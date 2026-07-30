import Phaser from 'phaser';

import type { ChaseParameters } from '../data/encounters';
import { OwnerNpc, OwnerState } from '../entities/OwnerNpc';
import { Player } from '../entities/Player';

export class ChaseSystem {
  public constructor(
    private readonly owner: OwnerNpc,
    private readonly parameters: ChaseParameters,
  ) {}

  public start(): void {
    this.owner.startChase();
  }

  public stop(): void {
    this.owner.returnHome();
  }

  public update(player: Player): void {
    this.owner.updateNpc(player);
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
}
