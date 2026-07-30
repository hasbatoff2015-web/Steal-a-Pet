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
  },
];
