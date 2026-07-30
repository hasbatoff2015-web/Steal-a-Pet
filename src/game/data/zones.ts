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
}

export const PARK_GATE_DEFINITION: ZoneGateDefinition = {
  id: 'park-bridge-gate',
  zoneId: ZoneId.Park,
  displayName: 'PARK',
  cost: 25,
};
