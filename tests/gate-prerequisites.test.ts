import { describe, expect, it } from 'vitest';

import {
  areZoneGatePrerequisitesMet,
  RICH_DISTRICT_GATE_DEFINITION,
  VIP_ESTATE_GATE_DEFINITION,
  ZoneId,
} from '../src/game/data/zones';

describe('Rich District gate prerequisites', () => {
  it('stays unavailable before Fast Dash', () => {
    expect(
      areZoneGatePrerequisitesMet(RICH_DISTRICT_GATE_DEFINITION, {
        isPetDelivered: (petId) => petId === 'fox',
        isUpgradePurchased: () => false,
        isZoneUnlocked: (zoneId) => zoneId === ZoneId.CentralHub,
      }),
    ).toBe(false);
  });

  it('becomes available after all data-driven prerequisites', () => {
    expect(
      areZoneGatePrerequisitesMet(RICH_DISTRICT_GATE_DEFINITION, {
        isPetDelivered: (petId) => petId === 'fox',
        isUpgradePurchased: (upgradeId) => upgradeId === 'fast-dash',
        isZoneUnlocked: (zoneId) => zoneId === ZoneId.CentralHub,
      }),
    ).toBe(true);
  });
});

describe('VIP Estate gate prerequisites', () => {
  const deliveredPets = new Set(['dog', 'cat', 'fox', 'peacock', 'panda']);
  const purchasedUpgrades = new Set(['fast-dash', 'double-dash']);

  it('stays unavailable when any final prerequisite is missing', () => {
    deliveredPets.delete('panda');
    expect(
      areZoneGatePrerequisitesMet(VIP_ESTATE_GATE_DEFINITION, {
        isPetDelivered: (petId) => deliveredPets.has(petId),
        isUpgradePurchased: (upgradeId) => purchasedUpgrades.has(upgradeId),
        isZoneUnlocked: (zoneId) => zoneId === ZoneId.RichDistrict,
      }),
    ).toBe(false);
  });

  it('becomes available with five pets, both upgrades and Rich District', () => {
    deliveredPets.add('panda');
    expect(
      areZoneGatePrerequisitesMet(VIP_ESTATE_GATE_DEFINITION, {
        isPetDelivered: (petId) => deliveredPets.has(petId),
        isUpgradePurchased: (upgradeId) => purchasedUpgrades.has(upgradeId),
        isZoneUnlocked: (zoneId) => zoneId === ZoneId.RichDistrict,
      }),
    ).toBe(true);
  });
});
