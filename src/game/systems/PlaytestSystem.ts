import Phaser from 'phaser';

import type { EconomySystem } from './EconomySystem';
import type { ProgressionSystem } from './ProgressionSystem';
import { PLAYTEST_MILESTONE_IDS, type PlaytestMilestoneId, type RunStatsSystem } from './RunStatsSystem';
import type { UpgradeSystem } from './UpgradeSystem';
import { ZoneId } from '../data/zones';

export class PlaytestSystem {
  public readonly enabled: boolean;
  private readonly output: Phaser.GameObjects.Text | null;
  private nextRefreshAt = 0;
  private lastText = '';
  private readonly scene: Phaser.Scene;

  public constructor(
    scene: Phaser.Scene,
    private readonly progression: ProgressionSystem,
    private readonly economy: EconomySystem,
    private readonly upgrades: UpgradeSystem,
    private readonly runStats: RunStatsSystem,
    private readonly getAverageFps: () => number,
    private readonly validNormalRun: boolean,
  ) {
    this.scene = scene;
    const query = new URLSearchParams(window.location.search);
    this.enabled = query.get('playtest') === '1' && query.get('dev') !== '1';
    this.output = this.enabled
      ? scene.add.text(8, scene.scale.gameSize.width < 760 ? 138 : 84, '', {
          fontFamily: 'Consolas, monospace', fontSize: '11px', color: '#e9f8ff',
          backgroundColor: '#132536c9', padding: { x: 6, y: 5 }, lineSpacing: 2,
        }).setScrollFactor(0).setDepth(100_010)
      : null;
    scene.scale.on('resize', this.handleResize, this);
  }

  public update(time: number): void {
    if (!this.enabled) return;
    if (time < this.nextRefreshAt) return;
    this.nextRefreshAt = time + 250;
    this.recordReachedMilestones();
    const stats = this.runStats.getSnapshot();
    const current = PLAYTEST_MILESTONE_IDS.find((id) => stats.milestoneTimestamps?.[id] === undefined) ?? 'COMPLETE';
    const text = [
      `${this.validNormalRun ? 'PLAYTEST' : 'PLAYTEST — TIME INVALID'} ${formatTime(stats.elapsedMs)} · ${this.progression.getStage()}`,
      `money=${this.economy.getDisplayedMoney()} income=+${this.economy.getIncomePerSecond()}/s roam=${this.progression.getRoamingPetCount()}/6`,
      `fails=${stats.failedThefts} captures=${stats.roamingCaptures ?? 0} · next=${current}`,
    ].join('\n');
    if (text !== this.lastText) { this.lastText = text; this.output?.setText(text); }
  }

  public async copyReport(): Promise<boolean> {
    const report = this.createReport();
    try {
      await navigator.clipboard.writeText(report); return true;
    } catch {
      const area = document.createElement('textarea'); area.value = report;
      area.style.position = 'fixed'; area.style.left = '8px'; area.style.top = '8px'; area.style.zIndex = '99999';
      area.style.width = 'min(720px, calc(100vw - 16px))'; area.style.height = '60vh';
      document.body.append(area); area.focus(); area.select();
      return false;
    }
  }

  public createReport(): string {
    const stats = this.runStats.getSnapshot();
    const milestoneLines = PLAYTEST_MILESTONE_IDS.map((id) => `${id}: ${formatTime(stats.milestoneTimestamps?.[id] ?? -1)}`);
    return [
      this.validNormalRun
        ? 'STEAL A PET — NORMAL PLAYTEST REPORT'
        : 'STEAL A PET — PLAYTEST RUN — TIME INVALID',
      `total=${formatTime(stats.elapsedMs)}`,
      `failedThefts=${stats.failedThefts}`,
      `roamingAttempts=${stats.roamingAttempts ?? 0}`,
      `roamingCaptures=${stats.roamingCaptures ?? 0}`,
      `upgradePurchases=${stats.upgradePurchases ?? 0}`,
      `purchased=${this.upgrades.getPurchasedUpgradeIds().join(',') || 'none'}`,
      `finalIncome=${this.economy.getIncomePerSecond()}`,
      `averageFps=${this.getAverageFps().toFixed(1)}`,
      `viewport=${window.innerWidth}x${window.innerHeight}; touchPoints=${navigator.maxTouchPoints}`,
      '', 'MILESTONES', ...milestoneLines,
    ].join('\n');
  }

  public destroy(): void {
    this.scene.scale.off('resize', this.handleResize, this);
    this.output?.destroy();
  }

  private recordReachedMilestones(): void {
    const p = this.progression; const u = this.upgrades;
    const checks: readonly (readonly [PlaytestMilestoneId, boolean])[] = [
      ['DOG_DELIVERED', p.isPetDelivered('dog')], ['PARK_UNLOCKED', p.isZoneUnlocked(ZoneId.Park)],
      ['CAT_DELIVERED', p.isPetDelivered('cat')], ['CENTRAL_HUB_UNLOCKED', p.isZoneUnlocked(ZoneId.CentralHub)],
      ['FOX_DELIVERED', p.isPetDelivered('fox')], ['FAST_DASH_PURCHASED', u.isPurchased('fast-dash')],
      ['TWO_ROAMING_PETS', p.getRoamingPetCount() >= 2], ['RICH_DISTRICT_UNLOCKED', p.isZoneUnlocked(ZoneId.RichDistrict)],
      ['RICH_PETS_COMPLETE', p.isPetDelivered('peacock') && p.isPetDelivered('panda')],
      ['FOUR_ROAMING_PETS', p.getRoamingPetCount() >= 4], ['RUNNER_SHOES_PURCHASED', u.isPurchased('runner-shoes')],
      ['DOUBLE_DASH_PURCHASED', u.isPurchased('double-dash')], ['SIX_ROAMING_PETS', p.getRoamingPetCount() >= 6],
      ['QUIET_SHOES_PURCHASED', u.isPurchased('quiet-shoes')], ['VIP_ESTATE_UNLOCKED', p.isZoneUnlocked(ZoneId.VipEstate)],
      ['VIP_PETS_COMPLETE', p.isPetDelivered('vip-a') && p.isPetDelivered('vip-b')],
      ['DRAGON_DELIVERED', p.isPetDelivered('dragon')], ['CAMPAIGN_COMPLETE', p.isCampaignComplete()],
    ];
    for (const [id, reached] of checks) if (reached) this.runStats.recordMilestone(id);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.output?.setPosition(8, gameSize.width < 760 ? 138 : 84);
  }
}

function formatTime(ms: number): string {
  if (ms < 0) return '--:--';
  const seconds = Math.floor(ms / 1000); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
