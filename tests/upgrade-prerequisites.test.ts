import { describe, expect, it } from 'vitest';
import { areUpgradePrerequisitesMet, CALMING_LURE_UPGRADE, DOUBLE_DASH_UPGRADE, FAST_DASH_UPGRADE, PET_TRACKER_UPGRADE, QUIET_SHOES_UPGRADE, RUNNER_SHOES_UPGRADE, UpgradeEffectId } from '../src/game/data/upgrades';
import { ZoneId } from '../src/game/data/zones';

describe('Stage 6 upgrade prerequisites and effects', () => {
  const baseFacts = {
    isPetDelivered: (id: string) => id === 'peacock' || id === 'panda',
    isUpgradePurchased: (id: string) => id === 'fast-dash' || id === 'runner-shoes',
    isZoneUnlocked: (id: string) => id === ZoneId.RichDistrict,
    getRoamingPetCount: () => 4,
  };
  it('requires four roaming pets and Runner Shoes for Double Dash', () => {
    expect(areUpgradePrerequisitesMet(DOUBLE_DASH_UPGRADE, baseFacts)).toBe(true);
    expect(areUpgradePrerequisitesMet(DOUBLE_DASH_UPGRADE, { ...baseFacts, getRoamingPetCount: () => 3 })).toBe(false);
  });
  it('requires Rich, Fast Dash and four roaming pets for Runner Shoes', () => {
    expect(areUpgradePrerequisitesMet(RUNNER_SHOES_UPGRADE, baseFacts)).toBe(true);
  });
  it('encodes Quiet Shoes as data-driven timing bonuses', () => {
    expect(QUIET_SHOES_UPGRADE.effects).toEqual(expect.arrayContaining([
      { id: UpgradeEffectId.TheftHeadStartBonusMs, value: 200 },
      { id: UpgradeEffectId.DelayedPursuerActivationBonusMs, value: 300 },
    ]));
  });
  it('matches every approved typed upgrade effect', () => {
    expect(PET_TRACKER_UPGRADE.effects).toContainEqual({ id: UpgradeEffectId.TrackerEnabled, value: 1 });
    expect(CALMING_LURE_UPGRADE.effects).toEqual(expect.arrayContaining([
      { id: UpgradeEffectId.RoamingDetectionRadiusMultiplier, value: 0.8 },
      { id: UpgradeEffectId.RoamingStaminaDrainMultiplier, value: 1.25 },
      { id: UpgradeEffectId.RoamingTiredWindowMultiplier, value: 1.2 },
    ]));
    expect(FAST_DASH_UPGRADE.effects).toContainEqual({ id: UpgradeEffectId.DashCooldownMs, value: 650 });
    expect(RUNNER_SHOES_UPGRADE.effects).toContainEqual({ id: UpgradeEffectId.MoveSpeedMultiplier, value: 1.1 });
    expect(DOUBLE_DASH_UPGRADE.effects).toContainEqual({ id: UpgradeEffectId.MaxDashCharges, value: 2 });
  });
});
