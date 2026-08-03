import { PET_DEFINITIONS, PetSourceType, type PetId } from '../data/pets';
import { ROAMING_PET_DEFINITIONS } from '../data/roamingPets';
import {
  areUpgradePrerequisitesMet,
  UPGRADE_DEFINITIONS,
  type UpgradeId,
} from '../data/upgrades';
import {
  areZoneGatePrerequisitesMet,
  CENTRAL_HUB_GATE_DEFINITION,
  PARK_GATE_DEFINITION,
  RICH_DISTRICT_GATE_DEFINITION,
  VIP_ESTATE_GATE_DEFINITION,
  ZoneId,
} from '../data/zones';
import type { RunStatsSnapshot } from './RunStatsSystem';

const SAVE_KEY_V3 = 'steal-a-pet.save.v3';
const SAVE_KEY_V2 = 'steal-a-pet.save.v2';
const LEGACY_SAVE_KEY_V1 = 'steal-a-pet.save.v1';
export const SAVE_VERSION = 3;
export const BALANCE_REVISION = 2;

interface GameSaveDataV2 {
  readonly saveVersion: 2;
  readonly money: number;
  readonly deliveredPetIds: readonly string[];
  readonly unlockedZones: readonly ZoneId[];
  readonly purchasedUpgradeIds: readonly string[];
  readonly runStats?: RunStatsSnapshot;
}

interface LegacyGameSaveDataV1 {
  readonly saveVersion: 1;
  readonly money: number;
  readonly parkUnlocked: boolean;
  readonly deliveredPetIds: readonly ('dog' | 'cat')[];
  readonly unlockedZones: readonly ZoneId[];
  readonly campaignStage: string;
}

export interface GameSaveData {
  readonly saveVersion: 3;
  readonly balanceRevision: 2;
  readonly money: number;
  readonly deliveredPetIds: readonly PetId[];
  readonly unlockedZones: readonly ZoneId[];
  readonly purchasedUpgradeIds: readonly UpgradeId[];
  readonly grandfatheredZoneIds: readonly ZoneId[];
  readonly grandfatheredUpgradeIds: readonly UpgradeId[];
  readonly runStats?: RunStatsSnapshot;
}

const GATE_DEFINITIONS = [
  PARK_GATE_DEFINITION, CENTRAL_HUB_GATE_DEFINITION,
  RICH_DISTRICT_GATE_DEFINITION, VIP_ESTATE_GATE_DEFINITION,
] as const;

