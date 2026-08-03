export type ChaseLane = -1 | 0 | 1;

export interface NavigationPoint {
  readonly x: number;
  readonly y: number;
}

export interface ChaseNavigationNode extends NavigationPoint {
  readonly id: string;
  readonly lane?: ChaseLane;
}

export interface ChaseNavigationEdge {
  readonly from: string;
  readonly to: string;
  readonly conditionId?: string;
}

export interface ChaseNavigationGraph {
  readonly id: string;
  readonly nodes: readonly ChaseNavigationNode[];
  readonly edges: readonly ChaseNavigationEdge[];
}

export interface NavigationBlocker {
  readonly id: string;
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly isActive?: () => boolean;
}

export interface FindPathOptions {
  readonly isConditionOpen?: (conditionId: string) => boolean;
  readonly isSegmentClear?: (from: NavigationPoint, to: NavigationPoint) => boolean;
  readonly laneBias?: ChaseLane;
}

const EPSILON = 0.0001;

export function hasLineOfSight(
  from: NavigationPoint,
  to: NavigationPoint,
  blockers: readonly NavigationBlocker[],
  padding = 18,
): boolean {
  for (const blocker of blockers) {
    if (blocker.isActive?.() === false) continue;
    if (segmentIntersectsRectangle(from, to, blocker, padding)) return false;
  }
  return true;
}

export function segmentIntersectsRectangle(
  from: NavigationPoint,
  to: NavigationPoint,
  rectangle: Pick<NavigationBlocker, 'minX' | 'minY' | 'maxX' | 'maxY'>,
  padding = 0,
): boolean {
  const minX = rectangle.minX - padding;
  const minY = rectangle.minY - padding;
  const maxX = rectangle.maxX + padding;
  const maxY = rectangle.maxY + padding;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  let near = 0;
  let far = 1;

  const clips = [
    [-dx, from.x - minX],
    [dx, maxX - from.x],
    [-dy, from.y - minY],
    [dy, maxY - from.y],
  ] as const;
  for (const [direction, distance] of clips) {
    if (Math.abs(direction) < EPSILON) {
      if (distance < 0) return false;
      continue;
    }
    const ratio = distance / direction;
    if (direction < 0) near = Math.max(near, ratio);
    else far = Math.min(far, ratio);
    if (near > far) return false;
  }
  return near <= far && far >= 0 && near <= 1;
}

export class CompiledChaseGraph {
  private readonly nodesById = new Map<string, ChaseNavigationNode>();
  private readonly connections = new Map<string, ChaseNavigationEdge[]>();

  public constructor(public readonly definition: ChaseNavigationGraph) {
    for (const node of definition.nodes) {
      this.nodesById.set(node.id, node);
      this.connections.set(node.id, []);
    }
    for (const edge of definition.edges) {
      if (!this.nodesById.has(edge.from) || !this.nodesById.has(edge.to)) {
        throw new Error(`Navigation graph ${definition.id} has an invalid edge ${edge.from} -> ${edge.to}.`);
      }
      this.connections.get(edge.from)?.push(edge);
      this.connections.get(edge.to)?.push({ ...edge, from: edge.to, to: edge.from });
    }
  }

  public getNode(id: string): ChaseNavigationNode | undefined {
    return this.nodesById.get(id);
  }

  public findClosestNode(
    point: NavigationPoint,
    isVisible?: (node: ChaseNavigationNode) => boolean,
    excludedIds: ReadonlySet<string> = EMPTY_IDS,
  ): ChaseNavigationNode | null {
    let best: ChaseNavigationNode | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const node of this.definition.nodes) {
      if (excludedIds.has(node.id) || (isVisible !== undefined && !isVisible(node))) continue;
      const distance = distanceSquared(point, node);
      if (distance < bestDistance) {
        best = node;
        bestDistance = distance;
      }
    }
    return best;
  }

  public findPath(startId: string, goalId: string, options: FindPathOptions = {}): readonly string[] {
    if (startId === goalId) return [startId];
    const start = this.nodesById.get(startId);
    const goal = this.nodesById.get(goalId);
    if (start === undefined || goal === undefined) return [];

    const open = new Set<string>([startId]);
    const cameFrom = new Map<string, string>();
    const costs = new Map<string, number>([[startId, 0]]);
    const estimates = new Map<string, number>([[startId, distance(start, goal)]]);

    while (open.size > 0) {
      let currentId: string | null = null;
      let currentEstimate = Number.POSITIVE_INFINITY;
      for (const candidateId of open) {
        const estimate = estimates.get(candidateId) ?? Number.POSITIVE_INFINITY;
        if (estimate < currentEstimate) {
          currentId = candidateId;
          currentEstimate = estimate;
        }
      }
      if (currentId === null) break;
      if (currentId === goalId) return reconstructPath(cameFrom, currentId);
      open.delete(currentId);

      const current = this.nodesById.get(currentId);
      if (current === undefined) continue;
      for (const edge of this.connections.get(currentId) ?? EMPTY_EDGES) {
        if (edge.conditionId !== undefined && options.isConditionOpen?.(edge.conditionId) !== true) continue;
        const neighbor = this.nodesById.get(edge.to);
        if (neighbor === undefined || options.isSegmentClear?.(current, neighbor) === false) continue;
        const laneAdjustment = getLaneAdjustment(neighbor.lane, options.laneBias);
        const candidateCost = (costs.get(currentId) ?? 0) + distance(current, neighbor) + laneAdjustment;
        if (candidateCost >= (costs.get(neighbor.id) ?? Number.POSITIVE_INFINITY)) continue;
        cameFrom.set(neighbor.id, currentId);
        costs.set(neighbor.id, candidateCost);
        estimates.set(neighbor.id, candidateCost + distance(neighbor, goal));
        open.add(neighbor.id);
      }
    }
    return [];
  }
}

export function smoothPath(
  path: readonly string[],
  graph: CompiledChaseGraph,
  from: NavigationPoint,
  isSegmentClear: (from: NavigationPoint, to: NavigationPoint) => boolean,
): readonly string[] {
  if (path.length < 2) return path;
  let farthestVisible = 0;
  for (let index = path.length - 1; index >= 0; index -= 1) {
    const id = path[index];
    const node = id === undefined ? undefined : graph.getNode(id);
    if (node !== undefined && isSegmentClear(from, node)) {
      farthestVisible = index;
      break;
    }
  }
  return path.slice(farthestVisible);
}

function reconstructPath(cameFrom: ReadonlyMap<string, string>, currentId: string): readonly string[] {
  const path = [currentId];
  let cursor = currentId;
  while (cameFrom.has(cursor)) {
    cursor = cameFrom.get(cursor) ?? cursor;
    path.push(cursor);
  }
  path.reverse();
  return path;
}

function getLaneAdjustment(nodeLane: ChaseLane | undefined, preferredLane: ChaseLane | undefined): number {
  if (preferredLane === undefined || preferredLane === 0 || nodeLane === undefined) return 0;
  return nodeLane === preferredLane ? -12 : nodeLane === -preferredLane ? 12 : 0;
}

function distanceSquared(a: NavigationPoint, b: NavigationPoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function distance(a: NavigationPoint, b: NavigationPoint): number {
  return Math.sqrt(distanceSquared(a, b));
}

const EMPTY_IDS: ReadonlySet<string> = new Set<string>();
const EMPTY_EDGES: readonly ChaseNavigationEdge[] = [];
