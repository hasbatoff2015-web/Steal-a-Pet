export enum UpgradeEffectId {
  DashCooldownMs = 'DASH_COOLDOWN_MS',
}

export interface UpgradeDefinition {
  readonly id: string;
  readonly displayName: string;
  readonly cost: number;
  readonly effectId: UpgradeEffectId;
  readonly effectValue: number;
}

export const UPGRADE_DEFINITIONS = {
  fastDash: {
    id: 'fast-dash',
    displayName: 'БЫСТРЫЙ РЫВОК',
    cost: 50,
    effectId: UpgradeEffectId.DashCooldownMs,
    effectValue: 650,
  },
} as const satisfies Readonly<Record<string, UpgradeDefinition>>;

export type UpgradeId = (typeof UPGRADE_DEFINITIONS)[keyof typeof UPGRADE_DEFINITIONS]['id'];

export const FAST_DASH_UPGRADE = UPGRADE_DEFINITIONS.fastDash;

export function getUpgradeDefinition(upgradeId: UpgradeId): UpgradeDefinition {
  const definition = Object.values(UPGRADE_DEFINITIONS).find(
    (candidate) => candidate.id === upgradeId,
  );
  if (definition === undefined) {
    throw new Error(`Unknown upgrade "${upgradeId}".`);
  }
  return definition;
}
