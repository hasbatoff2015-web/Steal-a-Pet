import { describe, expect, it } from 'vitest';

import {
  areUpgradePrerequisitesMet,
  DOUBLE_DASH_UPGRADE,
} from '../src/game/data/upgrades';

describe('Double Dash prerequisites', () => {
  it('requires Fast Dash and both Rich District pets', () => {
    const deliveredPetIds = new Set(['peacock']);
    expect(
      areUpgradePrerequisitesMet(DOUBLE_DASH_UPGRADE, {
        isPetDelivered: (petId) => deliveredPetIds.has(petId),
        isUpgradePurchased: (upgradeId) => upgradeId === 'fast-dash',
      }),
    ).toBe(false);

    deliveredPetIds.add('panda');
    expect(
      areUpgradePrerequisitesMet(DOUBLE_DASH_UPGRADE, {
        isPetDelivered: (petId) => deliveredPetIds.has(petId),
        isUpgradePurchased: (upgradeId) => upgradeId === 'fast-dash',
      }),
    ).toBe(true);
  });
});
