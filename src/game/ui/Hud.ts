import Phaser from 'phaser';

import { DEPTH } from '../config/gameplay';

export interface DebugSnapshot {
  fps: number;
  playerX: number;
  playerY: number;
  petState: string;
  chaseState: string;
}

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
    this.moneyText.setText(`МОНЕТЫ: ${money}${income}`);
  }

  public setObjective(objective: string): void {
    this.objectiveText.setText(`ЦЕЛЬ: ${objective}`);
  }

  public setInteractionPrompt(visible: boolean, mobileMode: boolean): void {
    this.promptText.setText(mobileMode ? 'Нажми «УКРАСТЬ»' : 'E — УКРАСТЬ');
    this.promptText.setVisible(visible);
  }

  public setDashReadyRatio(ratio: number, mobileMode: boolean): void {
    if (mobileMode) {
      this.dashGraphics.clear();
      this.dashLabel.setVisible(false);
      return;
    }

    const width = 126;
    const height = 10;
    const x = this.scene.scale.gameSize.width - width - 20;
    const y = 53;

    this.dashGraphics.clear();
    this.dashGraphics.fillStyle(0x152a42, 0.8);
    this.dashGraphics.fillRoundedRect(x, y, width, height, 5);
    this.dashGraphics.fillStyle(ratio >= 1 ? 0x76e69b : 0x69b7ff, 0.95);
    this.dashGraphics.fillRoundedRect(x, y, width * ratio, height, 5);
    this.dashLabel
      .setVisible(true)
      .setPosition(this.scene.scale.gameSize.width - 20, 31)
      .setText('SPACE · РЫВОК');
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
    return this.debugVisible;
  }

  public updateDebug(snapshot: DebugSnapshot): void {
    if (!this.debugVisible) {
      return;
    }

    this.debugText.setText(
      [
        `FPS: ${snapshot.fps.toFixed(0)}`,
        `PLAYER: ${snapshot.playerX.toFixed(0)}, ${snapshot.playerY.toFixed(0)}`,
        `PET: ${snapshot.petState}`,
        `CHASE: ${snapshot.chaseState}`,
      ].join('\n'),
    );
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
  }
}
