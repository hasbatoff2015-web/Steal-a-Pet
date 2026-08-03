import Phaser from 'phaser';

import { PLAYER_CONFIG } from '../config/gameplay';
import { DashChargeController } from '../systems/DashChargeController';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly directionMarker: Phaser.GameObjects.Triangle;
  private readonly lastDirection = new Phaser.Math.Vector2(0, -1);
  private readonly dashDirection = new Phaser.Math.Vector2(0, -1);

  private dashEndsAt = 0;
  private nextTrailAt = 0;
  private moveSpeedMultiplier = 1;
  private readonly dashCharges = new DashChargeController(
    PLAYER_CONFIG.dashCooldownMs,
  );

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    this.shadow = scene.add.ellipse(x, y + 22, 42, 17, 0x18324a, 0.28);
    this.directionMarker = scene.add.triangle(x, y, 0, -7, 6, 6, -6, 6, 0xffffff, 0.95);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.62);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(PLAYER_CONFIG.radius, 7, 10);
    body.setMaxVelocity(PLAYER_CONFIG.dashSpeed, PLAYER_CONFIG.dashSpeed);
  }

  public updatePlayer(
    time: number,
    movement: Phaser.Math.Vector2,
    dashPressed: boolean,
  ): void {
    this.dashCharges.update(time);

    if (movement.lengthSq() > 0) {
      this.lastDirection.copy(movement).normalize();
    }

    if (
      dashPressed &&
      this.dashCharges.tryConsume(time, time >= this.dashEndsAt)
    ) {
      this.dashDirection.copy(this.lastDirection);
      this.dashEndsAt = time + PLAYER_CONFIG.dashDurationMs;
      this.nextTrailAt = time;
    }

    const isDashing = time < this.dashEndsAt;
    const direction = isDashing ? this.dashDirection : movement;
    const speed = isDashing
      ? PLAYER_CONFIG.dashSpeed
      : PLAYER_CONFIG.speed * this.moveSpeedMultiplier;

    this.setVelocity(direction.x * speed, direction.y * speed);

    if (isDashing) {
      this.setScale(1.16, 0.88);
      if (time >= this.nextTrailAt) {
        this.createDashTrail();
        this.nextTrailAt = time + PLAYER_CONFIG.trailIntervalMs;
      }
    } else {
      this.setScale(1);
    }

    this.updateVisuals();
  }

  public getLastDirection(): Phaser.Math.Vector2 {
    return this.lastDirection;
  }

  public getDashReadyRatio(time: number): number {
    return this.getDashRechargeRatio(time);
  }

  public getDashRechargeRatio(time: number): number {
    return this.dashCharges.getRechargeRatio(time);
  }

  public setDashCooldownMs(cooldownMs: number): void {
    this.dashCharges.setCooldownMs(cooldownMs, this.scene.time.now);
  }

  public setMaxDashCharges(maxCharges: number): void {
    this.dashCharges.setMaxCharges(maxCharges, this.scene.time.now);
  }

  public setMoveSpeedMultiplier(multiplier: number): void {
    this.moveSpeedMultiplier = Math.max(0.1, multiplier);
  }

  public getMoveSpeedMultiplier(): number {
    return this.moveSpeedMultiplier;
  }

  public getDashCooldownMs(): number {
    return this.dashCharges.getCooldownMs();
  }

  public getDashCharges(): number {
    return this.dashCharges.getCharges();
  }

  public getMaxDashCharges(): number {
    return this.dashCharges.getMaxCharges();
  }

  public shiftTiming(deltaMs: number): void {
    if (deltaMs <= 0) {
      return;
    }
    if (this.dashEndsAt > 0) {
      this.dashEndsAt += deltaMs;
    }
    if (this.nextTrailAt > 0) {
      this.nextTrailAt += deltaMs;
    }
    this.dashCharges.shiftTiming(deltaMs);
  }

  public applyCaughtFeedback(ownerPosition: Phaser.Math.Vector2): void {
    const knockback = new Phaser.Math.Vector2(this.x - ownerPosition.x, this.y - ownerPosition.y);
    if (knockback.lengthSq() === 0) {
      knockback.set(0, 1);
    }

    knockback.normalize().scale(34);
    this.setPosition(this.x + knockback.x, this.y + knockback.y);
    this.setTint(0xffb7b0);
    this.scene.time.delayedCall(220, () => this.clearTint());
  }

  private updateVisuals(): void {
    const angle = this.lastDirection.angle() + Math.PI / 2;

    this.shadow.setPosition(this.x, this.y + 20);
    this.shadow.setDepth(this.y - 2);
    this.directionMarker.setPosition(
      this.x + this.lastDirection.x * 18,
      this.y - 7 + this.lastDirection.y * 18,
    );
    this.directionMarker.setRotation(angle);
    this.directionMarker.setDepth(this.y + 2);
    this.setDepth(this.y);
  }

  private createDashTrail(): void {
    const trail = this.scene.add
      .circle(this.x, this.y, 20, 0xbfe9ff, 0.3)
      .setDepth(this.y - 3);

    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 1.65,
      duration: 190,
      ease: 'Quad.easeOut',
      onComplete: () => trail.destroy(),
    });
  }
}
