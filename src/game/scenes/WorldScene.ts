import Phaser from 'phaser';

import { PET_CONFIG, WORLD } from '../config/gameplay';
import { PET_ENCOUNTER_DEFINITIONS } from '../data/encounters';
import { getPetDefinition, type PetId } from '../data/pets';
import { FAST_DASH_UPGRADE } from '../data/upgrades';
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
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { type GameSaveData, SaveSystem } from '../systems/SaveSystem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { ZoneGateSystem } from '../systems/ZoneGateSystem';
import { Hud } from '../ui/Hud';
import { createPrototypeTextures } from '../utils/createPrototypeTextures';
import { DeveloperTools } from '../utils/DeveloperTools';
import { WorldBuilder, type WorldBuildResult } from '../world/WorldBuilder';

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private inputController!: InputController;
  private economy!: EconomySystem;
  private progression!: ProgressionSystem;
  private saveSystem!: SaveSystem;
  private upgradeSystem!: UpgradeSystem;
  private pathHistory!: PlayerPathHistory;
  private encounters: readonly PetEncounter[] = [];
  private coreLoop!: CoreLoopSystem;
  private hud!: Hud;
  private world!: WorldBuildResult;
  private saveTimer: Phaser.Time.TimerEvent | null = null;
  private developerTools: DeveloperTools | null = null;
  private suppressSaveOnShutdown = false;
  private catReturnTestPositionIndex = 0;

  public constructor() {
    super({ key: 'WorldScene' });
  }

  public create(): void {
    createPrototypeTextures(this);

    this.saveSystem = new SaveSystem();
    const savedGame = this.saveSystem.load();
    this.economy = new EconomySystem(savedGame.money);
    this.upgradeSystem = new UpgradeSystem(
      this.economy,
      savedGame.purchasedUpgradeIds,
    );
    this.progression = new ProgressionSystem(
      () => this.upgradeSystem.isPurchased(FAST_DASH_UPGRADE.id),
      {
        deliveredPetIds: savedGame.deliveredPetIds,
        unlockedZones: savedGame.unlockedZones,
      },
    );
    this.progression.updateForMoney(this.economy.getMoney());

    this.world = new WorldBuilder(this).build(
      this.progression.isZoneUnlocked(ZoneId.Park),
      this.progression.isZoneUnlocked(ZoneId.CentralHub),
      this.progression.isPetDelivered('fox'),
      this.upgradeSystem.isPurchased(FAST_DASH_UPGRADE.id),
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

    const baseSystem = new BaseSystem(
      this.world.playerDeliveryZone,
      this.world.playerPetSlots,
    );
    this.encounters = this.createEncounters(baseSystem);
    const gateSystem = new ZoneGateSystem(
      [this.world.parkGate, this.world.centralHubGate],
      this.economy,
      this.progression,
    );

    this.coreLoop = new CoreLoopSystem({
      scene: this,
      player: this.player,
      encounters: this.encounters,
      baseSystem,
      gateSystem,
      economy: this.economy,
      progression: this.progression,
      upgradeSystem: this.upgradeSystem,
      upgradeStation: this.world.upgradeStation,
      pathHistory: this.pathHistory,
      hud: this.hud,
      input: this.inputController,
      navigationMarkers: {
        park: this.world.parkNavigationMarkerView,
        cat: this.world.catNavigationMarkerView,
        centralHub: this.world.centralHubMarkerView,
        fox: this.world.foxNavigationMarkerView,
        upgrade: this.world.upgradeNavigationMarkerView,
      },
      onProgressChanged: () => this.persistProgress(),
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
      restoredProgress
        ? 'Прогресс восстановлен'
        : 'Найди чужую базу и укради Собаку',
      1900,
    );
  }

  public override update(time: number, delta: number): void {
    const frameInput = this.inputController.readFrame();

    this.developerTools?.update(time);
    this.player.updatePlayer(time, frameInput.movement, frameInput.dashPressed);
    this.pathHistory.record(this.player);
    this.coreLoop.update(time, delta, frameInput.interactPressed);
    this.economy.update(delta);
    this.hud.recordPerformance(time, delta);

    this.hud.updateMoney(
      this.economy.getDisplayedMoney(),
      this.economy.getIncomePerSecond(),
    );
    const dashReadyRatio = this.player.getDashReadyRatio(time);
    this.hud.setDashReadyRatio(
      dashReadyRatio,
      this.inputController.isMobileMode,
    );
    this.inputController.setDashReadyRatio(dashReadyRatio);

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
          .map((encounter) => `${encounter.definition.id}:${encounter.chase.getState()}`)
          .join(' '),
      });
    }
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
      const ownerHome = new Phaser.Math.Vector2(
        definition.ownerHome.x,
        definition.ownerHome.y,
      );
      const owner = new OwnerNpc(
        this,
        ownerHome,
        definition.ownerVisualKey,
        definition.chase,
        definition.returnRoutes,
      );
      const chase = new ChaseSystem(owner, definition.chase);
      const encounter = new PetEncounter(definition, pet, owner, chase);

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
      this.physics.add.collider(encounter.owner, this.world.obstacles);
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
      toUpgradeStation: () =>
        this.player.setPosition(
          this.world.upgradeStationPosition.x,
          this.world.upgradeStationPosition.y + 72,
        ),
      catchActive: () => this.teleportActiveOwnerToPlayer(),
      cycleCatReturnTestPosition: () => this.cycleCatReturnTestPosition(),
      addMoney: (amount) => this.economy.addMoney(amount),
      resetMoney: () => this.economy.spend(this.economy.getMoney()),
      resetSave: () => this.resetSave(),
      testV1Migration: () => this.testV1Migration(),
      getSnapshot: () => this.getDeveloperSnapshot(),
    });
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
    }
  }

  private teleportActiveOwnerToPlayer(): void {
    const activeEncounter = this.encounters.find(
      (encounter) => encounter.owner.getState() === OwnerState.Chasing,
    );
    activeEncounter?.owner.setPosition(this.player.x, this.player.y);
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

  private getDeveloperSnapshot(): string {
    return [
      `stage=${this.progression.getStage()}`,
      `phase=${this.coreLoop.getPhase()}`,
      `active=${this.coreLoop.getActiveEncounterId()}`,
      `money=${this.economy.getMoney().toFixed(2)}`,
      `income=${this.economy.getIncomePerSecond()}`,
      `fps=${this.hud.getCurrentFps().toFixed(0)}/${this.hud.getRollingFps().toFixed(1)}`,
      `frame=${this.hud.getAverageFrameTimeMs().toFixed(2)}ms`,
      `limit=${this.game.loop.fpsLimit}`,
      `pos=${this.player.x.toFixed(0)},${this.player.y.toFixed(0)}`,
      `park=${this.progression.isZoneUnlocked(ZoneId.Park)}`,
      `hub=${this.progression.isZoneUnlocked(ZoneId.CentralHub)}`,
      `dashCd=${this.player.getDashCooldownMs()}`,
      `upgrades=${this.upgradeSystem.getPurchasedUpgradeIds().join(',') || 'none'}`,
      `pets=${this.encounters
        .map((encounter) => `${encounter.pet.petId}:${encounter.pet.getState()}`)
        .join(',')}`,
      `owners=${this.encounters
        .map((encounter) => `${encounter.pet.petId}:${encounter.owner.getState()}`)
        .join(',')}`,
    ].join(' · ');
  }

  private persistProgress(): void {
    if (this.suppressSaveOnShutdown) {
      return;
    }

    const progression = this.progression.getSnapshot();
    const saveData: GameSaveData = {
      saveVersion: 2,
      money: this.economy.getMoney(),
      deliveredPetIds: progression.deliveredPetIds,
      unlockedZones: progression.unlockedZones,
      purchasedUpgradeIds: this.upgradeSystem.getPurchasedUpgradeIds(),
    };
    this.saveSystem.save(saveData);
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

  private shutdown(): void {
    this.persistProgress();
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    this.scale.off('resize', this.resizeCamera, this);
    this.saveTimer?.remove(false);
    this.inputController.destroy();
    this.hud.destroy();
    this.developerTools?.destroy();
  }
}
