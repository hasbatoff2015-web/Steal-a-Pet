import Phaser from 'phaser';

import { DEPTH } from '../config/gameplay';

export interface VictorySummary {
  readonly deliveredPets: number;
  readonly elapsedMs: number;
  readonly failedThefts: number;
  readonly incomePerSecond: number;
}

export interface VictoryOverlayActions {
  readonly onContinue: () => void;
  readonly onNewGame: () => void;
}

export class VictoryOverlay {
  private readonly container: Phaser.GameObjects.Container;
  private readonly backdrop: Phaser.GameObjects.Rectangle;
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly title: Phaser.GameObjects.Text;
  private readonly subtitle: Phaser.GameObjects.Text;
  private readonly stats: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;
  private readonly primaryButton: Phaser.GameObjects.Rectangle;
  private readonly primaryLabel: Phaser.GameObjects.Text;
  private readonly newGameButton: Phaser.GameObjects.Rectangle;
  private readonly newGameLabel: Phaser.GameObjects.Text;
  private readonly confirmText: Phaser.GameObjects.Text;
  private readonly enterKey: Phaser.Input.Keyboard.Key;
  private readonly newGameKey: Phaser.Input.Keyboard.Key;
  private readonly escapeKey: Phaser.Input.Keyboard.Key;

