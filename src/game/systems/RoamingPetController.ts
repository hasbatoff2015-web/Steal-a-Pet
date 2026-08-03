import Phaser from 'phaser';

import {
  ROAMING_BEHAVIOR_PROFILES,
  type RoamingPetDefinition,
  type RoamingWaypoint,
} from '../data/roamingPets';
import type { Pet } from '../entities/Pet';
import type { Player } from '../entities/Player';
import type { PlayerPathHistory } from './PlayerPathHistory';
import { chooseFleeWaypoint, RoamingAiModel, RoamingPetState } from './RoamingAiModel';

export interface RoamingBehaviorMultipliers {
  readonly detectionRadius: number;
  readonly staminaDrain: number;
  readonly tiredWindow: number;
}

export class RoamingPetController {
  private readonly waypointById: ReadonlyMap<string, RoamingWaypoint>;
  private readonly profile;
  private readonly model: RoamingAiModel;
  private targetWaypoint: RoamingWaypoint | null = null;
  private nextDecisionAt = 0;
  private nextOffscreenUpdateAt = 0;
  private lastProgressAt = 0;
  private lastProgressX: number;
  private lastProgressY: number;
  private accessible: boolean | null = null;

  public constructor(
    public readonly definition: RoamingPetDefinition,
    public readonly pet: Pet,
    private readonly scene: Phaser.Scene,
  ) {
    this.profile = ROAMING_BEHAVIOR_PROFILES[definition.behaviorId];
    this.waypointById = new Map(definition.waypoints.map((item) => [item.id, item]));
    this.model = new RoamingAiModel(this.profile, definition.spawnWaypointId, Math.random());
    this.lastProgressX = pet.x; this.lastProgressY = pet.y;
  }

  public setAccessible(accessible: boolean): void {
    if (this.accessible === accessible) return;
    this.accessible = accessible;
    if (this.pet.getState() !== 'AT_PLAYER_BASE') this.pet.setPetVisible(accessible);
  }

  public update(
    time: number,
    delta: number,
    player: Player,
    pathHistory: PlayerPathHistory,
    modifiers: RoamingBehaviorMultipliers,
  ): void {
    const stateBefore = this.model.getState();
    if (stateBefore === RoamingPetState.Following || stateBefore === RoamingPetState.AtPlayerBase) {
      this.pet.updatePet(time, delta, player, pathHistory); return;
    }
    if (!this.accessible) return;
    const camera = this.scene.cameras.main;
    const offscreen = !camera.worldView.contains(this.pet.x, this.pet.y);
    if (offscreen && time < this.nextOffscreenUpdateAt) return;
    const effectiveDelta = offscreen ? Math.min(300, Math.max(delta, time - (this.nextOffscreenUpdateAt - 300))) : delta;
    if (offscreen) this.nextOffscreenUpdateAt = time + 300;

    const dx = player.x - this.pet.x; const dy = player.y - this.pet.y;
    const playerDistance = Math.sqrt(dx * dx + dy * dy);
    const atWaypoint = this.targetWaypoint === null || Phaser.Math.Distance.Squared(
      this.pet.x, this.pet.y, this.targetWaypoint.x, this.targetWaypoint.y,
    ) <= 16 * 16;
    const state = this.model.update(
      effectiveDelta, playerDistance, atWaypoint,
      modifiers.detectionRadius, modifiers.staminaDrain, modifiers.tiredWindow,
    );
    this.pet.setRoamingFeedback(state === RoamingPetState.Tired);

    if (atWaypoint && this.targetWaypoint !== null) {
      this.model.setWaypoint(this.targetWaypoint.id); this.targetWaypoint = null;
    }
    if ((state === RoamingPetState.Wandering || state === RoamingPetState.Fleeing) &&
      (this.targetWaypoint === null || time >= this.nextDecisionAt)) {
      this.chooseTarget(state, player, time);
    }
    if (state === RoamingPetState.Wandering || state === RoamingPetState.Fleeing || state === RoamingPetState.Tired) {
      this.moveTowardTarget(effectiveDelta, state);
    }
    this.checkFailSafe(time);
  }

