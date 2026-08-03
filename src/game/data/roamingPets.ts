import type { PetId } from './pets';
import { ZoneId } from './zones';

export enum RoamingBehaviorId {
  Curious = 'CURIOUS', Skittish = 'SKITTISH', Evasive = 'EVASIVE', Sprinter = 'SPRINTER',
}

export enum RoamingCaptureMode {
  TireAndInteract = 'TIRE_AND_INTERACT',
}

export interface RoamingBehaviorProfile {
  readonly wanderSpeed: number;
  readonly fleeSpeed: number;
  readonly detectionRadius: number;
  readonly staminaSeconds: number;
  readonly decisionIntervalMs: number;
  readonly tiredWindowMs: number;
}

export const ROAMING_BEHAVIOR_PROFILES: Readonly<Record<RoamingBehaviorId, RoamingBehaviorProfile>> = {
  [RoamingBehaviorId.Curious]: { wanderSpeed: 80, fleeSpeed: 150, detectionRadius: 120, staminaSeconds: 5, decisionIntervalMs: 600, tiredWindowMs: 3500 },
  [RoamingBehaviorId.Skittish]: { wanderSpeed: 95, fleeSpeed: 175, detectionRadius: 170, staminaSeconds: 4.5, decisionIntervalMs: 480, tiredWindowMs: 3200 },
  [RoamingBehaviorId.Evasive]: { wanderSpeed: 100, fleeSpeed: 190, detectionRadius: 190, staminaSeconds: 4, decisionIntervalMs: 350, tiredWindowMs: 2700 },
  [RoamingBehaviorId.Sprinter]: { wanderSpeed: 110, fleeSpeed: 220, detectionRadius: 220, staminaSeconds: 3.3, decisionIntervalMs: 420, tiredWindowMs: 2300 },
};

export interface RoamingWaypoint {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly neighborIds: readonly string[];
}

export interface RoamingTerritory {
  readonly id: string;
  readonly displayName: string;
  readonly bounds: Readonly<{ x: number; y: number; width: number; height: number }>;
}

export interface RoamingPetDefinition {
  readonly id: string;
  readonly petId: PetId;
  readonly zoneId: ZoneId;
  readonly territory: RoamingTerritory;
  readonly spawnWaypointId: string;
  readonly waypoints: readonly RoamingWaypoint[];
  readonly behaviorId: RoamingBehaviorId;
  readonly captureMode: RoamingCaptureMode;
  readonly baseSlotId: string;
  readonly accessibleAfterZoneId?: ZoneId;
}

function loopWaypoints(
  prefix: string,
  points: readonly (readonly [number, number])[],
): readonly RoamingWaypoint[] {
  return points.map(([x, y], index) => ({
    id: `${prefix}-${index}`,
    x, y,
    neighborIds: [
      `${prefix}-${(index + points.length - 1) % points.length}`,
      `${prefix}-${(index + 1) % points.length}`,
    ],
  }));
}

