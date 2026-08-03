import Phaser from 'phaser';

import { PET_CONFIG } from '../config/gameplay';
import type { PetId } from '../data/pets';
import {
  DOUBLE_DASH_UPGRADE,
  getUpgradeDefinition,
  type UpgradeId,
} from '../data/upgrades';
import { Player } from '../entities/Player';
import { InputController } from '../input/InputController';
import { Hud } from '../ui/Hud';
import type { DragonCourtyard } from '../world/DragonCourtyard';
import type { ZoneGate } from '../world/ZoneGate';
import type { UpgradeStation } from '../world/UpgradeStation';
import { BaseSystem } from './BaseSystem';
import { EconomySystem } from './EconomySystem';
import { PetEncounter } from './PetEncounter';
import { PlayerPathHistory } from './PlayerPathHistory';
import { ProgressionStage, ProgressionSystem } from './ProgressionSystem';
import type { RunStatsSystem } from './RunStatsSystem';
import { UpgradePurchaseResult, UpgradeSystem } from './UpgradeSystem';
import { GateUnlockResult, ZoneGateSystem } from './ZoneGateSystem';

export enum CoreLoopPhase {
  Exploring = 'EXPLORING',
  Escape = 'ESCAPE',
}

interface NavigationMarkers {
  park: Phaser.GameObjects.Container;
  cat: Phaser.GameObjects.Container;
  centralHub: Phaser.GameObjects.Container;
  fox: Phaser.GameObjects.Container;
  richDistrict: Phaser.GameObjects.Container;
  peacock: Phaser.GameObjects.Container;
  panda: Phaser.GameObjects.Container;
  vipEstate: Phaser.GameObjects.Container;
  vipA: Phaser.GameObjects.Container;
  vipB: Phaser.GameObjects.Container;
  dragon: Phaser.GameObjects.Container;
  upgrade: Phaser.GameObjects.Container;
}

interface CoreLoopDependencies {
  scene: Phaser.Scene;
  player: Player;
  encounters: readonly PetEncounter[];
  baseSystem: BaseSystem;
  gateSystem: ZoneGateSystem;
  economy: EconomySystem;
  progression: ProgressionSystem;
  upgradeSystem: UpgradeSystem;
  upgradeStation: UpgradeStation;
  dragonCourtyard: DragonCourtyard;
  runStats: RunStatsSystem;
  pathHistory: PlayerPathHistory;
  hud: Hud;
  input: InputController;
  navigationMarkers: NavigationMarkers;
  onProgressChanged: () => void;
  onVictory: () => void;
}

export class CoreLoopSystem {
  private readonly scene: Phaser.Scene;
  private readonly player: Player;
  private readonly encounters: readonly PetEncounter[];
  private readonly baseSystem: BaseSystem;
  private readonly gateSystem: ZoneGateSystem;
  private readonly economy: EconomySystem;
  private readonly progression: ProgressionSystem;
  private readonly upgradeSystem: UpgradeSystem;
  private readonly upgradeStation: UpgradeStation;
  private readonly dragonCourtyard: DragonCourtyard;
  private readonly runStats: RunStatsSystem;
  private readonly pathHistory: PlayerPathHistory;
  private readonly hud: Hud;
  private readonly input: InputController;
  private readonly navigationMarkers: NavigationMarkers;
  private readonly onProgressChanged: () => void;
  private readonly onVictory: () => void;
  private readonly encounterByPetId: ReadonlyMap<PetId, PetEncounter>;

  private activeEncounter: PetEncounter | null = null;
  private retryAvailableAt = 0;
  private objective = '';
  private parkMarkerVisible = false;
  private catMarkerVisible = false;
  private centralHubMarkerVisible = false;
  private foxMarkerVisible = false;
  private richDistrictMarkerVisible = false;
  private peacockMarkerVisible = false;
  private pandaMarkerVisible = false;
  private vipEstateMarkerVisible = false;
  private vipAMarkerVisible = false;
  private vipBMarkerVisible = false;
  private dragonMarkerVisible = false;
  private upgradeMarkerVisible = false;
  private cachedBaseObjective = '';
  private cachedObjectiveStage: ProgressionStage | null = null;
  private cachedObjectiveMoney = -1;

