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
          : definition.id === 'peacock'
            ? Math.PI * 1.55
            : definition.id === 'panda'
              ? Math.PI * 0.3
              : 0;
    this.idleAnchor = new Phaser.Math.Vector2(x, y);
    this.shadow = scene.add.ellipse(
      x,
      y + 17,
      definition.id === 'cat'
        ? 38
        : definition.id === 'fox'
          ? 47
          : definition.id === 'peacock'
            ? 62
            : definition.id === 'panda'
              ? 54
              : 43,
      14,
      0x18324a,
      0.24,
    );
    scene.add.existing(this);
    this.setOrigin(0.5, 0.7);
    this.setScale(this.getIdleScale(false));
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
    this.setScale(this.getIdleScale(false));
    this.clearTint();
    this.nextIncomeFeedbackAt = Number.POSITIVE_INFINITY;
    this.updateDepth();
  }

  public placeAtPlayerBase(position: Phaser.Math.Vector2): void {
    this.petState = PetState.AtPlayerBase;
    this.lastBreadcrumbSequence = null;
    this.idleAnchor = position.clone();
    this.setPosition(position.x, position.y);
    this.setScale(this.getIdleScale(true));
    this.setTint(this.getBaseTint());
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
    const peacockMotion = this.petId === 'peacock';
    const pandaMotion = this.petId === 'panda';
    const bob =
      Math.sin(
        time /
          (catMotion
            ? 220
            : foxMotion
              ? 245
              : peacockMotion
                ? 310
                : pandaMotion
                  ? 360
                  : 280) +
          this.idlePhase,
      ) * (pandaMotion ? 2 : 3);
    const sway =
      catMotion || foxMotion || peacockMotion
        ? Math.sin(time / (foxMotion ? 460 : peacockMotion ? 620 : 520) + this.idlePhase) *
          (foxMotion ? 6 : peacockMotion ? 5 : 4)
        : 0;
    this.setPosition(this.idleAnchor.x + sway, this.idleAnchor.y + bob);
    const baseScale = this.getIdleScale(this.petState === PetState.AtPlayerBase);
    if (peacockMotion) {
      const tailPulse = (Math.sin(time / 520 + this.idlePhase) + 1) * 0.5;
      this.setScale(baseScale * (1 + tailPulse * 0.045), baseScale);
    } else if (pandaMotion) {
      const squash = Math.sin(time / 430 + this.idlePhase) * 0.025;
      this.setScale(baseScale * (1 + squash), baseScale * (1 - squash));
    }
    this.setRotation(
      Math.sin(
        time /
          (catMotion ? 320 : foxMotion ? 290 : peacockMotion ? 510 : 430) +
          this.idlePhase,
      ) * (foxMotion ? 0.065 : peacockMotion ? 0.035 : 0.05),
    );
  }

  private getIdleScale(atPlayerBase: boolean): number {
    switch (this.petId) {
      case 'cat':
        return atPlayerBase ? 1 : 0.94;
      case 'fox':
        return atPlayerBase ? 1.08 : 1.04;
      case 'peacock':
        return atPlayerBase ? 1.02 : 0.98;
      case 'panda':
        return atPlayerBase ? 1.06 : 1.02;
      case 'dog':
        return atPlayerBase ? 1.06 : 1;
    }
  }

  private getBaseTint(): number {
    switch (this.petId) {
      case 'cat':
        return 0xf1ddff;
      case 'fox':
        return 0xffdfba;
      case 'peacock':
        return 0xd4ffff;
      case 'panda':
        return 0xfff8df;
      case 'dog':
        return 0xfff3a6;
    }
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
