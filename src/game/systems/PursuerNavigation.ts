import type { Player } from '../entities/Player';
import type { OwnerNpc } from '../entities/OwnerNpc';
import {
  CompiledChaseGraph,
  hasLineOfSight,
  smoothPath,
  type ChaseLane,
  type ChaseNavigationGraph,
  type NavigationBlocker,
  type NavigationPoint,
} from './ChaseNavigation';

const LOS_INTERVAL_MS = 110;
const REPATH_INTERVAL_MS = 220;
const NODE_REACHED_DISTANCE_SQ = 34 * 34;
const STUCK_SAMPLE_INTERVAL_MS = 250;
const STUCK_REPATH_MS = 750;
const STUCK_ALTERNATIVE_MS = 1500;
const STUCK_RESET_MS = 3000;
const STUCK_MOVEMENT_DISTANCE_SQ = 4 * 4;
const STUCK_PROGRESS_DISTANCE = 3;
const SAFE_RESET_PLAYER_DISTANCE_SQ = 460 * 460;

export type ChaseNavigationMode = 'DIRECT' | 'PATH';

export interface PursuerNavigationContext {
  readonly blockers: readonly NavigationBlocker[];
  readonly isConditionOpen: (conditionId: string) => boolean;
}

export interface PursuerNavigationDebugState {
  readonly mode: ChaseNavigationMode;
  readonly graphId: string;
  readonly currentNodeId: string;
  readonly remainingPathLength: number;
  readonly lineOfSight: boolean;
  readonly nextRepathAt: number;
  readonly stuckDurationMs: number;
}

export class PursuerNavigation {
  private readonly graph: CompiledChaseGraph;
  private readonly target: { x: number; y: number } = { x: 0, y: 0 };
  private mode: ChaseNavigationMode = 'DIRECT';
  private path: readonly string[] = [];
  private pathIndex = 0;
  private lineOfSight = true;
  private nextLineOfSightAt = 0;
  private nextRepathAt = 0;
  private lastSampleAt = 0;
  private lastSampleX = 0;
  private lastSampleY = 0;
  private lastTargetDistance = Number.POSITIVE_INFINITY;
  private stuckDurationMs = 0;
  private excludedStartNodeId: string | null = null;

  public constructor(
    graph: ChaseNavigationGraph,
    private readonly context: PursuerNavigationContext,
    private readonly laneBias: ChaseLane = 0,
  ) {
    this.graph = new CompiledChaseGraph(graph);
  }

  public start(owner: OwnerNpc): void {
    this.mode = 'DIRECT';
    this.path = [];
    this.pathIndex = 0;
    this.lineOfSight = true;
    this.nextLineOfSightAt = 0;
    this.nextRepathAt = 0;
    this.lastSampleAt = owner.scene.time.now;
    this.lastSampleX = owner.x;
    this.lastSampleY = owner.y;
    this.lastTargetDistance = Number.POSITIVE_INFINITY;
    this.stuckDurationMs = 0;
    this.excludedStartNodeId = null;
  }

  public stop(): void {
    this.path = [];
    this.pathIndex = 0;
    this.stuckDurationMs = 0;
  }

  public shiftTiming(deltaMs: number): void {
    if (deltaMs <= 0) return;
    this.nextLineOfSightAt += deltaMs;
    this.nextRepathAt += deltaMs;
    this.lastSampleAt += deltaMs;
  }

  public update(time: number, owner: OwnerNpc, player: Player): NavigationPoint {
    if (time >= this.nextLineOfSightAt) {
      this.nextLineOfSightAt = time + LOS_INTERVAL_MS;
      this.lineOfSight = this.canSee(owner, player);
      if (this.lineOfSight) {
        this.mode = 'DIRECT';
        this.path = [];
        this.pathIndex = 0;
      }
    }

    if (this.lineOfSight) {
      this.target.x = player.x;
      this.target.y = player.y;
    } else {
      this.mode = 'PATH';
      if (time >= this.nextRepathAt || this.pathIndex >= this.path.length) {
        this.repath(time, owner, player);
      }
      this.updatePathTarget(owner, player);
    }

    this.updateStuckState(time, owner, player);
    return this.target;
  }