  public constructor(dependencies: CoreLoopDependencies) {
    this.scene = dependencies.scene;
    this.player = dependencies.player;
    this.encounters = dependencies.encounters;
    this.baseSystem = dependencies.baseSystem;
    this.gateSystem = dependencies.gateSystem;
    this.economy = dependencies.economy;
    this.progression = dependencies.progression;
    this.upgradeSystem = dependencies.upgradeSystem;
    this.upgradeStation = dependencies.upgradeStation;
    this.dragonCourtyard = dependencies.dragonCourtyard;
    this.runStats = dependencies.runStats;
    this.pathHistory = dependencies.pathHistory;
    this.hud = dependencies.hud;
    this.input = dependencies.input;
    this.navigationMarkers = dependencies.navigationMarkers;
    this.onProgressChanged = dependencies.onProgressChanged;
    this.onVictory = dependencies.onVictory;
    this.encounterByPetId = new Map(
      this.encounters.map((encounter) => [encounter.pet.petId, encounter]),
    );
  }

  public update(time: number, delta: number, interactPressed: boolean): void {
    for (const encounter of this.encounters) {
      encounter.update(time, delta, this.player, this.pathHistory);
      const activatedPursuer = encounter.consumeActivatedPursuer();
      if (activatedPursuer !== null && encounter === this.activeEncounter) {
        this.hud.showToast(
          activatedPursuer.activationMessage ?? 'СРАБОТАЛА СИГНАЛИЗАЦИЯ!',
          1500,
        );
        this.scene.cameras.main.flash(150, 220, 45, 55, false);
      }
    }

    this.progression.updateForMoney(this.economy.getMoney());
    this.gateSystem.refreshPrerequisiteStates();
    this.upgradeStation.setState(this.upgradeSystem.getStationState());

    if (this.activeEncounter === null) {
      this.updateExploration(time, interactPressed);
    } else {
      this.updateEscape(time);
    }

    this.updateNavigationMarkers();
    this.hud.setObjective(this.objective);
  }

  public getPhase(): CoreLoopPhase {
    return this.activeEncounter === null
      ? CoreLoopPhase.Exploring
      : CoreLoopPhase.Escape;
  }

  public getActiveEncounterId(): string {
    return this.activeEncounter?.definition.id ?? 'none';
  }

  public shiftTiming(deltaMs: number): void {
    if (deltaMs <= 0) {
      return;
    }
    if (this.retryAvailableAt > 0) {
      this.retryAvailableAt += deltaMs;
    }
    for (const encounter of this.encounters) {
      encounter.shiftTiming(deltaMs);
    }
  }

  public completeActiveTheftForDevelopment(): boolean {
    if (this.activeEncounter === null) {
      return false;
    }

    this.completeDelivery(this.activeEncounter);
    return true;
  }

