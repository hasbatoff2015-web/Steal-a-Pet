import { PET_DEFINITIONS, type PetId } from '../data/pets';
import { ZoneId } from '../data/zones';
import { ProgressionStage } from './ProgressionSystem';

const SAVE_KEY = 'steal-a-pet.save.v1';
const SAVE_VERSION = 1;

export interface GameSaveData {
  readonly saveVersion: 1;
  readonly money: number;
  readonly parkUnlocked: boolean;
  readonly deliveredPetIds: readonly PetId[];
  readonly unlockedZones: readonly ZoneId[];
  readonly campaignStage: ProgressionStage;
}

export class SaveSystem {
  public load(): GameSaveData {
    try {
      const rawSave = window.localStorage.getItem(SAVE_KEY);
      if (rawSave === null) {
        return this.createDefaultSave();
      }

      const parsedSave: unknown = JSON.parse(rawSave);
      return this.isValidSave(parsedSave) ? parsedSave : this.createDefaultSave();
    } catch {
      return this.createDefaultSave();
    }
  }

  public save(data: GameSaveData): boolean {
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  public clear(): void {
    try {
      window.localStorage.removeItem(SAVE_KEY);
    } catch {
      // Storage may be unavailable in restricted browser modes.
    }
  }

  public createDefaultSave(): GameSaveData {
    return {
      saveVersion: SAVE_VERSION,
      money: 0,
      parkUnlocked: false,
      deliveredPetIds: [],
      unlockedZones: [ZoneId.StarterSuburb],
      campaignStage: ProgressionStage.FirstPet,
    };
  }

  private isValidSave(value: unknown): value is GameSaveData {
    if (!this.isRecord(value) || value.saveVersion !== SAVE_VERSION) {
      return false;
    }

    if (
      typeof value.money !== 'number' ||
      !Number.isFinite(value.money) ||
      value.money < 0 ||
      typeof value.parkUnlocked !== 'boolean'
    ) {
      return false;
    }

    if (
      !Array.isArray(value.deliveredPetIds) ||
      !value.deliveredPetIds.every((petId) => this.isPetId(petId)) ||
      !Array.isArray(value.unlockedZones) ||
      !value.unlockedZones.every((zoneId) => this.isZoneId(zoneId)) ||
      !this.isProgressionStage(value.campaignStage)
    ) {
      return false;
    }

    return value.parkUnlocked === value.unlockedZones.includes(ZoneId.Park);
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isPetId(value: unknown): value is PetId {
    return typeof value === 'string' && value in PET_DEFINITIONS;
  }

  private isZoneId(value: unknown): value is ZoneId {
    return typeof value === 'string' && Object.values(ZoneId).includes(value as ZoneId);
  }

  private isProgressionStage(value: unknown): value is ProgressionStage {
    return (
      typeof value === 'string' &&
      Object.values(ProgressionStage).includes(value as ProgressionStage)
    );
  }
}