  public getDebugState(): PursuerNavigationDebugState {
    return {
      mode: this.mode,
      graphId: this.graph.definition.id,
      currentNodeId: this.path[this.pathIndex] ?? '-',
      remainingPathLength: Math.max(0, this.path.length - this.pathIndex),
      lineOfSight: this.lineOfSight,
      nextRepathAt: this.nextRepathAt,
      stuckDurationMs: this.stuckDurationMs,
    };
  }

  private repath(time: number, owner: OwnerNpc, player: Player): void {
    this.nextRepathAt = time + REPATH_INTERVAL_MS;
    const excluded = this.excludedStartNodeId === null
      ? EMPTY_NODE_IDS
      : new Set<string>([this.excludedStartNodeId]);
    const start = this.graph.findClosestNode(
      owner,
      (node) => this.canSee(owner, node),
      excluded,
    ) ?? this.graph.findClosestNode(owner, undefined, excluded);
    const goal = this.graph.findClosestNode(
      player,
      (node) => this.canSee(node, player),
    ) ?? this.graph.findClosestNode(player);
    this.excludedStartNodeId = null;
    if (start === null || goal === null) {
      this.path = [];
      this.pathIndex = 0;
      return;
    }
    const path = this.graph.findPath(start.id, goal.id, {
      laneBias: this.laneBias,
      isConditionOpen: this.context.isConditionOpen,
    });
    this.path = smoothPath(path, this.graph, owner, (from, to) => this.canSee(from, to));
    this.pathIndex = 0;
  }

  private updatePathTarget(owner: OwnerNpc, player: Player): void {
    while (this.pathIndex < this.path.length) {
      const nodeId = this.path[this.pathIndex];
      const node = nodeId === undefined ? undefined : this.graph.getNode(nodeId);
      if (node === undefined) {
        this.pathIndex += 1;
        continue;
      }
      const dx = node.x - owner.x;
      const dy = node.y - owner.y;
      if (dx * dx + dy * dy <= NODE_REACHED_DISTANCE_SQ) {
        this.pathIndex += 1;
        continue;
      }
      this.target.x = node.x;
      this.target.y = node.y;
      return;
    }
    this.target.x = player.x;
    this.target.y = player.y;
  }

  private updateStuckState(time: number, owner: OwnerNpc, player: Player): void {
    if (time < this.lastSampleAt + STUCK_SAMPLE_INTERVAL_MS) return;
    const elapsed = time - this.lastSampleAt;
    const movedX = owner.x - this.lastSampleX;
    const movedY = owner.y - this.lastSampleY;
    const targetDistance = distance(owner, this.target);
    const madeProgress = targetDistance <= this.lastTargetDistance - STUCK_PROGRESS_DISTANCE;
    if (movedX * movedX + movedY * movedY <= STUCK_MOVEMENT_DISTANCE_SQ && !madeProgress) {
      this.stuckDurationMs += elapsed;
    } else {
      this.stuckDurationMs = 0;
    }
    this.lastSampleAt = time;
    this.lastSampleX = owner.x;
    this.lastSampleY = owner.y;
    this.lastTargetDistance = targetDistance;

    if (this.stuckDurationMs >= STUCK_RESET_MS) {
      this.resetToSafeNode(owner, player);
      return;
    }
    if (this.stuckDurationMs >= STUCK_ALTERNATIVE_MS) {
      this.excludedStartNodeId = this.path[this.pathIndex] ?? null;
      this.nextRepathAt = 0;
      return;
    }
    if (this.stuckDurationMs >= STUCK_REPATH_MS) this.nextRepathAt = 0;
  }

  private resetToSafeNode(owner: OwnerNpc, player: Player): void {
    const safe = this.graph.findClosestNode(owner, (node) => {
      const dx = node.x - player.x;
      const dy = node.y - player.y;
      return dx * dx + dy * dy >= SAFE_RESET_PLAYER_DISTANCE_SQ && this.canSee(owner, node);
    });
    if (safe !== null) owner.setPosition(safe.x, safe.y);
    this.stuckDurationMs = 0;
    this.nextRepathAt = 0;
    this.lastSampleX = owner.x;
    this.lastSampleY = owner.y;
  }

  private canSee(from: NavigationPoint, to: NavigationPoint): boolean {
    return hasLineOfSight(from, to, this.context.blockers);
  }
}

function distance(a: NavigationPoint, b: NavigationPoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

const EMPTY_NODE_IDS: ReadonlySet<string> = new Set<string>();