  private updateExploration(time: number, interactPressed: boolean): void {
    const availableUpgradeId = this.upgradeStation.getAvailableUpgradeId();
    if (
      availableUpgradeId !== null &&
      this.upgradeStation.isPlayerNearby(this.player)
    ) {
      const upgrade = getUpgradeDefinition(availableUpgradeId);
      this.objective = this.economy.canAfford(upgrade.cost)
        ? `Купи улучшение «${this.getUpgradeDisplayTitle(availableUpgradeId)}»`
        : `Нужно ${upgrade.cost} монет`;
      this.setInteraction(
        true,
        'УЛУЧШИТЬ',
        `E — КУПИТЬ ${upgrade.displayName} ЗА ${upgrade.cost}`,
        `КУПИТЬ ${upgrade.displayName}`,
      );

      if (interactPressed) {
        this.tryPurchaseUpgrade(availableUpgradeId);
      }
      return;
    }

    const nearbyGate = this.gateSystem.findNearbyLockedGate(this.player);
    if (nearbyGate !== null) {
      this.objective = this.economy.canAfford(nearbyGate.definition.cost)
        ? `Открой ${nearbyGate.definition.displayName}`
        : `Нужно ${nearbyGate.definition.cost} монет`;
      this.setInteraction(
        true,
        'ОТКРЫТЬ',
        `E — ОТКРЫТЬ ${nearbyGate.definition.displayName} ЗА ${nearbyGate.definition.cost}`,
        `ОТКРЫТЬ ${nearbyGate.definition.displayName}`,
      );

      if (interactPressed) {
        this.tryUnlockGate(nearbyGate);
      }
      return;
    }

    const nearbyEncounter = this.encounters.find(
      (encounter) =>
        encounter.isAvailable(this.progression) &&
        encounter.isPlayerInInteractionRange(this.player),
    );

    if (nearbyEncounter !== undefined) {
      if (!nearbyEncounter.arePursuersReady() || time < this.retryAvailableAt) {
        this.objective = 'Хозяин возвращается · приготовься к новой попытке';
        this.setInteraction(false);
        return;
      }

      this.objective = this.input.isMobileMode
        ? `Нажми «УКРАСТЬ» · ${nearbyEncounter.pet.displayName}`
        : `Нажми E, чтобы украсть ${nearbyEncounter.pet.displayName}`;
      this.setInteraction(
        true,
        'УКРАСТЬ',
        `E — УКРАСТЬ ${nearbyEncounter.pet.displayName.toUpperCase()}`,
        'УКРАСТЬ',
      );

      if (interactPressed) {
        this.startTheft(nearbyEncounter);
      }
      return;
    }

    this.objective = this.getBaseObjective();
    this.setInteraction(false);
  }

  private updateEscape(time: number): void {
    const encounter = this.activeEncounter;
    if (encounter === null) {
      return;
    }

    this.setInteraction(false);
    this.objective = `Верни питомца на базу: ${encounter.pet.displayName}`;

    if (
      this.baseSystem.canDeliver(
        this.player,
        encounter.pet,
        PET_CONFIG.deliveryDistance,
      )
    ) {
      this.completeDelivery(encounter);
      return;
    }

    const catchingPursuer =
      time >= this.retryAvailableAt
        ? encounter.findCatchingPursuer(this.player)
        : null;
    if (catchingPursuer !== null) {
      this.failTheft(encounter, catchingPursuer.owner, time);
    }
  }

  private startTheft(encounter: PetEncounter): void {
    this.activeEncounter = encounter;
    this.pathHistory.reset(this.player);
    encounter.startTheft(this.scene.time.now);
    this.progression.startTheft(encounter.pet.petId, this.economy.getMoney());
    this.retryAvailableAt =
      this.scene.time.now + encounter.getTheftHeadStartMs();
    this.hud.showToast(
      `${encounter.pet.displayName.toUpperCase()} УКРАДЕН! БЕГИ ДОМОЙ!`,
      1500,
    );
    this.createTheftFlash(encounter);
    this.setInteraction(false);
  }

  private failTheft(
    encounter: PetEncounter,
    catchingOwner: Phaser.Types.Math.Vector2Like,
    time: number,
  ): void {
    this.retryAvailableAt = time + encounter.getFailureGraceMs();
    encounter.failTheft();
    this.progression.cancelTheft(this.economy.getMoney());
    this.runStats.recordFailedTheft();
    this.activeEncounter = null;
    this.player.applyCaughtFeedback(
      new Phaser.Math.Vector2(catchingOwner.x, catchingOwner.y),
    );
    this.hud.showToast(
      `ПОЙМАЛИ! ${encounter.pet.displayName} вернулся домой`,
      1900,
    );
    this.onProgressChanged();
  }

