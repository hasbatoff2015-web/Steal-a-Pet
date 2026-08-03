import Phaser from 'phaser';

import { UpgradeEffectId } from '../data/upgrades';
import type { Player } from '../entities/Player';
import type { ProgressionSystem } from './ProgressionSystem';
import type { RoamingPetController } from './RoamingPetController';
import type { RoamingPetSystem } from './RoamingPetSystem';
import type { UpgradeSystem } from './UpgradeSystem';

const TARGET_REFRESH_MS = 250;
const DESKTOP_OFFSET_Y = 44;
const MOBILE_SCALE = 1.12;
const NEAR_TARGET_DISTANCE_SQ = 360 * 360;

export class PetTrackerSystem {
  private readonly marker: Phaser.GameObjects.Container;
  private readonly ring: Phaser.GameObjects.Arc;
  private readonly arrow: Phaser.GameObjects.Triangle;
  private cachedTarget: RoamingPetController | null = null;
  private nextTargetRefreshAt = 0;
  private visible = false;
  private mobileScaleApplied = false;

  public constructor(
    scene: Phaser.Scene,
    private readonly player: Player,
    private readonly roaming: RoamingPetSystem,
    private readonly progression: ProgressionSystem,
    private readonly upgrades: UpgradeSystem,
  ) {
    this.ring = scene.add
      .circle(0, 0, 22, 0xffd75d, 0.1)
      .setStrokeStyle(3, 0xffd75d, 0.92);
    this.arrow = scene.add.triangle(
      0,
      0,
      0,
      -8,
      -7,
      6,
      7,
      6,
      0xffd75d,
    );
    this.marker = scene.add
      .container(0, 0, [this.ring, this.arrow])
      .setDepth(99_000)
      .setVisible(false);
  }

  public update(
    time: number,
    activePet: boolean,
    suppressed = false,
    mobileMode = false,
  ): void {
    const enabled = this.upgrades.hasEffect(UpgradeEffectId.TrackerEnabled);
    if (!enabled || activePet || suppressed) {
      this.setVisible(false);
      return;
    }

    if (time >= this.nextTargetRefreshAt) {
      this.nextTargetRefreshAt = time + TARGET_REFRESH_MS;
      this.refreshTarget();
    }

    const target = this.cachedTarget;
    if (
      target === null ||
      !target.isAccessible() ||
      this.progression.isPetDelivered(target.definition.petId)
    ) {
      this.setVisible(false);
      return;
    }

    if (mobileMode !== this.mobileScaleApplied) {
      this.mobileScaleApplied = mobileMode;
      this.marker.setScale(mobileMode ? MOBILE_SCALE : 1);
    }

    const dx = target.pet.x - this.player.x;
    const dy = target.pet.y - this.player.y;
    const angle = Math.atan2(dy, dx);
    this.marker.setPosition(this.player.x, this.player.y + DESKTOP_OFFSET_Y);
    this.arrow.setRotation(angle + Math.PI / 2);
    const distanceSq = dx * dx + dy * dy;
    this.ring.setAlpha(
      distanceSq < NEAR_TARGET_DISTANCE_SQ
        ? 0.78 + Math.sin(time * 0.008) * 0.16
        : 0.92,
    );
    this.setVisible(true);
  }

  public getDebugSnapshot(): string {
    return `visible=${this.visible} pos=${this.marker.x.toFixed(0)},${this.marker.y.toFixed(0)}` +
      ` target=${this.cachedTarget?.definition.petId ?? 'none'}`;
  }

  private refreshTarget(): void {
    let nearest: RoamingPetController | null = null;
    let nearestDistanceSq = Number.POSITIVE_INFINITY;
    for (const controller of this.roaming.getControllers()) {
      if (!controller.isAccessible() || this.progression.isPetDelivered(controller.definition.petId)) continue;
      const dx = controller.pet.x - this.player.x;
      const dy = controller.pet.y - this.player.y;
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq < nearestDistanceSq) {
        nearest = controller;
        nearestDistanceSq = distanceSq;
      }
    }
    this.cachedTarget = nearest;
  }

  private setVisible(visible: boolean): void {
    if (visible === this.visible) return;
    this.visible = visible;
    this.marker.setVisible(visible);
  }
}
