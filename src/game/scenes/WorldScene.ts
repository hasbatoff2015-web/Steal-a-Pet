import Phaser from 'phaser';

import { PET_CONFIG, WORLD } from '../config/gameplay';
import { OwnerNpc } from '../entities/OwnerNpc';
import { Pet } from '../entities/Pet';
import { Player } from '../entities/Player';
import { InputController } from '../input/InputController';
import { BaseSystem } from '../systems/BaseSystem';
import { ChaseSystem } from '../systems/ChaseSystem';
import { CoreLoopSystem } from '../systems/CoreLoopSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { PlayerPathHistory } from '../systems/PlayerPathHistory';
import { Hud } from '../ui/Hud';
import { createPrototypeTextures } from '../utils/createPrototypeTextures';
import { DeveloperTools } from '../utils/DeveloperTools';
import { WorldBuilder } from '../world/WorldBuilder';

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private pet!: Pet;
  private owner!: OwnerNpc;
  private inputController!: InputController;
  private economy!: EconomySystem;
  private pathHistory!: PlayerPathHistory;
  private coreLoop!: CoreLoopSystem;
  private hud!: Hud;
  private developerTools: DeveloperTools | null = null;

  public constructor() {
    super({ key: 'WorldScene' });
  }

  public create(): void {
    createPrototypeTextures(this);

    const world = new WorldBuilder(this).build();

    this.player = new Player(this, world.playerSpawn.x, world.playerSpawn.y);
    this.pet = new Pet(this, world.petHome.x, world.petHome.y);
    this.owner = new OwnerNpc(this, world.npcHome);
    this.inputController = new InputController(this);
    this.economy = new EconomySystem();
    this.pathHistory = new PlayerPathHistory(
      this.player,
      PET_CONFIG.breadcrumbSpacing,
      PET_CONFIG.breadcrumbMaxPoints,
    );
    this.hud = new Hud(this);

    const baseSystem = new BaseSystem(world.playerDeliveryZone, world.playerPetSlot);
    const chaseSystem = new ChaseSystem(this.owner);

    this.coreLoop = new CoreLoopSystem({
      scene: this,
      player: this.player,
      pet: this.pet,
      owner: this.owner,
      petHome: world.petHome,
      baseSystem,
      chaseSystem,
      economy: this.economy,
      pathHistory: this.pathHistory,
      hud: this.hud,
      input: this.inputController,
      parkPreviewMarker: world.parkPreviewMarker,
    });

    if (new URLSearchParams(window.location.search).get('dev') === '1') {
      this.developerTools = new DeveloperTools(
        this,
        this.player,
        this.owner,
        world.petHome,
        new Phaser.Math.Vector2(
          world.playerDeliveryZone.centerX,
          world.playerDeliveryZone.centerY,
        ),
        {
          interact: () => this.inputController.requestDevInteract(),
          dash: () => this.inputController.requestDevDash(),
          getSnapshot: () =>
            [
              `phase=${this.coreLoop.getPhase()}`,
              `pet=${this.pet.getState()}`,
              `npc=${this.owner.getState()}`,
              `money=${this.economy.getMoney().toFixed(2)}`,
            ].join(' · '),
        },
      );
    }

    this.physics.add.collider(this.player, world.obstacles);
    this.physics.add.collider(this.owner, world.obstacles);

    const camera = this.cameras.main;
    camera.setBounds(0, 0, WORLD.width, WORLD.height);
    camera.startFollow(this.player, true, 0.1, 0.1);
    camera.setRoundPixels(true);
    this.resizeCamera(this.scale.gameSize);

    this.scale.on('resize', this.resizeCamera, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    this.hud.setObjective('Укради питомца с чужой базы');
    this.hud.showToast('Найди чужую базу и Собаку', 1900);
  }

  public override update(time: number, delta: number): void {
    const frameInput = this.inputController.readFrame();

    this.developerTools?.update();
    this.player.updatePlayer(time, frameInput.movement, frameInput.dashPressed);
    this.pathHistory.record(this.player);
    this.coreLoop.update(time, delta, frameInput.interactPressed);
    this.economy.update(delta);

    this.hud.updateMoney(
      this.economy.getDisplayedMoney(),
      this.economy.getIncomePerSecond(),
    );
    const dashReadyRatio = this.player.getDashReadyRatio(time);
    this.hud.setDashReadyRatio(dashReadyRatio, this.inputController.isMobileMode);
    this.inputController.setDashReadyRatio(dashReadyRatio);

    if (frameInput.debugPressed) {
      this.hud.toggleDebug();
    }

    this.hud.updateDebug({
      fps: this.game.loop.actualFps,
      playerX: this.player.x,
      playerY: this.player.y,
      petState: this.pet.getState(),
      chaseState: this.owner.getState(),
    });
  }

  private resizeCamera(gameSize: Phaser.Structs.Size): void {
    const shortestSide = Math.min(gameSize.width, gameSize.height);
    const zoom =
      shortestSide < 430 ? 0.82 : shortestSide < 700 ? 0.92 : gameSize.width > 1500 ? 1.08 : 1;
    this.cameras.main.setZoom(zoom);
  }

  private shutdown(): void {
    this.scale.off('resize', this.resizeCamera, this);
    this.inputController.destroy();
    this.hud.destroy();
    this.developerTools?.destroy();
  }
}
