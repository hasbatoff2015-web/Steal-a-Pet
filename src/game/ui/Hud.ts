import Phaser from 'phaser';

import { DEPTH } from '../config/gameplay';

export interface DebugSnapshot {
  playerX: number;
  playerY: number;
  petState: string;
  chaseState: string;
}

const DASH_VISUAL_STEPS = 24;
const PERFORMANCE_SAMPLE_INTERVAL_MS = 250;

export class Hud {
  private readonly moneyPanel: Phaser.GameObjects.Rectangle;
  private readonly objectivePanel: Phaser.GameObjects.Rectangle;
  private readonly moneyText: Phaser.GameObjects.Text;
  private readonly objectiveText: Phaser.GameObjects.Text;
  private readonly promptText: Phaser.GameObjects.Text;
  private readonly toastText: Phaser.GameObjects.Text;
  private readonly dashGraphics: Phaser.GameObjects.Graphics;
  private readonly dashLabel: Phaser.GameObjects.Text;
  private readonly debugText: Phaser.GameObjects.Text;

  private toastTimer: Phaser.Time.TimerEvent | null = null;
  private debugVisible = false;
  private lastMoneyText = '';
  private lastObjectiveText = '';
  private lastPromptText = '';
  private lastPromptVisible = false;
  private lastDashVisualStep = -1;
  private lastDashMobileMode: boolean | null = null;
  private lastDebugText = '';
  private nextDebugTextAt = 0;
  private nextPerformanceSampleAt = 0;
  private sampledFrameTimeTotal = 0;
  private sampledFrameCount = 0;
  private currentFps = 0;
  private rollingFps = 0;
  private averageFrameTimeMs = 0;

  public constructor(private readonly scene: Phaser.Scene) {
    this.moneyPanel = scene.add
      .rectangle(0, 0, 156, 58, 0x152a42, 0.88)
      .setStrokeStyle(2, 0xffffff, 0.38)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui);