  private completeDelivery(encounter: PetEncounter): void {
    encounter.completeDelivery(this.baseSystem.getPetSlot(encounter.pet.petId));
    this.economy.addIncomeSource(
      encounter.pet.petId,
      encounter.pet.incomePerSecond,
    );
    this.progression.deliverPet(
      encounter.pet.petId,
      this.economy.getMoney(),
    );
    this.runStats.recordDelivery();
    if (encounter.pet.petId === 'dragon') {
      this.runStats.completeCampaign();
    }
    this.activeEncounter = null;
    this.dragonCourtyard.setDeliveryState(
      this.progression.isPetDelivered('vip-a'),
      this.progression.isPetDelivered('vip-b'),
      true,
    );
    this.onProgressChanged();

    if (encounter.pet.petId === 'dragon') {
      this.hud.showToast('ПОБЕДА! Все питомцы теперь на базе', 2800);
    } else if (
      encounter.pet.petId === 'vip-a' ||
      encounter.pet.petId === 'vip-b'
    ) {
      const vipDelivered = this.progression.getVipPetDeliveryCount();
      this.hud.showToast(
        vipDelivered >= 2
          ? 'ЗАЩИТА СНЯТА — ДРАКОН ДОСТУПЕН'
          : `${encounter.pet.displayName} теперь на базе · замок отключён`,
        2800,
      );
    } else if (encounter.pet.petId === 'peacock' || encounter.pet.petId === 'panda') {
      const richDelivered = this.progression.getRichPetDeliveryCount();
      this.hud.showToast(
        richDelivered >= 2
          ? 'RICH DISTRICT ЗАВЕРШЁН! Двойной рывок ждёт на базе'
          : `${encounter.pet.displayName} на базе! Остался ещё один питомец`,
        2800,
      );
    } else if (encounter.pet.petId === 'fox') {
      this.hud.showToast('CENTRAL HUB ЗАВЕРШЁН! Улучшение ждёт на базе', 2800);
    } else if (encounter.pet.petId === 'cat') {
      this.hud.showToast('PARK ЗАВЕРШЁН! Следующая цель: CENTRAL HUB', 2600);
    } else {
      this.hud.showToast('Питомец спасён… ну почти 😄', 2300);
    }
    this.createDeliveryCelebration(encounter);
    if (encounter.pet.petId === 'dragon') {
      this.onVictory();
    }
  }

  private tryUnlockGate(gate: ZoneGate): void {
    const result = this.gateSystem.tryUnlock(gate);

    if (result === GateUnlockResult.InsufficientFunds) {
      this.hud.showToast(`Нужно ${gate.definition.cost} монет`, 1400);
      return;
    }

    if (result === GateUnlockResult.Unlocked) {
      this.hud.showToast(`${gate.definition.displayName} ОТКРЫТ!`, 2100);
      this.onProgressChanged();
      this.setInteraction(false);
    }
  }

  private tryPurchaseUpgrade(upgradeId: UpgradeId): void {
    const upgrade = getUpgradeDefinition(upgradeId);
    const result = this.upgradeSystem.tryPurchase(upgradeId);
    if (result === UpgradePurchaseResult.InsufficientFunds) {
      this.hud.showToast(`Нужно ${upgrade.cost} монет`, 1400);
      return;
    }

    if (result === UpgradePurchaseResult.Purchased) {
      this.progression.notifyUpgradePurchased(this.economy.getMoney());
      this.upgradeStation.setState(this.upgradeSystem.getStationState());
      this.hud.showToast(
        upgradeId === DOUBLE_DASH_UPGRADE.id
          ? 'ДВОЙНОЙ РЫВОК! Теперь доступны два заряда'
          : 'БЫСТРЫЙ РЫВОК! Перезарядка теперь 650 мс',
        2600,
      );
      this.onProgressChanged();
      this.setInteraction(false);
      this.scene.cameras.main.flash(180, 118, 230, 155, false);
    }
  }

  private setInteraction(
    visible: boolean,
    mobileLabel = 'УКРАСТЬ',
    desktopPrompt = '',
    mobilePrompt = '',
  ): void {
    this.input.setInteractionVisible(visible, mobileLabel);
    this.hud.setInteractionPrompt(
      visible,
      this.input.isMobileMode ? mobilePrompt : desktopPrompt,
    );
  }

