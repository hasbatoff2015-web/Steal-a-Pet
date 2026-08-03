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
  private readonly prototypeVisual: PetDefinition['prototypeVisual'];
  private petState = PetState.AtNpcBase;
  private idleAnchor: Phaser.Math.Vector2;
  private lastBreadcrumbSequence: number | null = null;
  private nextIncomeFeedbackAt = Number.POSITIVE_INFINITY;
  private nextIdleVisualAt = 0;

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
    this.prototypeVisual = definition.prototypeVisual;
    this.idleAnchor = new Phaser.Math.Vector2(x, y);
    this.shadow = scene.add.ellipse(
      x,
      y + 17,
      this.prototypeVisual.shadowWidth,
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

  public setRoamingPosition(x: number, y: number): void {
    this.idleAnchor.set(x, y);
    this.setPosition(x, y);
    this.shadow.setPosition(x, y + 16);
    this.updateDepth();
  }

  public setRoamingFeedback(tired: boolean): void {
    if (tired) this.setTint(0xbde8ff);
    else this.clearTint();
  }

  public setPetVisible(visible: boolean): void {
    this.setVisible(visible);
    this.shadow.setVisible(visible);
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
      this.scene.time.now + 1200 + Math.abs(this.prototypeVisual.idlePhase) * 380;
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
      this.shadow.setPosition(this.x, this.y + 16);
      this.updateDepth();
    } else {
      if (time >= this.nextIdleVisualAt) {
        this.nextIdleVisualAt = time + 80;
        this.updateIdle(time);
        this.shadow.setPosition(this.x, this.y + 16);
        this.updateDepth();
      }
      if (
        this.petState === PetState.AtPlayerBase &&
        time >= this.nextIncomeFeedbackAt
      ) {
        this.createIncomeFeedback();
        this.nextIncomeFeedbackAt = time + 4800;
      }
    }
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
    const visual = this.prototypeVisual;
    const bob =
      Math.sin(time / visual.idleBobPeriodMs + visual.idlePhase) *
      visual.idleBobAmplitude;
    const sway =
      Math.sin(time / visual.idleSwayPeriodMs + visual.idlePhase) *
      visual.idleSwayAmplitude;
    this.setPosition(this.idleAnchor.x + sway, this.idleAnchor.y + bob);
    const baseScale = this.getIdleScale(this.petState === PetState.AtPlayerBase);
    const scalePulse = visual.idleScalePulse ?? 0;
    if (scalePulse > 0) {
      const squash = Math.sin(time / visual.idleRotationPeriodMs + visual.idlePhase) * scalePulse;
      this.setScale(baseScale * (1 + squash), baseScale * (1 - squash * 0.35));
    } else {
      this.setScale(baseScale);
    }
    this.setRotation(
      Math.sin(time / visual.idleRotationPeriodMs + visual.idlePhase) *
        visual.idleRotationAmplitude,
    );
  }

  private getIdleScale(atPlayerBase: boolean): number {
    return atPlayerBase
      ? this.prototypeVisual.playerBaseScale
      : this.prototypeVisual.npcScale;
  }

  private getBaseTint(): number {
    return this.prototypeVisual.playerBaseTint;
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
