import type { PetId } from '../data/pets';
import { PARK_GATE_DEFINITION, ZoneId } from '../data/zones';

export enum ProgressionStage {
  FirstPet = 'FIRST_PET',
  EarnForPark = 'EARN_FOR_PARK',
  UnlockPark = 'UNLOCK_PARK',
  StealParkPet = 'STEAL_PARK_PET',
  ReturnParkPet = 'RETURN_PARK_PET',
  ParkComplete = 'PARK_COMPLETE',
}

export interface ProgressionSnapshot {
  readonly deliveredPetIds: readonly PetId[];
  readonly unlockedZones: readonly ZoneId[];
  readonly campaignStage: ProgressionStage;
}

interface ProgressionInitialState {
  readonly deliveredPetIds?: readonly PetId[];
  readonly unlockedZones?: readonly ZoneId[];
  readonly activePetId?: PetId | null;
}

export class ProgressionSystem {
  private readonly deliveredPetIds = new Set<PetId>();
  private readonly unlockedZones = new Set<ZoneId>([ZoneId.StarterSuburb]);
  private activePetId: PetId | null;
  private campaignStage = ProgressionStage.FirstPet;

  public constructor(initialState: ProgressionInitialState = {}) {
    for (const petId of initialState.deliveredPetIds ?? []) {
      this.deliveredPetIds.add(petId);
    }
    for (const zoneId of initialState.unlockedZones ?? []) {
      this.unlockedZones.add(zoneId);
    }
    this.activePetId = initialState.activePetId ?? null;
  }

  public updateForMoney(money: number): void {
    this.campaignStage = this.deriveStage(money);
  }

  public startTheft(petId: PetId, money: number): void {
    this.activePetId = petId;
    this.updateForMoney(money);
  }

  public cancelTheft(money: number): void {
    this.activePetId = null;
    this.updateForMoney(money);
  }

  public deliverPet(petId: PetId, money: number): void {
    this.deliveredPetIds.add(petId);
    this.activePetId = null;
    this.updateForMoney(money);
  }

  public unlockZone(zoneId: ZoneId, money: number): void {
    this.unlockedZones.add(zoneId);
    this.updateForMoney(money);
  }

  public isPetDelivered(petId: PetId): boolean {
    return this.deliveredPetIds.has(petId);
  }

  public isZoneUnlocked(zoneId: ZoneId): boolean {
    return this.unlockedZones.has(zoneId);
  }

  public getStage(): ProgressionStage {
    return this.campaignStage;
  }

  public getObjective(money: number): string {
    switch (this.campaignStage) {
      case ProgressionStage.FirstPet:
        return 'Укради Собаку';
      case ProgressionStage.EarnForPark:
        return `Накопи ${PARK_GATE_DEFINITION.cost} монет для PARK (${Math.floor(money)}/${PARK_GATE_DEFINITION.cost})`;
      case ProgressionStage.UnlockPark:
        return 'Открой PARK у моста';
      case ProgressionStage.StealParkPet:
        return 'Исследуй PARK и укради Кота';
      case ProgressionStage.ReturnParkPet:
        return 'Убегай! Верни Кота на базу';
      case ProgressionStage.ParkComplete:
        return 'PARK пройден — путь ведёт в CENTRAL HUB';
    }
  }

  public getSnapshot(): ProgressionSnapshot {
    return {
      deliveredPetIds: [...this.deliveredPetIds],
      unlockedZones: [...this.unlockedZones],
      campaignStage: this.campaignStage,
    };
  }

  private deriveStage(money: number): ProgressionStage {
    if (this.deliveredPetIds.has('cat')) {
      return ProgressionStage.ParkComplete;
    }
    if (this.activePetId === 'cat') {
      return ProgressionStage.ReturnParkPet;
    }
    if (!this.deliveredPetIds.has('dog')) {
      return ProgressionStage.FirstPet;
    }
    if (!this.unlockedZones.has(ZoneId.Park)) {
      return money >= PARK_GATE_DEFINITION.cost
        ? ProgressionStage.UnlockPark
        : ProgressionStage.EarnForPark;
    }
    return ProgressionStage.StealParkPet;
  }
}
