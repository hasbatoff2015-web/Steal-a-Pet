import Phaser from 'phaser';

import { UpgradeEffectId } from '../data/upgrades';
import type { Player } from '../entities/Player';
import type { ProgressionSystem } from './ProgressionSystem';
import type { RoamingPetSystem } from './RoamingPetSystem';
import type { UpgradeSystem } from './UpgradeSystem';

export class PetTrackerSystem {
  private readonly marker: Phaser.GameObjects.Container;
  private readonly arrow: Phaser.GameObjects.Triangle;
  private nextUpdateAt = 0;

  public constructor(
    scene: Phaser.Scene,
    private readonly player: Player,
    private readonly roaming: RoamingPetSystem,
    private readonly progression: ProgressionSystem,
    private readonly upgrades: UpgradeSystem,
  ) {
    const glow = scene.add.circle(0, 0, 28, 0xffd75d, 0.2).setStrokeStyle(4, 0xffd75d, 0.9);
    this.arrow = scene.add.triangle(0, 0, 0, -20, -12, 10, 12, 10, 0xffd75d);
    const label = scene.add.text(0, 34, 'РАДАР', { fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#4d380d', backgroundColor: '#fff5bddd', padding: { x: 5, y: 2 } }).setOrigin(0.5);
    this.marker = scene.add.container(0, 0, [glow, this.arrow, label]).setDepth(99_000).setVisible(false);
    scene.tweens.add({ targets: glow, scale: 1.2, alpha: 0.45, yoyo: true, repeat: -1, duration: 700 });
  }

  public update(time: number, activePet: boolean): void {
    if (time < this.nextUpdateAt) return;
    this.nextUpdateAt = time + 250;
    if (activePet || !this.upgrades.hasEffect(UpgradeEffectId.TrackerEnabled)) {
      this.marker.setVisible(false); return;
    }
    let nearest: { x: number; y: number; distanceSq: number } | null = null;
    for (const controller of this.roaming.getControllers()) {
      if (!controller.isAccessible() || this.progression.isPetDelivered(controller.definition.petId)) continue;
      const dx = controller.pet.x - this.player.x; const dy = controller.pet.y - this.player.y;
      const distanceSq = dx * dx + dy * dy;
      if (nearest === null || distanceSq < nearest.distanceSq) nearest = { x: controller.pet.x, y: controller.pet.y, distanceSq };
    }
    if (nearest === null) { this.marker.setVisible(false); return; }
    const angle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
    const quantized = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
    this.marker.setPosition(this.player.x + Math.cos(quantized) * 105, this.player.y + Math.sin(quantized) * 105);
    this.arrow.setRotation(quantized + Math.PI / 2);
    this.marker.setVisible(true);
  }
}
