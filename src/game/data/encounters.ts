import type { PetId } from './pets';
import { ChaseGraphId } from './chaseNavigation';
import type { ChaseLane } from '../systems/ChaseNavigation';
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
  readonly activationMessage?: string;
  readonly returnRoutes?: readonly (readonly WorldPoint[])[];
  readonly returnResetAfterMs?: number;
  readonly chaseNavigationGraphId: ChaseGraphId;
  readonly navigationBias?: ChaseLane;
}

export interface PetEncounterDefinition {
  readonly id: string;
  readonly petId: PetId;
  readonly requiredZone: ZoneId;
  readonly requiredPetIds?: readonly PetId[];
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
        chaseNavigationGraphId: ChaseGraphId.Starter,
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
        chaseNavigationGraphId: ChaseGraphId.Park,
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
        chaseNavigationGraphId: ChaseGraphId.Central,
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
        chaseNavigationGraphId: ChaseGraphId.RichA,
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
        chaseNavigationGraphId: ChaseGraphId.RichB,
        navigationBias: -1,
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
        chaseNavigationGraphId: ChaseGraphId.RichB,
        navigationBias: 1,
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
  {
    id: 'vip-west-garden',
    petId: 'vip-a',
    requiredZone: ZoneId.VipEstate,
    petHome: { x: 2880, y: 520 },
    pursuers: [
      {
        id: 'vip-a-owner',
        home: { x: 2795, y: 620 },
        visualKey: 'vip-owner-gold',
        chaseNavigationGraphId: ChaseGraphId.VipWest,
        navigationBias: -1,
        chase: {
          npcSpeed: 240,
          returnSpeed: 198,
          catchDistance: 45,
          theftHeadStartMs: 600,
          failureGraceMs: 1750,
        },
        returnResetAfterMs: 6000,
        returnRoutes: [
          [
            { x: 900, y: 1220 },
            { x: 1760, y: 1460 },
            { x: 2490, y: 1460 },
            { x: 3040, y: 1320 },
            { x: 3350, y: 940 },
            { x: 3350, y: 760 },
            { x: 3090, y: 690 },
            { x: 2795, y: 620 },
          ],
        ],
      },
      {
        id: 'vip-a-garden-guard',
        home: { x: 3090, y: 555 },
        visualKey: 'vip-guard-gold',
        chaseNavigationGraphId: ChaseGraphId.VipWest,
        navigationBias: 1,
        activationDelayMs: 750,
        activationMessage: 'СРАБОТАЛА ТРЕВОГА!',
        chase: {
          npcSpeed: 232,
          returnSpeed: 194,
          catchDistance: 44,
          theftHeadStartMs: 0,
          failureGraceMs: 1750,
        },
        returnResetAfterMs: 6000,
        returnRoutes: [
          [
            { x: 900, y: 1220 },
            { x: 1760, y: 1460 },
            { x: 2490, y: 1460 },
            { x: 3040, y: 1320 },
            { x: 3350, y: 940 },
            { x: 3350, y: 760 },
            { x: 3200, y: 660 },
            { x: 3090, y: 555 },
          ],
        ],
      },
    ],
  },
  {
    id: 'vip-east-tower',
    petId: 'vip-b',
    requiredZone: ZoneId.VipEstate,
    petHome: { x: 3740, y: 500 },
    pursuers: [
      {
        id: 'vip-b-owner',
        home: { x: 3680, y: 615 },
        visualKey: 'vip-owner-purple',
        chaseNavigationGraphId: ChaseGraphId.VipEast,
        navigationBias: 1,
        chase: {
          npcSpeed: 242,
          returnSpeed: 198,
          catchDistance: 45,
          theftHeadStartMs: 580,
          failureGraceMs: 1750,
        },
        returnResetAfterMs: 6000,
        returnRoutes: [
          [
            { x: 900, y: 1220 },
            { x: 1760, y: 1460 },
            { x: 2490, y: 1460 },
            { x: 3040, y: 1320 },
            { x: 3350, y: 940 },
            { x: 3350, y: 760 },
            { x: 3600, y: 700 },
            { x: 3680, y: 615 },
          ],
        ],
      },
      {
        id: 'vip-b-intercept-guard',
        home: { x: 3480, y: 735 },
        visualKey: 'vip-guard-purple',
        chaseNavigationGraphId: ChaseGraphId.VipEast,
        navigationBias: -1,
        activationDelayMs: 1000,
        activationMessage: 'ПЕРЕХВАТЧИК ВЫШЕЛ К ВОРОТАМ!',
        chase: {
          npcSpeed: 230,
          returnSpeed: 192,
          catchDistance: 44,
          theftHeadStartMs: 0,
          failureGraceMs: 1750,
        },
        returnResetAfterMs: 6000,
        returnRoutes: [
          [
            { x: 900, y: 1220 },
            { x: 1760, y: 1460 },
            { x: 2490, y: 1460 },
            { x: 3040, y: 1320 },
            { x: 3350, y: 940 },
            { x: 3350, y: 760 },
            { x: 3480, y: 735 },
          ],
        ],
      },
    ],
  },
  {
    id: 'vip-dragon-courtyard',
    petId: 'dragon',
    requiredZone: ZoneId.VipEstate,
    requiredPetIds: ['vip-a', 'vip-b'],
    petHome: { x: 3340, y: 220 },
    pursuers: [
      {
        id: 'dragon-boss',
        home: { x: 3340, y: 330 },
        visualKey: 'vip-boss',
        chaseNavigationGraphId: ChaseGraphId.Dragon,
        chase: {
          npcSpeed: 240,
          returnSpeed: 198,
          catchDistance: 46,
          theftHeadStartMs: 620,
          failureGraceMs: 1900,
        },
        returnResetAfterMs: 6000,
        returnRoutes: [
          [
            { x: 900, y: 1220 },
            { x: 1760, y: 1460 },
            { x: 2490, y: 1460 },
            { x: 3040, y: 1320 },
            { x: 3350, y: 940 },
            { x: 3350, y: 720 },
            { x: 3470, y: 450 },
            { x: 3340, y: 330 },
          ],
          [
            { x: 3210, y: 450 },
            { x: 3340, y: 330 },
          ],
        ],
      },
      {
        id: 'dragon-guard-a',
        home: { x: 3140, y: 300 },
        visualKey: 'vip-guard-gold',
        chaseNavigationGraphId: ChaseGraphId.Dragon,
        navigationBias: -1,
        activationDelayMs: 700,
        activationMessage: 'СРАБОТАЛА ТРЕВОГА!',
        chase: {
          npcSpeed: 233,
          returnSpeed: 194,
          catchDistance: 44,
          theftHeadStartMs: 0,
          failureGraceMs: 1900,
        },
        returnResetAfterMs: 6000,
        returnRoutes: [
          [
            { x: 900, y: 1220 },
            { x: 1760, y: 1460 },
            { x: 2490, y: 1460 },
            { x: 3040, y: 1320 },
            { x: 3350, y: 940 },
            { x: 3350, y: 720 },
            { x: 3210, y: 450 },
            { x: 3140, y: 300 },
          ],
        ],
      },
      {
        id: 'dragon-guard-b',
        home: { x: 3540, y: 305 },
        visualKey: 'vip-guard-purple',
        chaseNavigationGraphId: ChaseGraphId.Dragon,
        navigationBias: 1,
        activationDelayMs: 1400,
        activationMessage: 'ПОДКРЕПЛЕНИЕ ПРИБЫЛО!',
        chase: {
          npcSpeed: 230,
          returnSpeed: 192,
          catchDistance: 44,
          theftHeadStartMs: 0,
          failureGraceMs: 1900,
        },
        returnResetAfterMs: 6000,
        returnRoutes: [
          [
            { x: 900, y: 1220 },
            { x: 1760, y: 1460 },
            { x: 2490, y: 1460 },
            { x: 3040, y: 1320 },
            { x: 3350, y: 940 },
            { x: 3350, y: 720 },
            { x: 3470, y: 450 },
            { x: 3540, y: 305 },
          ],
        ],
      },
    ],
  },
];
