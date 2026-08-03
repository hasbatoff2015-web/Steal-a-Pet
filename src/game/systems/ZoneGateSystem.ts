import type { Player } from '../entities/Player';
import { areZoneGatePrerequisitesMet } from '../data/zones';
import type { ZoneGate } from '../world/ZoneGate';
import type { EconomySystem } from './EconomySystem';
import type { ProgressionSystem } from './ProgressionSystem';
import type { UpgradeSystem } from './UpgradeSystem';

export enum GateUnlockResult {
  Unlocked = 'UNLOCKED',
  InsufficientFunds = 'INSUFFICIENT_FUNDS',
  PrerequisitesNotMet = 'PREREQUISITES_NOT_MET',
  AlreadyUnlocked = 'ALREADY_UNLOCKED',
}

export class ZoneGateSystem {
  public constructor(
    private readonly gates: readonly ZoneGate[],
    private readonly economy: EconomySystem,
    private readonly progression: ProgressionSystem,
    private readonly upgrades: UpgradeSystem,
  ) {}

  public findNearbyLockedGate(player: Player): ZoneGate | null {
    this.refreshPrerequisiteStates();
    return (
      this.gates.find(
        (gate) =>
          !gate.isUnlocked() &&
          this.arePrerequisitesMet(gate) &&
          gate.isPlayerNearby(player),
      ) ?? null
    );
  }

  public tryUnlock(gate: ZoneGate): GateUnlockResult {
    if (gate.isUnlocked()) {
      return GateUnlockResult.AlreadyUnlocked;
    }
    if (!this.arePrerequisitesMet(gate)) {
      return GateUnlockResult.PrerequisitesNotMet;
    }

    if (!this.economy.spend(gate.definition.cost)) {
      return GateUnlockResult.InsufficientFunds;
    }

    gate.unlock(true);
    this.progression.unlockZone(gate.definition.zoneId, this.economy.getMoney());
    return GateUnlockResult.Unlocked;
  }

  public refreshPrerequisiteStates(): void {
    for (const gate of this.gates) {
      gate.setPrerequisitesMet(this.arePrerequisitesMet(gate));
    }
  }

  private arePrerequisitesMet(gate: ZoneGate): boolean {
    return areZoneGatePrerequisitesMet(gate.definition, {
      isPetDelivered: (petId) => this.progression.isPetDelivered(petId),
      isUpgradePurchased: (upgradeId) => this.upgrades.isPurchased(upgradeId as import('../data/upgrades').UpgradeId),
      isZoneUnlocked: (zoneId) => this.progression.isZoneUnlocked(zoneId as import('../data/zones').ZoneId),
      getRoamingPetCount: () => this.progression.getRoamingPetCount(),
    });
  }
}
