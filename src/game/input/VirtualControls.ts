import Phaser from 'phaser';

import { DEPTH } from '../config/gameplay';

const JOYSTICK_RADIUS = 66;
const DASH_VISUAL_STEPS = 24;

export class VirtualControls {
  public readonly isMobileMode: boolean;

  private readonly movement = new Phaser.Math.Vector2();
  private readonly joystickOffset = new Phaser.Math.Vector2();
  private readonly joystickBase: Phaser.GameObjects.Arc;
  private readonly joystickThumb: Phaser.GameObjects.Arc;
  private readonly dashButton: Phaser.GameObjects.Arc;
  private readonly dashCooldownRing: Phaser.GameObjects.Graphics;
  private readonly dashLabel: Phaser.GameObjects.Text;
  private readonly interactButton: Phaser.GameObjects.Arc;
  private readonly interactLabel: Phaser.GameObjects.Text;

  private joystickPointerId: number | null = null;
  private dashRechargeRatio = 1;
  private dashCharges = 1;
  private maxDashCharges = 1;
  private dashRequested = false;
  private interactRequested = false;
  private lastInteractionLabel = 'УКРАСТЬ';
  private lastInteractionVisible: boolean | null = null;
  private lastDashVisualStep = -1;
  private lastDashCharges = -1;
  private lastMaxDashCharges = -1;

  public constructor(private readonly scene: Phaser.Scene) {
    const search = new URLSearchParams(window.location.search);
    this.isMobileMode =
      search.get('touch') === '1' ||
      window.matchMedia('(pointer: coarse)').matches ||
      navigator.maxTouchPoints > 0;

    this.joystickBase = scene.add
      .circle(0, 0, JOYSTICK_RADIUS, 0x152a42, 0.42)
      .setStrokeStyle(4, 0xffffff, 0.6)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui)
      .setInteractive();

