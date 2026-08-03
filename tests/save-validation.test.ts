import { describe, expect, it } from 'vitest';
import { ZoneId } from '../src/game/data/zones';
import { isValidGameSaveData, migrateV2ToV3 } from '../src/game/systems/SaveSystem';

describe('save v3 validation and v2 migration', () => {
  it('accepts a strict clean v3 progression save', () => {
    expect(isValidGameSaveData({
      saveVersion: 3, balanceRevision: 2, money: 42,
      deliveredPetIds: ['dog','cat','fox','roam-01','roam-02'],
      unlockedZones: [ZoneId.StarterSuburb, ZoneId.Park, ZoneId.CentralHub, ZoneId.RichDistrict],
      purchasedUpgradeIds: ['fast-dash'], grandfatheredZoneIds: [], grandfatheredUpgradeIds: [],
    })).toBe(true);
  });
  it('rejects clean Rich progress without two roaming pets', () => {
    expect(isValidGameSaveData({
      saveVersion: 3, balanceRevision: 2, money: 0,
      deliveredPetIds: ['dog','cat','fox','roam-01'],
      unlockedZones: [ZoneId.StarterSuburb, ZoneId.Park, ZoneId.CentralHub, ZoneId.RichDistrict],
      purchasedUpgradeIds: ['fast-dash'], grandfatheredZoneIds: [], grandfatheredUpgradeIds: [],
    })).toBe(false);
  });
  it('migrates an old complete save without gifting roaming pets', () => {
    const migrated = migrateV2ToV3({
      saveVersion: 2, money: 456,
      deliveredPetIds: ['dog','cat','fox','peacock','panda','vip-a','vip-b','dragon'],
      unlockedZones: Object.values(ZoneId), purchasedUpgradeIds: ['fast-dash','double-dash'],
      runStats: { elapsedMs: 540_000, failedThefts: 3, successfulDeliveries: 8, campaignCompleted: true },
    });
    expect(migrated.balanceRevision).toBe(2);
    expect(migrated.deliveredPetIds).not.toContain('roam-01');
    expect(migrated.grandfatheredZoneIds).toContain(ZoneId.VipEstate);
    expect(migrated.grandfatheredUpgradeIds).toContain('double-dash');
    expect(isValidGameSaveData(migrated)).toBe(true);
  });
  it('rejects corrupt transient or duplicate facts', () => {
    expect(isValidGameSaveData({
      saveVersion: 3, balanceRevision: 2, money: 0,
      deliveredPetIds: ['dog','dog'], unlockedZones: [ZoneId.StarterSuburb],
      purchasedUpgradeIds: [], grandfatheredZoneIds: [], grandfatheredUpgradeIds: [],
    })).toBe(false);
  });
  it('accepts a clean completed 14/14 balance revision 2 save', () => {
    expect(isValidGameSaveData({
      saveVersion: 3, balanceRevision: 2, money: 123,
      deliveredPetIds: ['dog','cat','fox','peacock','panda','vip-a','vip-b','dragon','roam-01','roam-02','roam-03','roam-04','roam-05','roam-06'],
      unlockedZones: Object.values(ZoneId),
      purchasedUpgradeIds: ['pet-tracker','calming-lure','fast-dash','runner-shoes','double-dash','quiet-shoes'],
      grandfatheredZoneIds: [], grandfatheredUpgradeIds: [],
      runStats: { elapsedMs: 960_000, failedThefts: 2, successfulDeliveries: 14, campaignCompleted: true },
    })).toBe(true);
  });
});
