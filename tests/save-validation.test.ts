import { describe, expect, it } from 'vitest';

import { ZoneId } from '../src/game/data/zones';
import { isValidGameSaveData } from '../src/game/systems/SaveSystem';

describe('save v2 validation', () => {
  it('accepts a valid Stage 3 save without Stage 4 facts', () => {
    expect(
      isValidGameSaveData({
        saveVersion: 2,
        money: 64,
        deliveredPetIds: ['dog', 'cat', 'fox'],
        unlockedZones: [
          ZoneId.StarterSuburb,
          ZoneId.Park,
          ZoneId.CentralHub,
        ],
        purchasedUpgradeIds: ['fast-dash'],
      }),
    ).toBe(true);
  });

  it('rejects Rich District facts with broken dependencies', () => {
    expect(
      isValidGameSaveData({
        saveVersion: 2,
        money: 0,
        deliveredPetIds: ['dog', 'cat', 'fox', 'panda'],
        unlockedZones: [
          ZoneId.StarterSuburb,
          ZoneId.Park,
          ZoneId.CentralHub,
          ZoneId.RichDistrict,
        ],
        purchasedUpgradeIds: [],
      }),
    ).toBe(false);
  });

  it('accepts a complete valid Stage 4 save', () => {
    expect(
      isValidGameSaveData({
        saveVersion: 2,
        money: 310,
        deliveredPetIds: ['dog', 'cat', 'fox', 'peacock', 'panda'],
        unlockedZones: [
          ZoneId.StarterSuburb,
          ZoneId.Park,
          ZoneId.CentralHub,
          ZoneId.RichDistrict,
        ],
        purchasedUpgradeIds: ['fast-dash', 'double-dash'],
      }),
    ).toBe(true);
  });

  it('rejects VIP Estate without all Stage 4 prerequisites', () => {
    expect(
      isValidGameSaveData({
        saveVersion: 2,
        money: 0,
        deliveredPetIds: ['dog', 'cat', 'fox', 'peacock'],
        unlockedZones: Object.values(ZoneId),
        purchasedUpgradeIds: ['fast-dash', 'double-dash'],
      }),
    ).toBe(false);
  });

  it('rejects Dragon delivery without both VIP pets', () => {
    expect(
      isValidGameSaveData({
        saveVersion: 2,
        money: 0,
        deliveredPetIds: [
          'dog',
          'cat',
          'fox',
          'peacock',
          'panda',
          'vip-a',
          'dragon',
        ],
        unlockedZones: Object.values(ZoneId),
        purchasedUpgradeIds: ['fast-dash', 'double-dash'],
      }),
    ).toBe(false);
  });

  it('accepts a complete final save with optional run stats', () => {
    expect(
      isValidGameSaveData({
        saveVersion: 2,
        money: 456,
        deliveredPetIds: [
          'dog',
          'cat',
          'fox',
          'peacock',
          'panda',
          'vip-a',
          'vip-b',
          'dragon',
        ],
        unlockedZones: Object.values(ZoneId),
        purchasedUpgradeIds: ['fast-dash', 'double-dash'],
        runStats: {
          elapsedMs: 540_000,
          failedThefts: 3,
          successfulDeliveries: 8,
          campaignCompleted: true,
        },
      }),
    ).toBe(true);
  });
});
