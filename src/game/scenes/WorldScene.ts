import Phaser from 'phaser';

import { PET_CONFIG, WORLD } from '../config/gameplay';
import { PET_ENCOUNTER_DEFINITIONS } from '../data/encounters';
import {
  CHASE_NAVIGATION_GRAPHS,
  ChaseEdgeConditionId,
} from '../data/chaseNavigation';
import type { RoamingPetId } from '../data/roamingPets';
import { getPetDefinition, type PetId } from '../data/pets';
import { UpgradeBranchId, UPGRADE_DEFINITIONS } from '../data/upgrades';
import { ZoneId } from '../data/zones';
import { OwnerState } from '../entities/OwnerNpc';
import { OwnerNpc } from '../entities/OwnerNpc';
import { Pet } from '../entities/Pet';
import { Player } from '../entities/Player';
import { InputController } from '../input/InputController';
import { BaseSystem } from '../systems/BaseSystem';
import { ChaseSystem } from '../systems/ChaseSystem';
import { CoreLoopSystem } from '../systems/CoreLoopSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { PetEncounter } from '../systems/PetEncounter';
import { PlayerPathHistory } from '../systems/PlayerPathHistory';
import { PetTrackerSystem } from '../systems/PetTrackerSystem';
import { PlaytestSystem } from '../systems/PlaytestSystem';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { RunStatsSystem } from '../systems/RunStatsSystem';
import { RoamingPetSystem } from '../systems/RoamingPetSystem';
import { type GameSaveData, SaveSystem } from '../systems/SaveSystem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { ZoneGateSystem } from '../systems/ZoneGateSystem';
import { Hud } from '../ui/Hud';
import { VictoryOverlay } from '../ui/VictoryOverlay';
import { createPrototypeTextures } from '../utils/createPrototypeTextures';
import { DeveloperTools } from '../utils/DeveloperTools';
import { WorldBuilder, type WorldBuildResult } from '../world/WorldBuilder';
import { preloadVisualAssets } from '../assets/assetLoader';

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private inputController!: InputController;
  private economy!: EconomySystem;
  private progression!: ProgressionSystem;
  private saveSystem!: SaveSystem;
  private upgradeSystem!: UpgradeSystem;
  private pathHistory!: PlayerPathHistory;
  private baseSystem!: BaseSystem;
  private runStats!: RunStatsSystem;
  private roamingSystem!: RoamingPetSystem;
  private petTrackerSystem!: PetTrackerSystem;
  private playtestSystem!: PlaytestSystem;
  private encounters: readonly PetEncounter[] = [];
  private coreLoop!: CoreLoopSystem;
  private hud!: Hud;
  private victoryOverlay!: VictoryOverlay;
  private world!: WorldBuildResult;
  private saveTimer: Phaser.Time.TimerEvent | null = null;
  private developerTools: DeveloperTools | null = null;
  private suppressSaveOnShutdown = false;
  private pageHidden = document.hidden;
  private hiddenAtGameTime: number | null = null;
  private catReturnTestPositionIndex = 0;
  private grandfatheredZoneIds: readonly ZoneId[] = [];
  private lastRoamingPenCount = -1;

  public constructor() {
    super({ key: 'WorldScene' });
  }

  public preload(): void {
    preloadVisualAssets(this);
  }

  public create(): void {
    createPrototypeTextures(this);

    this.saveSystem = new SaveSystem();
    const savedGame = this.saveSystem.load();
    this.grandfatheredZoneIds = savedGame.grandfatheredZoneIds;
    this.economy = new EconomySystem(savedGame.money);
    this.upgradeSystem = new UpgradeSystem(
      this.economy,
      savedGame.purchasedUpgradeIds,
      savedGame.grandfatheredUpgradeIds,
    );
    this.progression = new ProgressionSystem(
      (upgradeId) => this.upgradeSystem.isPurchased(upgradeId),
      {
        deliveredPetIds: savedGame.deliveredPetIds,
        unlockedZones: savedGame.unlockedZones,
      },
    );
    this.upgradeSystem.connectPrerequisiteContext(this.progression);
    this.progression.updateForMoney(this.economy.getMoney());
    this.runStats = new RunStatsSystem(
      {
        ...savedGame.runStats,
        campaignCompleted: this.progression.isCampaignComplete(),
      },
      savedGame.deliveredPetIds.length,
    );

    this.world = new WorldBuilder(this).build(
      this.progression.isZoneUnlocked(ZoneId.Park),
      this.progression.isZoneUnlocked(ZoneId.CentralHub),
      this.progression.isZoneUnlocked(ZoneId.RichDistrict),
      this.progression.isZoneUnlocked(ZoneId.VipEstate),
      this.progression.isPetDelivered('vip-a'),
      this.progression.isPetDelivered('vip-b'),
    );
    this.player = new Player(
      this,
      this.world.playerSpawn.x,
      this.world.playerSpawn.y,
    );
    this.upgradeSystem.connectEffectTarget(this.player);
    this.inputController = new InputController(this);
    this.pathHistory = new PlayerPathHistory(
      this.player,
      PET_CONFIG.breadcrumbSpacing,
      PET_CONFIG.breadcrumbMaxPoints,
    );
    this.hud = new Hud(this);
    const cleanPlaytestStart =
      savedGame.money < 0.001 &&
      savedGame.deliveredPetIds.length === 0 &&
      savedGame.unlockedZones.length === 1 &&
      savedGame.purchasedUpgradeIds.length === 0 &&
      (savedGame.runStats?.elapsedMs ?? 0) === 0;
    this.playtestSystem = new PlaytestSystem(
      this,
      this.progression,
      this.economy,
      this.upgradeSystem,
      this.runStats,
      () => this.hud.getRollingFps(),
      cleanPlaytestStart,
    );
    this.victoryOverlay = new VictoryOverlay(this, {
      onContinue: () => {
        this.hud.showToast('Кампания завершена · свободное исследование', 2100);
      },
      onNewGame: () => this.resetSave(),
      ...(this.playtestSystem.enabled
        ? { onCopyReport: () => this.playtestSystem.copyReport() }
        : {}),
    });

    this.baseSystem = new BaseSystem(
      this.world.playerDeliveryZone,
      this.world.playerPetSlots,
    );
    this.encounters = this.createEncounters(this.baseSystem);
    this.roamingSystem = new RoamingPetSystem(
      this,
      this.progression,
      this.upgradeSystem,
      this.baseSystem,
    );
    for (const controller of this.roamingSystem.getControllers()) {
      if (this.progression.isPetDelivered(controller.definition.petId)) {
        this.economy.addIncomeSource(
          controller.definition.petId,
          controller.pet.incomePerSecond,
        );
      }
    }
    this.petTrackerSystem = new PetTrackerSystem(
      this,
      this.player,
      this.roamingSystem,
      this.progression,
      this.upgradeSystem,
    );
    const gateSystem = new ZoneGateSystem(
      [
        this.world.parkGate,
        this.world.centralHubGate,
        this.world.richDistrictGate,
        this.world.vipEstateGate,
      ],
      this.economy,
      this.progression,
      this.upgradeSystem,
    );

    this.coreLoop = new CoreLoopSystem({
      scene: this,
      player: this.player,
      encounters: this.encounters,
      roamingSystem: this.roamingSystem,
      baseSystem: this.baseSystem,
      gateSystem,
      economy: this.economy,
      progression: this.progression,
      upgradeSystem: this.upgradeSystem,
      upgradeStations: [
        { station: this.world.upgradeStation, branchId: UpgradeBranchId.Mobility },
        { station: this.world.trackingStation, branchId: UpgradeBranchId.Tracking },
        { station: this.world.stealthStation, branchId: UpgradeBranchId.Stealth },
      ],
      dragonCourtyard: this.world.dragonCourtyard,
      runStats: this.runStats,
      pathHistory: this.pathHistory,
      hud: this.hud,
      input: this.inputController,
      navigationMarkers: {
        park: this.world.parkNavigationMarkerView,
        cat: this.world.catNavigationMarkerView,
        centralHub: this.world.centralHubMarkerView,
        fox: this.world.foxNavigationMarkerView,
        richDistrict: this.world.richDistrictNavigationMarkerView,
        peacock: this.world.peacockNavigationMarkerView,
        panda: this.world.pandaNavigationMarkerView,
        vipEstate: this.world.vipEstateNavigationMarkerView,
        vipA: this.world.vipANavigationMarkerView,
        vipB: this.world.vipBNavigationMarkerView,
        dragon: this.world.dragonNavigationMarkerView,
        upgrade: this.world.upgradeNavigationMarkerView,
      },
      onProgressChanged: () => this.persistProgress(),
      onVictory: () => this.showVictory(),
    });

    this.configureDeveloperTools();
    this.configurePhysics();
    this.configureCamera();

    this.saveTimer = this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => this.persistProgress(),
    });
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.scale.on('resize', this.resizeCamera, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    this.hud.setObjective(
      this.progression.getObjective(this.economy.getMoney()),
    );
    const restoredProgress =
      savedGame.deliveredPetIds.length > 0 ||
      savedGame.unlockedZones.length > 1 ||
      savedGame.purchasedUpgradeIds.length > 0 ||
      savedGame.money > 0;
    this.hud.showToast(
      this.progression.isCampaignComplete()
        ? 'Кампания завершена — прогресс восстановлен'
        : restoredProgress
          ? 'Прогресс восстановлен'
          : `Найди чужую базу · ${this.progression.getObjective(0)}`,
      1900,
    );
  }

  public override update(time: number, delta: number): void {
    this.victoryOverlay.update();
    if (this.victoryOverlay.isVisible()) {
      this.petTrackerSystem.update(time, true, true, this.inputController.isMobileMode);
      this.developerTools?.update(time);
      this.playtestSystem.update(time);
      this.player.setVelocity(0, 0);
      this.economy.update(delta);
      this.hud.recordPerformance(time, delta);
      this.updateRuntimeHud(time);
      return;
    }

    const frameInput = this.inputController.readFrame();

    this.developerTools?.update(time);
    this.runStats.update(delta, !this.pageHidden);
    this.player.updatePlayer(time, frameInput.movement, frameInput.dashPressed);
    this.pathHistory.record(this.player);
    this.coreLoop.update(time, delta, frameInput.interactPressed);
    this.playtestSystem.update(time);
    for (const shortcut of this.world.shortcuts) shortcut.refresh(this.progression);
    const roamingCount = this.progression.getRoamingPetCount();
    if (roamingCount !== this.lastRoamingPenCount) {
      this.lastRoamingPenCount = roamingCount;
      this.world.roamingPenLabel.setText(`ОБЩИЙ ЗАГОН · БРОДЯЧИЕ ${roamingCount}/6`);
    }
    this.petTrackerSystem.update(
      time,
      this.coreLoop.getPhase() === 'ESCAPE',
      false,
      this.inputController.isMobileMode,
    );
    this.economy.update(delta);
    this.hud.recordPerformance(time, delta);
    this.updateRuntimeHud(time);

    if (frameInput.debugPressed) {
      this.hud.toggleDebug();
    }

    if (this.hud.shouldRefreshDebug(time)) {
      this.hud.updateDebug({
        playerX: this.player.x,
        playerY: this.player.y,
        petState: this.encounters
          .map((encounter) => `${encounter.pet.petId}:${encounter.pet.getState()}`)
          .join(' '),
        chaseState: this.encounters
          .flatMap((encounter) =>
            encounter.pursuers.map((pursuer) => {
              const navigation = pursuer.chase.getNavigationDebugState();
              return `${pursuer.definition.id}:${pursuer.chase.getState()}/${navigation.mode}` +
                `:${navigation.currentNodeId}:los=${navigation.lineOfSight}`;
            }),
          )
          .join(' '),
      });
    }
  }

  private updateRuntimeHud(time: number): void {
    this.hud.updateMoney(
      this.economy.getDisplayedMoney(),
      this.economy.getIncomePerSecond(),
    );
    const dashRechargeRatio = this.player.getDashRechargeRatio(time);
    const dashCharges = this.player.getDashCharges();
    const maxDashCharges = this.player.getMaxDashCharges();
    this.hud.setDashState(
      dashCharges,
      maxDashCharges,
      dashRechargeRatio,
      this.inputController.isMobileMode,
    );
    this.inputController.setDashState(
      dashCharges,
      maxDashCharges,
      dashRechargeRatio,
    );
  }

  private createEncounters(baseSystem: BaseSystem): readonly PetEncounter[] {
    return PET_ENCOUNTER_DEFINITIONS.map((definition) => {
      const petDefinition = getPetDefinition(definition.petId);
      const pet = new Pet(
        this,
        definition.petHome.x,
        definition.petHome.y,
        petDefinition,
      );
      const pursuers = definition.pursuers.map((pursuerDefinition) => {
        const owner = new OwnerNpc(
          this,
          new Phaser.Math.Vector2(
            pursuerDefinition.home.x,
            pursuerDefinition.home.y,
          ),
          pursuerDefinition.visualKey,
          pursuerDefinition.chase,
          pursuerDefinition.returnRoutes,
          pursuerDefinition.returnResetAfterMs,
        );
        return {
          definition: pursuerDefinition,
          owner,
          chase: new ChaseSystem(
            owner,
            pursuerDefinition.chase,
            CHASE_NAVIGATION_GRAPHS[pursuerDefinition.chaseNavigationGraphId],
            {
              blockers: this.world.navigationBlockers,
              isConditionOpen: (conditionId) => this.isChaseEdgeConditionOpen(conditionId),
            },
            pursuerDefinition.navigationBias,
          ),
          activated: false,
        };
      });
      const encounter = new PetEncounter(definition, pet, pursuers);

      if (this.progression.isPetDelivered(definition.petId)) {
        pet.placeAtPlayerBase(baseSystem.getPetSlot(definition.petId));
        this.economy.addIncomeSource(
          definition.petId,
          petDefinition.incomePerSecond,
        );
      }

      return encounter;
    });
  }

  private configurePhysics(): void {
    this.physics.add.collider(this.player, this.world.obstacles);
    for (const encounter of this.encounters) {
      for (const pursuer of encounter.pursuers) {
        this.physics.add.collider(pursuer.owner, this.world.obstacles);
      }
    }
  }

  private configureCamera(): void {
    const camera = this.cameras.main;
    camera.setBounds(0, 0, WORLD.width, WORLD.height);
    camera.startFollow(this.player, true, 0.1, 0.1);
    camera.setRoundPixels(true);
    this.resizeCamera(this.scale.gameSize);
  }

  private configureDeveloperTools(): void {
    if (new URLSearchParams(window.location.search).get('dev') !== '1') {
      return;
    }

    this.developerTools = new DeveloperTools(this, {
      interact: () => this.inputController.requestDevInteract(),
      dash: () => this.inputController.requestDevDash(),
      toPet: (petId) => this.teleportToPet(petId),
      toHome: () =>
        this.player.setPosition(
          this.world.playerDeliveryZone.centerX,
          this.world.playerDeliveryZone.centerY,
        ),
      toParkGate: () =>
        this.player.setPosition(
          this.world.parkGateInteractionPoint.x,
          this.world.parkGateInteractionPoint.y,
        ),
      toCentralHubGate: () =>
        this.player.setPosition(
          this.world.centralHubGateInteractionPoint.x,
          this.world.centralHubGateInteractionPoint.y,
        ),
      toRichDistrictGate: () =>
        this.player.setPosition(
          this.world.richDistrictGateInteractionPoint.x,
          this.world.richDistrictGateInteractionPoint.y,
        ),
      toVipEstateGate: () =>
        this.player.setPosition(
          this.world.vipEstateGateInteractionPoint.x,
          this.world.vipEstateGateInteractionPoint.y,
        ),
      toDragonCourtyard: () =>
        this.player.setPosition(
          this.world.dragonNavigationMarker.x,
          this.world.dragonNavigationMarker.y + 90,
        ),
      toUpgradeStation: () =>
        this.player.setPosition(
          this.world.upgradeStationPosition.x,
          this.world.upgradeStationPosition.y + 72,
        ),
      toTrackingStation: () =>
        this.player.setPosition(
          this.world.trackingStationPosition.x,
          this.world.trackingStationPosition.y + 72,
        ),
      catchActive: (pursuerIndex) =>
        this.teleportActivePursuerToPlayer(pursuerIndex),
      prepareVipPrerequisites: () => this.prepareVipPrerequisites(),
      deliverActive: () => this.coreLoop.completeActiveTheftForDevelopment(),
      cycleCatReturnTestPosition: () => this.cycleCatReturnTestPosition(),
      addMoney: (amount) => this.economy.addMoney(amount),
      resetMoney: () => this.economy.spend(this.economy.getMoney()),
      resetSave: () => this.resetSave(),
      testV1Migration: () => this.testV1Migration(),
      getSnapshot: () => this.getDeveloperSnapshot(),
      forceRoamingTired: (petId) => this.roamingSystem.forceTired(petId as RoamingPetId),
      resetRoaming: (petId) => this.roamingSystem.reset(petId as RoamingPetId),
    });
    this.applyVisualQaView(new URLSearchParams(window.location.search).get('view'));
  }

  private applyVisualQaView(view: string | null): void {
    if (view === null) return;
    const petByView: Readonly<Record<string, PetId>> = {
      park: 'cat',
      hub: 'fox',
      rich: 'panda',
      vip: 'vip-a',
    };
    if (view === 'base') {
      this.player.setPosition(this.world.playerDeliveryZone.centerX, this.world.playerDeliveryZone.centerY);
    } else if (view === 'vipgate') {
      this.player.setPosition(
        this.world.vipEstateGateInteractionPoint.x,
        this.world.vipEstateGateInteractionPoint.y,
      );
    } else if (view === 'dragon') {
      this.player.setPosition(this.world.dragonNavigationMarker.x, this.world.dragonNavigationMarker.y + 90);
    } else {
      const petId = petByView[view];
      if (petId !== undefined) this.teleportToPet(petId);
    }
    this.cameras.main.centerOn(this.player.x, this.player.y);
  }

  private teleportToPet(petId: PetId): void {
    const encounter = this.encounters.find(
      (candidate) => candidate.pet.petId === petId,
    );
    if (encounter !== undefined) {
      this.player.setPosition(
        encounter.definition.petHome.x - 70,
        encounter.definition.petHome.y,
      );
      return;
    }
    const roaming = this.roamingSystem.getControllers().find((item) => item.definition.petId === petId);
    if (roaming !== undefined) this.player.setPosition(roaming.pet.x - 90, roaming.pet.y);
  }

  private teleportActivePursuerToPlayer(pursuerIndex: number): void {
    const activeEncounterId = this.coreLoop.getActiveEncounterId();
    const activeEncounter = this.encounters.find(
      (encounter) => encounter.definition.id === activeEncounterId,
    );
    const pursuer = activeEncounter?.pursuers[pursuerIndex];
    if (pursuer?.owner.getState() === OwnerState.Chasing) {
      pursuer.owner.setPosition(this.player.x, this.player.y);
    }
  }

  private cycleCatReturnTestPosition(): void {
    const positions = [
      { x: 1220, y: 340 },
      { x: 1510, y: 620 },
      { x: 1100, y: 760 },
      { x: 900, y: 1250 },
      { x: 700, y: 2225 },
    ] as const;
    const position = positions[this.catReturnTestPositionIndex % positions.length];
    this.catReturnTestPositionIndex += 1;
    if (position !== undefined) {
      this.player.setPosition(position.x, position.y);
    }
  }

  private prepareVipPrerequisites(): void {
    for (const [zoneId, gate] of [
      [ZoneId.Park, this.world.parkGate],
      [ZoneId.CentralHub, this.world.centralHubGate],
      [ZoneId.RichDistrict, this.world.richDistrictGate],
    ] as const) {
      if (!this.progression.isZoneUnlocked(zoneId)) {
        gate.unlock(false);
        this.progression.unlockZone(zoneId, this.economy.getMoney());
      }
    }

    for (const petId of [
      'dog',
      'cat',
      'fox',
      'peacock',
      'panda',
    ] as const) {
      if (this.progression.isPetDelivered(petId)) {
        continue;
      }
      const encounter = this.encounters.find(
        (candidate) => candidate.pet.petId === petId,
      );
      if (encounter === undefined) {
        continue;
      }
      encounter.completeDelivery(this.baseSystem.getPetSlot(petId));
      this.economy.addIncomeSource(
        petId,
        getPetDefinition(petId).incomePerSecond,
      );
      this.progression.deliverPet(petId, this.economy.getMoney());
      this.runStats.recordDelivery();
    }

    for (const petId of ['roam-01', 'roam-02', 'roam-03', 'roam-04', 'roam-05', 'roam-06'] as const) {
      if (this.progression.isPetDelivered(petId)) continue;
      const controller = this.roamingSystem.deliverForDevelopment(petId, this.baseSystem);
      if (controller === null) continue;
      this.economy.addIncomeSource(petId, controller.pet.incomePerSecond);
      this.progression.deliverPet(petId, this.economy.getMoney());
      this.runStats.recordDelivery();
    }

    for (const upgrade of Object.values(UPGRADE_DEFINITIONS)) {
      if (this.upgradeSystem.isPurchased(upgrade.id)) {
        continue;
      }
      const missingMoney = Math.max(0, upgrade.cost - this.economy.getMoney());
      this.economy.addMoney(missingMoney);
      this.upgradeSystem.tryPurchase(upgrade.id);
      this.progression.notifyUpgradePurchased(this.economy.getMoney());
    }

    this.persistProgress();
    this.hud.showToast('DEV: prerequisites VIP ESTATE подготовлены', 1800);
  }

  private getDeveloperSnapshot(): string {
    return [
      'DEV RUN — TIME INVALID',
      `stage=${this.progression.getStage()}`,
      `phase=${this.coreLoop.getPhase()}`,
      `active=${this.coreLoop.getActiveEncounterId()}`,
      `money=${this.economy.getMoney().toFixed(2)}`,
      `income=${this.economy.getIncomePerSecond()}`,
      `fps=${this.hud.getCurrentFps().toFixed(0)}/${this.hud.getRollingFps().toFixed(1)}`,
      `frame=${this.hud.getAverageFrameTimeMs().toFixed(2)}ms`,
      `limit=${this.game.loop.fpsLimit}`,
      'balanceRevision=2',
      `pos=${this.player.x.toFixed(0)},${this.player.y.toFixed(0)}`,
      `park=${this.progression.isZoneUnlocked(ZoneId.Park)}`,
      `hub=${this.progression.isZoneUnlocked(ZoneId.CentralHub)}`,
      `rich=${this.progression.isZoneUnlocked(ZoneId.RichDistrict)}`,
      `vip=${this.progression.isZoneUnlocked(ZoneId.VipEstate)}`,
      `seals=${this.world.dragonCourtyard.getSealCount()}/2`,
      `dashCd=${this.player.getDashCooldownMs()}`,
      `dash=${this.player.getDashCharges()}/${this.player.getMaxDashCharges()}`,
      `upgrades=${this.upgradeSystem.getPurchasedUpgradeIds().join(',') || 'none'}`,
      `stats=${JSON.stringify(this.runStats.getSnapshot())}`,
      `pets=${this.encounters
        .map((encounter) => `${encounter.pet.petId}:${encounter.pet.getState()}`)
        .join(',')}`,
      `roaming=${this.roamingSystem.getControllers().map((item) => item.getDebugSnapshot()).join(',')}`,
      `tracker=${this.petTrackerSystem.getDebugSnapshot()}`,
      `owners=${this.encounters
        .flatMap((encounter) =>
          encounter.pursuers.map(
            (pursuer) => {
              const navigation = pursuer.chase.getNavigationDebugState();
              return `${pursuer.definition.id}:${pursuer.owner.getState()}/${navigation.mode}` +
                ` graph=${navigation.graphId} node=${navigation.currentNodeId}` +
                ` left=${navigation.remainingPathLength} los=${navigation.lineOfSight}` +
                ` repath=${Math.max(0, navigation.nextRepathAt - this.time.now).toFixed(0)}` +
                ` stuck=${navigation.stuckDurationMs.toFixed(0)}`;
            },
          ),
        )
        .join(',')}`,
    ].join(' · ');
  }

  private isChaseEdgeConditionOpen(conditionId: string): boolean {
    switch (conditionId) {
      case ChaseEdgeConditionId.ParkGateOpen:
        return this.world.parkGate.isUnlocked();
      case ChaseEdgeConditionId.CentralGateOpen:
        return this.world.centralHubGate.isUnlocked();
      case ChaseEdgeConditionId.RichGateOpen:
        return this.world.richDistrictGate.isUnlocked();
      case ChaseEdgeConditionId.VipGateOpen:
        return this.world.vipEstateGate.isUnlocked();
      case ChaseEdgeConditionId.DragonLeftOpen:
      case ChaseEdgeConditionId.DragonRightOpen:
        return this.world.dragonCourtyard.isOpen();
      default:
        return false;
    }
  }

  private persistProgress(): void {
    if (this.suppressSaveOnShutdown) {
      return;
    }

    const progression = this.progression.getSnapshot();
    const saveData: GameSaveData = {
      saveVersion: 3,
      balanceRevision: 2,
      money: this.economy.getMoney(),
      deliveredPetIds: progression.deliveredPetIds,
      unlockedZones: progression.unlockedZones,
      purchasedUpgradeIds: this.upgradeSystem.getPurchasedUpgradeIds(),
      grandfatheredZoneIds: this.grandfatheredZoneIds.filter((zoneId) => progression.unlockedZones.includes(zoneId)),
      grandfatheredUpgradeIds: this.upgradeSystem.getGrandfatheredUpgradeIds(),
      runStats: this.runStats.getSnapshot(),
    };
    this.saveSystem.save(saveData);
  }

  private showVictory(): void {
    this.persistProgress();
    this.hud.setObjective(
      this.progression.getObjective(this.economy.getDisplayedMoney()),
    );
    this.cameras.main.flash(520, 255, 224, 100, false);
    const stats = this.runStats.getSnapshot();
    this.victoryOverlay.show({
      deliveredPets: this.progression.getSnapshot().deliveredPetIds.length,
      elapsedMs: stats.elapsedMs,
      failedThefts: stats.failedThefts,
      incomePerSecond: this.economy.getIncomePerSecond(),
    });
  }

  private resetSave(): void {
    this.suppressSaveOnShutdown = true;
    this.saveTimer?.remove(false);
    this.saveSystem.clear();
    window.location.reload();
  }

  private testV1Migration(): void {
    this.suppressSaveOnShutdown = true;
    this.saveTimer?.remove(false);
    if (this.saveSystem.installLegacyV1FixtureForDevelopment()) {
      window.location.reload();
    }
  }

  private resizeCamera(gameSize: Phaser.Structs.Size): void {
    const shortestSide = Math.min(gameSize.width, gameSize.height);
    const zoom =
      shortestSide < 430
        ? 0.82
        : shortestSide < 700
          ? 0.92
          : gameSize.width > 1500
            ? 1.08
            : 1;
    this.cameras.main.setZoom(zoom);
  }

  private readonly handleBeforeUnload = (): void => {
    this.persistProgress();
  };

  private readonly handleVisibilityChange = (): void => {
    this.pageHidden = document.hidden;
    if (this.pageHidden) {
      this.hiddenAtGameTime = this.time.now;
      this.player.setVelocity(0, 0);
      this.physics.world.pause();
      this.persistProgress();
      return;
    }

    this.physics.world.resume();
    if (this.hiddenAtGameTime !== null) {
      const pausedGameTime = Math.max(0, this.time.now - this.hiddenAtGameTime);
      this.player.shiftTiming(pausedGameTime);
      this.coreLoop.shiftTiming(pausedGameTime);
      this.hiddenAtGameTime = null;
    }
    this.pathHistory.reset(this.player);
  };

  private shutdown(): void {
    this.persistProgress();
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.scale.off('resize', this.resizeCamera, this);
    this.saveTimer?.remove(false);
    this.inputController.destroy();
    this.hud.destroy();
    this.victoryOverlay.destroy();
    this.playtestSystem.destroy();
    this.developerTools?.destroy();
  }
}
