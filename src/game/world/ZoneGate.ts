import Phaser from 'phaser';

import type { ZoneGateDefinition } from '../data/zones';

export class ZoneGate {
  private unlocked = false;
  private prerequisitesMet: boolean | null = null;

  public constructor(
    private readonly scene: Phaser.Scene,
    public readonly definition: ZoneGateDefinition,
    private readonly interactionPoint: Phaser.Math.Vector2,
    private readonly barrier: Phaser.GameObjects.Rectangle,
    private readonly blockingVisuals: readonly Phaser.GameObjects.Rectangle[],
    private readonly statusLabel: Phaser.GameObjects.Text,
  ) {}

  public isUnlocked(): boolean {
    return this.unlocked;
  }

  public isPlayerNearby(position: Phaser.Types.Math.Vector2Like): boolean {
    return (
      Phaser.Math.Distance.Between(
        position.x,
        position.y,
        this.interactionPoint.x,
        this.interactionPoint.y,
      ) <= 135
    );
  }

  public setPrerequisitesMet(prerequisitesMet: boolean): void {
    if (this.unlocked || prerequisitesMet === this.prerequisitesMet) {
      return;
    }

    this.prerequisitesMet = prerequisitesMet;
    if (prerequisitesMet) {
      this.statusLabel
        .setText(`${this.definition.displayName}\n${this.definition.cost} МОНЕТ`)
        .setColor('#4f3300')
        .setBackgroundColor('#fff4cdeb');
      return;
    }

    this.statusLabel
      .setText(
        `${this.definition.displayName}\n${this.definition.prerequisiteHint ?? 'УСЛОВИЯ НЕ ВЫПОЛНЕНЫ'}`,
      )
      .setColor('#4c5260')
      .setBackgroundColor('#eef1f4e8');
  }

  public unlock(animate: boolean): void {
    if (this.unlocked) {
      return;
    }

    this.unlocked = true;
    this.barrier.destroy();
    this.statusLabel
      .setText(`${this.definition.displayName} ОТКРЫТ`)
      .setColor('#185938')
      .setBackgroundColor('#e4ffdbeb');

    if (animate) {
      this.scene.tweens.add({
        targets: this.blockingVisuals,
        alpha: 0,
        scaleY: 0.25,
        duration: 420,
        ease: 'Back.easeIn',
      });
      this.scene.tweens.add({
        targets: this.statusLabel,
        scale: { from: 1.18, to: 1 },
        duration: 420,
        ease: 'Back.easeOut',
      });
      this.createUnlockBurst();
    } else {
      for (const visual of this.blockingVisuals) {
        visual.setAlpha(0);
      }
    }
  }

  private createUnlockBurst(): void {
    const colors = [0xffd23f, 0x75e7a0, 0x78ccff];
    for (let index = 0; index < 10; index += 1) {
      const angle = (Math.PI * 2 * index) / 10;
      const particle = this.scene.add
        .circle(
          this.interactionPoint.x,
          this.interactionPoint.y - 70,
          6,
          colors[index % colors.length] ?? 0xffffff,
        )
        .setDepth(this.interactionPoint.y + 4);

      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Math.cos(angle) * 90,
        y: particle.y + Math.sin(angle) * 65,
        alpha: 0,
        duration: 560,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }
}