export const ROAMING_PET_DEFINITIONS: readonly RoamingPetDefinition[] = [
  {
    id: 'starter-jumper', petId: 'roam-01', zoneId: ZoneId.StarterSuburb,
    territory: { id: 'starter-outskirts', displayName: 'STARTER OUTSKIRTS', bounds: { x: 980, y: 2260, width: 780, height: 670 } },
    spawnWaypointId: 'r1-0', behaviorId: RoamingBehaviorId.Curious,
    captureMode: RoamingCaptureMode.TireAndInteract, baseSlotId: 'roam-01',
    waypoints: loopWaypoints('r1', [[1120,2420],[1370,2330],[1620,2440],[1660,2700],[1440,2870],[1150,2800],[1030,2600]]),
  },
  {
    id: 'park-raccoon', petId: 'roam-02', zoneId: ZoneId.Park,
    territory: { id: 'park-north-grove', displayName: 'PARK NORTH GROVE', bounds: { x: 120, y: 100, width: 1460, height: 680 } },
    spawnWaypointId: 'r2-0', behaviorId: RoamingBehaviorId.Skittish,
    captureMode: RoamingCaptureMode.TireAndInteract, baseSlotId: 'roam-02', accessibleAfterZoneId: ZoneId.Park,
    waypoints: loopWaypoints('r2', [[250,280],[490,180],[760,250],[1040,160],[1380,280],[1450,560],[1110,650],[770,570],[420,650],[190,500]]),
  },
  {
    id: 'hub-alpaca', petId: 'roam-03', zoneId: ZoneId.CentralHub,
    territory: { id: 'central-backstreets', displayName: 'CENTRAL MARKET BACKSTREETS', bounds: { x: 1750, y: 520, width: 1170, height: 850 } },
    spawnWaypointId: 'r3-0', behaviorId: RoamingBehaviorId.Curious,
    captureMode: RoamingCaptureMode.TireAndInteract, baseSlotId: 'roam-03', accessibleAfterZoneId: ZoneId.CentralHub,
    waypoints: loopWaypoints('r3', [[1830,690],[2070,590],[2350,700],[2670,610],[2820,850],[2690,1120],[2380,1250],[2050,1140],[1840,930]]),
  },
  {
    id: 'canal-chameleon', petId: 'roam-04', zoneId: ZoneId.CentralHub,
    territory: { id: 'south-canal', displayName: 'SOUTH CANAL PROMENADE', bounds: { x: 1710, y: 2210, width: 1290, height: 730 } },
    spawnWaypointId: 'r4-0', behaviorId: RoamingBehaviorId.Evasive,
    captureMode: RoamingCaptureMode.TireAndInteract, baseSlotId: 'roam-04', accessibleAfterZoneId: ZoneId.CentralHub,
    waypoints: loopWaypoints('r4', [[1810,2350],[2070,2260],[2390,2340],[2730,2290],[2870,2520],[2720,2810],[2390,2890],[2050,2790],[1790,2610]]),
  },
  {
    id: 'rich-gazelle', petId: 'roam-05', zoneId: ZoneId.RichDistrict,
    territory: { id: 'rich-gardens', displayName: 'RICH GARDENS', bounds: { x: 3080, y: 1540, width: 1370, height: 1320 } },
    spawnWaypointId: 'r5-0', behaviorId: RoamingBehaviorId.Sprinter,
    captureMode: RoamingCaptureMode.TireAndInteract, baseSlotId: 'roam-05', accessibleAfterZoneId: ZoneId.RichDistrict,
    waypoints: loopWaypoints('r5', [[3190,1740],[3490,1610],[3860,1690],[4250,1840],[4370,2180],[4260,2570],[3900,2760],[3500,2650],[3200,2360],[3110,2040]]),
  },
  {
    id: 'vip-griffin', petId: 'roam-06', zoneId: ZoneId.RichDistrict,
    territory: { id: 'vip-approach', displayName: 'VIP APPROACH OUTER GROUNDS', bounds: { x: 3020, y: 900, width: 1470, height: 590 } },
    spawnWaypointId: 'r6-0', behaviorId: RoamingBehaviorId.Sprinter,
    captureMode: RoamingCaptureMode.TireAndInteract, baseSlotId: 'roam-06', accessibleAfterZoneId: ZoneId.RichDistrict,
    waypoints: loopWaypoints('r6', [[3140,1050],[3440,980],[3780,1060],[4140,970],[4380,1110],[4290,1370],[3920,1430],[3570,1360],[3250,1400],[3070,1240]]),
  },
] as const;

export type RoamingPetId =
  | 'roam-01' | 'roam-02' | 'roam-03' | 'roam-04' | 'roam-05' | 'roam-06';

export function getRoamingPetDefinition(petId: RoamingPetId): RoamingPetDefinition {
  const definition = ROAMING_PET_DEFINITIONS.find((item) => item.petId === petId);
  if (definition === undefined) throw new Error(`Unknown roaming pet "${petId}".`);
  return definition;
}
