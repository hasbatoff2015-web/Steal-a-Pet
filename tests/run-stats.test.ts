import { describe, expect, it } from 'vitest';

import { RunStatsSystem } from '../src/game/systems/RunStatsSystem';

describe('Run stats', () => {
  it('uses safe Stage 4 defaults and preserves existing deliveries', () => {
    const stats = new RunStatsSystem({}, 5);
    expect(stats.getSnapshot()).toEqual(expect.objectContaining({
      elapsedMs: 0,
      failedThefts: 0,
      successfulDeliveries: 5,
      campaignCompleted: false,
    }));
  });

  it('counts only active clamped gameplay time', () => {
    const stats = new RunStatsSystem();
    stats.update(16, true);
    stats.update(10_000, false);
    stats.update(10_000, true);
    expect(stats.getSnapshot().elapsedMs).toBe(116);
  });

  it('records deliveries and failures and stops at campaign completion', () => {
    const stats = new RunStatsSystem();
    stats.recordFailedTheft();
    stats.recordDelivery();
    stats.completeCampaign();
    stats.update(16, true);
    stats.recordFailedTheft();
    stats.recordDelivery();
    expect(stats.getSnapshot()).toEqual(expect.objectContaining({
      elapsedMs: 0,
      failedThefts: 1,
      successfulDeliveries: 1,
      campaignCompleted: true,
    }));
  });
});
