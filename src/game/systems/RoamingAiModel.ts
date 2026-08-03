import type { RoamingBehaviorProfile, RoamingWaypoint } from '../data/roamingPets';

export enum RoamingPetState {
  Idle = 'IDLE', Wandering = 'WANDERING', Alert = 'ALERT', Fleeing = 'FLEEING',
  Tired = 'TIRED', Following = 'FOLLOWING', AtPlayerBase = 'AT_PLAYER_BASE', Resetting = 'RESETTING',
}

export interface RoamingAiSnapshot {
  readonly state: RoamingPetState;
  readonly waypointId: string;
  readonly staminaSeconds: number;
  readonly tiredRemainingMs: number;
}

export function chooseFleeWaypoint(
  current: RoamingWaypoint,
  waypoints: ReadonlyMap<string, RoamingWaypoint>,
  playerX: number,
  playerY: number,
  random01 = 0.5,
): RoamingWaypoint {
  const candidates = current.neighborIds
    .map((id) => waypoints.get(id))
    .filter((item): item is RoamingWaypoint => item !== undefined)
    .map((item) => ({ item, score: squaredDistance(item.x, item.y, playerX, playerY) }))
    .sort((a, b) => b.score - a.score);
  if (candidates.length === 0) return current;
  const currentScore = squaredDistance(current.x, current.y, playerX, playerY);
  const improving = candidates.filter((candidate) => candidate.score > currentScore);
  const pool = improving.length > 0 ? improving : candidates;
  const poolSize = Math.min(2, pool.length);
  return pool[Math.min(poolSize - 1, Math.floor(random01 * poolSize))]?.item ?? current;
}

export class RoamingAiModel {
  private state = RoamingPetState.Idle;
  private waypointId: string;
  private staminaSeconds: number;
  private tiredRemainingMs = 0;
  private idleRemainingMs: number;

  public constructor(
    private readonly profile: RoamingBehaviorProfile,
    spawnWaypointId: string,
    random01 = 0.5,
  ) {
    this.waypointId = spawnWaypointId;
    this.staminaSeconds = profile.staminaSeconds;
    this.idleRemainingMs = 500 + random01 * 1100;
  }

  public update(
    deltaMs: number,
    playerDistance: number,
    atWaypoint: boolean,
    detectionRadiusMultiplier = 1,
    staminaDrainMultiplier = 1,
    tiredWindowMultiplier = 1,
  ): RoamingPetState {
    const deltaSeconds = Math.max(0, Math.min(deltaMs, 250)) / 1000;
    if (this.state === RoamingPetState.Following || this.state === RoamingPetState.AtPlayerBase) return this.state;
    if (this.state === RoamingPetState.Tired) {
      this.tiredRemainingMs -= deltaMs;
      if (this.tiredRemainingMs <= 0) {
        this.staminaSeconds = this.profile.staminaSeconds * 0.45;
        this.state = RoamingPetState.Alert;
      }
      return this.state;
    }
    if (playerDistance <= this.profile.detectionRadius * detectionRadiusMultiplier) {
      this.state = RoamingPetState.Fleeing;
      this.staminaSeconds = Math.max(0, this.staminaSeconds - deltaSeconds * staminaDrainMultiplier);
      if (this.staminaSeconds <= 0) {
        this.state = RoamingPetState.Tired;
        this.tiredRemainingMs = this.profile.tiredWindowMs * tiredWindowMultiplier;
      }
      return this.state;
    }
    if (this.state === RoamingPetState.Fleeing || this.state === RoamingPetState.Alert) {
      this.staminaSeconds = Math.min(this.profile.staminaSeconds, this.staminaSeconds + deltaSeconds * 0.45);
      this.state = RoamingPetState.Wandering;
    }
    if (this.state === RoamingPetState.Idle) {
      this.idleRemainingMs -= deltaMs;
      if (this.idleRemainingMs <= 0) this.state = RoamingPetState.Wandering;
    } else if (atWaypoint) {
      this.state = RoamingPetState.Idle;
      this.idleRemainingMs = 500 + ((this.waypointId.length * 137) % 1100);
    }
    return this.state;
  }

  public setWaypoint(waypointId: string): void { this.waypointId = waypointId; }
  public getState(): RoamingPetState { return this.state; }
  public getWaypointId(): string { return this.waypointId; }
  public getStaminaSeconds(): number { return this.staminaSeconds; }
  public forceTired(): void { this.state = RoamingPetState.Tired; this.staminaSeconds = 0; this.tiredRemainingMs = this.profile.tiredWindowMs; }
  public capture(): boolean {
    if (this.state !== RoamingPetState.Tired) return false;
    this.state = RoamingPetState.Following;
    return true;
  }
  public deliver(): void { this.state = RoamingPetState.AtPlayerBase; }
  public reset(spawnWaypointId: string): void {
    this.state = RoamingPetState.Idle; this.waypointId = spawnWaypointId;
    this.staminaSeconds = this.profile.staminaSeconds; this.tiredRemainingMs = 0; this.idleRemainingMs = 700;
  }
  public getSnapshot(): RoamingAiSnapshot {
    return { state: this.state, waypointId: this.waypointId, staminaSeconds: this.staminaSeconds, tiredRemainingMs: Math.max(0, this.tiredRemainingMs) };
  }
}

function squaredDistance(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx; const dy = ay - by; return dx * dx + dy * dy;
}
