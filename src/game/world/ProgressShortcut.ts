import type Phaser from 'phaser';

import type { ShortcutDefinition } from '../data/shortcuts';
import type { ProgressionSystem } from '../systems/ProgressionSystem';

export class ProgressShortcut {
  private opened = false;
  public constructor(
    public readonly definition: ShortcutDefinition,
    private readonly barrier: Phaser.GameObjects.Rectangle,
    private readonly visuals: readonly Phaser.GameObjects.Rectangle[],
    private readonly label: Phaser.GameObjects.Text,
  ) {}
  public refresh(progression: ProgressionSystem): void {
    if (this.opened || !this.definition.requiredPetIds.every((id) => progression.isPetDelivered(id))) return;
    this.opened = true; this.barrier.destroy();
    for (const visual of this.visuals) visual.setAlpha(0);
    this.label.setText(`${this.definition.displayName}\nКОРОТКИЙ ПУТЬ ОТКРЫТ`).setColor('#185938');
  }
  public isOpened(): boolean { return this.opened; }
}
