import Phaser from 'phaser';

import type { ChaseParameters } from '../data/encounters';
import type { ChaseNavigationGraph } from './ChaseNavigation';
import { OwnerNpc, OwnerState } from '../entities/OwnerNpc';
import { Player } from '../entities/Player';
import {
  PursuerNavigation,
  type PursuerNavigationContext,
  type PursuerNavigationDebugState,
} from './PursuerNavigation';
import type { ChaseLane } from './ChaseNavigation';

export class ChaseSystem {
  private readonly navigation: PursuerNavigation;

  public constructor(
    private readonly owner: OwnerNpc,
    private readonly parameters: ChaseParameters,
    navigationGraph: ChaseNavigationGraph,
    navigationContext: PursuerNavigationContext,
    navigationBias: ChaseLane = 0,
  ) {
    this.navigation = new PursuerNavigation(
      navigationGraph,
      navigationContext,
      navigationBias,
    );
  }

  public start(): void {
    this.owner.startChase();
    this.navigation.start(this.owner);
  }

  public stop(): void {
    this.navigation.stop();
    this.owner.returnHome();
  }

  public update(time: number, player: Player): void {
    const target = this.owner.getState() === OwnerState.Chasing
      ? this.navigation.update(time, this.owner, player)
      : player;
    this.owner.updateNpc(target);
  }

  public hasCaught(player: Player): boolean {
    if (this.owner.getState() !== OwnerState.Chasing) {
      return false;
    }

    return (
      Phaser.Math.Distance.Between(this.owner.x, this.owner.y, player.x, player.y) <=
      this.parameters.catchDistance
    );
  }

  public isOwnerReady(): boolean {
    return this.owner.getState() === OwnerState.Idle;
  }

  public getState(): OwnerState {
    return this.owner.getState();
  }

  public shiftTiming(deltaMs: number): void {
    this.navigation.shiftTiming(deltaMs);
  }

  public getNavigationDebugState(): PursuerNavigationDebugState {
    return this.navigation.getDebugState();
  }
}
