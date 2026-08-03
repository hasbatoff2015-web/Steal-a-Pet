import Phaser from 'phaser';

import type { UpgradeDefinition, UpgradeId } from '../data/upgrades';
import {
  UpgradeStationStateKind,
  type UpgradeStationState,
} from '../systems/UpgradeSystem';

export class UpgradeStation {
  private availableUpgrade: UpgradeDefinition | null = null;
  private stateSignature = '';

  public constructor(
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

  public getAvailableUpgradeId(): UpgradeId | null {
    return (this.availableUpgrade?.id as UpgradeId | undefined) ?? null;
  }

  public setState(state: UpgradeStationState): void {
    const signature =
      state.kind === UpgradeStationStateKind.Available
        ? `${state.kind}:${state.definition.id}`
        : state.kind === UpgradeStationStateKind.Locked
          ? `${state.kind}:${state.label}`
          : state.kind;
    if (signature === this.stateSignature) {
      return;
    }

    this.stateSignature = signature;
    if (state.kind === UpgradeStationStateKind.Available) {
      this.availableUpgrade = state.definition;
      this.statusLabel
        .setText(`${state.definition.displayName}\n${state.definition.cost} МОНЕТ`)
        .setColor('#4f3300')
        .setBackgroundColor('#fff4cdeb');
      this.highlight.setFillStyle(0xffd15c, 0.2).setStrokeStyle(4, 0xffd15c, 0.8);
      return;
    }

    this.availableUpgrade = null;
    if (state.kind === UpgradeStationStateKind.Complete) {
      this.statusLabel
        .setText('ВСЕ ДОСТУПНЫЕ\nУЛУЧШЕНИЯ КУПЛЕНЫ')
        .setColor('#185938')
        .setBackgroundColor('#e4ffdbeb');
      this.highlight.setFillStyle(0x6ce39a, 0.2).setStrokeStyle(4, 0x6ce39a, 0.8);
      return;
    }

    this.statusLabel
      .setText(state.label)
      .setColor('#4c5260')
      .setBackgroundColor('#eef1f4db');
    this.highlight.setFillStyle(0x8290a0, 0.12).setStrokeStyle(3, 0x8290a0, 0.5);
  }
}
