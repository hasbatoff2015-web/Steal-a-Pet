import Phaser from 'phaser';

import type { UpgradeDefinition } from '../data/upgrades';

export class UpgradeStation {
  private available = false;
  private purchased = false;

  public constructor(
    public readonly definition: UpgradeDefinition,
    private readonly interactionPoint: Phaser.Math.Vector2,
    private readonly statusLabel: Phaser.GameObjects.Text,
    private readonly highlight: Phaser.GameObjects.Arc,
  ) {}

  public isPlayerNearby(position: Phaser.Types.Math.Vector2Like): boolean {
    return (
      Phaser.Math.Distance.Squared(
        position.x,
        position.y,
        this.interactionPoint.x,
        this.interactionPoint.y,
      ) <=
      135 * 135
    );
  }

  public isAvailable(): boolean {
    return this.available && !this.purchased;
  }

  public setState(available: boolean, purchased: boolean): void {
    if (available === this.available && purchased === this.purchased) {
      return;
    }

    this.available = available;
    this.purchased = purchased;
    if (purchased) {
      this.statusLabel
        .setText(`${this.definition.displayName}\nКУПЛЕНО`)
        .setColor('#185938')
        .setBackgroundColor('#e4ffdbeb');
      this.highlight.setFillStyle(0x6ce39a, 0.2).setStrokeStyle(4, 0x6ce39a, 0.8);
    } else if (available) {
      this.statusLabel
        .setText(`${this.definition.displayName}\n${this.definition.cost} МОНЕТ`)
        .setColor('#4f3300')
        .setBackgroundColor('#fff4cdeb');
      this.highlight.setFillStyle(0xffd15c, 0.2).setStrokeStyle(4, 0xffd15c, 0.8);
    } else {
      this.statusLabel
        .setText('УЛУЧШЕНИЕ\nОТКРОЕТСЯ ПОЗЖЕ')
        .setColor('#4c5260')
        .setBackgroundColor('#eef1f4db');
      this.highlight.setFillStyle(0x8290a0, 0.12).setStrokeStyle(3, 0x8290a0, 0.5);
    }
  }
}
