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
});
