import Phaser from 'phaser';

import { PLAYER_CONFIG } from '../config/gameplay';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly directionMarker: Phaser.GameObjects.Triangle;
  private readonly lastDirection = new Phaser.Math.Vector2(0, -1);
  private readonly dashDirection = new Phaser.Math.Vector2(0, -1);

  private dashEndsAt = 0;
  private dashAvailableAt = 0;
  private nextTrailAt = 0;
  private dashCooldownMs: number = PLAYER_CONFIG.dashCooldownMs;

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
    if (movement.lengthSq() > 0) {
      this.lastDirection.copy(movement).normalize();
    }

    if (dashPressed && time >= this.dashAvailableAt) {
      this.dashDirection.copy(this.lastDirection);
      this.dashEndsAt = time + PLAYER_CONFIG.dashDurationMs;
      this.dashAvailableAt = time + this.dashCooldownMs;
      this.nextTrailAt = time;
    }

    const isDashing = time < this.dashEndsAt;
    const direction = isDashing ? this.dashDirection : movement;
    const speed = isDashing ? PLAYER_CONFIG.dashSpeed : PLAYER_CONFIG.speed;

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
    if (time >= this.dashAvailableAt) {
      return 1;
    }

    return Phaser.Math.Clamp(
      1 - (this.dashAvailableAt - time) / this.dashCooldownMs,
      0,
      1,
    );
  }

  public setDashCooldownMs(cooldownMs: number): void {
    const nextCooldownMs = Math.max(1, cooldownMs);
    const now = this.scene.time.now;
    const remainingMs = Math.max(0, this.dashAvailableAt - now);
    const elapsedMs = Math.max(0, this.dashCooldownMs - remainingMs);

    this.dashCooldownMs = nextCooldownMs;
    if (remainingMs > 0) {
      this.dashAvailableAt = now + Math.max(0, nextCooldownMs - elapsedMs);
    }
  }

  public getDashCooldownMs(): number {
    return this.dashCooldownMs;
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
