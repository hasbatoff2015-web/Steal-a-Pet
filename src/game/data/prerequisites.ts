import type { PetId } from './pets';

export interface ProgressionRequirements {
  readonly requiredPetIds?: readonly PetId[];
  readonly requiredUpgradeIds?: readonly string[];
  readonly requiredZones?: readonly string[];
  readonly requiredRoamingPetCount?: number;
}

export interface ProgressionFacts {
  isPetDelivered(petId: PetId): boolean;
  isUpgradePurchased(upgradeId: string): boolean;
  isZoneUnlocked?(zoneId: string): boolean;
  getRoamingPetCount?(): number;
}

export function areProgressionRequirementsMet(
  requirements: ProgressionRequirements,
  facts: ProgressionFacts,
): boolean {
  return (
    (requirements.requiredPetIds?.every((id) => facts.isPetDelivered(id)) ?? true) &&
    (requirements.requiredUpgradeIds?.every((id) => facts.isUpgradePurchased(id)) ?? true) &&
    (requirements.requiredZones?.every((id) => facts.isZoneUnlocked?.(id) ?? false) ?? true) &&
    (facts.getRoamingPetCount?.() ?? 0) >= (requirements.requiredRoamingPetCount ?? 0)
  );
}
