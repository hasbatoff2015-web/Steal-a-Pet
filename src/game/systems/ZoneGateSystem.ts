import type { Player } from '../entities/Player';
import type { ZoneGate } from '../world/ZoneGate';
import type { EconomySystem } from './EconomySystem';
import type { ProgressionSystem } from './ProgressionSystem';

export enum GateUnlockResult {
  Unlocked = 'UNLOCKED',
  InsufficientFunds = 'INSUFFICIENT_FUNDS',
  AlreadyUnlocked = 'ALREADY_UNLOCKED',
}

export class ZoneGateSystem {
  public constructor(
    private readonly gates: readonly ZoneGate[],
    private readonly economy: EconomySystem,
    private readonly progression: ProgressionSystem,
  ) {}

  public findNearbyLockedGate(player: Player): ZoneGate | null {
    return (
      this.gates.find(
        (gate) => !gate.isUnlocked() && gate.isPlayerNearby(player),
      ) ?? null
    );
  }

  public tryUnlock(gate: ZoneGate): GateUnlockResult {
    if (gate.isUnlocked()) {
      return GateUnlockResult.AlreadyUnlocked;
    }

    if (!this.economy.spend(gate.definition.cost)) {
      return GateUnlockResult.InsufficientFunds;
    }

    gate.unlock(true);
    this.progression.unlockZone(gate.definition.zoneId, this.economy.getMoney());
    return GateUnlockResult.Unlocked;
  }
}
