import Phaser from 'phaser';

import { getPetDefinition, type PetId } from '../data/pets';

const SNAPSHOT_INTERVAL_MS = 250;

interface DeveloperActions {
  interact: () => void;
  dash: () => void;
  toPet: (petId: PetId) => void;
  toHome: () => void;
  toParkGate: () => void;
  toCentralHubGate: () => void;
  toRichDistrictGate: () => void;
  toVipEstateGate: () => void;
  toDragonCourtyard: () => void;
  toUpgradeStation: () => void;
  prepareVipPrerequisites: () => void;
  catchActive: (pursuerIndex: number) => void;
  deliverActive: () => void;
  cycleCatReturnTestPosition: () => void;
  addMoney: (amount: number) => void;
  resetMoney: () => void;
  resetSave: () => void;
  testV1Migration: () => void;
  getSnapshot: () => string;
  forceRoamingTired: (petId: PetId) => void;
  resetRoaming: (petId: PetId) => void;
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
  private nextSnapshotAt = 0;
  private lastSnapshot = '';

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
      this.createPetButton('dog', 'dev-to-dog', actions),
      this.createPetButton('cat', 'dev-to-cat', actions),
      this.createPetButton('fox', 'dev-to-fox', actions),
      this.createPetButton('peacock', 'dev-to-peacock', actions),
      this.createPetButton('panda', 'dev-to-panda', actions),
      this.createPetButton('vip-a', 'dev-to-vip-a', actions),
      this.createPetButton('vip-b', 'dev-to-vip-b', actions),
      this.createPetButton('dragon', 'dev-to-dragon', actions),
      ...(['roam-01', 'roam-02', 'roam-03', 'roam-04', 'roam-05', 'roam-06'] as const)
        .flatMap((petId) => [
          this.createPetButton(petId, `dev-to-${petId}`, actions),
          this.createButton(`TIRED ${petId.slice(-2)}`, `dev-tired-${petId}`, () => actions.forceRoamingTired(petId)),
          this.createButton(`RESET ${petId.slice(-2)}`, `dev-reset-${petId}`, () => actions.resetRoaming(petId)),
        ]),
      this.createButton('К PARK', 'dev-to-gate', actions.toParkGate),
      this.createButton('К HUB', 'dev-to-hub-gate', actions.toCentralHubGate),
      this.createButton('К RICH', 'dev-to-rich-gate', actions.toRichDistrictGate),
      this.createButton('К VIP GATE', 'dev-to-vip-gate', actions.toVipEstateGate),
      this.createButton('К DRAGON', 'dev-to-dragon-courtyard', actions.toDragonCourtyard),
      this.createButton('К UPGRADE', 'dev-to-upgrade', actions.toUpgradeStation),
      this.createButton('VIP PREREQS', 'dev-vip-prereqs', actions.prepareVipPrerequisites),
      this.createButton('+25', 'dev-add-money', () => actions.addMoney(25)),
      this.createButton('+75', 'dev-add-money-75', () => actions.addMoney(75)),
      this.createButton('+50', 'dev-add-money-50', () => actions.addMoney(50)),
      this.createButton('+200', 'dev-add-money-200', () => actions.addMoney(200)),
      this.createButton('+250', 'dev-add-money-250', () => actions.addMoney(250)),
      this.createButton('+800', 'dev-add-money-800', () => actions.addMoney(800)),
      this.createButton('+1400', 'dev-add-money-1400', () => actions.addMoney(1400)),
      this.createButton('+2800', 'dev-add-money-2800', () => actions.addMoney(2800)),
      this.createButton('0 МОНЕТ', 'dev-reset-money', actions.resetMoney),
      this.createButton('ДЕЙСТВИЕ', 'dev-interact', actions.interact),
      this.createButton('РЫВОК', 'dev-dash', actions.dash),
      this.createButton('ДОМОЙ', 'dev-home', actions.toHome),
      this.createButton('ПОЙМАТЬ OWNER', 'dev-catch', () => actions.catchActive(0)),
      this.createButton('ПОЙМАТЬ GUARD', 'dev-catch-guard', () => actions.catchActive(1)),
      this.createButton('ПОЙМАТЬ GUARD B', 'dev-catch-guard-b', () => actions.catchActive(2)),
      this.createButton('ДОСТАВИТЬ ACTIVE', 'dev-deliver-active', actions.deliverActive),
      this.createButton(
        'CAT RETURN POS',
        'dev-cat-return-position',
        actions.cycleCatReturnTestPosition,
      ),
      this.createButton('RESET SAVE', 'dev-reset-save', actions.resetSave),
      this.createButton('TEST V1 MIGRATION', 'dev-test-v1-migration', actions.testV1Migration),
    );

    document.body.append(this.panel);
  }

  public update(time: number): void {
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
      this.actions.catchActive(0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.resetSave)) {
      this.actions.resetSave();
    }

    if (time < this.nextSnapshotAt) {
      return;
    }

    this.nextSnapshotAt = time + SNAPSHOT_INTERVAL_MS;
    const snapshot = this.actions.getSnapshot();
    if (snapshot !== this.lastSnapshot) {
      this.lastSnapshot = snapshot;
      this.stateOutput.textContent = snapshot;
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

  private createPetButton(
    petId: PetId,
    testId: string,
    actions: DeveloperActions,
  ): HTMLButtonElement {
    return this.createButton(
      `ЦЕЛЬ: ${getPetDefinition(petId).displayName.toUpperCase()}`,
      testId,
      () => actions.toPet(petId),
    );
  }
}
