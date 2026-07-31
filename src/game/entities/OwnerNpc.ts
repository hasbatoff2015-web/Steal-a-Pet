import Phaser from 'phaser';

import type { ChaseParameters } from '../data/encounters';

export enum OwnerState {
  Idle = 'IDLE',
  Chasing = 'CHASING',
  Returning = 'RETURNING',
}

export class OwnerNpc extends Phaser.Physics.Arcade.Sprite {
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly home: Phaser.Math.Vector2;
  private ownerState = OwnerState.Idle;

  public constructor(
    scene: Phaser.Scene,
    home: Phaser.Math.Vector2,
    visualKey: string,
    private readonly chaseParameters: ChaseParameters,
  ) {
    super(scene, home.x, home.y, visualKey);

    this.home = home.clone();
    this.shadow = scene.add.ellipse(home.x, home.y + 22, 42, 17, 0x321f25, 0.28);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.62);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(19, 7, 10);
  }

  public getState(): OwnerState {
    return this.ownerState;
  }

  public startChase(): void {
    this.ownerState = OwnerState.Chasing;
    this.setScale(1);
    this.setTint(0xffd1cc);
  }

  public returnHome(): void {
    this.ownerState = OwnerState.Returning;
    this.clearTint();
  }

  public updateNpc(player: Phaser.GameObjects.GameObject & Phaser.Types.Math.Vector2Like): void {
    if (this.ownerState === OwnerState.Idle) {
      this.setScale(1 + Math.sin(this.scene.time.now / 350) * 0.025);
      return;
    }

    if (this.ownerState === OwnerState.Chasing) {
      this.scene.physics.moveToObject(this, player, this.chaseParameters.npcSpeed);
    } else {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, this.home.x, this.home.y);

      if (distance < 12) {
        this.setPosition(this.home.x, this.home.y);
        this.setVelocity(0, 0);
        this.ownerState = OwnerState.Idle;
      } else {
        this.scene.physics.moveTo(
          this,
          this.home.x,
          this.home.y,
          this.chaseParameters.returnSpeed,
        );
      }
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.lengthSq() > 4) {
      this.setFlipX(body.velocity.x < 0);
    }

    this.shadow.setPosition(this.x, this.y + 20);
    this.shadow.setDepth(this.y - 2);
    this.setDepth(this.y);
  }
}
