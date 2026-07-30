import Phaser from 'phaser';

import { PET_CONFIG } from '../config/gameplay';
import type { PetEncounterDefinition } from '../data/encounters';
import { Pet, PetState } from '../entities/Pet';
import { OwnerNpc } from '../entities/OwnerNpc';
import type { Player } from '../entities/Player';
import { ChaseSystem } from './ChaseSystem';
import type { PlayerPathHistory } from './PlayerPathHistory';
import type { ProgressionSystem } from './ProgressionSystem';

export class PetEncounter {
  public readonly petHome: Phaser.Math.Vector2;

  public constructor(
    public readonly definition: PetEncounterDefinition,
    public readonly pet: Pet,
    public readonly owner: OwnerNpc,
    public readonly chase: ChaseSystem,
  ) {
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
    this.chase.update(player);
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

  public startTheft(): void {
    this.pet.startFollowing();
    this.chase.start();
  }

  public failTheft(): void {
    this.pet.returnToNpcBase(this.petHome);
    this.chase.stop();
  }

  public completeDelivery(position: Phaser.Math.Vector2): void {
    this.pet.placeAtPlayerBase(position);
    this.chase.stop();
  }
}
