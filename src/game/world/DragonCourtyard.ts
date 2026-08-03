import Phaser from 'phaser';

export class DragonCourtyard {
  private vipADelivered: boolean | null = null;
  private vipBDelivered: boolean | null = null;
  private open = false;

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly barriers: readonly Phaser.GameObjects.Rectangle[],
    private readonly blockingVisuals: readonly Phaser.GameObjects.Rectangle[],
    private readonly sealIndicators: readonly [
      Phaser.GameObjects.Arc,
      Phaser.GameObjects.Arc,
    ],
    private readonly statusLabel: Phaser.GameObjects.Text,
  ) {}

  public setDeliveryState(
    vipADelivered: boolean,
    vipBDelivered: boolean,
    animate: boolean,
  ): void {
    const firstUpdate = this.vipADelivered === null || this.vipBDelivered === null;
    const vipAChanged = this.vipADelivered !== vipADelivered;
    const vipBChanged = this.vipBDelivered !== vipBDelivered;
    this.vipADelivered = vipADelivered;
    this.vipBDelivered = vipBDelivered;

    this.updateSeal(this.sealIndicators[0], vipADelivered);
    this.updateSeal(this.sealIndicators[1], vipBDelivered);
    const sealCount = Number(vipADelivered) + Number(vipBDelivered);
    this.statusLabel.setText(`ЗАЩИТА ДРАКОНА · ${sealCount}/2`);

    if (animate && !firstUpdate) {
      if (vipAChanged && vipADelivered) {
        this.createSealBurst(this.sealIndicators[0]);
      }
      if (vipBChanged && vipBDelivered) {
        this.createSealBurst(this.sealIndicators[1]);
      }
    }

    if (sealCount === 2) {
      this.unlock(animate && !firstUpdate);
    }
  }

  public getSealCount(): number {
    return Number(this.vipADelivered) + Number(this.vipBDelivered);
  }

  public isOpen(): boolean {
    return this.open;
  }

  private updateSeal(indicator: Phaser.GameObjects.Arc, disabled: boolean): void {
    indicator
      .setFillStyle(disabled ? 0x52d982 : 0xe3557d, disabled ? 0.85 : 0.95)
      .setStrokeStyle(5, disabled ? 0xd9ffe5 : 0xffd0e0, 0.95);
  }

  private unlock(animate: boolean): void {
    if (this.open) {
      return;
    }

    this.open = true;
    for (const barrier of this.barriers) {
      barrier.destroy();
    }
    this.statusLabel
      .setText('ЗАЩИТА СНЯТА · ДРАКОН ДОСТУПЕН')
      .setColor('#eaffc9')
      .setBackgroundColor('#31533aeb');

    if (!animate) {
      for (const visual of this.blockingVisuals) {
        visual.setAlpha(0);
      }
      return;
    }

    this.scene.tweens.add({
      targets: this.blockingVisuals,
      alpha: 0,
      scaleY: 0.2,
      duration: 480,
      ease: 'Back.easeIn',
    });
    this.scene.cameras.main.flash(220, 220, 184, 255, false);
  }

  private createSealBurst(indicator: Phaser.GameObjects.Arc): void {
    const ring = this.scene.add
      .circle(indicator.x, indicator.y, 17, 0x78ffab, 0.12)
      .setStrokeStyle(7, 0xb8ffd0, 0.95)
      .setDepth(indicator.depth + 1);
    this.scene.tweens.add({
      targets: ring,
      scale: 2.6,
      alpha: 0,
      duration: 520,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
  }
}
