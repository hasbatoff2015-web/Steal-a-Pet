export interface RunStatsSnapshot {
  readonly elapsedMs: number;
  readonly failedThefts: number;
  readonly successfulDeliveries: number;
  readonly campaignCompleted: boolean;
}

const MAX_COUNTED_FRAME_DELTA_MS = 100;

export class RunStatsSystem {
  private elapsedMs: number;
  private failedThefts: number;
  private successfulDeliveries: number;
  private campaignCompleted: boolean;

  public constructor(
    initialState: Partial<RunStatsSnapshot> = {},
    deliveredPetCount = 0,
  ) {
    this.elapsedMs = Math.max(0, initialState.elapsedMs ?? 0);
    this.failedThefts = Math.max(0, Math.floor(initialState.failedThefts ?? 0));
    this.successfulDeliveries = Math.max(
      deliveredPetCount,
      Math.floor(initialState.successfulDeliveries ?? deliveredPetCount),
    );
    this.campaignCompleted = initialState.campaignCompleted ?? false;
  }

  public update(deltaMs: number, gameplayActive: boolean): void {
    if (!gameplayActive || this.campaignCompleted || !Number.isFinite(deltaMs)) {
      return;
    }

    this.elapsedMs += Math.min(
      MAX_COUNTED_FRAME_DELTA_MS,
      Math.max(0, deltaMs),
    );
  }

  public recordFailedTheft(): void {
    if (!this.campaignCompleted) {
      this.failedThefts += 1;
    }
  }

  public recordDelivery(): void {
    if (!this.campaignCompleted) {
      this.successfulDeliveries += 1;
    }
  }

  public completeCampaign(): void {
    this.campaignCompleted = true;
  }

  public getSnapshot(): RunStatsSnapshot {
    return {
      elapsedMs: this.elapsedMs,
      failedThefts: this.failedThefts,
      successfulDeliveries: this.successfulDeliveries,
      campaignCompleted: this.campaignCompleted,
    };
  }
}
