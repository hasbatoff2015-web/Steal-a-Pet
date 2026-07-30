import Phaser from 'phaser';

import { OwnerNpc } from '../entities/OwnerNpc';
import { Player } from '../entities/Player';

interface DeveloperActions {
  interact: () => void;
  dash: () => void;
  getSnapshot: () => string;
}

export class DeveloperTools {
  private readonly toPet: Phaser.Input.Keyboard.Key;
  private readonly toDelivery: Phaser.Input.Keyboard.Key;
  private readonly ownerToPlayer: Phaser.Input.Keyboard.Key;
  private readonly panel: HTMLDivElement;
  private readonly stateOutput: HTMLOutputElement;
  private readonly getSnapshot: () => string;

  public constructor(
    scene: Phaser.Scene,
    private readonly player: Player,
    private readonly owner: OwnerNpc,
    private readonly petHome: Phaser.Math.Vector2,
    private readonly deliveryPoint: Phaser.Math.Vector2,
    actions: DeveloperActions,
  ) {
    const keyboard = scene.input.keyboard;
    if (keyboard === null) {
      throw new Error('Keyboard input plugin is unavailable.');
    }

    this.toPet = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.toDelivery = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.ownerToPlayer = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.getSnapshot = actions.getSnapshot;

    this.panel = document.createElement('div');
    this.panel.dataset.testid = 'dev-panel';
    this.panel.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:8px',
      'transform:translateX(-50%)',
      'display:flex',
      'gap:6px',
      'z-index:9999',
      'font:700 12px Arial,sans-serif',
    ].join(';');

    this.stateOutput = document.createElement('output');
    this.stateOutput.dataset.testid = 'dev-state';
    this.stateOutput.style.cssText = [
      'background:#13243de8',
      'color:#fff',
      'padding:7px 9px',
      'border-radius:5px',
      'min-width:250px',
    ].join(';');

    this.panel.append(
      this.stateOutput,
      this.createButton('К ПИТОМЦУ', 'dev-to-pet', () => this.teleportToPet()),
      this.createButton('УКРАСТЬ', 'dev-interact', actions.interact),
      this.createButton('РЫВОК', 'dev-dash', actions.dash),
      this.createButton('ДОМОЙ', 'dev-home', () => this.teleportToDelivery()),
      this.createButton('ПОЙМАТЬ', 'dev-catch', () => this.teleportOwnerToPlayer()),
    );

    document.body.append(this.panel);
  }

  public update(): void {
    this.stateOutput.textContent = this.getSnapshot();

    if (Phaser.Input.Keyboard.JustDown(this.toPet)) {
      this.teleportToPet();
    }

    if (Phaser.Input.Keyboard.JustDown(this.toDelivery)) {
      this.teleportToDelivery();
    }

    if (Phaser.Input.Keyboard.JustDown(this.ownerToPlayer)) {
      this.teleportOwnerToPlayer();
    }
  }

  public destroy(): void {
    this.panel.remove();
  }

  private createButton(
    label: string,
    testId: string,
    action: () => void,
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.dataset.testid = testId;
    button.style.cssText = [
      'border:1px solid #d9c0ff',
      'border-radius:5px',
      'background:#60339c',
      'color:#fff',
      'padding:7px 9px',
      'cursor:pointer',
    ].join(';');
    button.addEventListener('click', action);
    return button;
  }

  private teleportToPet(): void {
    this.player.setPosition(this.petHome.x - 70, this.petHome.y);
  }

  private teleportToDelivery(): void {
    this.player.setPosition(this.deliveryPoint.x, this.deliveryPoint.y);
  }

  private teleportOwnerToPlayer(): void {
    this.owner.setPosition(this.player.x, this.player.y);
  }
}
