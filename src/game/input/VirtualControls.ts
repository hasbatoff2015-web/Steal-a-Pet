import Phaser from 'phaser';

import { DEPTH } from '../config/gameplay';

const JOYSTICK_RADIUS = 66;

export class VirtualControls {
  public readonly isMobileMode: boolean;

  private readonly movement = new Phaser.Math.Vector2();
  private readonly joystickBase: Phaser.GameObjects.Arc;
  private readonly joystickThumb: Phaser.GameObjects.Arc;
  private readonly dashButton: Phaser.GameObjects.Arc;
  private readonly dashLabel: Phaser.GameObjects.Text;
  private readonly interactButton: Phaser.GameObjects.Arc;
  private readonly interactLabel: Phaser.GameObjects.Text;

  private joystickPointerId: number | null = null;
  private dashRequested = false;
  private interactRequested = false;

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

  public setInteractionVisible(visible: boolean): void {
    const shouldShow = visible && this.isMobileMode;
    this.interactButton.setVisible(shouldShow);
    this.interactLabel.setVisible(shouldShow);
  }

  public destroy(): void {
    this.scene.input.off('pointermove', this.handlePointerMove, this);
    this.scene.input.off('pointerup', this.handlePointerUp, this);
    this.scene.input.off('pointerupoutside', this.handlePointerUp, this);
    this.scene.scale.off('resize', this.resize, this);
  }

  private handleJoystickDown(pointer: Phaser.Input.Pointer): void {
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
    const offset = new Phaser.Math.Vector2(
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
  }

  private setMobileElementsVisible(visible: boolean): void {
    this.joystickBase.setVisible(visible);
    this.joystickThumb.setVisible(visible);
    this.dashButton.setVisible(visible);
    this.dashLabel.setVisible(visible);
  }
}