  private visible = false;
  private confirmingNewGame = false;

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly actions: VictoryOverlayActions,
  ) {
    const keyboard = scene.input.keyboard;
    if (keyboard === null) {
      throw new Error('Keyboard input plugin is unavailable.');
    }
    this.enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.newGameKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    this.escapeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.backdrop = scene.add.rectangle(0, 0, 10, 10, 0x101225, 0.84).setOrigin(0);
    this.panel = scene.add
      .rectangle(0, 0, 620, 430, 0x3d2865, 0.98)
      .setStrokeStyle(6, 0xffdf72, 0.96);
    this.title = scene.add
      .text(0, 0, 'ПОБЕДА!', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '44px',
        fontStyle: 'bold',
        color: '#ffe66d',
        stroke: '#6b3d20',
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.subtitle = scene.add
      .text(0, 0, 'ТЫ УКРАЛ ВСЕХ ПИТОМЦЕВ', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.stats = scene.add
      .text(0, 0, '', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '19px',
        lineSpacing: 7,
        color: '#f3ebff',
      })
      .setOrigin(0.5);
    this.hint = scene.add
      .text(0, 0, 'ENTER — продолжить · N — новая игра', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#d8c9ef',
      })
      .setOrigin(0.5);
    this.confirmText = scene.add
      .text(0, 0, 'Удалить сохранение и начать заново?', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#ffe8a6',
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.primaryButton = scene.add
      .rectangle(0, 0, 250, 58, 0x4bbf75, 1)
      .setStrokeStyle(4, 0xe6ffec, 0.95)
      .setInteractive({ useHandCursor: true });
    this.primaryLabel = scene.add
      .text(0, 0, 'ПРОДОЛЖИТЬ ИГРАТЬ', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#102e1b',
      })
      .setOrigin(0.5);
    this.newGameButton = scene.add
      .rectangle(0, 0, 250, 58, 0x8a5dcc, 1)
      .setStrokeStyle(4, 0xf0e6ff, 0.95)
      .setInteractive({ useHandCursor: true });
    this.newGameLabel = scene.add
      .text(0, 0, 'НАЧАТЬ ЗАНОВО', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.primaryButton.on('pointerdown', this.handlePrimary, this);
    this.primaryLabel.setInteractive({ useHandCursor: true });
    this.primaryLabel.on('pointerdown', this.handlePrimary, this);
    this.newGameButton.on('pointerdown', this.handleNewGame, this);
    this.newGameLabel.setInteractive({ useHandCursor: true });
    this.newGameLabel.on('pointerdown', this.handleNewGame, this);

    this.container = scene.add
      .container(0, 0, [
        this.backdrop,
        this.panel,
        this.title,
        this.subtitle,
        this.stats,
        this.hint,
        this.confirmText,
        this.primaryButton,
        this.primaryLabel,
        this.newGameButton,
        this.newGameLabel,
      ])
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 20)
      .setVisible(false);

    scene.scale.on('resize', this.resize, this);
    this.resize(scene.scale.gameSize);
  }

  public show(summary: VictorySummary): void {
    this.confirmingNewGame = false;
    this.refreshConfirmationState();
    this.stats.setText([
      `Питомцев доставлено: ${summary.deliveredPets}`,
      `Время прохождения: ${formatElapsedTime(summary.elapsedMs)}`,
      `Проваленных краж: ${summary.failedThefts}`,
      `Итоговый доход: +${summary.incomePerSecond}/сек`,
    ]);
    this.visible = true;
    this.container.setVisible(true).setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 260,
    });
  }

  public hide(): void {
    this.visible = false;
    this.confirmingNewGame = false;
    this.container.setVisible(false);
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public update(): void {
    if (!this.visible) {
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.handlePrimary();
    } else if (Phaser.Input.Keyboard.JustDown(this.newGameKey)) {
      this.handleNewGame();
    } else if (
      this.confirmingNewGame &&
      Phaser.Input.Keyboard.JustDown(this.escapeKey)
    ) {
      this.confirmingNewGame = false;
      this.refreshConfirmationState();
    }
  }

  public destroy(): void {
    this.scene.scale.off('resize', this.resize, this);
    this.container.destroy(true);
  }

  private handlePrimary(): void {
    if (this.confirmingNewGame) {
      this.actions.onNewGame();
      return;
    }
    this.hide();
    this.actions.onContinue();
  }

  private handleNewGame(): void {
    if (this.confirmingNewGame) {
      this.confirmingNewGame = false;
    } else {
      this.confirmingNewGame = true;
    }
    this.refreshConfirmationState();
  }

  private refreshConfirmationState(): void {
    this.confirmText.setVisible(this.confirmingNewGame);
    this.primaryLabel.setText(
      this.confirmingNewGame ? 'ПОДТВЕРДИТЬ' : 'ПРОДОЛЖИТЬ ИГРАТЬ',
    );
    this.newGameLabel.setText(this.confirmingNewGame ? 'ОТМЕНА' : 'НАЧАТЬ ЗАНОВО');
    this.primaryButton.setFillStyle(
      this.confirmingNewGame ? 0xd45f5f : 0x4bbf75,
      1,
    );
  }

  private resize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;
    const panelWidth = Math.min(620, width - 20);
    const panelHeight = Math.min(430, height - 18);
    const compact = panelWidth < 500 || panelHeight < 410;
    const centerX = width / 2;
    const centerY = height / 2;

    this.backdrop.setSize(width, height);
    this.panel.setPosition(centerX, centerY).setSize(panelWidth, panelHeight);
    this.title
      .setPosition(centerX, centerY - panelHeight * 0.36)
      .setFontSize(compact ? 34 : 44);
    this.subtitle
      .setPosition(centerX, centerY - panelHeight * 0.23)
      .setFontSize(compact ? 17 : 22)
      .setWordWrapWidth(panelWidth - 28, true);
    this.stats
      .setPosition(centerX, centerY - panelHeight * 0.02)
      .setFontSize(compact ? 16 : 19);
    this.confirmText
      .setPosition(centerX, centerY + panelHeight * 0.18)
      .setFontSize(compact ? 14 : 17);

    const horizontalButtons = panelWidth >= 560;
    const buttonWidth = horizontalButtons ? 250 : Math.min(270, panelWidth - 40);
    const buttonHeight = compact ? 50 : 58;
    const buttonY = centerY + panelHeight * (horizontalButtons ? 0.28 : 0.24);
    const firstX = horizontalButtons ? centerX - 138 : centerX;
    const secondX = horizontalButtons ? centerX + 138 : centerX;
    const secondY = horizontalButtons ? buttonY : buttonY + buttonHeight + 10;

    this.primaryButton.setPosition(firstX, buttonY).setSize(buttonWidth, buttonHeight);
    this.primaryLabel.setPosition(firstX, buttonY).setFontSize(compact ? 14 : 16);
    this.newGameButton.setPosition(secondX, secondY).setSize(buttonWidth, buttonHeight);
    this.newGameLabel.setPosition(secondX, secondY).setFontSize(compact ? 14 : 16);
    this.hint
      .setPosition(centerX, centerY + panelHeight * 0.44)
      .setVisible(!compact || horizontalButtons);
  }
}

export function formatElapsedTime(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