    this.objectivePanel = scene.add
      .rectangle(0, 0, 470, 58, 0x152a42, 0.82)
      .setStrokeStyle(2, 0xffffff, 0.3)
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui);

    this.moneyText = scene.add
      .text(0, 0, 'МОНЕТЫ: 0', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#fff2a6',
      })
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 1);

    this.objectiveText = scene.add
      .text(0, 0, 'Цель: найди питомца', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 1);

    this.promptText = scene.add
      .text(0, 0, 'E — УКРАСТЬ', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#4a2d00',
        backgroundColor: '#ffd15ce8',
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 3)
      .setVisible(false);

    this.toastText = scene.add
      .text(0, 0, '', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '25px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#18324aed',
        padding: { x: 20, y: 13 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 4)
      .setVisible(false);

    this.dashGraphics = scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 1);
    this.dashLabel = scene.add
      .text(0, 0, 'SPACE · РЫВОК', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#d8ecff',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 2);

    this.debugText = scene.add
      .text(12, 84, '', {
        fontFamily: 'Consolas, monospace',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#0a1522d9',
        padding: { x: 8, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 5)
      .setVisible(false);

    scene.scale.on('resize', this.resize, this);
    this.resize(scene.scale.gameSize);
  }

  public updateMoney(money: number, incomePerSecond: number): void {
    const income = incomePerSecond > 0 ? ` +${incomePerSecond}/сек` : '';
    const text = `МОНЕТЫ: ${money}${income}`;
    if (text === this.lastMoneyText) {
      return;
    }

    this.lastMoneyText = text;
    this.moneyText.setText(text);
  }

  public setObjective(objective: string): void {
    const text = `ЦЕЛЬ: ${objective}`;
    if (text === this.lastObjectiveText) {
      return;
    }

    this.lastObjectiveText = text;
    this.objectiveText.setText(text);
  }

  public setInteractionPrompt(visible: boolean, text: string): void {
    if (text !== this.lastPromptText) {
      this.lastPromptText = text;
      this.promptText.setText(text);
    }
    if (visible !== this.lastPromptVisible) {
      this.lastPromptVisible = visible;
      this.promptText.setVisible(visible);
    }
  }

  public setDashReadyRatio(ratio: number, mobileMode: boolean): void {
    if (mobileMode !== this.lastDashMobileMode) {
      this.lastDashMobileMode = mobileMode;
      this.lastDashVisualStep = -1;
      this.dashLabel.setVisible(!mobileMode);
      if (mobileMode) {
        this.dashGraphics.clear();
      }
    }

    if (mobileMode) {
      return;
    }

    const clampedRatio = Phaser.Math.Clamp(ratio, 0, 1);
    const visualStep =
      clampedRatio >= 1
        ? DASH_VISUAL_STEPS
        : Math.floor(clampedRatio * DASH_VISUAL_STEPS);
    if (visualStep === this.lastDashVisualStep) {
      return;
    }

    this.lastDashVisualStep = visualStep;
    const visualRatio = visualStep / DASH_VISUAL_STEPS;
    const width = 126;
    const height = 10;
    const x = this.scene.scale.gameSize.width - width - 20;
    const y = 53;

    this.dashGraphics.clear();
    this.dashGraphics.fillStyle(0x152a42, 0.8);
    this.dashGraphics.fillRoundedRect(x, y, width, height, 5);
    this.dashGraphics.fillStyle(visualStep >= DASH_VISUAL_STEPS ? 0x76e69b : 0x69b7ff, 0.95);
    this.dashGraphics.fillRoundedRect(x, y, width * visualRatio, height, 5);
  }

  public showToast(message: string, durationMs = 1800): void {
    this.toastTimer?.remove(false);
    this.scene.tweens.killTweensOf(this.toastText);
    this.toastText.setText(message).setVisible(true).setAlpha(0).setScale(0.9);
    this.scene.tweens.add({
      targets: this.toastText,
      alpha: 1,
      scale: 1,
      duration: 160,
      ease: 'Back.easeOut',
    });

    this.toastTimer = this.scene.time.delayedCall(durationMs, () => {
      this.scene.tweens.add({
        targets: this.toastText,
        alpha: 0,
        duration: 250,
        onComplete: () => this.toastText.setVisible(false),
      });
    });
  }

  public toggleDebug(): boolean {
    this.debugVisible = !this.debugVisible;
    this.debugText.setVisible(this.debugVisible);
    this.nextDebugTextAt = 0;
    return this.debugVisible;
  }

  public recordPerformance(time: number, delta: number): void {
    this.sampledFrameTimeTotal += delta;
    this.sampledFrameCount += 1;

    if (time < this.nextPerformanceSampleAt) {
      return;
    }

    this.averageFrameTimeMs =
      this.sampledFrameCount > 0
        ? this.sampledFrameTimeTotal / this.sampledFrameCount
        : delta;
    const sampledFps =
      this.averageFrameTimeMs > 0 ? 1000 / this.averageFrameTimeMs : 0;
    this.currentFps = sampledFps;
    this.rollingFps =
      this.rollingFps === 0
        ? sampledFps
        : this.rollingFps * 0.7 + sampledFps * 0.3;
    this.sampledFrameTimeTotal = 0;
    this.sampledFrameCount = 0;
    this.nextPerformanceSampleAt = time + PERFORMANCE_SAMPLE_INTERVAL_MS;
  }

  public shouldRefreshDebug(time: number): boolean {
    if (!this.debugVisible || time < this.nextDebugTextAt) {
      return false;
    }

    this.nextDebugTextAt = time + PERFORMANCE_SAMPLE_INTERVAL_MS;
    return true;
  }

  public updateDebug(snapshot: DebugSnapshot): void {
    const text =
      [
        `FPS: ${this.currentFps.toFixed(0)} · AVG: ${this.rollingFps.toFixed(1)}`,
        `FRAME: ${this.averageFrameTimeMs.toFixed(2)} ms`,
        `PLAYER: ${snapshot.playerX.toFixed(0)}, ${snapshot.playerY.toFixed(0)}`,
        `PET: ${snapshot.petState}`,
        `CHASE: ${snapshot.chaseState}`,
      ].join('\n');
    if (text === this.lastDebugText) {
      return;
    }

    this.lastDebugText = text;
    this.debugText.setText(text);
  }

  public getCurrentFps(): number {
    return this.currentFps;
  }

  public getRollingFps(): number {
    return this.rollingFps;
  }

  public getAverageFrameTimeMs(): number {
    return this.averageFrameTimeMs;
  }

  public destroy(): void {
    this.scene.scale.off('resize', this.resize, this);
    this.toastTimer?.remove(false);
  }

  private resize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;
    const compact = width < 760;
    const veryNarrow = width <= 360;
    const edge = compact ? 10 : 18;
    const moneyWidth = compact ? Math.min(width - 20, 200) : 186;
    const objectiveWidth = compact ? width - 20 : Math.min(520, width - 412);

    this.moneyPanel.setPosition(edge, compact ? 76 : 16).setSize(moneyWidth, compact ? 52 : 58);
    this.moneyText
      .setPosition(edge + 12, compact ? 91 : 34)
      .setFontSize(compact ? (veryNarrow ? 14 : 15) : 16);

    this.objectivePanel
      .setPosition(width / 2, compact ? 8 : 16)
      .setSize(objectiveWidth, compact ? 58 : 58);
    this.objectiveText
      .setPosition(width / 2, compact ? 20 : 28)
      .setFontSize(compact ? (veryNarrow ? 14 : 15) : 18)
      .setWordWrapWidth(objectiveWidth - 24, true);

    this.promptText.setPosition(width / 2, compact ? height * 0.68 : height - 88);
    this.toastText
      .setPosition(width / 2, Math.max(125, height * 0.24))
      .setFontSize(compact ? 20 : 25)
      .setWordWrapWidth(Math.max(240, width - 40), true);

    this.debugText.setPosition(12, compact ? 146 : 84);
    this.dashLabel.setPosition(width - 20, 31);
    this.lastDashVisualStep = -1;
  }
}
