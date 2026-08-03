import { describe, expect, it } from 'vitest';

import {
  areZoneGatePrerequisitesMet,
  RICH_DISTRICT_GATE_DEFINITION,
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