export function isValidGameSaveData(value: unknown): value is GameSaveData {
  if (!isRecord(value) || value.saveVersion !== SAVE_VERSION || value.balanceRevision !== BALANCE_REVISION) return false;
  if (!isValidMoney(value.money) || !isPetIdArray(value.deliveredPetIds) ||
    !isZoneIdArray(value.unlockedZones) || !value.unlockedZones.includes(ZoneId.StarterSuburb) ||
    !isUpgradeIdArray(value.purchasedUpgradeIds) || !isZoneIdArray(value.grandfatheredZoneIds) ||
    !isUpgradeIdArray(value.grandfatheredUpgradeIds) ||
    (value.runStats !== undefined && !isValidRunStats(value.runStats))) return false;

  const petIds = new Set(value.deliveredPetIds as PetId[]);
  const zones = new Set(value.unlockedZones as ZoneId[]);
  const upgrades = new Set(value.purchasedUpgradeIds as UpgradeId[]);
  const grandfatheredZones = new Set(value.grandfatheredZoneIds as ZoneId[]);
  const grandfatheredUpgrades = new Set(value.grandfatheredUpgradeIds as UpgradeId[]);
  if (!hasUniqueEntries(value.deliveredPetIds) || !hasUniqueEntries(value.unlockedZones) ||
    !hasUniqueEntries(value.purchasedUpgradeIds) ||
    [...grandfatheredZones].some((id) => !zones.has(id)) ||
    [...grandfatheredUpgrades].some((id) => !upgrades.has(id))) return false;

  const roamingCount = [...petIds].filter((id) => PET_DEFINITIONS[id].sourceType === PetSourceType.Roaming).length;
  const facts = {
    isPetDelivered: (id: PetId) => petIds.has(id),
    isUpgradePurchased: (id: string) => upgrades.has(id as UpgradeId),
    isZoneUnlocked: (id: string) => zones.has(id as ZoneId),
    getRoamingPetCount: () => roamingCount,
  };
  for (const definition of GATE_DEFINITIONS) {
    if (zones.has(definition.zoneId) && !grandfatheredZones.has(definition.zoneId) &&
      !areZoneGatePrerequisitesMet(definition, facts)) return false;
  }
  for (const definition of Object.values(UPGRADE_DEFINITIONS)) {
    if (upgrades.has(definition.id) && !grandfatheredUpgrades.has(definition.id) &&
      !areUpgradePrerequisitesMet(definition, facts)) return false;
  }
  for (const roaming of ROAMING_PET_DEFINITIONS) {
    if (petIds.has(roaming.petId) && roaming.accessibleAfterZoneId !== undefined &&
      !zones.has(roaming.accessibleAfterZoneId)) return false;
  }

  const vipA = petIds.has('vip-a'); const vipB = petIds.has('vip-b'); const dragon = petIds.has('dragon');
  if ((petIds.has('cat') && !zones.has(ZoneId.Park)) ||
      (petIds.has('fox') && !zones.has(ZoneId.CentralHub)) ||
      ((petIds.has('peacock') || petIds.has('panda')) && !zones.has(ZoneId.RichDistrict)) ||
      ((vipA || vipB) && !zones.has(ZoneId.VipEstate)) ||
      (dragon && (!vipA || !vipB)) ||
      (value.runStats !== undefined && value.runStats.campaignCompleted !== dragon)) return false;
  return true;
}

export class SaveSystem {
  public load(): GameSaveData {
    try {
      const current = this.parse(window.localStorage.getItem(SAVE_KEY_V3));
      if (isValidGameSaveData(current)) return current;
      const previous = this.parse(window.localStorage.getItem(SAVE_KEY_V2));
      if (isValidV2(previous)) {
        const migrated = migrateV2ToV3(previous);
        if (isValidGameSaveData(migrated)) { this.save(migrated); return migrated; }
      }
      const legacy = this.parse(window.localStorage.getItem(LEGACY_SAVE_KEY_V1));
      if (isValidV1(legacy)) {
        const migrated = migrateV2ToV3(migrateV1ToV2(legacy));
        if (isValidGameSaveData(migrated)) { this.save(migrated); return migrated; }
      }
    } catch { /* Missing/restricted/corrupt storage starts a safe new game. */ }
    return this.createDefaultSave();
  }

  public save(data: GameSaveData): boolean {
    try { window.localStorage.setItem(SAVE_KEY_V3, JSON.stringify(data)); return true; } catch { return false; }
  }

  public clear(): void {
    try { window.localStorage.removeItem(SAVE_KEY_V3); window.localStorage.removeItem(SAVE_KEY_V2); window.localStorage.removeItem(LEGACY_SAVE_KEY_V1); } catch { /* ignore */ }
  }

  public installLegacyV1FixtureForDevelopment(): boolean {
    try {
      this.clear(); window.localStorage.setItem(LEGACY_SAVE_KEY_V1, JSON.stringify({
        saveVersion: 1, money: 31, parkUnlocked: true, deliveredPetIds: ['dog', 'cat'],
        unlockedZones: [ZoneId.StarterSuburb, ZoneId.Park], campaignStage: 'PARK_COMPLETE',
      } satisfies LegacyGameSaveDataV1)); return true;
    } catch { return false; }
  }

  public createDefaultSave(): GameSaveData {
    return { saveVersion: 3, balanceRevision: 2, money: 0, deliveredPetIds: [],
      unlockedZones: [ZoneId.StarterSuburb], purchasedUpgradeIds: [],
      grandfatheredZoneIds: [], grandfatheredUpgradeIds: [] };
  }

  private parse(raw: string | null): unknown { return raw === null ? null : JSON.parse(raw) as unknown; }
}

