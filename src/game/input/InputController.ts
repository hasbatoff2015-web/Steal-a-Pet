import Phaser from 'phaser';

import { VirtualControls } from './VirtualControls';

export interface FrameInput {
  movement: Phaser.Math.Vector2;
  dashPressed: boolean;
  interactPressed: boolean;
  debugPressed: boolean;
}

export class InputController {
  public readonly isMobileMode: boolean;

  private readonly virtualControls: VirtualControls;
  private readonly movement = new Phaser.Math.Vector2();
  private readonly up: Phaser.Input.Keyboard.Key;
  private readonly down: Phaser.Input.Keyboard.Key;
  private readonly left: Phaser.Input.Keyboard.Key;
  private readonly right: Phaser.Input.Keyboard.Key;
  private readonly w: Phaser.Input.Keyboard.Key;
  private readonly a: Phaser.Input.Keyboard.Key;
  private readonly s: Phaser.Input.Keyboard.Key;
  private readonly d: Phaser.Input.Keyboard.Key;
  private readonly dash: Phaser.Input.Keyboard.Key;
  private readonly interact: Phaser.Input.Keyboard.Key;
  private readonly debug: Phaser.Input.Keyboard.Key;
  private devDashRequested = false;
  private devInteractRequested = false;

  public constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (keyboard === null) {
      throw new Error('Keyboard input plugin is unavailable.');
    }

    this.up = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.down = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.left = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.right = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.w = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.a = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.s = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.d = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.dash = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.interact = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.debug = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F2);

    keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    ]);

    this.virtualControls = new VirtualControls(scene);
    this.isMobileMode = this.virtualControls.isMobileMode;
  }

  public readFrame(): FrameInput {
    const keyboardX =
      Number(this.right.isDown || this.d.isDown) - Number(this.left.isDown || this.a.isDown);
    const keyboardY =
      Number(this.down.isDown || this.s.isDown) - Number(this.up.isDown || this.w.isDown);

    this.movement.set(keyboardX, keyboardY);

    if (this.movement.lengthSq() === 0) {
      this.movement.copy(this.virtualControls.getMovement());
    }

    if (this.movement.lengthSq() > 1) {
      this.movement.normalize();
    }

    return {
      movement: this.movement,
      dashPressed:
        Phaser.Input.Keyboard.JustDown(this.dash) ||
        this.virtualControls.consumeDash() ||
        this.consumeDevDash(),
      interactPressed:
        Phaser.Input.Keyboard.JustDown(this.interact) ||
        this.virtualControls.consumeInteract() ||
        this.consumeDevInteract(),
      debugPressed: Phaser.Input.Keyboard.JustDown(this.debug),
    };
  }

  public setInteractionVisible(visible: boolean, label?: string): void {
    this.virtualControls.setInteractionVisible(visible, label);
  }

  public setDashReadyRatio(ratio: number): void {
    this.virtualControls.setDashReadyRatio(ratio);
  }

  public requestDevDash(): void {
    this.devDashRequested = true;
  }

  public requestDevInteract(): void {
    this.devInteractRequested = true;
  }

  public destroy(): void {
    this.virtualControls.destroy();
  }

  private consumeDevDash(): boolean {
    const requested = this.devDashRequested;
    this.devDashRequested = false;
    return requested;
  }

  private consumeDevInteract(): boolean {
    const requested = this.devInteractRequested;
    this.devInteractRequested = false;
    return requested;
  }
}