  private updateNavigationMarkers(): void {
    const stage = this.progression.getStage();
    const catEncounter = this.encounterByPetId.get('cat');
    const foxEncounter = this.encounterByPetId.get('fox');
    const peacockEncounter = this.encounterByPetId.get('peacock');
    const pandaEncounter = this.encounterByPetId.get('panda');
    const vipAEncounter = this.encounterByPetId.get('vip-a');
    const vipBEncounter = this.encounterByPetId.get('vip-b');
    const dragonEncounter = this.encounterByPetId.get('dragon');
    const closeToCat =
      catEncounter !== undefined && this.isPlayerCloseToEncounter(catEncounter);
    const closeToFox =
      foxEncounter !== undefined && this.isPlayerCloseToEncounter(foxEncounter);
    const parkVisible =
      stage === ProgressionStage.EarnForPark ||
      stage === ProgressionStage.UnlockPark;
    const catVisible = stage === ProgressionStage.StealParkPet && !closeToCat;
    const centralHubVisible =
      stage === ProgressionStage.EarnForCentralHub ||
      stage === ProgressionStage.UnlockCentralHub;
    const foxVisible = stage === ProgressionStage.StealHubPet && !closeToFox;
    const richDistrictVisible =
      stage === ProgressionStage.EarnForRichDistrict ||
      stage === ProgressionStage.UnlockRichDistrict;
    const peacockVisible =
      stage === ProgressionStage.StealRichPets &&
      !this.progression.isPetDelivered('peacock') &&
      peacockEncounter !== undefined &&
      !this.isPlayerCloseToEncounter(peacockEncounter);
    const pandaVisible =
      stage === ProgressionStage.StealRichPets &&
      !this.progression.isPetDelivered('panda') &&
      pandaEncounter !== undefined &&
      !this.isPlayerCloseToEncounter(pandaEncounter);
    const vipEstateVisible =
      stage === ProgressionStage.EarnForVipEstate ||
      stage === ProgressionStage.UnlockVipEstate;
    const vipAVisible =
      stage === ProgressionStage.StealVipPets &&
      !this.progression.isPetDelivered('vip-a') &&
      vipAEncounter !== undefined &&
      !this.isPlayerCloseToEncounter(vipAEncounter);
    const vipBVisible =
      stage === ProgressionStage.StealVipPets &&
      !this.progression.isPetDelivered('vip-b') &&
      vipBEncounter !== undefined &&
      !this.isPlayerCloseToEncounter(vipBEncounter);
    const dragonVisible =
      stage === ProgressionStage.DragonAvailable &&
      dragonEncounter !== undefined &&
      !this.isPlayerCloseToEncounter(dragonEncounter);
    const upgradeVisible =
      stage === ProgressionStage.EarnForDashUpgrade ||
      stage === ProgressionStage.BuyDashUpgrade ||
      stage === ProgressionStage.EarnForDoubleDash ||
      stage === ProgressionStage.BuyDoubleDash;

    if (parkVisible !== this.parkMarkerVisible) {
      this.parkMarkerVisible = parkVisible;
      this.navigationMarkers.park.setVisible(parkVisible);
    }
    if (catVisible !== this.catMarkerVisible) {
      this.catMarkerVisible = catVisible;
      this.navigationMarkers.cat.setVisible(catVisible);
    }
    if (centralHubVisible !== this.centralHubMarkerVisible) {
      this.centralHubMarkerVisible = centralHubVisible;
      this.navigationMarkers.centralHub.setVisible(centralHubVisible);
    }
    if (foxVisible !== this.foxMarkerVisible) {
      this.foxMarkerVisible = foxVisible;
      this.navigationMarkers.fox.setVisible(foxVisible);
    }
    if (richDistrictVisible !== this.richDistrictMarkerVisible) {
      this.richDistrictMarkerVisible = richDistrictVisible;
      this.navigationMarkers.richDistrict.setVisible(richDistrictVisible);
    }
    if (peacockVisible !== this.peacockMarkerVisible) {
      this.peacockMarkerVisible = peacockVisible;
      this.navigationMarkers.peacock.setVisible(peacockVisible);
    }
    if (pandaVisible !== this.pandaMarkerVisible) {
      this.pandaMarkerVisible = pandaVisible;
      this.navigationMarkers.panda.setVisible(pandaVisible);
    }
    if (vipEstateVisible !== this.vipEstateMarkerVisible) {
      this.vipEstateMarkerVisible = vipEstateVisible;
      this.navigationMarkers.vipEstate.setVisible(vipEstateVisible);
    }
    if (vipAVisible !== this.vipAMarkerVisible) {
      this.vipAMarkerVisible = vipAVisible;
      this.navigationMarkers.vipA.setVisible(vipAVisible);
    }
    if (vipBVisible !== this.vipBMarkerVisible) {
      this.vipBMarkerVisible = vipBVisible;
      this.navigationMarkers.vipB.setVisible(vipBVisible);
    }
    if (dragonVisible !== this.dragonMarkerVisible) {
      this.dragonMarkerVisible = dragonVisible;
      this.navigationMarkers.dragon.setVisible(dragonVisible);
    }
    if (upgradeVisible !== this.upgradeMarkerVisible) {
      this.upgradeMarkerVisible = upgradeVisible;
      this.navigationMarkers.upgrade.setVisible(upgradeVisible);
    }
  }

