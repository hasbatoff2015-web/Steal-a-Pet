import type {
  ChaseLane,
  ChaseNavigationEdge,
  ChaseNavigationGraph,
} from '../systems/ChaseNavigation';

export const ChaseGraphId = {
  Starter: 'starter-chase',
  Park: 'park-chase',
  Central: 'central-chase',
  RichA: 'rich-a-chase',
  RichB: 'rich-b-chase',
  VipWest: 'vip-west-chase',
  VipEast: 'vip-east-chase',
  Dragon: 'dragon-chase',
} as const;

export type ChaseGraphId = (typeof ChaseGraphId)[keyof typeof ChaseGraphId];

export const ChaseEdgeConditionId = {
  ParkGateOpen: 'park-gate-open',
  CentralGateOpen: 'central-gate-open',
  RichGateOpen: 'rich-gate-open',
  VipGateOpen: 'vip-gate-open',
  DragonLeftOpen: 'dragon-left-open',
  DragonRightOpen: 'dragon-right-open',
} as const;

type NodeData = readonly [id: string, x: number, y: number, lane?: ChaseLane];
type EdgeData = readonly [from: string, to: string, conditionId?: string];

function defineGraph(
  id: ChaseGraphId,
  nodes: readonly NodeData[],
  edges: readonly EdgeData[],
): ChaseNavigationGraph {
  return {
    id,
    nodes: nodes.map(([nodeId, x, y, lane]) => ({ id: nodeId, x, y, ...(lane === undefined ? {} : { lane }) })),
    edges: edges.map(([from, to, conditionId]): ChaseNavigationEdge => ({
      from,
      to,
      ...(conditionId === undefined ? {} : { conditionId }),
    })),
  };
}

const BASE_ROUTE_NODES = [
  ['base-road', 900, 1760, 0],
  ['base-entry', 900, 1260, 0],
] as const satisfies readonly NodeData[];

const WORLD_TRANSIT_NODES = [
  ...BASE_ROUTE_NODES,
  ['hub-gate-west', 1570, 650, -1],
  ['hub-gate-east', 1770, 650, 1],
  ['hub-west-side', 1830, 840, -1],
  ['hub-south-west', 1810, 1320, -1],
  ['hub-south-east', 2420, 1400, 1],
  ['rich-gate-west', 2550, 1460, -1],
  ['rich-gate-east', 2760, 1460, 1],
  ['rich-north-road', 2940, 1430, -1],
  ['rich-east-road', 3440, 1400, 1],
  ['vip-gate-south', 3350, 930, 0],
  ['vip-gate-north', 3350, 770, 0],
] as const satisfies readonly NodeData[];

const WORLD_TRANSIT_EDGES = [
  ['base-entry', 'hub-gate-west'],
  ['hub-gate-west', 'hub-gate-east', ChaseEdgeConditionId.CentralGateOpen],
  ['hub-gate-east', 'hub-west-side'],
  ['hub-west-side', 'hub-south-west'],
  ['hub-south-west', 'hub-south-east'],
  ['hub-south-east', 'rich-gate-west'],
  ['rich-gate-west', 'rich-gate-east', ChaseEdgeConditionId.RichGateOpen],
  ['rich-gate-east', 'rich-north-road'],
  ['rich-north-road', 'rich-east-road'],
  ['rich-east-road', 'vip-gate-south'],
  ['vip-gate-south', 'vip-gate-north', ChaseEdgeConditionId.VipGateOpen],
] as const satisfies readonly EdgeData[];

