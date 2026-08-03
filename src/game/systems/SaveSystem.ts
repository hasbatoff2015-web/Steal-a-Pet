import { PET_DEFINITIONS, type PetId } from '../data/pets';
import { UPGRADE_DEFINITIONS, type UpgradeId } from '../data/upgrades';
import { ZoneId } from '../data/zones';

const SAVE_KEY_V2 = 'steal-a-pet.save.v2';
const LEGACY_SAVE_KEY_V1 = 'steal-a-pet.save.v1';
const SAVE_VERSION = 2;

const LEGACY_STAGES = new Set([
  'FIRST_PET',
  'EARN_FOR_PARK',
  'UNLOCK_PARK',
  'STEAL_PARK_PET',
  'RETURN_PARK_PET',
  'PARK_COMPLETE',
]);

interface LegacyGameSaveDataV1 {
  readonly saveVersion: 1;
  readonly money: number;
  readonly parkUnlocked: boolean;
  readonly deliveredPetIds: readonly ('dog' | 'cat')[];
  readonly unlockedZones: readonly ZoneId[];
  readonly campaignStage: string;
}

export interface GameSaveData {
  readonly saveVersion: 2;
  readonly money: number;
  readonly deliveredPetIds: readonly PetId[];
  readonly unlockedZones: readonly ZoneId[];
  readonly purchasedUpgradeIds: readonly UpgradeId[];
}

export function isValidGameSaveData(value: unknown): value is GameSaveData {
  if (!isRecord(value) || value.saveVersion !== SAVE_VERSION) {
    return false;
  }

  const structurallyValid =
    isValidMoney(value.money) &&
    Array.isArray(value.deliveredPetIds) &&
    value.deliveredPetIds.every((petId) => isPetId(petId)) &&
    Array.isArray(value.unlockedZones) &&
    value.unlockedZones.every((zoneId) => isZoneId(zoneId)) &&
    value.unlockedZones.includes(ZoneId.StarterSuburb) &&
    Array.isArray(value.purchasedUpgradeIds) &&
    value.purchasedUpgradeIds.every((upgradeId) => isUpgradeId(upgradeId));
  if (!structurallyValid) {
    return false;
  }

  const deliveredPetIds = value.deliveredPetIds as readonly PetId[];
  const unlockedZones = value.unlockedZones as readonly ZoneId[];
  const purchasedUpgradeIds = value.purchasedUpgradeIds as readonly UpgradeId[];
  const parkUnlocked = unlockedZones.includes(ZoneId.Park);
  const hubUnlocked = unlockedZones.includes(ZoneId.CentralHub);
  const richUnlocked = unlockedZones.includes(ZoneId.RichDistrict);
  const foxDelivered = deliveredPetIds.includes('fox');
  const peacockDelivered = deliveredPetIds.includes('peacock');
  const pandaDelivered = deliveredPetIds.includes('panda');
  const fastDashPurchased = purchasedUpgradeIds.includes('fast-dash');
  const doubleDashPurchased = purchasedUpgradeIds.includes('double-dash');

  return !(
    (hubUnlocked && !parkUnlocked) ||
    (deliveredPetIds.includes('cat') && !parkUnlocked) ||
    (foxDelivered && !hubUnlocked) ||
    (fastDashPurchased && !foxDelivered) ||
    (richUnlocked && (!hubUnlocked || !foxDelivered || !fastDashPurchased)) ||
    ((peacockDelivered || pandaDelivered) && !richUnlocked) ||
    (doubleDashPurchased &&
      (!fastDashPurchased || !peacockDelivered || !pandaDelivered))
  );
}

export class SaveSystem {
  public load(): GameSaveData {
    try {
      const currentSave = this.parse(window.localStorage.getItem(SAVE_KEY_V2));
      if (isValidGameSaveData(currentSave)) {
        return currentSave;
      }

      const legacySave = this.parse(
        window.localStorage.getItem(LEGACY_SAVE_KEY_V1),
      );
      if (this.isValidLegacySaveV1(legacySave)) {
        const migratedSave = this.migrateV1(legacySave);
        this.save(migratedSave);
        return migratedSave;
      }
    } catch {
      // A missing or restricted storage implementation starts a safe new game.
    }

    return this.createDefaultSave();
  }

  public save(data: GameSaveData): boolean {
    try {
      window.localStorage.setItem(SAVE_KEY_V2, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  public clear(): void {
    try {
      window.localStorage.removeItem(SAVE_KEY_V2);
      window.localStorage.removeItem(LEGACY_SAVE_KEY_V1);
    } catch {
      // Storage may be unavailable in restricted browser modes.
    }
  }

  public installLegacyV1FixtureForDevelopment(): boolean {
    try {
      window.localStorage.removeItem(SAVE_KEY_V2);
      window.localStorage.setItem(
        LEGACY_SAVE_KEY_V1,
        JSON.stringify({
          saveVersion: 1,
          money: 31,
          parkUnlocked: true,
          deliveredPetIds: ['dog', 'cat'],
          unlockedZones: [ZoneId.StarterSuburb, ZoneId.Park],
          campaignStage: 'PARK_COMPLETE',
        } satisfies LegacyGameSaveDataV1),
      );
      return true;
    } catch {
      return false;
    }
  }

  public createDefaultSave(): GameSaveData {
    return {
      saveVersion: SAVE_VERSION,
      money: 0,
      deliveredPetIds: [],
      unlockedZones: [ZoneId.StarterSuburb],
      purchasedUpgradeIds: [],
    };
  }

  private migrateV1(save: LegacyGameSaveDataV1): GameSaveData {
    const unlockedZones = new Set(save.unlockedZones);
    unlockedZones.add(ZoneId.StarterSuburb);
    if (save.parkUnlocked) {
      unlockedZones.add(ZoneId.Park);
    }

    return {
      saveVersion: SAVE_VERSION,
      money: save.money,
      deliveredPetIds: [...save.deliveredPetIds],
      unlockedZones: [...unlockedZones],
      purchasedUpgradeIds: [],
    };
  }

  private parse(rawSave: string | null): unknown {
    if (rawSave === null) {
      return null;
    }
    return JSON.parse(rawSave) as unknown;
  }

  private isValidLegacySaveV1(value: unknown): value is LegacyGameSaveDataV1 {
    if (!isRecord(value) || value.saveVersion !== 1) {
      return false;
    }

    if (
      !isValidMoney(value.money) ||
      typeof value.parkUnlocked !== 'boolean' ||
      !Array.isArray(value.deliveredPetIds) ||
      !value.deliveredPetIds.every((petId) => petId === 'dog' || petId === 'cat') ||
      !Array.isArray(value.unlockedZones) ||
      !value.unlockedZones.every((zoneId) => isZoneId(zoneId)) ||
      typeof value.campaignStage !== 'string' ||
      !LEGACY_STAGES.has(value.campaignStage)
    ) {
      return false;
    }

    return value.parkUnlocked === value.unlockedZones.includes(ZoneId.Park);
  }

}

function isValidMoney(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPetId(value: unknown): value is PetId {
  return typeof value === 'string' && value in PET_DEFINITIONS;
}

function isUpgradeId(value: unknown): value is UpgradeId {
  return (
    typeof value === 'string' &&
    Object.values(UPGRADE_DEFINITIONS).some(
      (definition) => definition.id === value,
    )
  );
}

function isZoneId(value: unknown): value is ZoneId {
  return typeof value === 'string' && Object.values(ZoneId).includes(value as ZoneId);
}
