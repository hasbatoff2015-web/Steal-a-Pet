import type { PetId } from './pets';

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
  readonly requiredPetId?: PetId;
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
  requiredPetId: 'cat',
};
