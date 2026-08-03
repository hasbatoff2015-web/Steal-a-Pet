import { describe, expect, it } from 'vitest';

import {
  CompiledChaseGraph,
  hasLineOfSight,
  smoothPath,
  type ChaseNavigationGraph,
  type NavigationBlocker,
} from '../src/game/systems/ChaseNavigation';

const blocker: NavigationBlocker = {
  id: 'wall', minX: 40, minY: -20, maxX: 60, maxY: 20,
};

describe('chase navigation', () => {
  it('A* routes around a blocker', () => {
    const graph = compile(
      [['start', 0, 0], ['top', 50, -50], ['bottom', 50, 50], ['goal', 100, 0]],
      [['start', 'goal'], ['start', 'top'], ['top', 'goal'], ['start', 'bottom'], ['bottom', 'goal']],
    );
    expect(find(graph, 'start', 'goal', [blocker])).toEqual(['start', 'top', 'goal']);
  });

  it('chooses the shorter available route', () => {
    const graph = compile(
      [['start', 0, 0], ['short', 50, 20], ['long-a', 0, 100], ['long-b', 100, 100], ['goal', 100, 0]],
      [['start', 'short'], ['short', 'goal'], ['start', 'long-a'], ['long-a', 'long-b'], ['long-b', 'goal']],
    );
    expect(graph.findPath('start', 'goal')).toEqual(['start', 'short', 'goal']);
  });

  it('excludes an edge behind a closed gate', () => {
    const graph = compile(
      [['start', 0, 0], ['goal', 100, 0]],
      [['start', 'goal', 'park-open']],
    );
    expect(graph.findPath('start', 'goal', { isConditionOpen: () => false })).toEqual([]);
  });

  it('uses a conditional edge after its gate opens', () => {
    const graph = compile(
      [['start', 0, 0], ['goal', 100, 0]],
      [['start', 'goal', 'park-open']],
    );
    expect(graph.findPath('start', 'goal', { isConditionOpen: (id) => id === 'park-open' }))
      .toEqual(['start', 'goal']);
  });

  it('returns no path for an isolated area', () => {
    const graph = compile(
      [['start', 0, 0], ['island', 50, 50], ['goal', 100, 0]],
      [['start', 'island']],
    );
    expect(graph.findPath('start', 'goal')).toEqual([]);
  });

  it('smooths redundant nodes when a farther node is visible', () => {
    const graph = compile(
      [['start', 0, 0], ['middle', 50, 0], ['goal', 100, 0]],
      [['start', 'middle'], ['middle', 'goal']],
    );
    expect(smoothPath(['start', 'middle', 'goal'], graph, { x: -10, y: 0 }, () => true))
      .toEqual(['goal']);
  });

  it('lane bias selects an alternative equal route', () => {
    const graph = compile(
      [['start', 0, 0], ['left', 50, -30, -1], ['right', 50, 30, 1], ['goal', 100, 0]],
      [['start', 'left'], ['left', 'goal'], ['start', 'right'], ['right', 'goal']],
    );
    expect(graph.findPath('start', 'goal', { laneBias: 1 })).toEqual(['start', 'right', 'goal']);
    expect(graph.findPath('start', 'goal', { laneBias: -1 })).toEqual(['start', 'left', 'goal']);
  });

  it('selects a new target node after the player changes side', () => {
    const graph = compile(
      [['start', 0, 0], ['west', 50, 0], ['east', 150, 0]],
      [['start', 'west'], ['west', 'east']],
    );
    const firstGoal = graph.findClosestNode({ x: 55, y: 0 });
    const movedGoal = graph.findClosestNode({ x: 145, y: 0 });
    expect(firstGoal?.id).toBe('west');
    expect(movedGoal?.id).toBe('east');
    expect(graph.findPath('start', movedGoal?.id ?? '')).toEqual(['start', 'west', 'east']);
  });
});

function compile(
  nodes: readonly (readonly [string, number, number, (-1 | 0 | 1)?])[],
  edges: readonly (readonly [string, string, string?])[],
): CompiledChaseGraph {
  const definition: ChaseNavigationGraph = {
    id: 'test',
    nodes: nodes.map(([id, x, y, lane]) => ({ id, x, y, ...(lane === undefined ? {} : { lane }) })),
    edges: edges.map(([from, to, conditionId]) => ({ from, to, ...(conditionId === undefined ? {} : { conditionId }) })),
  };
  return new CompiledChaseGraph(definition);
}

function find(
  graph: CompiledChaseGraph,
  start: string,
  goal: string,
  blockers: readonly NavigationBlocker[],
): readonly string[] {
  return graph.findPath(start, goal, {
    isSegmentClear: (from, to) => hasLineOfSight(from, to, blockers, 0),
  });
}