export const CHASE_NAVIGATION_GRAPHS: Readonly<Record<ChaseGraphId, ChaseNavigationGraph>> = {
  [ChaseGraphId.Starter]: defineGraph(
    ChaseGraphId.Starter,
    [
      ...BASE_ROUTE_NODES,
      ['starter-south', 1380, 1785, 1],
      ['starter-east', 1905, 1650, 1],
      ['starter-north', 1880, 1190, -1],
      ['starter-west', 1200, 1120, -1],
    ],
    [
      ['base-road', 'base-entry'], ['base-road', 'starter-south'],
      ['starter-south', 'starter-east'], ['starter-east', 'starter-north'],
      ['starter-north', 'starter-west'], ['starter-west', 'base-entry'],
    ],
  ),
  [ChaseGraphId.Park]: defineGraph(
    ChaseGraphId.Park,
    [
      ...BASE_ROUTE_NODES,
      ['bridge-south', 900, 1160, 0], ['bridge-north', 900, 840, 0],
      ['pavilion-sw', 1050, 780, -1], ['pavilion-se', 1510, 790, 1],
      ['pavilion-ne', 1600, 330, 1], ['pavilion-nw', 1040, 330, -1],
      ['pavilion-west', 1010, 620, -1], ['pavilion-east', 1605, 620, 1],
    ],
    [
      ['base-entry', 'bridge-south'],
      ['bridge-south', 'bridge-north', ChaseEdgeConditionId.ParkGateOpen],
      ['bridge-north', 'pavilion-sw'], ['bridge-north', 'pavilion-se'],
      ['pavilion-sw', 'pavilion-west'], ['pavilion-west', 'pavilion-nw'],
      ['pavilion-nw', 'pavilion-ne'], ['pavilion-ne', 'pavilion-east'],
      ['pavilion-east', 'pavilion-se'], ['pavilion-west', 'pavilion-east'],
    ],
  ),
  [ChaseGraphId.Central]: defineGraph(
    ChaseGraphId.Central,
    [
      ...BASE_ROUTE_NODES,
      ['hub-gate-west', 1570, 650, -1], ['hub-gate-east', 1770, 650, 1],
      ['cafe-south', 2200, 660, -1], ['shop-west', 2310, 820, -1],
      ['shop-east', 2660, 840, 1], ['plaza-north', 2110, 840, -1],
      ['plaza-west', 1870, 1060, -1], ['plaza-east', 2350, 1060, 1],
      ['plaza-south', 2110, 1305, 1], ['fox-west', 2070, 1640, -1],
      ['fox-east', 2640, 1640, 1], ['fox-south', 2390, 1880, 0],
    ],
    [
      ['base-entry', 'hub-gate-west'], ['hub-gate-west', 'hub-gate-east', ChaseEdgeConditionId.CentralGateOpen],
      ['hub-gate-east', 'cafe-south'], ['cafe-south', 'plaza-north'],
      ['plaza-north', 'plaza-west'], ['plaza-north', 'plaza-east'],
      ['plaza-west', 'plaza-south'], ['plaza-east', 'plaza-south'],
      ['plaza-east', 'shop-west'], ['shop-west', 'shop-east'],
      ['plaza-south', 'fox-west'], ['plaza-south', 'fox-east'],
      ['fox-west', 'fox-south'], ['fox-east', 'fox-south'],
    ],
  ),
  [ChaseGraphId.RichA]: defineGraph(
    ChaseGraphId.RichA,
    [
      ...WORLD_TRANSIT_NODES,
      ['estate-a-sw', 2760, 1395, -1], ['estate-a-se', 3440, 1400, 1],
      ['estate-a-east', 3450, 1120, 1], ['estate-a-ne', 3425, 885, 1],
      ['estate-a-nw', 2745, 885, -1], ['estate-a-west', 2740, 1120, -1],
      ['fountain-west', 2990, 1260, -1], ['fountain-east', 3190, 1260, 1],
    ],
    [
      ...WORLD_TRANSIT_EDGES,
      ['rich-gate-east', 'estate-a-sw'], ['estate-a-sw', 'estate-a-west'],
      ['estate-a-west', 'estate-a-nw'], ['estate-a-nw', 'estate-a-ne'],
      ['estate-a-ne', 'estate-a-east'], ['estate-a-east', 'estate-a-se'],
      ['estate-a-se', 'rich-gate-east'], ['estate-a-sw', 'fountain-west'],
      ['fountain-west', 'fountain-east'], ['fountain-east', 'estate-a-se'],
    ],
  ),
  [ChaseGraphId.RichB]: defineGraph(
    ChaseGraphId.RichB,
    [
      ...WORLD_TRANSIT_NODES,
      ['estate-b-nw', 3040, 1590, -1], ['estate-b-ne', 3830, 1590, 1],
      ['estate-b-east', 3840, 2110, 1], ['estate-b-se', 3790, 2510, 1],
      ['estate-b-sw', 3030, 2510, -1], ['estate-b-west', 3020, 2100, -1],
      ['pool-north', 3255, 1800, -1], ['pool-east', 3415, 1905, 1],
      ['pool-south', 3255, 2025, -1], ['booth-east', 3290, 2200, 1],
    ],
    [
      ...WORLD_TRANSIT_EDGES,
      ['rich-gate-east', 'estate-b-nw'], ['estate-b-nw', 'estate-b-ne'],
      ['estate-b-ne', 'estate-b-east'], ['estate-b-east', 'estate-b-se'],
      ['estate-b-se', 'estate-b-sw'], ['estate-b-sw', 'estate-b-west'],
      ['estate-b-west', 'estate-b-nw'], ['estate-b-nw', 'pool-north'],
      ['pool-north', 'pool-east'], ['pool-east', 'pool-south'],
      ['pool-south', 'estate-b-west'], ['pool-south', 'booth-east'], ['booth-east', 'estate-b-se'],
    ],
  ),
  [ChaseGraphId.VipWest]: defineGraph(
    ChaseGraphId.VipWest,
    [
      ...WORLD_TRANSIT_NODES,
      ['west-exit', 3190, 700, 1], ['west-south', 2780, 760, -1],
      ['west-west', 2680, 555, -1], ['west-north', 2750, 330, -1],
      ['west-east', 3150, 555, 1], ['west-fountain-n', 2980, 570, 1],
      ['west-fountain-s', 2980, 745, -1],
    ],
    [
      ...WORLD_TRANSIT_EDGES,
      ['vip-gate-north', 'west-exit'], ['west-exit', 'west-south'],
      ['west-south', 'west-west'], ['west-west', 'west-north'],
      ['west-north', 'west-east'], ['west-east', 'west-exit'],
      ['west-south', 'west-fountain-s'], ['west-fountain-s', 'west-fountain-n'], ['west-fountain-n', 'west-east'],
    ],
  ),
  [ChaseGraphId.VipEast]: defineGraph(
    ChaseGraphId.VipEast,
    [
      ...WORLD_TRANSIT_NODES,
      ['east-exit', 3510, 700, -1], ['east-south', 3790, 760, 1],
      ['east-east', 3890, 555, 1], ['east-north', 3890, 220, 1],
      ['tower-west', 3620, 330, -1], ['tower-south', 3735, 460, -1],
    ],
    [
      ...WORLD_TRANSIT_EDGES,
      ['vip-gate-north', 'east-exit'], ['east-exit', 'east-south'],
      ['east-south', 'east-east'], ['east-east', 'east-north'],
      ['east-north', 'tower-west'], ['tower-west', 'tower-south'],
      ['tower-south', 'east-south'], ['tower-west', 'east-exit'],
    ],
  ),
  [ChaseGraphId.Dragon]: defineGraph(
    ChaseGraphId.Dragon,
    [
      ...WORLD_TRANSIT_NODES,
      ['court-left-out', 3190, 470, -1], ['court-right-out', 3480, 470, 1],
      ['court-left-in', 3190, 360, -1], ['court-right-in', 3480, 360, 1],
      ['court-nw', 3100, 110, -1], ['court-ne', 3580, 110, 1],
      ['court-center-west', 3240, 250, -1], ['court-center-east', 3440, 250, 1],
    ],
    [
      ...WORLD_TRANSIT_EDGES,
      ['vip-gate-north', 'court-left-out'], ['vip-gate-north', 'court-right-out'],
      ['court-left-out', 'court-left-in', ChaseEdgeConditionId.DragonLeftOpen],
      ['court-right-out', 'court-right-in', ChaseEdgeConditionId.DragonRightOpen],
      ['court-left-in', 'court-nw'], ['court-right-in', 'court-ne'],
      ['court-nw', 'court-center-west'], ['court-center-west', 'court-center-east'],
      ['court-center-east', 'court-ne'], ['court-left-in', 'court-center-west'],
      ['court-right-in', 'court-center-east'],
    ],
  ),
};
