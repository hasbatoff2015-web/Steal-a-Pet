import type { PetId } from './pets';
import {
  areProgressionRequirementsMet,
  type ProgressionFacts,
  type ProgressionRequirements,
} from './prerequisites';
import { ZoneId } from './zones';

export enum UpgradeEffectId {
  DashCooldownMs = 'DASH_COOLDOWN_MS',
  MaxDashCharges = 'MAX_DASH_CHARGES',
  MoveSpeedMultiplier = 'MOVE_SPEED_MULTIPLIER',
  RoamingDetectionRadiusMultiplier = 'ROAMING_DETECTION_RADIUS_MULTIPLIER',
  RoamingStaminaDrainMultiplier = 'ROAMING_STAMINA_DRAIN_MULTIPLIER',
  RoamingTiredWindowMultiplier = 'ROAMING_TIRED_WINDOW_MULTIPLIER',
  TheftHeadStartBonusMs = 'THEFT_HEAD_START_BONUS_MS',
  DelayedPursuerActivationBonusMs = 'DELAYED_PURSUER_ACTIVATION_BONUS_MS',
  TrackerEnabled = 'TRACKER_ENABLED',
}

export enum UpgradeBranchId {
  Mobility = 'MOBILITY',
  Tracking = 'TRACKING',
  Stealth = 'STEALTH',
}

export interface UpgradeEffect {
  readonly id: UpgradeEffectId;
  readonly value: number;
}

export type UpgradeId =
  | 'pet-tracker' | 'calming-lure' | 'fast-dash'
  | 'runner-shoes' | 'double-dash' | 'quiet-shoes';

export interface UpgradeDefinition extends ProgressionRequirements {
  readonly id: UpgradeId;
  readonly displayName: string;
  readonly cost: number;
  readonly branchId: UpgradeBranchId;
  readonly order: number;
  readonly effects: readonly UpgradeEffect[];
  readonly lockedLabel: string;
}

export const UPGRADE_DEFINITIONS: Readonly<Record<string, UpgradeDefinition>> = {
  petTracker: {
    id: 'pet-tracker', displayName: 'ТРЕКЕР ПИТОМЦЕВ', cost: 120,
    branchId: UpgradeBranchId.Tracking, order: 0,
    effects: [{ id: UpgradeEffectId.TrackerEnabled, value: 1 }],
    requiredPetIds: ['cat'], lockedLabel: 'НУЖЕН КОТ',
  },
  calmingLure: {
    id: 'calming-lure', displayName: 'УЛУЧШЕННАЯ ПРИМАНКА', cost: 450,
    branchId: UpgradeBranchId.Tracking, order: 1,
    effects: [
      { id: UpgradeEffectId.RoamingDetectionRadiusMultiplier, value: 0.8 },
      { id: UpgradeEffectId.RoamingStaminaDrainMultiplier, value: 1.25 },
      { id: UpgradeEffectId.RoamingTiredWindowMultiplier, value: 1.2 },
    ],
    requiredUpgradeIds: ['pet-tracker'], requiredRoamingPetCount: 2,
    lockedLabel: 'НУЖНЫ РАДАР И 2 БРОДЯЧИХ ПИТОМЦА',
  },
  fastDash: {
    id: 'fast-dash', displayName: 'БЫСТРЫЙ РЫВОК', cost: 200,
    branchId: UpgradeBranchId.Mobility, order: 0,
    effects: [{ id: UpgradeEffectId.DashCooldownMs, value: 650 }],
    requiredPetIds: ['fox'], lockedLabel: 'НУЖНА ЛИСА',
  },
  runnerShoes: {
    id: 'runner-shoes', displayName: 'БЕГОВЫЕ КРОССОВКИ', cost: 800,
    branchId: UpgradeBranchId.Mobility, order: 1,
    effects: [{ id: UpgradeEffectId.MoveSpeedMultiplier, value: 1.1 }],
    requiredZones: [ZoneId.RichDistrict], requiredUpgradeIds: ['fast-dash'],
    requiredRoamingPetCount: 4, lockedLabel: 'НУЖНЫ RICH, БЫСТРЫЙ РЫВОК И 4 БРОДЯЧИХ',
  },
  doubleDash: {
    id: 'double-dash', displayName: 'ДВОЙНОЙ РЫВОК', cost: 1100,
    branchId: UpgradeBranchId.Mobility, order: 2,
    effects: [{ id: UpgradeEffectId.MaxDashCharges, value: 2 }],
    requiredPetIds: ['peacock', 'panda'],
    requiredUpgradeIds: ['fast-dash', 'runner-shoes'],
    requiredRoamingPetCount: 4,
    lockedLabel: 'НУЖНЫ ПАВЛИН, ПАНДА, КРОССОВКИ И 4 БРОДЯЧИХ',
  },
  quietShoes: {
    id: 'quiet-shoes', displayName: 'ТИХИЕ КРОССОВКИ', cost: 1400,
    branchId: UpgradeBranchId.Stealth, order: 0,
    effects: [
      { id: UpgradeEffectId.TheftHeadStartBonusMs, value: 200 },
      { id: UpgradeEffectId.DelayedPursuerActivationBonusMs, value: 300 },
    ],
    requiredUpgradeIds: ['runner-shoes', 'double-dash'],
    requiredRoamingPetCount: 6,
    lockedLabel: 'НУЖНЫ 6 БРОДЯЧИХ И ДВОЙНОЙ РЫВОК',
  },
};

export const PET_TRACKER_UPGRADE = UPGRADE_DEFINITIONS['petTracker']!;
export const CALMING_LURE_UPGRADE = UPGRADE_DEFINITIONS['calmingLure']!;
export const FAST_DASH_UPGRADE = UPGRADE_DEFINITIONS['fastDash']!;
export const RUNNER_SHOES_UPGRADE = UPGRADE_DEFINITIONS['runnerShoes']!;
export const DOUBLE_DASH_UPGRADE = UPGRADE_DEFINITIONS['doubleDash']!;
export const QUIET_SHOES_UPGRADE = UPGRADE_DEFINITIONS['quietShoes']!;

export function getUpgradeDefinition(upgradeId: UpgradeId): UpgradeDefinition {
  const definition = Object.values(UPGRADE_DEFINITIONS).find((item) => item.id === upgradeId);
  if (definition === undefined) throw new Error(`Unknown upgrade "${upgradeId}".`);
  return definition;
}

export interface UpgradePrerequisiteFacts extends ProgressionFacts {
  isPetDelivered(petId: PetId): boolean;
}

export function areUpgradePrerequisitesMet(
  definition: UpgradeDefinition,
  facts: UpgradePrerequisiteFacts,
): boolean {
  return areProgressionRequirementsMet(definition, facts);
}
