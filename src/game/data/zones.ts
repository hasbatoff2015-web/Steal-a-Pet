import type { PetId } from './pets';
import {
  areProgressionRequirementsMet,
  type ProgressionFacts,
  type ProgressionRequirements,
} from './prerequisites';

export enum ZoneId {
  StarterSuburb = 'STARTER_SUBURB', Park = 'PARK', CentralHub = 'CENTRAL_HUB',
  RichDistrict = 'RICH_DISTRICT', VipEstate = 'VIP_ESTATE',
}

export interface ZoneGateDefinition extends ProgressionRequirements {
  readonly id: string;
  readonly zoneId: ZoneId;
  readonly displayName: string;
  readonly cost: number;
  readonly prerequisiteHint?: string;
}

export const PARK_GATE_DEFINITION: ZoneGateDefinition = {
  id: 'park-bridge-gate', zoneId: ZoneId.Park, displayName: 'PARK', cost: 25,
};
export const CENTRAL_HUB_GATE_DEFINITION: ZoneGateDefinition = {
  id: 'central-hub-west-gate', zoneId: ZoneId.CentralHub, displayName: 'CENTRAL HUB', cost: 120,
  requiredPetIds: ['cat'], prerequisiteHint: 'СНАЧАЛА ДОСТАВЬ КОТА',
};
export const RICH_DISTRICT_GATE_DEFINITION: ZoneGateDefinition = {
  id: 'rich-district-west-gate', zoneId: ZoneId.RichDistrict, displayName: 'RICH DISTRICT', cost: 600,
  requiredPetIds: ['fox'], requiredUpgradeIds: ['fast-dash'],
  requiredZones: [ZoneId.CentralHub], requiredRoamingPetCount: 2,
  prerequisiteHint: 'НУЖНЫ ЛИСА, БЫСТРЫЙ РЫВОК И 2 БРОДЯЧИХ ПИТОМЦА',
};
export const VIP_ESTATE_GATE_DEFINITION: ZoneGateDefinition = {
  id: 'vip-estate-main-gate', zoneId: ZoneId.VipEstate, displayName: 'VIP ESTATE', cost: 2800,
  requiredPetIds: ['dog', 'cat', 'fox', 'peacock', 'panda'],
  requiredUpgradeIds: ['fast-dash', 'double-dash', 'quiet-shoes'],
  requiredZones: [ZoneId.RichDistrict], requiredRoamingPetCount: 6,
  prerequisiteHint: 'НУЖНЫ 6 БРОДЯЧИХ, ДВОЙНОЙ РЫВОК И ТИХИЕ КРОССОВКИ',
};

export interface ZoneGatePrerequisiteFacts extends ProgressionFacts {
  isPetDelivered(petId: PetId): boolean;
  isUpgradePurchased(upgradeId: string): boolean;
}

export function areZoneGatePrerequisitesMet(
  definition: ZoneGateDefinition,
  facts: ZoneGatePrerequisiteFacts,
): boolean {
  return areProgressionRequirementsMet(definition, facts);
}
