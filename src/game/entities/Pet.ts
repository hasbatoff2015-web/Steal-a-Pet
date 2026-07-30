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
    this.idlePhase = definition.id === 'cat' ? Math.PI * 0.65 : 0;
    this.idleAnchor = new Phaser.Math.Vector2(x, y);
    this.shadow = scene.add.ellipse(
      x,
      y + 17,
      definition.id === 'cat' ? 38 : 43,
      14,
      0x18324a,
      0.24,
    );
    scene.add.existing(this);
    this.setOrigin(0.5, 0.7);
    if (definition.id === 'cat') {
      this.setScale(0.94);
    }
    this.updateDepth();
  }

  public getState(): PetState {
    return this.petState;
  }

  public startFollowing(): void {
    this.petState = PetState.FollowingPlayer;
    this.lastBreadcrumbSequence = null;
    this.setScale(1.08);
  }

  public returnToNpcBase(position: Phaser.Math.Vector2): void {
    this.petState = PetState.AtNpcBase;
    this.lastBreadcrumbSequence = null;
    this.idleAnchor = position.clone();
    this.setPosition(position.x, position.y);
    this.setScale(this.petId === 'cat' ? 0.94 : 1);
    this.clearTint();
    this.updateDepth();
  }

  public placeAtPlayerBase(position: Phaser.Math.Vector2): void {
    this.petState = PetState.AtPlayerBase;
    this.lastBreadcrumbSequence = null;
    this.idleAnchor = position.clone();
    this.setPosition(position.x, position.y);
    this.setScale(this.petId === 'cat' ? 1 : 1.06);
    this.setTint(this.petId === 'cat' ? 0xf1ddff : 0xfff3a6);
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
    const bob = Math.sin(time / (catMotion ? 220 : 280) + this.idlePhase) * 3;
    const sway = catMotion ? Math.sin(time / 520 + this.idlePhase) * 4 : 0;
    this.setPosition(this.idleAnchor.x + sway, this.idleAnchor.y + bob);
    this.setRotation(Math.sin(time / (catMotion ? 320 : 430) + this.idlePhase) * 0.05);
  }

  private updateDepth(): void {
    this.shadow.setDepth(this.y - 2);
    this.setDepth(this.y);
  }
}
