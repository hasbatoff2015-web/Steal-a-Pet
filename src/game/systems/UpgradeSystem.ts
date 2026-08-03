import type { PetId } from '../data/pets';
import {
  areUpgradePrerequisitesMet,
  getUpgradeDefinition,
  UPGRADE_DEFINITIONS,
  UpgradeBranchId,
  UpgradeEffectId,
  type UpgradeDefinition,
  type UpgradeId,
} from '../data/upgrades';
import type { ZoneId } from '../data/zones';
import type { EconomySystem } from './EconomySystem';

export enum UpgradePurchaseResult {
  Purchased = 'PURCHASED', InsufficientFunds = 'INSUFFICIENT_FUNDS',
  PrerequisitesNotMet = 'PREREQUISITES_NOT_MET', AlreadyPurchased = 'ALREADY_PURCHASED',
}
export enum UpgradeStationStateKind { Locked = 'LOCKED', Available = 'AVAILABLE', Complete = 'COMPLETE' }
export type UpgradeStationState =
  | { readonly kind: UpgradeStationStateKind.Locked; readonly label: string }
  | { readonly kind: UpgradeStationStateKind.Available; readonly definition: UpgradeDefinition }
  | { readonly kind: UpgradeStationStateKind.Complete };

export interface UpgradeEffectTarget {
  setDashCooldownMs(cooldownMs: number): void;
  setMaxDashCharges(maxCharges: number): void;
  setMoveSpeedMultiplier(multiplier: number): void;
}
export interface UpgradePrerequisiteContext {
  isPetDelivered(petId: PetId): boolean;
  isZoneUnlocked(zoneId: ZoneId): boolean;
  getRoamingPetCount(): number;
}

export class UpgradeSystem {
  private readonly purchasedUpgradeIds = new Set<UpgradeId>();
  private readonly grandfatheredUpgradeIds = new Set<UpgradeId>();
  private readonly effectValues = new Map<UpgradeEffectId, readonly number[]>();
  private effectTarget: UpgradeEffectTarget | null = null;
  private prerequisiteContext: UpgradePrerequisiteContext | null = null;

  public constructor(
    private readonly economy: EconomySystem,
    purchasedUpgradeIds: readonly UpgradeId[] = [],
    grandfatheredUpgradeIds: readonly UpgradeId[] = [],
  ) {
    purchasedUpgradeIds.forEach((id) => this.purchasedUpgradeIds.add(id));
    grandfatheredUpgradeIds.forEach((id) => this.grandfatheredUpgradeIds.add(id));
    this.rebuildEffectCache();
  }
  public connectPrerequisiteContext(context: UpgradePrerequisiteContext): void { this.prerequisiteContext = context; }
  public connectEffectTarget(target: UpgradeEffectTarget): void {
    this.effectTarget = target;
    for (const id of this.purchasedUpgradeIds) this.applyEffects(id);
  }
  public tryPurchase(upgradeId: UpgradeId): UpgradePurchaseResult {
    if (this.isPurchased(upgradeId)) return UpgradePurchaseResult.AlreadyPurchased;
    if (!this.arePrerequisitesMet(upgradeId)) return UpgradePurchaseResult.PrerequisitesNotMet;
    const definition = getUpgradeDefinition(upgradeId);
    if (!this.economy.spend(definition.cost)) return UpgradePurchaseResult.InsufficientFunds;
    this.purchasedUpgradeIds.add(upgradeId); this.rebuildEffectCache(); this.applyEffects(upgradeId);
    return UpgradePurchaseResult.Purchased;
  }
  public arePrerequisitesMet(upgradeId: UpgradeId): boolean {
    if (this.grandfatheredUpgradeIds.has(upgradeId)) return true;
    const context = this.prerequisiteContext; if (context === null) return false;
    return areUpgradePrerequisitesMet(getUpgradeDefinition(upgradeId), {
      isPetDelivered: (id) => context.isPetDelivered(id),
      isUpgradePurchased: (id) => this.purchasedUpgradeIds.has(id as UpgradeId),
      isZoneUnlocked: (id) => context.isZoneUnlocked(id as ZoneId),
      getRoamingPetCount: () => context.getRoamingPetCount(),
    });
  }
  public getStationState(branchId: UpgradeBranchId = UpgradeBranchId.Mobility): UpgradeStationState {
    const branch = Object.values(UPGRADE_DEFINITIONS)
      .filter((definition) => definition.branchId === branchId)
      .sort((a, b) => a.order - b.order);
    const next = branch.find((definition) => !this.isPurchased(definition.id as UpgradeId));
    if (next === undefined) return { kind: UpgradeStationStateKind.Complete };
    if (!this.arePrerequisitesMet(next.id as UpgradeId)) return { kind: UpgradeStationStateKind.Locked, label: next.lockedLabel };
    return { kind: UpgradeStationStateKind.Available, definition: next };
  }
  public isPurchased(id: UpgradeId): boolean { return this.purchasedUpgradeIds.has(id); }
  public getPurchasedUpgradeIds(): readonly UpgradeId[] { return [...this.purchasedUpgradeIds]; }
  public getGrandfatheredUpgradeIds(): readonly UpgradeId[] { return [...this.grandfatheredUpgradeIds]; }
  public hasEffect(effectId: UpgradeEffectId): boolean { return this.getEffects(effectId).length > 0; }
  public getEffectProduct(effectId: UpgradeEffectId, fallback = 1): number {
    const values = this.getEffects(effectId); return values.length === 0 ? fallback : values.reduce((value, item) => value * item, 1);
  }
  public getEffectSum(effectId: UpgradeEffectId): number { return this.getEffects(effectId).reduce((value, item) => value + item, 0); }

  private getEffects(effectId: UpgradeEffectId): readonly number[] {
    return this.effectValues.get(effectId) ?? [];
  }
  private rebuildEffectCache(): void {
    this.effectValues.clear();
    const mutable = new Map<UpgradeEffectId, number[]>();
    for (const id of this.purchasedUpgradeIds) {
      for (const effect of getUpgradeDefinition(id).effects) {
        const values = mutable.get(effect.id) ?? [];
        values.push(effect.value); mutable.set(effect.id, values);
      }
    }
    for (const [id, values] of mutable) this.effectValues.set(id, values);
  }
  private applyEffects(upgradeId: UpgradeId): void {
    if (this.effectTarget === null) return;
    for (const effect of getUpgradeDefinition(upgradeId).effects) {
      switch (effect.id) {
        case UpgradeEffectId.DashCooldownMs: this.effectTarget.setDashCooldownMs(effect.value); break;
        case UpgradeEffectId.MaxDashCharges: this.effectTarget.setMaxDashCharges(effect.value); break;
        case UpgradeEffectId.MoveSpeedMultiplier: this.effectTarget.setMoveSpeedMultiplier(effect.value); break;
        default: break;
      }
    }
  }
}
