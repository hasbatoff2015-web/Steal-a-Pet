import Phaser from 'phaser';

import { PET_CONFIG } from '../config/gameplay';

export enum PetState {
  AtNpcBase = 'AT_NPC_BASE',
  FollowingPlayer = 'FOLLOWING_PLAYER',
  AtPlayerBase = 'AT_PLAYER_BASE',
}

export class Pet extends Phaser.GameObjects.Sprite {
  public readonly petId = 'prototype-dog';
  public readonly incomePerSecond = PET_CONFIG.prototypeIncomePerSecond;

  private readonly shadow: Phaser.GameObjects.Ellipse;
  private petState = PetState.AtNpcBase;
  private idleAnchor: Phaser.Math.Vector2;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'dog');

    this.idleAnchor = new Phaser.Math.Vector2(x, y);
    this.shadow = scene.add.ellipse(x, y + 17, 43, 14, 0x18324a, 0.24);
    scene.add.existing(this);
    this.setOrigin(0.5, 0.7);
    this.updateDepth();
  }

  public getState(): PetState {
    return this.petState;
  }

  public startFollowing(): void {
    this.petState = PetState.FollowingPlayer;
    this.setScale(1.08);
  }

  public returnToNpcBase(position: Phaser.Math.Vector2): void {
    this.petState = PetState.AtNpcBase;
    this.idleAnchor = position.clone();
    this.setPosition(position.x, position.y);
    this.setScale(1);
    this.clearTint();
    this.updateDepth();
  }

  public placeAtPlayerBase(position: Phaser.Math.Vector2): void {
    this.petState = PetState.AtPlayerBase;
    this.idleAnchor = position.clone();
    this.setPosition(position.x, position.y);
    this.setScale(1.06);
    this.setTint(0xfff3a6);
    this.updateDepth();
  }

  public updatePet(
    time: number,
    delta: number,
    player: Phaser.Types.Math.Vector2Like,
    playerDirection: Phaser.Math.Vector2,
  ): void {
    if (this.petState === PetState.FollowingPlayer) {
      this.updateFollowing(delta, player, playerDirection);
    } else {
      this.updateIdle(time);
    }

    this.shadow.setPosition(this.x, this.y + 16);
    this.updateDepth();
  }

  private updateFollowing(
    delta: number,
    player: Phaser.Types.Math.Vector2Like,
    playerDirection: Phaser.Math.Vector2,
  ): void {
    const targetX = player.x - playerDirection.x * PET_CONFIG.followDistance;
    const targetY = player.y - playerDirection.y * PET_CONFIG.followDistance;
    const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);

    if (distance > PET_CONFIG.teleportDistance) {
      this.setPosition(targetX, targetY);
      return;
    }

    if (distance < 12) {
      return;
    }

    const speed =
      distance > PET_CONFIG.followDistance * 2
        ? PET_CONFIG.catchUpSpeed
        : PET_CONFIG.followSpeed;
    const step = Math.min(distance, speed * (delta / 1000));
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

    this.x += Math.cos(angle) * step;
    this.y += Math.sin(angle) * step;
    this.setRotation(Math.sin(angle) * 0.08);
  }

  private updateIdle(time: number): void {
    const bob = Math.sin(time / 280) * 3;
    this.setPosition(this.idleAnchor.x, this.idleAnchor.y + bob);
    this.setRotation(Math.sin(time / 430) * 0.05);
  }

  private updateDepth(): void {
    this.shadow.setDepth(this.y - 2);
    this.setDepth(this.y);
  }
}