    this.joystickThumb = scene.add
      .circle(0, 0, 29, 0xffffff, 0.72)
      .setStrokeStyle(3, 0x7ecbff, 0.9)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 1);

    this.dashButton = scene.add
      .circle(0, 0, 54, 0x4e8fe8, 0.76)
      .setStrokeStyle(4, 0xffffff, 0.78)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui)
      .setInteractive();

    this.dashCooldownRing = scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 1);

    this.dashLabel = scene.add
      .text(0, 0, 'РЫВОК', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 1);

    this.interactButton = scene.add
      .circle(0, 0, 58, 0xffb72d, 0.88)
      .setStrokeStyle(5, 0xffffff, 0.86)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui)
      .setInteractive();

    this.interactLabel = scene.add
      .text(0, 0, 'УКРАСТЬ', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#4f3300',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 1);

    this.joystickBase.on('pointerdown', this.handleJoystickDown, this);
    this.dashButton.on('pointerdown', this.handleDashDown, this);
    this.interactButton.on('pointerdown', this.handleInteractDown, this);
    scene.input.on('pointermove', this.handlePointerMove, this);
    scene.input.on('pointerup', this.handlePointerUp, this);
    scene.input.on('pointerupoutside', this.handlePointerUp, this);
    scene.scale.on('resize', this.resize, this);

    this.setInteractionVisible(false);
    this.setMobileElementsVisible(this.isMobileMode);
    this.resize(scene.scale.gameSize);
  }

  public getMovement(): Phaser.Math.Vector2 {
    return this.movement;
  }

  public consumeDash(): boolean {
    const requested = this.dashRequested;
    this.dashRequested = false;
    return requested;
  }

  public consumeInteract(): boolean {
    const requested = this.interactRequested;
    this.interactRequested = false;
    return requested;
  }

  public setInteractionVisible(visible: boolean, label = 'УКРАСТЬ'): void {
    const shouldShow = visible && this.isMobileMode;
    if (label !== this.lastInteractionLabel) {
      this.lastInteractionLabel = label;
      this.interactLabel.setText(label);
    }
    if (shouldShow !== this.lastInteractionVisible) {
      this.lastInteractionVisible = shouldShow;
      this.interactButton.setVisible(shouldShow);
      this.interactLabel.setVisible(shouldShow);
    }
  }

  public setDashState(
    charges: number,
    maxCharges: number,
    rechargeRatio: number,
  ): void {
    this.dashCharges = Math.max(0, Math.floor(charges));
    this.maxDashCharges = Math.max(1, Math.floor(maxCharges));
    this.dashRechargeRatio = Phaser.Math.Clamp(rechargeRatio, 0, 1);
    if (!this.isMobileMode) {
      return;
    }
    this.renderDashCooldown();
  }

  public destroy(): void {
    this.scene.input.off('pointermove', this.handlePointerMove, this);
    this.scene.input.off('pointerup', this.handlePointerUp, this);
    this.scene.input.off('pointerupoutside', this.handlePointerUp, this);
    this.scene.scale.off('resize', this.resize, this);
  }

  private handleJoystickDown(pointer: Phaser.Input.Pointer): void {
    if (this.joystickPointerId !== null) {
      return;
    }

    this.joystickPointerId = pointer.id;
    this.updateJoystick(pointer);
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.joystickPointerId && pointer.isDown) {
      this.updateJoystick(pointer);
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.joystickPointerId) {
      return;
    }

    this.joystickPointerId = null;
    this.movement.set(0, 0);
    this.joystickThumb.setPosition(this.joystickBase.x, this.joystickBase.y);
  }

  private handleDashDown(): void {
    if (this.dashCharges <= 0) {
      return;
    }

    this.dashRequested = true;
    this.scene.tweens.add({
      targets: [this.dashButton, this.dashLabel],
      scale: 0.86,
      yoyo: true,
      duration: 75,
    });
  }

  private handleInteractDown(): void {
    this.interactRequested = true;
    this.scene.tweens.add({
      targets: [this.interactButton, this.interactLabel],
      scale: 0.86,
      yoyo: true,
      duration: 75,
    });
  }

  private updateJoystick(pointer: Phaser.Input.Pointer): void {
    const offset = this.joystickOffset.set(
      pointer.x - this.joystickBase.x,
      pointer.y - this.joystickBase.y,
    );

    if (offset.length() > JOYSTICK_RADIUS) {
      offset.setLength(JOYSTICK_RADIUS);
    }

    this.joystickThumb.setPosition(
      this.joystickBase.x + offset.x,
      this.joystickBase.y + offset.y,
    );
    this.movement.copy(offset).scale(1 / JOYSTICK_RADIUS);

    if (this.movement.length() < 0.14) {
      this.movement.set(0, 0);
    }
  }

  private resize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;
    const joystickX = Math.max(88, Math.min(116, width * 0.2));
    const joystickY = height - Math.max(94, Math.min(126, height * 0.16));
    const actionX = width - Math.max(82, Math.min(108, width * 0.18));
    const dashY = height - Math.max(92, Math.min(118, height * 0.15));
    const interactY = dashY - 132;

    this.joystickBase.setPosition(joystickX, joystickY);
    if (this.joystickPointerId === null) {
      this.joystickThumb.setPosition(joystickX, joystickY);
    }

    this.dashButton.setPosition(actionX, dashY);
    this.dashLabel.setPosition(actionX, dashY);
    this.interactButton.setPosition(actionX, interactY);
    this.interactLabel.setPosition(actionX, interactY);
    this.renderDashCooldown(true);
  }

  private setMobileElementsVisible(visible: boolean): void {
    this.joystickBase.setVisible(visible);
    this.joystickThumb.setVisible(visible);
    this.dashButton.setVisible(visible);
    this.dashCooldownRing.setVisible(visible);
    this.dashLabel.setVisible(visible);
  }

  private renderDashCooldown(force = false): void {
    if (!this.isMobileMode) {
      return;
    }

    const ready = this.dashCharges > 0;
    const fullyCharged = this.dashCharges >= this.maxDashCharges;
    const visualStep = fullyCharged
      ? DASH_VISUAL_STEPS
      : Math.floor(this.dashRechargeRatio * DASH_VISUAL_STEPS);
    if (
      !force &&
      visualStep === this.lastDashVisualStep &&
      this.dashCharges === this.lastDashCharges &&
      this.maxDashCharges === this.lastMaxDashCharges
    ) {
      return;
    }

    this.lastDashVisualStep = visualStep;
    this.lastDashCharges = this.dashCharges;
    this.lastMaxDashCharges = this.maxDashCharges;
    const visualRatio = visualStep / DASH_VISUAL_STEPS;

    this.dashLabel.setText(
      this.maxDashCharges > 1
        ? `РЫВОК\n${this.dashCharges}/${this.maxDashCharges}`
        : `РЫВОК\n${this.dashCharges}`,
    );

    this.dashButton
      .setFillStyle(ready ? 0x4e8fe8 : 0x20384e, ready ? 0.82 : 0.72)
      .setStrokeStyle(ready ? 5 : 4, ready ? 0xa8f0bc : 0x8ca0b4, ready ? 0.95 : 0.55);
    this.dashLabel.setAlpha(ready ? 1 : 0.58);

    this.dashCooldownRing.clear();
    if (!fullyCharged) {
      this.dashCooldownRing.lineStyle(7, 0x77c9ff, 0.94);
      this.dashCooldownRing.beginPath();
      this.dashCooldownRing.arc(
        this.dashButton.x,
        this.dashButton.y,
        47,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * visualRatio,
      );
      this.dashCooldownRing.strokePath();
    }
  }
}
