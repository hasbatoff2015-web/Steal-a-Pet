import Phaser from 'phaser';

import { CHASE_CONFIG } from '../config/gameplay';
import { OwnerNpc, OwnerState } from '../entities/OwnerNpc';
import { Player } from '../entities/Player';

export class ChaseSystem {
  public constructor(private readonly owner: OwnerNpc) {}

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
      CHASE_CONFIG.catchDistance
    );
  }

  public isOwnerReady(): boolean {
    return this.owner.getState() === OwnerState.Idle;
  }

  public getState(): OwnerState {
    return this.owner.getState();
  }
}
