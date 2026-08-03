import type { PetId } from './pets';

export enum UpgradeEffectId {
  DashCooldownMs = 'DASH_COOLDOWN_MS',
  MaxDashCharges = 'MAX_DASH_CHARGES',
}

export interface UpgradeDefinition {
  readonly id: string;
  readonly displayName: string;
  readonly cost: number;
  readonly effectId: UpgradeEffectId;
  readonly effectValue: number;
  readonly requiredPetIds?: readonly PetId[];
  readonly requiredUpgradeIds?: readonly string[];
  readonly lockedLabel: string;
}

export const UPGRADE_DEFINITIONS = {
  fastDash: {
    id: 'fast-dash',
    displayName: 'БЫСТРЫЙ РЫВОК',
    cost: 50,
    effectId: UpgradeEffectId.DashCooldownMs,
    effectValue: 650,
    requiredPetIds: ['fox'],
    lockedLabel: 'УЛУЧШЕНИЕ\nОТКРОЕТСЯ ПОЗЖЕ',
  },
  doubleDash: {
    id: 'double-dash',
    displayName: 'ДВОЙНОЙ РЫВОК',
    cost: 250,
    effectId: UpgradeEffectId.MaxDashCharges,
    effectValue: 2,
    requiredPetIds: ['peacock', 'panda'],
    requiredUpgradeIds: ['fast-dash'],
    lockedLabel: 'СЛЕДУЮЩЕЕ УЛУЧШЕНИЕ\nПОСЛЕ RICH DISTRICT',
  },
} as const satisfies Readonly<Record<string, UpgradeDefinition>>;

export type UpgradeId = (typeof UPGRADE_DEFINITIONS)[keyof typeof UPGRADE_DEFINITIONS]['id'];

export const FAST_DASH_UPGRADE = UPGRADE_DEFINITIONS.fastDash;
export const DOUBLE_DASH_UPGRADE = UPGRADE_DEFINITIONS.doubleDash;

export function getUpgradeDefinition(upgradeId: UpgradeId): UpgradeDefinition {
  const definition = Object.values(UPGRADE_DEFINITIONS).find(
    (candidate) => candidate.id === upgradeId,
  );
  if (definition === undefined) {
    throw new Error(`Unknown upgrade "${upgradeId}".`);
  }
  return definition;
}

export interface UpgradePrerequisiteFacts {
  isPetDelivered(petId: PetId): boolean;
  isUpgradePurchased(upgradeId: string): boolean;
}

export function areUpgradePrerequisitesMet(
  definition: UpgradeDefinition,
  facts: UpgradePrerequisiteFacts,
): boolean {
  return (
    (definition.requiredPetIds?.every((petId) => facts.isPetDelivered(petId)) ??
      true) &&
    (definition.requiredUpgradeIds?.every((upgradeId) =>
      facts.isUpgradePurchased(upgradeId),
    ) ?? true)
  );
}
