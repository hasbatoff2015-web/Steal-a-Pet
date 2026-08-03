import Phaser from 'phaser';

import { PET_CONFIG } from '../config/gameplay';
import type {
  PetEncounterDefinition,
  PursuerDefinition,
} from '../data/encounters';
import { Pet, PetState } from '../entities/Pet';
import { OwnerNpc } from '../entities/OwnerNpc';
import type { Player } from '../entities/Player';
import { ChaseSystem } from './ChaseSystem';
import type { PlayerPathHistory } from './PlayerPathHistory';
import type { ProgressionSystem } from './ProgressionSystem';

export interface EncounterPursuer {
  readonly definition: PursuerDefinition;
  readonly owner: OwnerNpc;
  readonly chase: ChaseSystem;
  activated: boolean;
}

export class PetEncounter {
  public readonly petHome: Phaser.Math.Vector2;

  private theftActive = false;
  private theftStartedAt = 0;
  private justActivatedPursuerId: string | null = null;

  public constructor(
    public readonly definition: PetEncounterDefinition,
    public readonly pet: Pet,
    public readonly pursuers: readonly EncounterPursuer[],
  ) {
    if (pursuers.length === 0) {
      throw new Error(`Encounter "${definition.id}" requires at least one pursuer.`);
    }
    this.petHome = new Phaser.Math.Vector2(
      definition.petHome.x,
      definition.petHome.y,
    );
  }

  public update(
    time: number,
    delta: number,
    player: Player,
    pathHistory: PlayerPathHistory,
  ): void {
    this.pet.updatePet(time, delta, player, pathHistory);

    if (this.theftActive) {
      for (const pursuer of this.pursuers) {
        if (
          !pursuer.activated &&
          time >= this.theftStartedAt + (pursuer.definition.activationDelayMs ?? 0)
        ) {
          pursuer.activated = true;
          pursuer.chase.start();
          if ((pursuer.definition.activationDelayMs ?? 0) > 0) {
            this.justActivatedPursuerId = pursuer.definition.id;
          }
        }
      }
    }

    for (const pursuer of this.pursuers) {
      pursuer.chase.update(player);
    }
  }

  public isAvailable(progression: ProgressionSystem): boolean {
    return (
      this.pet.getState() === PetState.AtNpcBase &&
      !progression.isPetDelivered(this.pet.petId) &&
      progression.isZoneUnlocked(this.definition.requiredZone)
    );
  }

  public isPlayerInInteractionRange(player: Player): boolean {
    return (
      Phaser.Math.Distance.Between(player.x, player.y, this.pet.x, this.pet.y) <=
      PET_CONFIG.interactionRadius
    );
  }

  public arePursuersReady(): boolean {
    return this.pursuers.every((pursuer) => pursuer.chase.isOwnerReady());
  }

  public startTheft(time: number): void {
    this.theftActive = true;
    this.theftStartedAt = time;
    this.justActivatedPursuerId = null;
    this.pet.startFollowing();
    for (const pursuer of this.pursuers) {
      pursuer.activated = (pursuer.definition.activationDelayMs ?? 0) <= 0;
      if (pursuer.activated) {
        pursuer.chase.start();
      }
    }
  }

  public failTheft(): void {
    this.pet.returnToNpcBase(this.petHome);
    this.stopAllPursuers();
  }

  public completeDelivery(position: Phaser.Math.Vector2): void {
    this.pet.placeAtPlayerBase(position);
    this.stopAllPursuers();
  }

  public findCatchingPursuer(player: Player): EncounterPursuer | null {
    return (
      this.pursuers.find(
        (pursuer) => pursuer.activated && pursuer.chase.hasCaught(player),
      ) ?? null
    );
  }

  public consumeActivatedPursuerId(): string | null {
    const pursuerId = this.justActivatedPursuerId;
    this.justActivatedPursuerId = null;
    return pursuerId;
  }

  public getTheftHeadStartMs(): number {
    return this.pursuers[0]?.definition.chase.theftHeadStartMs ?? 0;
  }

  public getFailureGraceMs(): number {
    return Math.max(
      ...this.pursuers.map((pursuer) => pursuer.definition.chase.failureGraceMs),
    );
  }

  private stopAllPursuers(): void {
    this.theftActive = false;
    this.justActivatedPursuerId = null;
    for (const pursuer of this.pursuers) {
      pursuer.activated = false;
      pursuer.chase.stop();
    }
  }
}
