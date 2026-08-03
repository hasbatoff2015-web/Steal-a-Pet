import type Phaser from 'phaser';

import { ROAMING_PET_DEFINITIONS, type RoamingPetId } from '../data/roamingPets';
import { UpgradeEffectId } from '../data/upgrades';
import { Pet } from '../entities/Pet';
import type { Player } from '../entities/Player';
import { getPetDefinition } from '../data/pets';
import type { BaseSystem } from './BaseSystem';
import type { PlayerPathHistory } from './PlayerPathHistory';
import type { ProgressionSystem } from './ProgressionSystem';
import { RoamingPetController } from './RoamingPetController';
import type { UpgradeSystem } from './UpgradeSystem';

export class RoamingPetSystem {
  private readonly controllers: readonly RoamingPetController[];
  private active: RoamingPetController | null = null;
  private readonly behaviorModifiers = {
    detectionRadius: 1,
    staminaDrain: 1,
    tiredWindow: 1,
  };

  public constructor(
    scene: Phaser.Scene,
    private readonly progression: ProgressionSystem,
    private readonly upgrades: UpgradeSystem,
    baseSystem: BaseSystem,
  ) {
    this.controllers = ROAMING_PET_DEFINITIONS.map((definition) => {
      const spawn = definition.waypoints.find((item) => item.id === definition.spawnWaypointId)!;
      const pet = new Pet(scene, spawn.x, spawn.y, getPetDefinition(definition.petId));
      const controller = new RoamingPetController(definition, pet, scene);
      if (progression.isPetDelivered(definition.petId)) {
        controller.deliver(baseSystem.getPetSlot(definition.petId));
      }
      return controller;
    });
  }

  public update(time: number, delta: number, player: Player, history: PlayerPathHistory): void {
    this.behaviorModifiers.detectionRadius = this.upgrades.getEffectProduct(UpgradeEffectId.RoamingDetectionRadiusMultiplier);
    this.behaviorModifiers.staminaDrain = this.upgrades.getEffectProduct(UpgradeEffectId.RoamingStaminaDrainMultiplier);
    this.behaviorModifiers.tiredWindow = this.upgrades.getEffectProduct(UpgradeEffectId.RoamingTiredWindowMultiplier);
    for (const controller of this.controllers) {
      const required = controller.definition.accessibleAfterZoneId;
      controller.setAccessible(required === undefined || this.progression.isZoneUnlocked(required) || this.progression.isPetDelivered(controller.definition.petId));
      controller.update(time, delta, player, history, this.behaviorModifiers);
    }
  }
  public findNearbyCapture(player: Player): RoamingPetController | null {
    return this.controllers.find((controller) => controller.isCaptureAvailable(player)) ?? null;
  }
  public startCapture(controller: RoamingPetController): boolean {
    if (this.active !== null || !controller.capture()) return false;
    this.active = controller; return true;
  }
  public getActive(): RoamingPetController | null { return this.active; }
  public completeActive(baseSystem: BaseSystem): RoamingPetController | null {
    const controller = this.active; if (controller === null) return null;
    controller.deliver(baseSystem.getPetSlot(controller.definition.petId)); this.active = null; return controller;
  }
  public getControllers(): readonly RoamingPetController[] { return this.controllers; }
  public forceTired(petId: RoamingPetId): void {
    if (!this.progression.isPetDelivered(petId)) this.controllers.find((item) => item.definition.petId === petId)?.forceTired();
  }
  public reset(petId: RoamingPetId): void {
    if (!this.progression.isPetDelivered(petId)) this.controllers.find((item) => item.definition.petId === petId)?.resetToTerritory();
  }
  public deliverForDevelopment(petId: RoamingPetId, baseSystem: BaseSystem): RoamingPetController | null {
    const controller = this.controllers.find((item) => item.definition.petId === petId);
    if (controller === undefined) return null;
    controller.deliver(baseSystem.getPetSlot(petId)); return controller;
  }
}
