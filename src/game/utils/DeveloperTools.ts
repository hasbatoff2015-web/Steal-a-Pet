import Phaser from 'phaser';

import type { PetId } from '../data/pets';

interface DeveloperActions {
  interact: () => void;
  dash: () => void;
  toPet: (petId: PetId) => void;
  toHome: () => void;
  toParkGate: () => void;
  catchActive: () => void;
  addMoney: (amount: number) => void;
  resetSave: () => void;
  getSnapshot: () => string;
}

export class DeveloperTools {
  private readonly toDog: Phaser.Input.Keyboard.Key;
  private readonly toCat: Phaser.Input.Keyboard.Key;
  private readonly toDelivery: Phaser.Input.Keyboard.Key;
  private readonly toGate: Phaser.Input.Keyboard.Key;
  private readonly catchActive: Phaser.Input.Keyboard.Key;
  private readonly resetSave: Phaser.Input.Keyboard.Key;
  private readonly panel: HTMLDivElement;
  private readonly stateOutput: HTMLOutputElement;

  public constructor(
    scene: Phaser.Scene,
    private readonly actions: DeveloperActions,
  ) {
    const keyboard = scene.input.keyboard;
    if (keyboard === null) {
      throw new Error('Keyboard input plugin is unavailable.');
    }

    this.toDog = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.toCat = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
    this.toDelivery = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.toGate = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    this.catchActive = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.resetSave = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F4);

    this.panel = document.createElement('div');
    this.panel.dataset.testid = 'dev-panel';
    this.panel.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:8px',
      'transform:translateX(-50%)',
      'display:flex',
      'flex-wrap:wrap',
      'justify-content:center',
      'gap:5px',
      'width:min(980px,calc(100% - 12px))',
      'z-index:9999',
      'font:700 11px Arial,sans-serif',
    ].join(';');

    this.stateOutput = document.createElement('output');
    this.stateOutput.dataset.testid = 'dev-state';
    this.stateOutput.style.cssText = [
      'background:#13243de8',
      'color:#fff',
      'padding:7px 9px',
      'border-radius:5px',
      'flex:1 1 100%',
      'text-align:center',
    ].join(';');

    this.panel.append(
      this.stateOutput,
      this.createButton('К СОБАКЕ', 'dev-to-dog', () => actions.toPet('dog')),
      this.createButton('К КОТУ', 'dev-to-cat', () => actions.toPet('cat')),
      this.createButton('К PARK', 'dev-to-gate', actions.toParkGate),
      this.createButton('+25', 'dev-add-money', () => actions.addMoney(25)),
      this.createButton('ДЕЙСТВИЕ', 'dev-interact', actions.interact),
      this.createButton('РЫВОК', 'dev-dash', actions.dash),
      this.createButton('ДОМОЙ', 'dev-home', actions.toHome),
      this.createButton('ПОЙМАТЬ', 'dev-catch', actions.catchActive),
      this.createButton('RESET SAVE', 'dev-reset-save', actions.resetSave),
    );

    document.body.append(this.panel);
  }

  public update(): void {
    this.stateOutput.textContent = this.actions.getSnapshot();

    if (Phaser.Input.Keyboard.JustDown(this.toDog)) {
      this.actions.toPet('dog');
    }
    if (Phaser.Input.Keyboard.JustDown(this.toCat)) {
      this.actions.toPet('cat');
    }
    if (Phaser.Input.Keyboard.JustDown(this.toDelivery)) {
      this.actions.toHome();
    }
    if (Phaser.Input.Keyboard.JustDown(this.toGate)) {
      this.actions.toParkGate();
    }
    if (Phaser.Input.Keyboard.JustDown(this.catchActive)) {
      this.actions.catchActive();
    }
    if (Phaser.Input.Keyboard.JustDown(this.resetSave)) {
      this.actions.resetSave();
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
      'padding:6px 8px',
      'cursor:pointer',
    ].join(';');
    button.addEventListener('click', action);
    return button;
  }
}