  private isPlayerCloseToEncounter(encounter: PetEncounter): boolean {
    const distanceX = this.player.x - encounter.pet.x;
    const distanceY = this.player.y - encounter.pet.y;
    return distanceX * distanceX + distanceY * distanceY < 220 * 220;
  }

  private getUpgradeDisplayTitle(upgradeId: UpgradeId): string {
    return upgradeId === DOUBLE_DASH_UPGRADE.id
      ? 'Двойной рывок'
      : 'Быстрый рывок';
  }

  private getBaseObjective(): string {
    const stage = this.progression.getStage();
    const displayedMoney = this.economy.getDisplayedMoney();
    if (
      stage !== this.cachedObjectiveStage ||
      displayedMoney !== this.cachedObjectiveMoney
    ) {
      this.cachedObjectiveStage = stage;
      this.cachedObjectiveMoney = displayedMoney;
      this.cachedBaseObjective = this.progression.getObjective(displayedMoney);
    }

    return this.cachedBaseObjective;
  }

  private createTheftFlash(encounter: PetEncounter): void {
    const ring = this.scene.add
      .circle(encounter.pet.x, encounter.pet.y, 28, 0xffe575, 0.12)
      .setStrokeStyle(8, 0xffd23f, 0.95)
      .setDepth(encounter.pet.y + 2);

    this.scene.tweens.add({
      targets: ring,
      scale: 2.2,
      alpha: 0,
      duration: 360,
      onComplete: () => ring.destroy(),
    });
  }

  private createDeliveryCelebration(encounter: PetEncounter): void {
    const colors = [0xffd23f, 0x6ce39a, 0x72c7ff, 0xff85b3];
    const particleCount = encounter.pet.petId === 'dragon' ? 28 : 12;
    const radius = encounter.pet.petId === 'dragon' ? 170 : 100;

    for (let index = 0; index < particleCount; index += 1) {
      const angle = (Math.PI * 2 * index) / particleCount;
      const particle = this.scene.add
        .circle(
          encounter.pet.x,
          encounter.pet.y,
          7,
          colors[index % colors.length] ?? 0xffffff,
        )
        .setDepth(encounter.pet.y + 4);

      this.scene.tweens.add({
        targets: particle,
        x: encounter.pet.x + Math.cos(angle) * radius,
        y: encounter.pet.y + Math.sin(angle) * radius,
        alpha: 0,
        scale: 0.3,
        duration: encounter.pet.petId === 'dragon' ? 900 : 620,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }
}
