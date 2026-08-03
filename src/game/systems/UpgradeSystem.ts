import type { PetId } from '../data/pets';
import {
  areUpgradePrerequisitesMet,
  getUpgradeDefinition,
  UPGRADE_DEFINITIONS,
  UpgradeEffectId,
  type UpgradeDefinition,
  type UpgradeId,
} from '../data/upgrades';
import type { EconomySystem } from './EconomySystem';

export enum UpgradePurchaseResult {
  Purchased = 'PURCHASED',
  InsufficientFunds = 'INSUFFICIENT_FUNDS',
  PrerequisitesNotMet = 'PREREQUISITES_NOT_MET',
  AlreadyPurchased = 'ALREADY_PURCHASED',
}

export enum UpgradeStationStateKind {
  Locked = 'LOCKED',
  Available = 'AVAILABLE',
  Complete = 'COMPLETE',
}

export type UpgradeStationState =
  | {
      readonly kind: UpgradeStationStateKind.Locked;
      readonly label: string;
    }
  | {
      readonly kind: UpgradeStationStateKind.Available;
      readonly definition: UpgradeDefinition;
    }
  | {
      readonly kind: UpgradeStationStateKind.Complete;
    };

export interface UpgradeEffectTarget {
  setDashCooldownMs(cooldownMs: number): void;
  setMaxDashCharges(maxCharges: number): void;
}

export interface UpgradePrerequisiteContext {
  isPetDelivered(petId: PetId): boolean;
}

export class UpgradeSystem {
  private readonly purchasedUpgradeIds = new Set<UpgradeId>();
  private effectTarget: UpgradeEffectTarget | null = null;
  private prerequisiteContext: UpgradePrerequisiteContext | null = null;

  public constructor(
    private readonly economy: EconomySystem,
    purchasedUpgradeIds: readonly UpgradeId[] = [],
  ) {
    for (const upgradeId of purchasedUpgradeIds) {
      this.purchasedUpgradeIds.add(upgradeId);
    }
  }

  public connectPrerequisiteContext(context: UpgradePrerequisiteContext): void {
    this.prerequisiteContext = context;
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
    if (!this.arePrerequisitesMet(upgradeId)) {
      return UpgradePurchaseResult.PrerequisitesNotMet;
    }

    const definition = getUpgradeDefinition(upgradeId);
    if (!this.economy.spend(definition.cost)) {
      return UpgradePurchaseResult.InsufficientFunds;
    }

    this.purchasedUpgradeIds.add(upgradeId);
    this.applyEffect(upgradeId);
    return UpgradePurchaseResult.Purchased;
  }

  public arePrerequisitesMet(upgradeId: UpgradeId): boolean {
    const context = this.prerequisiteContext;
    if (context === null) {
      return false;
    }

    return areUpgradePrerequisitesMet(getUpgradeDefinition(upgradeId), {
      isPetDelivered: (petId) => context.isPetDelivered(petId),
      isUpgradePurchased: (candidateId) =>
        this.purchasedUpgradeIds.has(candidateId as UpgradeId),
    });
  }

  public getStationState(): UpgradeStationState {
    const nextUpgrade = Object.values(UPGRADE_DEFINITIONS).find(
      (definition) => !this.isPurchased(definition.id),
    );
    if (nextUpgrade === undefined) {
      return { kind: UpgradeStationStateKind.Complete };
    }
    if (!this.arePrerequisitesMet(nextUpgrade.id)) {
      return {
        kind: UpgradeStationStateKind.Locked,
        label: nextUpgrade.lockedLabel,
      };
    }
    return {
      kind: UpgradeStationStateKind.Available,
      definition: nextUpgrade,
    };
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
      case UpgradeEffectId.MaxDashCharges:
        this.effectTarget.setMaxDashCharges(definition.effectValue);
        break;
    }
  }
}
