import Phaser from 'phaser';

import { CHASE_CONFIG, PET_CONFIG } from '../config/gameplay';
import { OwnerNpc } from '../entities/OwnerNpc';
import { Pet, PetState } from '../entities/Pet';
import { Player } from '../entities/Player';
import { InputController } from '../input/InputController';
import { Hud } from '../ui/Hud';
import { BaseSystem } from './BaseSystem';
import { ChaseSystem } from './ChaseSystem';
import { EconomySystem } from './EconomySystem';

export enum CoreLoopPhase {
  SeekPet = 'SEEK_PET',
  Escape = 'ESCAPE',
  Income = 'INCOME',
}

interface CoreLoopDependencies {
  scene: Phaser.Scene;
  player: Player;
  pet: Pet;
  owner: OwnerNpc;
  petHome: Phaser.Math.Vector2;
  baseSystem: BaseSystem;
  chaseSystem: ChaseSystem;
  economy: EconomySystem;
  hud: Hud;
  input: InputController;
  parkPreviewMarker: Phaser.GameObjects.Container;
}

export class CoreLoopSystem {
  private readonly scene: Phaser.Scene;
  private readonly player: Player;
  private readonly pet: Pet;
  private readonly owner: OwnerNpc;
  private readonly petHome: Phaser.Math.Vector2;
  private readonly baseSystem: BaseSystem;
  private readonly chaseSystem: ChaseSystem;
  private readonly economy: EconomySystem;
  private readonly hud: Hud;
  private readonly input: InputController;
  private readonly parkPreviewMarker: Phaser.GameObjects.Container;

  private phase = CoreLoopPhase.SeekPet;
  private retryAvailableAt = 0;
  private objective = 'Укради питомца с чужой базы';

  public constructor(dependencies: CoreLoopDependencies) {
    this.scene = dependencies.scene;
    this.player = dependencies.player;
    this.pet = dependencies.pet;
    this.owner = dependencies.owner;
    this.petHome = dependencies.petHome;
    this.baseSystem = dependencies.baseSystem;
    this.chaseSystem = dependencies.chaseSystem;
    this.economy = dependencies.economy;
    this.hud = dependencies.hud;
    this.input = dependencies.input;
    this.parkPreviewMarker = dependencies.parkPreviewMarker;
  }

  public update(time: number, delta: number, interactPressed: boolean): void {
    this.pet.updatePet(time, delta, this.player, this.player.getLastDirection());
    this.chaseSystem.update(this.player);

    if (this.phase === CoreLoopPhase.SeekPet) {
      this.updateSeeking(time, interactPressed);
    } else if (this.phase === CoreLoopPhase.Escape) {
      this.updateEscape(time);
    } else {
      this.objective =
        this.economy.getDisplayedMoney() >= 3
          ? 'Следующая зона: PARK — будущий этап'
          : 'Питомец приносит деньги · Следующая зона: PARK';
      this.setInteractionVisible(false);
    }

    this.hud.setObjective(this.objective);
  }

  public getPhase(): CoreLoopPhase {
    return this.phase;
  }

  private updateSeeking(time: number, interactPressed: boolean): void {
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.pet.x,
      this.pet.y,
    );
    const canSteal =
      this.pet.getState() === PetState.AtNpcBase &&
      this.chaseSystem.isOwnerReady() &&
      time >= this.retryAvailableAt &&
      distance <= PET_CONFIG.interactionRadius;

    if (canSteal) {
      this.objective = this.input.isMobileMode
        ? 'Нажми «УКРАСТЬ»'
        : 'Нажми E, чтобы украсть Собаку';
    } else if (!this.chaseSystem.isOwnerReady()) {
      this.objective = 'Хозяин возвращается · приготовься к новой попытке';
    } else {
      this.objective = 'Укради питомца с чужой базы';
    }

    this.setInteractionVisible(canSteal);

    if (canSteal && interactPressed) {
      this.startTheft();
    }
  }

  private updateEscape(time: number): void {
    this.setInteractionVisible(false);
    this.objective = 'Убегай! Вернись в зелёную зону своей базы';

    if (
      this.baseSystem.canDeliver(
        this.player,
        this.pet,
        PET_CONFIG.deliveryDistance,
      )
    ) {
      this.completeDelivery();
      return;
    }

    if (time >= this.retryAvailableAt && this.chaseSystem.hasCaught(this.player)) {
      this.failTheft(time);
    }
  }

  private startTheft(): void {
    this.phase = CoreLoopPhase.Escape;
    this.pet.startFollowing();
    this.chaseSystem.start();
    this.retryAvailableAt = this.scene.time.now + CHASE_CONFIG.theftHeadStartMs;
    this.hud.showToast('ПИТОМЕЦ УКРАДЕН! БЕГИ ДОМОЙ!', 1500);
    this.createTheftFlash();
    this.setInteractionVisible(false);
  }

  private failTheft(time: number): void {
    this.phase = CoreLoopPhase.SeekPet;
    this.retryAvailableAt = time + CHASE_CONFIG.failureGraceMs;
    this.pet.returnToNpcBase(this.petHome);
    this.chaseSystem.stop();
    this.player.applyCaughtFeedback(new Phaser.Math.Vector2(this.owner.x, this.owner.y));
    this.hud.showToast('ПОЙМАЛИ! Питомец вернулся домой', 1900);
  }

  private completeDelivery(): void {
    this.phase = CoreLoopPhase.Income;
    this.pet.placeAtPlayerBase(this.baseSystem.getPetSlot());
    this.chaseSystem.stop();
    this.economy.addIncomeSource(this.pet.petId, this.pet.incomePerSecond);
    this.parkPreviewMarker.setVisible(true);
    this.hud.showToast('Питомец спасён… ну почти 😄', 2300);
    this.createDeliveryCelebration();
  }

  private setInteractionVisible(visible: boolean): void {
    this.input.setInteractionVisible(visible);
    this.hud.setInteractionPrompt(visible, this.input.isMobileMode);
  }

  private createTheftFlash(): void {
    const ring = this.scene.add
      .circle(this.pet.x, this.pet.y, 28, 0xffe575, 0.12)
      .setStrokeStyle(8, 0xffd23f, 0.95)
      .setDepth(this.pet.y + 2);

    this.scene.tweens.add({
      targets: ring,
      scale: 2.2,
      alpha: 0,
      duration: 360,
      onComplete: () => ring.destroy(),
    });
  }

  private createDeliveryCelebration(): void {
    const colors = [0xffd23f, 0x6ce39a, 0x72c7ff, 0xff85b3];

    for (let index = 0; index < 12; index += 1) {
      const angle = (Math.PI * 2 * index) / 12;
      const particle = this.scene.add
        .circle(this.pet.x, this.pet.y, 7, colors[index % colors.length] ?? 0xffffff)
        .setDepth(this.pet.y + 4);

      this.scene.tweens.add({
        targets: particle,
        x: this.pet.x + Math.cos(angle) * 100,
        y: this.pet.y + Math.sin(angle) * 100,
        alpha: 0,
        scale: 0.3,
        duration: 620,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }
}
