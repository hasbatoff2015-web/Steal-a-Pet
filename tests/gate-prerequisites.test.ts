import { describe, expect, it } from 'vitest';
import { areZoneGatePrerequisitesMet, RICH_DISTRICT_GATE_DEFINITION, VIP_ESTATE_GATE_DEFINITION, ZoneId } from '../src/game/data/zones';

const coreFive = new Set(['dog', 'cat', 'fox', 'peacock', 'panda']);

describe('Stage 6 gate prerequisites', () => {
  it('requires two roaming pets for Rich District', () => {
    const facts = {
      isPetDelivered: (id: string) => id === 'fox',
      isUpgradePurchased: (id: string) => id === 'fast-dash',
      isZoneUnlocked: (id: string) => id === ZoneId.CentralHub,
      getRoamingPetCount: () => 1,
    };
    expect(areZoneGatePrerequisitesMet(RICH_DISTRICT_GATE_DEFINITION, facts)).toBe(false);
    expect(areZoneGatePrerequisitesMet(RICH_DISTRICT_GATE_DEFINITION, { ...facts, getRoamingPetCount: () => 2 })).toBe(true);
    expect(RICH_DISTRICT_GATE_DEFINITION.cost).toBe(600);
  });

  it('requires six roaming pets, Double Dash and Quiet Shoes for VIP', () => {
    const facts = {
      isPetDelivered: (id: string) => coreFive.has(id),
      isUpgradePurchased: (id: string) => ['fast-dash', 'double-dash', 'quiet-shoes'].includes(id),
      isZoneUnlocked: (id: string) => id === ZoneId.RichDistrict,
      getRoamingPetCount: () => 6,
    };
    expect(areZoneGatePrerequisitesMet(VIP_ESTATE_GATE_DEFINITION, facts)).toBe(true);
    expect(areZoneGatePrerequisitesMet(VIP_ESTATE_GATE_DEFINITION, { ...facts, getRoamingPetCount: () => 5 })).toBe(false);
    expect(VIP_ESTATE_GATE_DEFINITION.cost).toBe(2800);
  });
});
