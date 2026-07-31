import Phaser from 'phaser';

import { PET_CONFIG } from '../config/gameplay';
import type { PetDefinition, PetId } from '../data/pets';
import { PlayerPathHistory } from '../systems/PlayerPathHistory';

export enum PetState {
  AtNpcBase = 'AT_NPC_BASE',
  FollowingPlayer = 'FOLLOWING_PLAYER',
  AtPlayerBase = 'AT_PLAYER_BASE',
}

export class Pet extends Phaser.GameObjects.Sprite {
  public readonly petId: PetId;
  public readonly displayName: string;
  public readonly incomePerSecond: number;

  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly idlePhase: number;
  private petState = PetState.AtNpcBase;
  private idleAnchor: Phaser.Math.Vector2;
  private lastBreadcrumbSequence: number | null = null;
  private nextIncomeFeedbackAt = Number.POSITIVE_INFINITY;

  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    definition: PetDefinition,
  ) {
    super(scene, x, y, definition.visualKey);

    this.petId = definition.id as PetId;
    this.displayName = definition.displayName;
    this.incomePerSecond = definition.incomePerSecond;
    this.idlePhase =
      definition.id === 'cat'
        ? Math.PI * 0.65
        : definition.id === 'fox'
          ? Math.PI * 1.15
          : 0;
    this.idleAnchor = new Phaser.Math.Vector2(x, y);
    this.shadow = scene.add.ellipse(
      x,
      y + 17,
      definition.id === 'cat' ? 38 : definition.id === 'fox' ? 47 : 43,
      14,
      0x18324a,
      0.24,
    );
    scene.add.existing(this);
    this.setOrigin(0.5, 0.7);
    if (definition.id === 'cat') {
      this.setScale(0.94);
    } else if (definition.id === 'fox') {
      this.setScale(1.04);
    }
    this.updateDepth();
  }

  public getState(): PetState {
    return this.petState;
  }

  public startFollowing(): void {
    this.petState = PetState.FollowingPlayer;
    this.lastBreadcrumbSequence = null;
    this.nextIncomeFeedbackAt = Number.POSITIVE_INFINITY;
    this.setScale(1.08);
  }

  public returnToNpcBase(position: Phaser.Math.Vector2): void {
    this.petState = PetState.AtNpcBase;
    this.lastBreadcrumbSequence = null;
    this.idleAnchor = position.clone();
    this.setPosition(position.x, position.y);
    this.setScale(this.petId === 'cat' ? 0.94 : this.petId === 'fox' ? 1.04 : 1);
    this.clearTint();
    this.nextIncomeFeedbackAt = Number.POSITIVE_INFINITY;
    this.updateDepth();
  }

  public placeAtPlayerBase(position: Phaser.Math.Vector2): void {
    this.petState = PetState.AtPlayerBase;
    this.lastBreadcrumbSequence = null;
    this.idleAnchor = position.clone();
    this.setPosition(position.x, position.y);
    this.setScale(this.petId === 'cat' ? 1 : this.petId === 'fox' ? 1.08 : 1.06);
    this.setTint(
      this.petId === 'cat'
        ? 0xf1ddff
        : this.petId === 'fox'
          ? 0xffdfba
          : 0xfff3a6,
    );
    this.nextIncomeFeedbackAt =
      this.scene.time.now + 1200 + Math.abs(this.idlePhase) * 380;
    this.updateDepth();
  }

  public updatePet(
    time: number,
    delta: number,
    player: Phaser.Types.Math.Vector2Like,
    pathHistory: PlayerPathHistory,
  ): void {
    if (this.petState === PetState.FollowingPlayer) {
      this.updateFollowing(delta, player, pathHistory);
    } else {
      this.updateIdle(time);
      if (
        this.petState === PetState.AtPlayerBase &&
        time >= this.nextIncomeFeedbackAt
      ) {
        this.createIncomeFeedback();
        this.nextIncomeFeedbackAt = time + 3200;
      }
    }

    this.shadow.setPosition(this.x, this.y + 16);
    this.updateDepth();
  }

  private updateFollowing(
    delta: number,
    player: Phaser.Types.Math.Vector2Like,
    pathHistory: PlayerPathHistory,
  ): void {
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y,
    );

    if (distanceToPlayer > PET_CONFIG.teleportDistance) {
      const correctionPoint = pathHistory.getTrailingPoint(PET_CONFIG.followDistance);
      if (correctionPoint !== null) {
        this.setPosition(correctionPoint.x, correctionPoint.y);
        this.lastBreadcrumbSequence = correctionPoint.sequence;
      }
      return;
    }

    for (let skippedPoints = 0; skippedPoints < 4; skippedPoints += 1) {
      const waypoint = pathHistory.getNextFollowWaypoint(
        this.lastBreadcrumbSequence,
        PET_CONFIG.followDistance,
      );
      if (waypoint === null) {
        this.setRotation(this.rotation * 0.82);
        return;
      }

      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        waypoint.x,
        waypoint.y,
      );
      if (distance <= PET_CONFIG.breadcrumbReachDistance) {
        this.lastBreadcrumbSequence = waypoint.sequence;
        continue;
      }

      const speed =
      distanceToPlayer > PET_CONFIG.followDistance * 2
        ? PET_CONFIG.catchUpSpeed
        : PET_CONFIG.followSpeed;
      const step = Math.min(distance, speed * (delta / 1000));
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        waypoint.x,
        waypoint.y,
      );

      this.x += Math.cos(angle) * step;
      this.y += Math.sin(angle) * step;
      this.setRotation(Math.sin(angle) * 0.08);
      return;
    }
  }

  private updateIdle(time: number): void {
    const catMotion = this.petId === 'cat';
    const foxMotion = this.petId === 'fox';
    const bob = Math.sin(time / (catMotion ? 220 : foxMotion ? 245 : 280) + this.idlePhase) * 3;
    const sway =
      catMotion || foxMotion
        ? Math.sin(time / (foxMotion ? 460 : 520) + this.idlePhase) * (foxMotion ? 6 : 4)
        : 0;
    this.setPosition(this.idleAnchor.x + sway, this.idleAnchor.y + bob);
    this.setRotation(
      Math.sin(time / (catMotion ? 320 : foxMotion ? 290 : 430) + this.idlePhase) *
        (foxMotion ? 0.065 : 0.05),
    );
  }

  private updateDepth(): void {
    this.shadow.setDepth(this.y - 2);
    this.setDepth(this.y);
  }

  private createIncomeFeedback(): void {
    const incomeText = this.scene.add
      .text(this.x, this.y - 38, `+${this.incomePerSecond}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#fff3a4',
        stroke: '#5b4214',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(this.y + 4);

    this.scene.tweens.add({
      targets: incomeText,
      y: incomeText.y - 24,
      alpha: 0,
      duration: 720,
      ease: 'Quad.easeOut',
      onComplete: () => incomeText.destroy(),
    });
  }
}