  public isCaptureAvailable(player: Phaser.Types.Math.Vector2Like): boolean {
    return this.accessible === true && this.model.getState() === RoamingPetState.Tired &&
      Phaser.Math.Distance.Squared(player.x, player.y, this.pet.x, this.pet.y) <= 72 * 72;
  }
  public capture(): boolean {
    if (!this.model.capture()) return false;
    this.targetWaypoint = null; this.pet.setRoamingFeedback(false); this.pet.startFollowing(); return true;
  }
  public deliver(position: Phaser.Math.Vector2): void { this.model.deliver(); this.pet.placeAtPlayerBase(position); }
  public forceTired(): void { this.model.forceTired(); }
  public resetToTerritory(): void {
    const spawn = this.waypointById.get(this.definition.spawnWaypointId); if (spawn === undefined) return;
    this.model.reset(spawn.id); this.targetWaypoint = null; this.pet.setRoamingPosition(spawn.x, spawn.y); this.pet.setAlpha(1);
  }
  public getState(): RoamingPetState { return this.model.getState(); }
  public isAccessible(): boolean { return this.accessible === true; }
  public getDebugSnapshot(): string {
    return `${this.definition.petId}:${this.model.getState()}@${this.model.getWaypointId()} stamina=${this.model.getStaminaSeconds().toFixed(1)}`;
  }

  private chooseTarget(state: RoamingPetState, player: Player, time: number): void {
    const currentId = this.model.getWaypointId();
    const current = this.waypointById.get(currentId); if (current === undefined) { this.resetToTerritory(); return; }
    if (state === RoamingPetState.Fleeing) {
      this.targetWaypoint = chooseFleeWaypoint(current, this.waypointById, player.x, player.y, Math.random());
    } else {
      const candidates = current.neighborIds; const id = candidates[Math.floor(Math.random() * candidates.length)];
      this.targetWaypoint = id === undefined ? current : (this.waypointById.get(id) ?? current);
    }
    this.nextDecisionAt = time + this.profile.decisionIntervalMs;
  }

  private moveTowardTarget(delta: number, state: RoamingPetState): void {
    const target = this.targetWaypoint; if (target === null) return;
    const angle = Math.atan2(target.y - this.pet.y, target.x - this.pet.x);
    const baseSpeed = state === RoamingPetState.Fleeing ? this.profile.fleeSpeed :
      state === RoamingPetState.Tired ? this.profile.wanderSpeed * 0.45 : this.profile.wanderSpeed;
    const distance = Math.hypot(target.x - this.pet.x, target.y - this.pet.y);
    const step = Math.min(distance, baseSpeed * Math.min(0.3, delta / 1000));
    this.pet.setRoamingPosition(this.pet.x + Math.cos(angle) * step, this.pet.y + Math.sin(angle) * step);
    this.pet.setRotation(Math.sin(angle) * 0.08);
  }

  private checkFailSafe(time: number): void {
    const { bounds } = this.definition.territory;
    const inBounds = this.pet.x >= bounds.x && this.pet.x <= bounds.x + bounds.width &&
      this.pet.y >= bounds.y && this.pet.y <= bounds.y + bounds.height;
    const movedSq = Phaser.Math.Distance.Squared(this.pet.x, this.pet.y, this.lastProgressX, this.lastProgressY);
    if (movedSq > 12 * 12) { this.lastProgressAt = time; this.lastProgressX = this.pet.x; this.lastProgressY = this.pet.y; }
    if (!inBounds || (this.targetWaypoint !== null && time - this.lastProgressAt > 2400)) {
      this.scene.tweens.add({ targets: this.pet, alpha: 0.15, duration: 100, yoyo: true });
      this.resetToTerritory(); this.lastProgressAt = time;
    }
  }
}
