export const PLAYTEST_MILESTONE_IDS = [
  'DOG_DELIVERED', 'PARK_UNLOCKED', 'CAT_DELIVERED', 'CENTRAL_HUB_UNLOCKED',
  'FOX_DELIVERED', 'FAST_DASH_PURCHASED', 'TWO_ROAMING_PETS',
  'RICH_DISTRICT_UNLOCKED', 'RICH_PETS_COMPLETE', 'FOUR_ROAMING_PETS',
  'RUNNER_SHOES_PURCHASED', 'DOUBLE_DASH_PURCHASED', 'SIX_ROAMING_PETS',
  'QUIET_SHOES_PURCHASED', 'VIP_ESTATE_UNLOCKED', 'VIP_PETS_COMPLETE',
  'DRAGON_DELIVERED', 'CAMPAIGN_COMPLETE',
] as const;
export type PlaytestMilestoneId = (typeof PLAYTEST_MILESTONE_IDS)[number];

export interface RunStatsSnapshot {
  readonly elapsedMs: number;
  readonly failedThefts: number;
  readonly successfulDeliveries: number;
  readonly campaignCompleted: boolean;
  readonly roamingAttempts?: number;
  readonly roamingCaptures?: number;
  readonly upgradePurchases?: number;
  readonly milestoneTimestamps?: Readonly<Partial<Record<PlaytestMilestoneId, number>>>;
}

const MAX_COUNTED_FRAME_DELTA_MS = 100;

export class RunStatsSystem {
  private elapsedMs: number;
  private failedThefts: number;
  private successfulDeliveries: number;
  private campaignCompleted: boolean;
  private roamingAttempts: number;
  private roamingCaptures: number;
  private upgradePurchases: number;
  private readonly milestoneTimestamps = new Map<PlaytestMilestoneId, number>();

  public constructor(initialState: Partial<RunStatsSnapshot> = {}, deliveredPetCount = 0) {
    this.elapsedMs = Math.max(0, initialState.elapsedMs ?? 0);
    this.failedThefts = Math.max(0, Math.floor(initialState.failedThefts ?? 0));
    this.successfulDeliveries = Math.max(deliveredPetCount, Math.floor(initialState.successfulDeliveries ?? deliveredPetCount));
    this.campaignCompleted = initialState.campaignCompleted ?? false;
    this.roamingAttempts = Math.max(0, Math.floor(initialState.roamingAttempts ?? 0));
    this.roamingCaptures = Math.max(0, Math.floor(initialState.roamingCaptures ?? 0));
    this.upgradePurchases = Math.max(0, Math.floor(initialState.upgradePurchases ?? 0));
    for (const [id, value] of Object.entries(initialState.milestoneTimestamps ?? {})) {
      if (PLAYTEST_MILESTONE_IDS.includes(id as PlaytestMilestoneId) && typeof value === 'number' && value >= 0) this.milestoneTimestamps.set(id as PlaytestMilestoneId, value);
    }
  }
  public update(deltaMs: number, gameplayActive: boolean): void {
    if (!gameplayActive || this.campaignCompleted || !Number.isFinite(deltaMs)) return;
    this.elapsedMs += Math.min(MAX_COUNTED_FRAME_DELTA_MS, Math.max(0, deltaMs));
  }
  public recordFailedTheft(): void { if (!this.campaignCompleted) this.failedThefts += 1; }
  public recordDelivery(): void { if (!this.campaignCompleted) this.successfulDeliveries += 1; }
  public recordRoamingAttempt(): void { if (!this.campaignCompleted) this.roamingAttempts += 1; }
  public recordRoamingCapture(): void { if (!this.campaignCompleted) this.roamingCaptures += 1; }
  public recordUpgradePurchase(): void { if (!this.campaignCompleted) this.upgradePurchases += 1; }
  public recordMilestone(id: PlaytestMilestoneId): void {
    if (!this.milestoneTimestamps.has(id)) this.milestoneTimestamps.set(id, this.elapsedMs);
  }
  public completeCampaign(): void { this.campaignCompleted = true; }
  public getSnapshot(): RunStatsSnapshot {
    return {
      elapsedMs: this.elapsedMs, failedThefts: this.failedThefts,
      successfulDeliveries: this.successfulDeliveries, campaignCompleted: this.campaignCompleted,
      roamingAttempts: this.roamingAttempts, roamingCaptures: this.roamingCaptures,
      upgradePurchases: this.upgradePurchases,
      milestoneTimestamps: Object.fromEntries(this.milestoneTimestamps),
    };
  }
}
