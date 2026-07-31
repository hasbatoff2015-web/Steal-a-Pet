import type { PetId } from './pets';
import { ZoneId } from './zones';

export interface WorldPoint {
  readonly x: number;
  readonly y: number;
}

export interface ChaseParameters {
  readonly npcSpeed: number;
  readonly returnSpeed: number;
  readonly catchDistance: number;
  readonly theftHeadStartMs: number;
  readonly failureGraceMs: number;
}

export interface PetEncounterDefinition {
  readonly id: string;
  readonly petId: PetId;
  readonly requiredZone: ZoneId;
  readonly ownerHome: WorldPoint;
  readonly petHome: WorldPoint;
  readonly ownerVisualKey: string;
  readonly chase: ChaseParameters;
  readonly returnRoutes?: readonly (readonly WorldPoint[])[];
}

export const PET_ENCOUNTER_DEFINITIONS: readonly PetEncounterDefinition[] = [
  {
    id: 'starter-dog',
    petId: 'dog',
    requiredZone: ZoneId.StarterSuburb,
    ownerHome: { x: 1500, y: 1580 },
    petHome: { x: 1640, y: 1580 },
    ownerVisualKey: 'owner',
    chase: {
      npcSpeed: 226,
      returnSpeed: 185,
      catchDistance: 45,
      theftHeadStartMs: 900,
      failureGraceMs: 1600,
    },
  },
  {
    id: 'park-cat',
    petId: 'cat',
    requiredZone: ZoneId.Park,
    ownerHome: { x: 1220, y: 620 },
    petHome: { x: 1370, y: 620 },
    ownerVisualKey: 'park-owner',
    chase: {
      npcSpeed: 238,
      returnSpeed: 190,
      catchDistance: 45,
      theftHeadStartMs: 700,
      failureGraceMs: 1600,
    },
    returnRoutes: [
      [
        { x: 900, y: 1220 },
        { x: 900, y: 840 },
        { x: 1100, y: 700 },
        { x: 1220, y: 700 },
      ],
      [
        { x: 1040, y: 340 },
        { x: 1020, y: 620 },
        { x: 1220, y: 700 },
      ],
      [
        { x: 1420, y: 340 },
        { x: 1510, y: 620 },
        { x: 1400, y: 700 },
        { x: 1220, y: 700 },
      ],
      [
        { x: 1400, y: 790 },
        { x: 1220, y: 700 },
      ],
    ],
  },
  {
    id: 'central-fox',
    petId: 'fox',
    requiredZone: ZoneId.CentralHub,
    ownerHome: { x: 2260, y: 1650 },
    petHome: { x: 2390, y: 1650 },
    ownerVisualKey: 'hub-owner',
    chase: {
      npcSpeed: 240,
      returnSpeed: 195,
      catchDistance: 45,
      theftHeadStartMs: 650,
      failureGraceMs: 1600,
    },
    returnRoutes: [
      [
        { x: 900, y: 1220 },
        { x: 900, y: 840 },
        { x: 1550, y: 650 },
        { x: 1800, y: 650 },
        { x: 1950, y: 820 },
        { x: 2250, y: 900 },
        { x: 2450, y: 1250 },
        { x: 2300, y: 1550 },
      ],
      [
        { x: 2020, y: 1940 },
        { x: 2240, y: 1840 },
        { x: 2300, y: 1550 },
      ],
    ],
  },
];
