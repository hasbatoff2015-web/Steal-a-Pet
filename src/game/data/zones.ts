import type { PetId } from './pets';
import type { UpgradeId } from './upgrades';

export enum ZoneId {
  StarterSuburb = 'STARTER_SUBURB',
  Park = 'PARK',
  CentralHub = 'CENTRAL_HUB',
  RichDistrict = 'RICH_DISTRICT',
  VipEstate = 'VIP_ESTATE',
}

export interface ZoneGateDefinition {
  readonly id: string;
  readonly zoneId: ZoneId;
  readonly displayName: string;
  readonly cost: number;
  readonly requiredPetIds?: readonly PetId[];
  readonly requiredUpgradeIds?: readonly UpgradeId[];
  readonly requiredZones?: readonly ZoneId[];
  readonly prerequisiteHint?: string;
}

export const PARK_GATE_DEFINITION: ZoneGateDefinition = {
  id: 'park-bridge-gate',
  zoneId: ZoneId.Park,
  displayName: 'PARK',
  cost: 25,
};

export const CENTRAL_HUB_GATE_DEFINITION: ZoneGateDefinition = {
  id: 'central-hub-west-gate',
  zoneId: ZoneId.CentralHub,
  displayName: 'CENTRAL HUB',
  cost: 75,
  requiredPetIds: ['cat'],
  prerequisiteHint: 'СНАЧАЛА ДОСТАВЬ КОТА',
};

export const RICH_DISTRICT_GATE_DEFINITION: ZoneGateDefinition = {
  id: 'rich-district-west-gate',
  zoneId: ZoneId.RichDistrict,
  displayName: 'RICH DISTRICT',
  cost: 200,
  requiredPetIds: ['fox'],
  requiredUpgradeIds: ['fast-dash'],
  requiredZones: [ZoneId.CentralHub],
  prerequisiteHint: 'НУЖНЫ ЛИСА И БЫСТРЫЙ РЫВОК',
};

export interface ZoneGatePrerequisiteFacts {
  isPetDelivered(petId: PetId): boolean;
  isUpgradePurchased(upgradeId: UpgradeId): boolean;
  isZoneUnlocked(zoneId: ZoneId): boolean;
}

export function areZoneGatePrerequisitesMet(
  definition: ZoneGateDefinition,
  facts: ZoneGatePrerequisiteFacts,
): boolean {
  return (
    (definition.requiredPetIds?.every((petId) => facts.isPetDelivered(petId)) ??
      true) &&
    (definition.requiredUpgradeIds?.every((upgradeId) =>
      facts.isUpgradePurchased(upgradeId),
    ) ?? true) &&
    (definition.requiredZones?.every((zoneId) => facts.isZoneUnlocked(zoneId)) ??
      true)
  );
}
