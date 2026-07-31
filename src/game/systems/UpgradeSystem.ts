import {
  getUpgradeDefinition,
  UpgradeEffectId,
  type UpgradeId,
} from '../data/upgrades';
import type { EconomySystem } from './EconomySystem';

export enum UpgradePurchaseResult {
  Purchased = 'PURCHASED',
  InsufficientFunds = 'INSUFFICIENT_FUNDS',
  AlreadyPurchased = 'ALREADY_PURCHASED',
}

export interface UpgradeEffectTarget {
  setDashCooldownMs(cooldownMs: number): void;
}

export class UpgradeSystem {
  private readonly purchasedUpgradeIds = new Set<UpgradeId>();
  private effectTarget: UpgradeEffectTarget | null = null;

  public constructor(
    private readonly economy: EconomySystem,
    purchasedUpgradeIds: readonly UpgradeId[] = [],
  ) {
    for (const upgradeId of purchasedUpgradeIds) {
      this.purchasedUpgradeIds.add(upgradeId);
    }
  }

  public connectEffectTarget(target: UpgradeEffectTarget): void {
    this.effectTarget = target;
    for (const upgradeId of this.purchasedUpgradeIds) {
      this.applyEffect(upgradeId);
    }
  }

  public tryPurchase(upgradeId: UpgradeId): UpgradePurchaseResult {
    if (this.isPurchased(upgradeId)) {
      return UpgradePurchaseResult.AlreadyPurchased;
    }

    const definition = getUpgradeDefinition(upgradeId);
    if (!this.economy.spend(definition.cost)) {
      return UpgradePurchaseResult.InsufficientFunds;
    }

    this.purchasedUpgradeIds.add(upgradeId);
    this.applyEffect(upgradeId);
    return UpgradePurchaseResult.Purchased;
  }

  public isPurchased(upgradeId: UpgradeId): boolean {
    return this.purchasedUpgradeIds.has(upgradeId);
  }

  public getPurchasedUpgradeIds(): readonly UpgradeId[] {
    return [...this.purchasedUpgradeIds];
  }

  private applyEffect(upgradeId: UpgradeId): void {
    if (this.effectTarget === null) {
      return;
    }

    const definition = getUpgradeDefinition(upgradeId);
    switch (definition.effectId) {
      case UpgradeEffectId.DashCooldownMs:
        this.effectTarget.setDashCooldownMs(definition.effectValue);
        break;
    }
  }
}