export function migrateV2ToV3(save: GameSaveDataV2): GameSaveData {
  const delivered = save.deliveredPetIds.filter(isPetId);
  const zones = save.unlockedZones.filter(isZoneId);
  const upgrades = save.purchasedUpgradeIds.filter(isUpgradeId);
  return { saveVersion: 3, balanceRevision: 2, money: save.money,
    deliveredPetIds: [...new Set(delivered)], unlockedZones: [...new Set([ZoneId.StarterSuburb, ...zones])],
    purchasedUpgradeIds: [...new Set(upgrades)], grandfatheredZoneIds: [...new Set(zones)],
    grandfatheredUpgradeIds: [...new Set(upgrades)], ...(save.runStats === undefined ? {} : { runStats: save.runStats }) };
}

function migrateV1ToV2(save: LegacyGameSaveDataV1): GameSaveDataV2 {
  const zones = new Set(save.unlockedZones); zones.add(ZoneId.StarterSuburb); if (save.parkUnlocked) zones.add(ZoneId.Park);
  return { saveVersion: 2, money: save.money, deliveredPetIds: [...save.deliveredPetIds], unlockedZones: [...zones], purchasedUpgradeIds: [] };
}

function isValidV2(value: unknown): value is GameSaveDataV2 {
  return isRecord(value) && value.saveVersion === 2 && isValidMoney(value.money) &&
    Array.isArray(value.deliveredPetIds) && value.deliveredPetIds.every((id) => typeof id === 'string') &&
    isZoneIdArray(value.unlockedZones) && isStringArray(value.purchasedUpgradeIds) &&
    (value.runStats === undefined || isValidRunStats(value.runStats));
}
function isValidV1(value: unknown): value is LegacyGameSaveDataV1 {
  return isRecord(value) && value.saveVersion === 1 && isValidMoney(value.money) &&
    typeof value.parkUnlocked === 'boolean' && Array.isArray(value.deliveredPetIds) &&
    value.deliveredPetIds.every((id) => id === 'dog' || id === 'cat') && isZoneIdArray(value.unlockedZones) &&
    typeof value.campaignStage === 'string';
}
function isValidMoney(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value) && value >= 0; }
function isValidRunStats(value: unknown): value is RunStatsSnapshot {
  return isRecord(value) && isNonNegative(value.elapsedMs) && Number.isInteger(value.failedThefts) && (value.failedThefts as number) >= 0 &&
    Number.isInteger(value.successfulDeliveries) && (value.successfulDeliveries as number) >= 0 && typeof value.campaignCompleted === 'boolean' &&
    isOptionalNonNegativeInteger(value.roamingAttempts) && isOptionalNonNegativeInteger(value.roamingCaptures) &&
    isOptionalNonNegativeInteger(value.upgradePurchases) &&
    (value.milestoneTimestamps === undefined || (isRecord(value.milestoneTimestamps) && Object.values(value.milestoneTimestamps).every(isNonNegative)));
}
function isNonNegative(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value) && value >= 0; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function isStringArray(value: unknown): value is string[] { return Array.isArray(value) && value.every((id) => typeof id === 'string'); }
function isPetIdArray(value: unknown): value is PetId[] { return Array.isArray(value) && value.every(isPetId); }
function isUpgradeIdArray(value: unknown): value is UpgradeId[] { return Array.isArray(value) && value.every(isUpgradeId); }
function isZoneIdArray(value: unknown): value is ZoneId[] { return Array.isArray(value) && value.every(isZoneId); }
function isPetId(value: unknown): value is PetId { return typeof value === 'string' && value in PET_DEFINITIONS; }
function isUpgradeId(value: unknown): value is UpgradeId { return typeof value === 'string' && Object.values(UPGRADE_DEFINITIONS).some((d) => d.id === value); }
function isZoneId(value: unknown): value is ZoneId { return typeof value === 'string' && Object.values(ZoneId).includes(value as ZoneId); }
function hasUniqueEntries(values: readonly unknown[]): boolean { return new Set(values).size === values.length; }
function isOptionalNonNegativeInteger(value: unknown): boolean {
  return value === undefined || (Number.isInteger(value) && (value as number) >= 0);
}
