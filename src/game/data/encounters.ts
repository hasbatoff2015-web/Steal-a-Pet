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

export interface PursuerDefinition {
  readonly id: string;
  readonly home: WorldPoint;
  readonly visualKey: string;
  readonly chase: ChaseParameters;
  readonly activationDelayMs?: number;
  readonly returnRoutes?: readonly (readonly WorldPoint[])[];
}

export interface PetEncounterDefinition {
  readonly id: string;
  readonly petId: PetId;
  readonly requiredZone: ZoneId;
  readonly petHome: WorldPoint;
  readonly pursuers: readonly PursuerDefinition[];
}

export const PET_ENCOUNTER_DEFINITIONS: readonly PetEncounterDefinition[] = [
  {
    id: 'starter-dog',
    petId: 'dog',
    requiredZone: ZoneId.StarterSuburb,
    petHome: { x: 1640, y: 1580 },
    pursuers: [
      {
        id: 'starter-owner',
        home: { x: 1500, y: 1580 },
        visualKey: 'owner',
        chase: {
          npcSpeed: 226,
          returnSpeed: 185,
          catchDistance: 45,
          theftHeadStartMs: 900,
          failureGraceMs: 1600,
        },
      },
    ],
  },
  {
    id: 'park-cat',
    petId: 'cat',
    requiredZone: ZoneId.Park,
    petHome: { x: 1370, y: 620 },
    pursuers: [
      {
        id: 'park-owner',
        home: { x: 1220, y: 620 },
        visualKey: 'park-owner',
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
    ],
  },
  {
    id: 'central-fox',
    petId: 'fox',
    requiredZone: ZoneId.CentralHub,
    petHome: { x: 2390, y: 1650 },
    pursuers: [
      {
        id: 'hub-owner',
        home: { x: 2260, y: 1650 },
        visualKey: 'hub-owner',
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
    ],
  },
  {
    id: 'rich-peacock',
    petId: 'peacock',
    requiredZone: ZoneId.RichDistrict,
    petHome: { x: 3160, y: 1120 },
    pursuers: [
      {
        id: 'peacock-owner',
        home: { x: 3015, y: 1120 },
        visualKey: 'rich-owner',
        chase: {
          npcSpeed: 244,
          returnSpeed: 200,
          catchDistance: 45,
          theftHeadStartMs: 600,
          failureGraceMs: 1600,
        },
        returnRoutes: [
          [
            { x: 900, y: 1220 },
            { x: 1760, y: 1460 },
            { x: 2490, y: 1460 },
            { x: 2770, y: 1460 },
            { x: 2890, y: 1270 },
            { x: 3015, y: 1200 },
          ],
          [
            { x: 3420, y: 2240 },
            { x: 3010, y: 2070 },
            { x: 2780, y: 1650 },
            { x: 2890, y: 1270 },
            { x: 3015, y: 1200 },
          ],
          [
            { x: 3580, y: 1030 },
            { x: 3370, y: 980 },
            { x: 3190, y: 1010 },
            { x: 3015, y: 1200 },
          ],
        ],
      },
    ],
  },
  {
    id: 'rich-panda',
    petId: 'panda',
    requiredZone: ZoneId.RichDistrict,
    petHome: { x: 3590, y: 2050 },
    pursuers: [
      {
        id: 'panda-owner',
        home: { x: 3440, y: 2030 },
        visualKey: 'panda-owner',
        chase: {
          npcSpeed: 240,
          returnSpeed: 198,
          catchDistance: 45,
          theftHeadStartMs: 620,
          failureGraceMs: 1700,
        },
        returnRoutes: [
          [
            { x: 900, y: 1220 },
            { x: 1760, y: 1460 },
            { x: 2490, y: 1460 },
            { x: 2780, y: 1560 },
            { x: 3040, y: 1900 },
            { x: 3320, y: 2130 },
            { x: 3440, y: 2030 },
          ],
          [
            { x: 3700, y: 1300 },
            { x: 3690, y: 1690 },
            { x: 3540, y: 1840 },
            { x: 3440, y: 2030 },
          ],
        ],
      },
      {
        id: 'panda-guard',
        home: { x: 3300, y: 2220 },
        visualKey: 'rich-guard',
        activationDelayMs: 800,
        chase: {
          npcSpeed: 232,
          returnSpeed: 194,
          catchDistance: 44,
          theftHeadStartMs: 0,
          failureGraceMs: 1700,
        },
        returnRoutes: [
          [
            { x: 900, y: 1220 },
            { x: 1760, y: 1460 },
            { x: 2490, y: 1460 },
            { x: 2780, y: 1560 },
            { x: 3040, y: 1900 },
            { x: 3220, y: 2160 },
          ],
          [
            { x: 3700, y: 1300 },
            { x: 3690, y: 1690 },
            { x: 3550, y: 1930 },
            { x: 3300, y: 2220 },
          ],
        ],
      },
    ],
  },
];
