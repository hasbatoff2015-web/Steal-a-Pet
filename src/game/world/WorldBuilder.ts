import Phaser from 'phaser';

import { DEPTH, WORLD } from '../config/gameplay';
import { getPetDefinition } from '../data/pets';
import { SHORTCUT_DEFINITIONS, type ShortcutDefinition } from '../data/shortcuts';
import { PROTOTYPE_LAYOUT, type PrototypeWorldLayout } from '../data/worldLayout';
import {
  CENTRAL_HUB_GATE_DEFINITION,
  PARK_GATE_DEFINITION,
  RICH_DISTRICT_GATE_DEFINITION,
  VIP_ESTATE_GATE_DEFINITION,
} from '../data/zones';
import { DragonCourtyard } from './DragonCourtyard';
import { UpgradeStation } from './UpgradeStation';
import { ProgressShortcut } from './ProgressShortcut';
import { ZoneGate } from './ZoneGate';
import type { NavigationBlocker } from '../systems/ChaseNavigation';

export interface WorldBuildResult extends PrototypeWorldLayout {
  obstacles: Phaser.Physics.Arcade.StaticGroup;
  navigationBlockers: readonly NavigationBlocker[];
  parkGate: ZoneGate;
  centralHubGate: ZoneGate;
  richDistrictGate: ZoneGate;
  vipEstateGate: ZoneGate;
  dragonCourtyard: DragonCourtyard;
  upgradeStation: UpgradeStation;
  trackingStation: UpgradeStation;
  stealthStation: UpgradeStation;
  shortcuts: readonly ProgressShortcut[];
  roamingPenLabel: Phaser.GameObjects.Text;
  parkNavigationMarkerView: Phaser.GameObjects.Container;
  catNavigationMarkerView: Phaser.GameObjects.Container;
  centralHubMarkerView: Phaser.GameObjects.Container;
  foxNavigationMarkerView: Phaser.GameObjects.Container;
  richDistrictNavigationMarkerView: Phaser.GameObjects.Container;
  peacockNavigationMarkerView: Phaser.GameObjects.Container;
  pandaNavigationMarkerView: Phaser.GameObjects.Container;
  vipEstateNavigationMarkerView: Phaser.GameObjects.Container;
  vipANavigationMarkerView: Phaser.GameObjects.Container;
  vipBNavigationMarkerView: Phaser.GameObjects.Container;
  dragonNavigationMarkerView: Phaser.GameObjects.Container;
  upgradeNavigationMarkerView: Phaser.GameObjects.Container;
}

interface BuildingOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  roofColor: number;
  label: string;
}

export class WorldBuilder {
  private readonly obstacles: Phaser.Physics.Arcade.StaticGroup;
  private readonly navigationBlockers: NavigationBlocker[] = [];
  private navigationBlockerSequence = 0;

  public constructor(private readonly scene: Phaser.Scene) {
    this.obstacles = scene.physics.add.staticGroup();
  }

  public build(
    parkUnlocked: boolean,
    centralHubUnlocked: boolean,
    richDistrictUnlocked: boolean,
    vipEstateUnlocked: boolean,
    vipADelivered: boolean,
    vipBDelivered: boolean,
  ): WorldBuildResult {
    this.scene.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);

    this.drawZoneGrounds();
    this.drawRoads();
    this.drawExpandedWorld();
    this.drawRiverAndBridge();
    const parkGate = this.createParkGate();
    if (parkUnlocked) {
      parkGate.unlock(false);
    }
    const roamingPenLabel = this.drawPlayerBase();
    const upgradeStation = this.createUpgradeStation(
      PROTOTYPE_LAYOUT.upgradeStationPosition, 'MOBILITY', 0x4e8fe8,
    );
    const trackingStation = this.createUpgradeStation(
      PROTOTYPE_LAYOUT.trackingStationPosition, 'TRACKING', 0xffc84f,
    );
    const stealthStation = this.createUpgradeStation(
      PROTOTYPE_LAYOUT.stealthStationPosition, 'STEALTH', 0x9b78d1,
    );
    this.drawNpcBase();
    this.drawParkEnvironment();
    this.drawParkEncounter();
    this.drawParkBoundary();
    const centralHubGate = this.createCentralHubGate();
    if (centralHubUnlocked) {
      centralHubGate.unlock(false);
    }
    this.drawCentralHubEnvironment();
    this.drawCentralHubEncounter();
    this.drawRichDistrictBoundary();
    const richDistrictGate = this.createRichDistrictGate();
    if (richDistrictUnlocked) {
      richDistrictGate.unlock(false);
    }
    this.drawRichDistrictEnvironment();
    this.drawRichDistrictEncounters();
    this.drawVipEstateEnvironment();
    const vipEstateGate = this.createVipEstateGate();
    if (vipEstateUnlocked) {
      vipEstateGate.unlock(false);
    }
    const dragonCourtyard = this.drawDragonCourtyard();
    dragonCourtyard.setDeliveryState(vipADelivered, vipBDelivered, false);
    this.drawEnvironment();
    this.drawZoneLabels();
    const shortcuts = this.createProgressShortcuts();

    const playerPetSlots = new Map<string, Phaser.Math.Vector2>(
      Object.entries(PROTOTYPE_LAYOUT.playerPetSlots).map(([petId, point]) => [
        petId,
        new Phaser.Math.Vector2(point.x, point.y),
      ]),
    );

    return {
      obstacles: this.obstacles,
      navigationBlockers: this.navigationBlockers,
      playerSpawn: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.playerSpawn.x,
        PROTOTYPE_LAYOUT.playerSpawn.y,
      ),
      playerDeliveryZone: new Phaser.Geom.Rectangle(
        PROTOTYPE_LAYOUT.playerDeliveryZone.x,
        PROTOTYPE_LAYOUT.playerDeliveryZone.y,
        PROTOTYPE_LAYOUT.playerDeliveryZone.width,
        PROTOTYPE_LAYOUT.playerDeliveryZone.height,
      ),
      playerPetSlots,
      parkGatePosition: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.parkGatePosition.x,
        PROTOTYPE_LAYOUT.parkGatePosition.y,
      ),
      parkGateInteractionPoint: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.parkGateInteractionPoint.x,
        PROTOTYPE_LAYOUT.parkGateInteractionPoint.y,
      ),
      parkNavigationMarker: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.parkNavigationMarker.x,
        PROTOTYPE_LAYOUT.parkNavigationMarker.y,
      ),
      catNavigationMarker: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.catNavigationMarker.x,
        PROTOTYPE_LAYOUT.catNavigationMarker.y,
      ),
      centralHubMarker: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.centralHubMarker.x,
        PROTOTYPE_LAYOUT.centralHubMarker.y,
      ),
      centralHubGatePosition: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.centralHubGatePosition.x,
        PROTOTYPE_LAYOUT.centralHubGatePosition.y,
      ),
      centralHubGateInteractionPoint: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.centralHubGateInteractionPoint.x,
        PROTOTYPE_LAYOUT.centralHubGateInteractionPoint.y,
      ),
      foxNavigationMarker: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.foxNavigationMarker.x,
        PROTOTYPE_LAYOUT.foxNavigationMarker.y,
      ),
      richDistrictGatePosition: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.richDistrictGatePosition.x,
        PROTOTYPE_LAYOUT.richDistrictGatePosition.y,
      ),
      richDistrictGateInteractionPoint: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.richDistrictGateInteractionPoint.x,
        PROTOTYPE_LAYOUT.richDistrictGateInteractionPoint.y,
      ),
      richDistrictNavigationMarker: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.richDistrictNavigationMarker.x,
        PROTOTYPE_LAYOUT.richDistrictNavigationMarker.y,
      ),
      peacockNavigationMarker: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.peacockNavigationMarker.x,
        PROTOTYPE_LAYOUT.peacockNavigationMarker.y,
      ),
      pandaNavigationMarker: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.pandaNavigationMarker.x,
        PROTOTYPE_LAYOUT.pandaNavigationMarker.y,
      ),
      vipEstateGatePosition: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.vipEstateGatePosition.x,
        PROTOTYPE_LAYOUT.vipEstateGatePosition.y,
      ),
      vipEstateGateInteractionPoint: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.vipEstateGateInteractionPoint.x,
        PROTOTYPE_LAYOUT.vipEstateGateInteractionPoint.y,
      ),
      vipEstateNavigationMarker: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.vipEstateNavigationMarker.x,
        PROTOTYPE_LAYOUT.vipEstateNavigationMarker.y,
      ),
      vipANavigationMarker: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.vipANavigationMarker.x,
        PROTOTYPE_LAYOUT.vipANavigationMarker.y,
      ),
      vipBNavigationMarker: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.vipBNavigationMarker.x,
        PROTOTYPE_LAYOUT.vipBNavigationMarker.y,
      ),
      dragonNavigationMarker: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.dragonNavigationMarker.x,
        PROTOTYPE_LAYOUT.dragonNavigationMarker.y,
      ),
      upgradeNavigationMarker: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.upgradeNavigationMarker.x,
        PROTOTYPE_LAYOUT.upgradeNavigationMarker.y,
      ),
      upgradeStationPosition: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.upgradeStationPosition.x,
        PROTOTYPE_LAYOUT.upgradeStationPosition.y,
      ),
      trackingStationPosition: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.trackingStationPosition.x,
        PROTOTYPE_LAYOUT.trackingStationPosition.y,
      ),
      stealthStationPosition: new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.stealthStationPosition.x,
        PROTOTYPE_LAYOUT.stealthStationPosition.y,
      ),
      parkGate,
      centralHubGate,
      richDistrictGate,
      vipEstateGate,
      dragonCourtyard,
      upgradeStation,
      trackingStation,
      stealthStation,
      shortcuts,
      roamingPenLabel,
      parkNavigationMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.parkNavigationMarker,
        'PARK · 25 МОНЕТ',
        0xffd43b,
      ),
      catNavigationMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.catNavigationMarker,
        `ЦЕЛЬ: ${getPetDefinition('cat').displayName.toUpperCase()}`,
        0xc997ff,
      ),
      centralHubMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.centralHubMarker,
        'CENTRAL HUB · 120 МОНЕТ',
        0x71d8ff,
      ),
      foxNavigationMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.foxNavigationMarker,
        `ЦЕЛЬ: ${getPetDefinition('fox').displayName.toUpperCase()}`,
        0xff9d45,
      ),
      richDistrictNavigationMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.richDistrictNavigationMarker,
        'RICH DISTRICT · 600 МОНЕТ',
        0xffd36f,
      ),
      peacockNavigationMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.peacockNavigationMarker,
        `ЦЕЛЬ: ${getPetDefinition('peacock').displayName.toUpperCase()}`,
        0x42d7dc,
      ),
      pandaNavigationMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.pandaNavigationMarker,
        `ЦЕЛЬ: ${getPetDefinition('panda').displayName.toUpperCase()}`,
        0xf1f0e8,
      ),
      vipEstateNavigationMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.vipEstateNavigationMarker,
        'VIP ESTATE · 2800 МОНЕТ',
        0xe5b8ff,
      ),
      vipANavigationMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.vipANavigationMarker,
        `VIP: ${getPetDefinition('vip-a').displayName.toUpperCase()}`,
        0xffd75d,
      ),
      vipBNavigationMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.vipBNavigationMarker,
        `VIP: ${getPetDefinition('vip-b').displayName.toUpperCase()}`,
        0xd8b8ff,
      ),
      dragonNavigationMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.dragonNavigationMarker,
        `ФИНАЛ: ${getPetDefinition('dragon').displayName.toUpperCase()}`,
        0xffd85e,
      ),
      upgradeNavigationMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.upgradeNavigationMarker,
        'MOBILITY UPGRADES',
        0x76e69b,
      ),
    };
  }

  private drawZoneGrounds(): void {
    const graphics = this.scene.add.graphics().setDepth(DEPTH.ground);

    graphics.fillStyle(0x8bd067);
    graphics.fillRect(0, 0, WORLD.width, WORLD.height);

    graphics.fillStyle(0x9adc72);
    graphics.fillRect(0, 1100, 1850, 1460);

    graphics.fillStyle(0x70c979);
    graphics.fillRect(0, 0, 1680, 900);

    graphics.fillStyle(0xf0d077);
    graphics.fillRect(1650, 350, 1000, 1860);

    graphics.fillStyle(0x9bded0);
    graphics.fillRect(2500, 850, 1340, 1710);

    graphics.fillStyle(0xc9a9ea);
    graphics.fillRect(2700, 0, 1140, 920);

    graphics.lineStyle(8, 0xffffff, 0.22);
    graphics.strokeRect(18, 18, WORLD.width - 36, WORLD.height - 36);
  }

  private drawExpandedWorld(): void {
    const ground = this.scene.add.graphics().setDepth(DEPTH.ground + 1);
    // The added space is split into small renderable regions rather than one world-sized texture.
    for (let x = 0; x < WORLD.width; x += 768) {
      for (let y = 0; y < WORLD.height; y += 768) {
        if (x < 3840 && y < 2560) continue;
        ground.fillStyle((x / 768 + y / 768) % 2 === 0 ? 0x8fd26c : 0x88cb68, 1);
        ground.fillRect(x, y, Math.min(768, WORLD.width - x), Math.min(768, WORLD.height - y));
      }
    }
    ground.fillStyle(0x9adc72, 0.96); ground.fillRoundedRect(930, 2240, 900, 760, 50);
    ground.fillStyle(0x75cdd0, 0.5); ground.fillRoundedRect(1660, 2190, 1380, 810, 50);
    ground.fillStyle(0xb8e38d, 0.96); ground.fillRoundedRect(3040, 1500, 1500, 1500, 50);
    ground.fillStyle(0xcab2e5, 0.92); ground.fillRoundedRect(2960, 0, 1580, 1510, 50);

    const roads = this.scene.add.graphics().setDepth(DEPTH.ground + 3);
    roads.lineStyle(116, 0xe8caa0, 1);
    roads.strokePoints([
      new Phaser.Math.Vector2(700, 2440), new Phaser.Math.Vector2(1450, 2700),
      new Phaser.Math.Vector2(2350, 2730), new Phaser.Math.Vector2(3300, 2600),
      new Phaser.Math.Vector2(4200, 2300), new Phaser.Math.Vector2(4380, 1500),
      new Phaser.Math.Vector2(3820, 1180), new Phaser.Math.Vector2(3350, 900),
    ], false, false);
    roads.lineStyle(58, 0xf8e5c5, 1);
    roads.strokePoints([
      new Phaser.Math.Vector2(700, 2440), new Phaser.Math.Vector2(1450, 2700),
      new Phaser.Math.Vector2(2350, 2730), new Phaser.Math.Vector2(3300, 2600),
      new Phaser.Math.Vector2(4200, 2300), new Phaser.Math.Vector2(4380, 1500),
      new Phaser.Math.Vector2(3820, 1180), new Phaser.Math.Vector2(3350, 900),
    ], false, false);

    for (const territory of [
      { x: 1030, y: 2320, w: 700, h: 590, label: 'STARTER OUTSKIRTS', color: 0xffe477 },
      { x: 120, y: 90, w: 1460, h: 690, label: 'PARK NORTH GROVE', color: 0x79d58d },
      { x: 1740, y: 500, w: 1190, h: 890, label: 'CENTRAL MARKET BACKSTREETS', color: 0xffc66d },
      { x: 1690, y: 2200, w: 1320, h: 780, label: 'SOUTH CANAL PROMENADE', color: 0x74d6e8 },
      { x: 3060, y: 1520, w: 1410, h: 1390, label: 'RICH GARDENS', color: 0xf5df82 },
      { x: 3010, y: 900, w: 1490, h: 610, label: 'VIP APPROACH · OUTER GROUNDS', color: 0xd4b5ed },
    ] as const) {
      ground.lineStyle(6, territory.color, 0.66);
      ground.strokeRoundedRect(territory.x, territory.y, territory.w, territory.h, 34);
      this.scene.add.text(territory.x + 22, territory.y + 18, territory.label, {
        fontFamily: 'Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#17324b',
        backgroundColor: '#ffffffb8', padding: { x: 8, y: 4 },
      }).setDepth(DEPTH.groundLabels).setAlpha(0.8);
    }

    for (const [x, y, color] of [
      [1250, 2520, 0x4f9e57], [1560, 2850, 0x4f9e57], [1830, 2860, 0x54a36c],
      [2110, 2390, 0x62b5c1], [2740, 2780, 0x62b5c1], [3270, 2820, 0x4b9e55],
      [3700, 2550, 0x4b9e55], [4280, 2700, 0x4b9e55], [3200, 1160, 0x7e62a5],
      [4050, 1280, 0x7e62a5], [4450, 1700, 0x4b9e55],
    ] as const) {
      this.scene.add.circle(x, y, 34, color, 0.9).setStrokeStyle(6, 0xffffff, 0.35).setDepth(y);
    }
  }

  private createProgressShortcuts(): readonly ProgressShortcut[] {
    return [
      this.createProgressShortcut(SHORTCUT_DEFINITIONS[0]!, 1530, 900, false),
      this.createProgressShortcut(SHORTCUT_DEFINITIONS[1]!, 2460, 2050, true),
      this.createProgressShortcut(SHORTCUT_DEFINITIONS[2]!, 3860, 1515, true),
      this.createProgressShortcut(SHORTCUT_DEFINITIONS[3]!, 4140, 885, true),
    ];
  }

  private createProgressShortcut(
    definition: ShortcutDefinition,
    x: number,
    y: number,
    horizontal: boolean,
  ): ProgressShortcut {
    const width = horizontal ? 180 : 38;
    const height = horizontal ? 38 : 180;
    const barrier = this.addInvisibleObstacle(x - width / 2, y - height / 2, width, height);
    const bar = this.scene.add.rectangle(x, y, width, height, 0x52616d, 0.94)
      .setStrokeStyle(5, 0xf4db75, 0.9).setDepth(y + 2);
    const label = this.scene.add.text(x, y - height / 2 - 18, `${definition.displayName}\nЗАКРЫТО`, {
      align: 'center', fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold',
      color: '#f7f1d0', backgroundColor: '#35424dde', padding: { x: 6, y: 3 },
    }).setOrigin(0.5, 1).setDepth(y + 3);
    return new ProgressShortcut(definition, barrier, [bar], label);
  }

  private drawRoads(): void {
    const graphics = this.scene.add.graphics().setDepth(DEPTH.ground + 2);

    graphics.lineStyle(180, 0xb9946c, 1);
    graphics.strokePoints(
      [
        new Phaser.Math.Vector2(680, 2240),
        new Phaser.Math.Vector2(930, 2070),
        new Phaser.Math.Vector2(1120, 1810),
        new Phaser.Math.Vector2(1450, 1640),
        new Phaser.Math.Vector2(1760, 1460),
        new Phaser.Math.Vector2(2320, 1460),
        new Phaser.Math.Vector2(3100, 1340),
      ],
      false,
      false,
    );

    graphics.lineStyle(118, 0xe2c39d, 1);
    graphics.strokePoints(
      [
        new Phaser.Math.Vector2(680, 2240),
        new Phaser.Math.Vector2(930, 2070),
        new Phaser.Math.Vector2(1120, 1810),
        new Phaser.Math.Vector2(1450, 1640),
        new Phaser.Math.Vector2(1760, 1460),
        new Phaser.Math.Vector2(2320, 1460),
        new Phaser.Math.Vector2(3100, 1340),
      ],
      false,
      false,
    );

    graphics.lineStyle(135, 0xb9946c, 1);
    graphics.strokePoints(
      [
        new Phaser.Math.Vector2(900, 1640),
        new Phaser.Math.Vector2(900, 930),
        new Phaser.Math.Vector2(1120, 660),
        new Phaser.Math.Vector2(2050, 820),
        new Phaser.Math.Vector2(2800, 540),
      ],
      false,
      false,
    );

    graphics.lineStyle(82, 0xe2c39d, 1);
    graphics.strokePoints(
      [
        new Phaser.Math.Vector2(900, 1640),
        new Phaser.Math.Vector2(900, 930),
        new Phaser.Math.Vector2(1120, 660),
        new Phaser.Math.Vector2(2050, 820),
        new Phaser.Math.Vector2(2800, 540),
      ],
      false,
      false,
    );
  }

  private drawRiverAndBridge(): void {
    const water = this.scene.add.graphics().setDepth(DEPTH.ground + 3);
    water.fillStyle(0x4eb8df);
    water.fillRoundedRect(0, 900, 1680, 210, 24);

    water.lineStyle(5, 0xa9e8fa, 0.65);
    for (let x = 40; x < 1640; x += 170) {
      water.beginPath();
      water.moveTo(x, 955);
      water.lineTo(x + 80, 945);
      water.lineTo(x + 130, 960);
      water.strokePath();
    }

    this.addInvisibleObstacle(0, 900, 770, 210);
    this.addInvisibleObstacle(1030, 900, 650, 210);

    const bridge = this.scene.add.graphics().setDepth(DEPTH.ground + 5);
    bridge.fillStyle(0x6f4f36);
    bridge.fillRoundedRect(770, 875, 260, 260, 12);
    bridge.fillStyle(0xd6a76a);
    bridge.fillRect(792, 875, 216, 260);
    bridge.lineStyle(5, 0x8f653f, 0.8);

    for (let y = 890; y <= 1120; y += 30) {
      bridge.lineBetween(792, y, 1008, y);
    }

    this.scene.add
      .text(900, 880, 'МОСТ В PARK', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#4f321d',
        backgroundColor: '#fff1c7dd',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.groundLabels);
  }

  private createParkGate(): ZoneGate {
    const { x, y } = PROTOTYPE_LAYOUT.parkGatePosition;
    const leftPost = this.scene.add
      .rectangle(x - 102, y, 28, 82, 0x315f4c)
      .setStrokeStyle(4, 0xe8ffdd, 0.9)
      .setDepth(y + 2);
    const rightPost = this.scene.add
      .rectangle(x + 102, y, 28, 82, 0x315f4c)
      .setStrokeStyle(4, 0xe8ffdd, 0.9)
      .setDepth(y + 2);
    const crossbar = this.scene.add
      .rectangle(x, y, 214, 28, 0xe75555)
      .setStrokeStyle(4, 0xffffff, 0.9)
      .setDepth(y + 3);

    const statusLabel = this.scene.add
      .text(x, y - 67, 'PARK\n25 МОНЕТ', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#5a241e',
        backgroundColor: '#fff4cdeb',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(y + 4);

    const barrier = this.addInvisibleObstacle(x - 120, y - 20, 240, 40);
    return new ZoneGate(
      this.scene,
      PARK_GATE_DEFINITION,
      new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.parkGateInteractionPoint.x,
        PROTOTYPE_LAYOUT.parkGateInteractionPoint.y,
      ),
      barrier,
      [leftPost, rightPost, crossbar],
      statusLabel,
    );
  }

  private createUpgradeStation(
    position: Readonly<{ x: number; y: number }>,
    branchLabel: string,
    accentColor: number,
  ): UpgradeStation {
    const { x, y } = position;
    const highlight = this.scene.add
      .circle(x, y + 18, 72, 0x8290a0, 0.12)
      .setStrokeStyle(3, 0x8290a0, 0.5)
      .setDepth(y - 3);
    this.scene.add
      .ellipse(x + 8, y + 24, 118, 36, 0x18324a, 0.2)
      .setDepth(y - 2);
    const bench = this.scene.add
      .rectangle(x, y, 112, 54, 0x99633e)
      .setStrokeStyle(6, 0xffd793, 0.92)
      .setDepth(y);
    this.addStaticObstacle(bench);
    this.scene.add
      .rectangle(x - 34, y - 34, 16, 42, accentColor)
      .setStrokeStyle(3, 0xffffff, 0.7)
      .setDepth(y + 1);
    this.scene.add
      .rectangle(x + 34, y - 28, 30, 28, 0x76e69b)
      .setStrokeStyle(3, 0xffffff, 0.7)
      .setDepth(y + 1);

    const statusLabel = this.scene.add
      .text(x, y - 82, `${branchLabel}\nОТКРОЕТСЯ ПОЗЖЕ`, {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#4c5260',
        backgroundColor: '#eef1f4db',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(y + 2);

    return new UpgradeStation(
      new Phaser.Math.Vector2(x, y + 72),
      statusLabel,
      highlight,
    );
  }

  private createCentralHubGate(): ZoneGate {
    const { x, y } = PROTOTYPE_LAYOUT.centralHubGatePosition;
    const upperPost = this.scene.add
      .rectangle(x, y - 92, 38, 46, 0x355f78)
      .setStrokeStyle(5, 0xffffff, 0.78)
      .setDepth(y - 40);
    const lowerPost = this.scene.add
      .rectangle(x, y + 92, 38, 46, 0x355f78)
      .setStrokeStyle(5, 0xffffff, 0.78)
      .setDepth(y + 115);
    const crossbar = this.scene.add
      .rectangle(x, y, 28, 164, 0xe75555)
      .setStrokeStyle(4, 0xffffff, 0.9)
      .setDepth(y + 3);
    const statusLabel = this.scene.add
      .text(x + 108, y - 6, 'CENTRAL HUB\n120 МОНЕТ', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#173f56',
        backgroundColor: '#e5f8ffed',
        padding: { x: 11, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(y + 4);

    const barrier = this.addInvisibleObstacle(x - 20, y - 95, 40, 190);
    return new ZoneGate(
      this.scene,
      CENTRAL_HUB_GATE_DEFINITION,
      new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.centralHubGateInteractionPoint.x,
        PROTOTYPE_LAYOUT.centralHubGateInteractionPoint.y,
      ),
      barrier,
      [upperPost, lowerPost, crossbar],
      statusLabel,
    );
  }

  private drawPlayerBase(): Phaser.GameObjects.Text {
    const yard = this.scene.add.graphics().setDepth(DEPTH.ground + 4);
    yard.fillStyle(0xdff4af, 0.92);
    yard.fillRoundedRect(170, 1840, 950, 1080, 42);
    yard.lineStyle(12, 0x4a9c68, 0.95);
    yard.strokeRoundedRect(170, 1840, 950, 1080, 42);

    this.addBuilding({
      x: 410,
      y: 2020,
      width: 320,
      height: 220,
      color: 0xfff1b8,
      roofColor: 0xef6f6c,
      label: 'ДОМ',
    });

    const delivery = this.scene.add.graphics().setDepth(DEPTH.ground + 6);
    const zone = PROTOTYPE_LAYOUT.playerDeliveryZone;
    delivery.fillStyle(0x64d98b, 0.35);
    delivery.fillRoundedRect(zone.x, zone.y, zone.width, zone.height, 24);
    delivery.lineStyle(8, 0xffffff, 0.9);
    delivery.strokeRoundedRect(zone.x, zone.y, zone.width, zone.height, 24);

    this.scene.add
      .text(zone.x + zone.width / 2, zone.y + 26, 'МОЯ БАЗА\nДОСТАВКА', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '21px',
        fontStyle: 'bold',
        color: '#185938',
      })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH.groundLabels);

    const pen = this.scene.add.graphics().setDepth(DEPTH.ground + 5);
    pen.fillStyle(0xaee6a5, 0.78);
    pen.fillRoundedRect(250, 2430, 360, 300, 28);
    pen.lineStyle(8, 0x5b9a52, 0.94);
    pen.strokeRoundedRect(250, 2430, 360, 300, 28);
    const penLabel = this.scene.add.text(430, 2460, 'СВОБОДНЫЙ ЗАГОН · 0/6', {
      fontFamily: 'Arial, sans-serif', fontSize: '17px', fontStyle: 'bold',
      color: '#255d31', backgroundColor: '#f3ffe0dd', padding: { x: 9, y: 5 },
    }).setOrigin(0.5).setDepth(DEPTH.groundLabels);
    return penLabel;
  }

  private drawNpcBase(): void {
    const yard = this.scene.add.graphics().setDepth(DEPTH.ground + 4);
    yard.fillStyle(0xffd7cf, 0.95);
    yard.fillRoundedRect(1230, 1200, 650, 570, 38);
    yard.lineStyle(12, 0xd66562, 0.9);
    yard.strokeRoundedRect(1230, 1200, 650, 570, 38);

    this.addBuilding({
      x: 1490,
      y: 1370,
      width: 330,
      height: 230,
      color: 0xffd9bd,
      roofColor: 0xb95056,
      label: 'ЧУЖОЙ ДОМ',
    });

    this.scene.add
      .text(1555, 1718, 'ЧУЖАЯ БАЗА', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#8b3034',
        backgroundColor: '#fff4ecdd',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.groundLabels);
  }

  private drawParkEnvironment(): void {
    const paths = this.scene.add.graphics().setDepth(DEPTH.ground + 4);
    paths.lineStyle(70, 0xc6a879, 1);
    paths.strokePoints(
      [
        new Phaser.Math.Vector2(900, 875),
        new Phaser.Math.Vector2(980, 720),
        new Phaser.Math.Vector2(1180, 610),
        new Phaser.Math.Vector2(1420, 590),
      ],
      false,
      false,
    );
    paths.lineStyle(42, 0xead5a5, 1);
    paths.strokePoints(
      [
        new Phaser.Math.Vector2(900, 875),
        new Phaser.Math.Vector2(980, 720),
        new Phaser.Math.Vector2(1180, 610),
        new Phaser.Math.Vector2(1420, 590),
      ],
      false,
      false,
    );

    const pond = this.scene.add.graphics().setDepth(DEPTH.ground + 5);
    pond.fillStyle(0x4eb8df, 0.95);
    pond.fillEllipse(430, 500, 300, 180);
    pond.lineStyle(9, 0xa9e8fa, 0.75);
    pond.strokeEllipse(430, 500, 300, 180);
    pond.lineStyle(4, 0xe7fbff, 0.6);
    pond.strokeEllipse(430, 500, 220, 105);
    this.addInvisibleObstacle(295, 425, 270, 145);

    this.addBench(760, 470, 0);
    this.addBench(875, 350, Math.PI / 2);
    this.addBench(660, 720, 0);

    this.scene.add
      .text(450, 650, 'ПРУД', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#18516b',
        backgroundColor: '#dff8ffcc',
        padding: { x: 9, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.groundLabels);
  }

  private drawParkEncounter(): void {
    const yard = this.scene.add.graphics().setDepth(DEPTH.ground + 5);
    yard.fillStyle(0xc9efaa, 0.88);
    yard.fillRoundedRect(1090, 390, 500, 360, 34);
    yard.lineStyle(8, 0x4c955c, 0.9);
    yard.strokeRoundedRect(1090, 390, 500, 360, 34);

    this.addBuilding({
      x: 1220,
      y: 475,
      width: 220,
      height: 120,
      color: 0xffedb6,
      roofColor: 0x5e9b63,
      label: 'ПАВИЛЬОН',
    });

    this.scene.add
      .text(1400, 430, 'ПАРКОВАЯ\nПЛОЩАДКА', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#27643b',
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.groundLabels);
  }

  private drawParkBoundary(): void {
    const hedge = this.scene.add.graphics().setDepth(DEPTH.ground + 8);
    hedge.fillStyle(0x397f4c, 0.98);
    hedge.fillRoundedRect(1640, 0, 70, 555, 22);
    hedge.fillRoundedRect(1640, 745, 70, WORLD.height - 745, 22);
    hedge.lineStyle(6, 0x69ba63, 0.95);
    hedge.strokeRoundedRect(1640, 0, 70, 555, 22);
    hedge.strokeRoundedRect(1640, 745, 70, WORLD.height - 745, 22);

    this.addInvisibleObstacle(1640, 0, 70, 555);
    this.addInvisibleObstacle(1640, 745, 70, WORLD.height - 745);
  }

  private drawCentralHubEnvironment(): void {
    const paths = this.scene.add.graphics().setDepth(DEPTH.ground + 4);
    paths.lineStyle(150, 0xb58f69, 1);
    paths.strokePoints(
      [
        new Phaser.Math.Vector2(1710, 650),
        new Phaser.Math.Vector2(1910, 720),
        new Phaser.Math.Vector2(2050, 900),
        new Phaser.Math.Vector2(2260, 1110),
        new Phaser.Math.Vector2(2320, 1640),
      ],
      false,
      false,
    );
    paths.lineStyle(104, 0xf2ddb5, 1);
    paths.strokePoints(
      [
        new Phaser.Math.Vector2(1710, 650),
        new Phaser.Math.Vector2(1910, 720),
        new Phaser.Math.Vector2(2050, 900),
        new Phaser.Math.Vector2(2260, 1110),
        new Phaser.Math.Vector2(2320, 1640),
      ],
      false,
      false,
    );

    const plaza = this.scene.add.graphics().setDepth(DEPTH.ground + 5);
    plaza.fillStyle(0xf7e6bc, 0.96);
    plaza.fillCircle(2110, 1060, 260);
    plaza.lineStyle(12, 0xc69d6e, 0.9);
    plaza.strokeCircle(2110, 1060, 260);
    plaza.fillStyle(0x55b9dc, 0.98);
    plaza.fillCircle(2110, 1060, 104);
    plaza.lineStyle(10, 0xe9fbff, 0.86);
    plaza.strokeCircle(2110, 1060, 104);
    plaza.fillStyle(0xffe18b, 1);
    plaza.fillCircle(2110, 1060, 26);
    this.addInvisibleObstacle(2020, 970, 180, 180);

    this.scene.add
      .text(2110, 1060, '⛲', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '38px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(1120);

    this.addBuilding({
      x: 2210,
      y: 520,
      width: 280,
      height: 150,
      color: 0xffefc7,
      roofColor: 0xd26c54,
      label: 'КАФЕ',
    });
    this.addBuilding({
      x: 2480,
      y: 830,
      width: 260,
      height: 170,
      color: 0xdff5ff,
      roofColor: 0x428aaf,
      label: 'МАГАЗИН',
    });
    this.addBuilding({
      x: 1870,
      y: 1550,
      width: 230,
      height: 190,
      color: 0xffe5ae,
      roofColor: 0xbf7a38,
      label: 'ПОЧТА',
    });

    for (const [x, y] of [
      [1810, 790],
      [1910, 1190],
      [2320, 1140],
      [2480, 1320],
    ] as const) {
      this.scene.add.rectangle(x, y, 12, 68, 0x354c5e).setDepth(y);
      this.scene.add
        .circle(x, y - 38, 14, 0xffe99a, 0.95)
        .setStrokeStyle(4, 0xffffff, 0.65)
        .setDepth(y + 1);
    }

    for (const [x, y, color] of [
      [1830, 950, 0xff7f9e],
      [2400, 1030, 0x7bdc86],
      [2020, 1310, 0x8d7cff],
    ] as const) {
      this.scene.add
        .ellipse(x, y, 118, 46, color, 0.85)
        .setStrokeStyle(5, 0xffffff, 0.65)
        .setDepth(y);
    }
  }

  private drawCentralHubEncounter(): void {
    const yard = this.scene.add.graphics().setDepth(DEPTH.ground + 5);
    yard.fillStyle(0xffdda3, 0.88);
    yard.fillRoundedRect(2100, 1450, 500, 390, 34);
    yard.lineStyle(8, 0xc77a38, 0.9);
    yard.strokeRoundedRect(2100, 1450, 500, 390, 34);

    this.addBuilding({
      x: 2420,
      y: 1505,
      width: 270,
      height: 120,
      color: 0xffeed2,
      roofColor: 0xc75c45,
      label: 'ТЕРРАСА',
    });

    this.scene.add
      .text(2195, 1490, 'ГОРОДСКОЙ\nДВОРИК', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#74401d',
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.groundLabels);
  }

  private drawRichDistrictBoundary(): void {
    const boundary = this.scene.add.graphics().setDepth(DEPTH.ground + 9);
    boundary.fillStyle(0x365f58, 0.98);
    boundary.fillRect(2630, 0, 66, 1320);
    boundary.fillRect(2630, 1600, 66, WORLD.height - 1600);
    boundary.lineStyle(6, 0xd9c47c, 0.9);
    boundary.lineBetween(2633, 0, 2633, 1320);
    boundary.lineBetween(2693, 0, 2693, 1320);
    boundary.lineBetween(2633, 1600, 2633, WORLD.height);
    boundary.lineBetween(2693, 1600, 2693, WORLD.height);
    this.addInvisibleObstacle(2630, 0, 66, 1320);
    this.addInvisibleObstacle(2630, 1600, 66, WORLD.height - 1600);

    const vipBoundary = this.scene.add.graphics().setDepth(DEPTH.ground + 9);
    vipBoundary.fillStyle(0x66478f, 0.98);
    vipBoundary.fillRect(2696, 820, 524, 54);
    vipBoundary.fillRect(3480, 820, WORLD.width - 3480, 54);
    vipBoundary.lineStyle(5, 0xe3c3ff, 0.9);
    vipBoundary.lineBetween(2696, 823, 3220, 823);
    vipBoundary.lineBetween(3480, 823, WORLD.width, 823);
    vipBoundary.lineBetween(2696, 871, 3220, 871);
    vipBoundary.lineBetween(3480, 871, WORLD.width, 871);
    this.addInvisibleObstacle(2696, 820, 524, 54);
    this.addInvisibleObstacle(3480, 820, WORLD.width - 3480, 54);
  }

  private createRichDistrictGate(): ZoneGate {
    const { x, y } = PROTOTYPE_LAYOUT.richDistrictGatePosition;
    const upperPost = this.scene.add
      .rectangle(x, y - 112, 44, 66, 0xf0d37b)
      .setStrokeStyle(6, 0xffffff, 0.88)
      .setDepth(y - 68);
    const lowerPost = this.scene.add
      .rectangle(x, y + 112, 44, 66, 0xf0d37b)
      .setStrokeStyle(6, 0xffffff, 0.88)
      .setDepth(y + 150);
    const crossbar = this.scene.add
      .rectangle(x, y, 30, 218, 0xd95755)
      .setStrokeStyle(5, 0xffffff, 0.9)
      .setDepth(y + 3);
    const statusLabel = this.scene.add
      .text(x - 142, y, 'RICH DISTRICT\nНУЖНЫ ЛИСА И БЫСТРЫЙ РЫВОК', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#4c5260',
        backgroundColor: '#eef1f4e8',
        padding: { x: 11, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(y + 4);
    const barrier = this.addInvisibleObstacle(x - 20, y - 125, 40, 250);

    return new ZoneGate(
      this.scene,
      RICH_DISTRICT_GATE_DEFINITION,
      new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.richDistrictGateInteractionPoint.x,
        PROTOTYPE_LAYOUT.richDistrictGateInteractionPoint.y,
      ),
      barrier,
      [upperPost, lowerPost, crossbar],
      statusLabel,
    );
  }

  private drawRichDistrictEnvironment(): void {
    const stone = this.scene.add.graphics().setDepth(DEPTH.ground + 4);
    stone.fillStyle(0xe8dfbd, 0.84);
    stone.fillRoundedRect(2700, 900, 1100, 1600, 42);
    stone.lineStyle(12, 0xd1b668, 0.72);
    stone.strokeRoundedRect(2700, 900, 1100, 1600, 42);
    stone.lineStyle(180, 0xbca777, 1);
    stone.strokePoints(
      [
        new Phaser.Math.Vector2(2700, 1460),
        new Phaser.Math.Vector2(2960, 1460),
        new Phaser.Math.Vector2(3260, 1510),
        new Phaser.Math.Vector2(3500, 1700),
        new Phaser.Math.Vector2(3660, 2050),
      ],
      false,
      false,
    );
    stone.lineStyle(116, 0xf7edcf, 1);
    stone.strokePoints(
      [
        new Phaser.Math.Vector2(2700, 1460),
        new Phaser.Math.Vector2(2960, 1460),
        new Phaser.Math.Vector2(3260, 1510),
        new Phaser.Math.Vector2(3500, 1700),
        new Phaser.Math.Vector2(3660, 2050),
      ],
      false,
      false,
    );

    for (const [x, y] of [
      [2780, 1320],
      [2910, 1320],
      [3040, 1390],
      [3260, 1410],
      [3460, 1550],
      [3650, 1760],
    ] as const) {
      this.scene.add.image(x, y, 'rich-lamp').setDepth(y);
    }
    for (const [x, y, flip] of [
      [2800, 1020, false],
      [3370, 1010, true],
      [2830, 2360, true],
      [3650, 2390, false],
    ] as const) {
      this.scene.add.image(x, y, 'rich-car').setFlipX(flip).setDepth(y);
    }
    for (const [x, y] of [
      [2830, 1570],
      [3100, 1550],
      [3380, 1510],
      [3540, 1630],
    ] as const) {
      this.scene.add.image(x, y, 'rich-flowerbed').setDepth(y);
    }
  }

  private drawRichDistrictEncounters(): void {
    const estateA = this.scene.add.graphics().setDepth(DEPTH.ground + 5);
    estateA.fillStyle(0xd9f1ae, 0.95);
    estateA.fillRoundedRect(2790, 930, 610, 430, 32);
    estateA.lineStyle(9, 0x4d9660, 0.92);
    estateA.strokeRoundedRect(2790, 930, 610, 430, 32);
    this.addBuilding({
      x: 2865,
      y: 1015,
      width: 125,
      height: 110,
      color: 0xfffbec,
      roofColor: 0xd8b957,
      label: 'ESTATE A',
    });
    const fountain = this.scene.add
      .circle(3090, 1260, 66, 0x65c7df, 0.96)
      .setStrokeStyle(10, 0xffffff, 0.85)
      .setDepth(1260);
    this.addStaticObstacle(fountain);
    this.scene.add.circle(3090, 1260, 20, 0xf4d16e).setDepth(1261);
    for (const [x, y] of [
      [2860, 1365],
      [2960, 1365],
      [3260, 1365],
      [3360, 1365],
      [3400, 1010],
    ] as const) {
      this.scene.add.image(x, y, 'rich-hedge').setDepth(y);
    }
    this.scene.add
      .text(3110, 970, 'ESTATE A · ПАВЛИН', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#27643b',
        backgroundColor: '#f7ffe5dd',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.groundLabels);

    const estateB = this.scene.add.graphics().setDepth(DEPTH.ground + 5);
    estateB.fillStyle(0xc8e99e, 0.96);
    estateB.fillRoundedRect(3090, 1650, 690, 800, 34);
    estateB.lineStyle(10, 0x3c7c50, 0.95);
    estateB.strokeRoundedRect(3090, 1650, 690, 800, 34);
    this.addBuilding({
      x: 3520,
      y: 1735,
      width: 360,
      height: 170,
      color: 0xfffbf2,
      roofColor: 0x6c55a3,
      label: 'ESTATE B',
    });
    const pool = this.scene.add
      .rectangle(3255, 1905, 215, 125, 0x4dbddd, 0.96)
      .setStrokeStyle(9, 0xecffff, 0.9)
      .setDepth(1905);
    this.addStaticObstacle(pool);
    const guardBooth = this.scene.add
      .rectangle(3205, 2200, 92, 72, 0xf2dfb6)
      .setStrokeStyle(6, 0x7b6650, 0.9)
      .setDepth(2225);
    this.addStaticObstacle(guardBooth);
    this.scene.add
      .circle(3205, 2152, 14, 0xff4f58, 0.96)
      .setStrokeStyle(4, 0xffffff, 0.8)
      .setDepth(2227);
    for (const [x, y] of [
      [3140, 1650],
      [3240, 1650],
      [3650, 1650],
      [3750, 1650],
      [3090, 1780],
      [3090, 2350],
      [3690, 2450],
    ] as const) {
      this.scene.add.image(x, y, 'rich-hedge').setDepth(y);
    }
    this.scene.add
      .text(3460, 2365, 'ESTATE B · ПАНДА\nОХРАНА', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#284733',
        backgroundColor: '#f7ffe5dd',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.groundLabels);
  }

  private createVipEstateGate(): ZoneGate {
    const { x, y } = PROTOTYPE_LAYOUT.vipEstateGatePosition;
    const leftPost = this.scene.add
      .rectangle(x - 112, y, 42, 112, 0xd7ad4f)
      .setStrokeStyle(6, 0xfff2bc, 0.96)
      .setDepth(y + 2);
    const rightPost = this.scene.add
      .rectangle(x + 112, y, 42, 112, 0xd7ad4f)
      .setStrokeStyle(6, 0xfff2bc, 0.96)
      .setDepth(y + 2);
    const crossbar = this.scene.add
      .rectangle(x, y, 224, 36, 0x8152b5)
      .setStrokeStyle(6, 0xffdf72, 0.96)
      .setDepth(y + 3);
    const statusLabel = this.scene.add
      .text(
        x,
        y - 86,
        'VIP ESTATE\nНУЖНЫ 6 БРОДЯЧИХ И ТИХИЕ КРОССОВКИ',
        {
          align: 'center',
          fontFamily: 'Arial, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#efe3ff',
          backgroundColor: '#3b2555ed',
          padding: { x: 11, y: 6 },
        },
      )
      .setOrigin(0.5)
      .setDepth(y + 4);
    const barrier = this.addInvisibleObstacle(x - 130, y - 24, 260, 48);

    return new ZoneGate(
      this.scene,
      VIP_ESTATE_GATE_DEFINITION,
      new Phaser.Math.Vector2(
        PROTOTYPE_LAYOUT.vipEstateGateInteractionPoint.x,
        PROTOTYPE_LAYOUT.vipEstateGateInteractionPoint.y,
      ),
      barrier,
      [leftPost, rightPost, crossbar],
      statusLabel,
    );
  }

  private drawVipEstateEnvironment(): void {
    const estate = this.scene.add.graphics().setDepth(DEPTH.ground + 4);
    estate.fillStyle(0x6e4d96, 0.2);
    estate.fillRoundedRect(2720, 28, 1090, 770, 42);
    estate.lineStyle(12, 0xe1bd5c, 0.82);
    estate.strokeRoundedRect(2720, 28, 1090, 770, 42);

    estate.lineStyle(150, 0xb99bcb, 1);
    estate.strokePoints(
      [
        new Phaser.Math.Vector2(3350, 840),
        new Phaser.Math.Vector2(3350, 690),
        new Phaser.Math.Vector2(3190, 610),
        new Phaser.Math.Vector2(2920, 570),
      ],
      false,
      false,
    );
    estate.strokePoints(
      [
        new Phaser.Math.Vector2(3350, 690),
        new Phaser.Math.Vector2(3510, 610),
        new Phaser.Math.Vector2(3730, 560),
      ],
      false,
      false,
    );
    estate.lineStyle(94, 0xf1e7f7, 1);
    estate.strokePoints(
      [
        new Phaser.Math.Vector2(3350, 840),
        new Phaser.Math.Vector2(3350, 690),
        new Phaser.Math.Vector2(3190, 610),
        new Phaser.Math.Vector2(2920, 570),
      ],
      false,
      false,
    );
    estate.strokePoints(
      [
        new Phaser.Math.Vector2(3350, 690),
        new Phaser.Math.Vector2(3510, 610),
        new Phaser.Math.Vector2(3730, 560),
      ],
      false,
      false,
    );

    const westGarden = this.scene.add
      .rectangle(2890, 555, 360, 330, 0xaad783, 0.9)
      .setStrokeStyle(8, 0xf1d36d, 0.84)
      .setDepth(DEPTH.ground + 5);
    const gardenFountain = this.scene.add
      .circle(2980, 655, 52, 0x63c8e2, 0.96)
      .setStrokeStyle(8, 0xfff4d2, 0.9)
      .setDepth(655);
    this.addStaticObstacle(gardenFountain);
    this.scene.add.circle(2980, 655, 15, 0xf4cf60).setDepth(656);

    const eastCourt = this.scene.add
      .rectangle(3680, 555, 310, 330, 0xc5b4df, 0.94)
      .setStrokeStyle(8, 0xf1d36d, 0.84)
      .setDepth(DEPTH.ground + 5);
    this.addBuilding({
      x: 3735,
      y: 330,
      width: 155,
      height: 145,
      color: 0xf8efff,
      roofColor: 0x7650a4,
      label: 'VIP TOWER',
    });

    for (const [x, y, color] of [
      [2765, 150, 0xd8b955],
      [2805, 710, 0xe8cf7a],
      [3170, 740, 0xb988d4],
      [3510, 740, 0xb988d4],
      [3780, 150, 0xd8b955],
    ] as const) {
      this.scene.add
        .rectangle(x, y, 28, 90, color)
        .setStrokeStyle(5, 0xfff5ca, 0.8)
        .setDepth(y);
      this.scene.add.circle(x, y - 54, 18, 0xffec9c, 0.9).setDepth(y + 1);
    }

    for (const [x, y] of [
      [2775, 400],
      [3070, 730],
      [3590, 730],
      [3790, 690],
    ] as const) {
      this.scene.add.image(x, y, 'vip-rare-plant').setDepth(y);
    }

    this.scene.add
      .text(
        2890,
        430,
        `ЗАПАДНОЕ КРЫЛО\n${getPetDefinition('vip-a').displayName.toUpperCase()}`,
        {
          align: 'center',
          fontFamily: 'Arial, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#5a4110',
          backgroundColor: '#fff4cde0',
          padding: { x: 9, y: 5 },
        },
      )
      .setOrigin(0.5)
      .setDepth(DEPTH.groundLabels);
    this.scene.add
      .text(
        3690,
        430,
        `ВОСТОЧНОЕ КРЫЛО\n${getPetDefinition('vip-b').displayName.toUpperCase()}`,
        {
          align: 'center',
          fontFamily: 'Arial, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#4a2b62',
          backgroundColor: '#f7efffe0',
          padding: { x: 9, y: 5 },
        },
      )
      .setOrigin(0.5)
      .setDepth(DEPTH.groundLabels);

    // Keep the prototype wing surfaces separate without making them physical walls.
    westGarden.setAlpha(0.9);
    eastCourt.setAlpha(0.94);
  }

  private drawDragonCourtyard(): DragonCourtyard {
    const courtyard = this.scene.add.graphics().setDepth(DEPTH.ground + 6);
    courtyard.fillStyle(0x4b326f, 0.88);
    courtyard.fillRoundedRect(3030, 45, 620, 385, 30);
    courtyard.lineStyle(10, 0xe5bd57, 0.95);
    courtyard.strokeRoundedRect(3030, 45, 620, 385, 30);
    courtyard.fillStyle(0x7350a1, 0.7);
    courtyard.fillCircle(3340, 230, 128);
    courtyard.lineStyle(7, 0xffdf6b, 0.78);
    courtyard.strokeCircle(3340, 230, 128);

    this.addBuilding({
      x: 3340,
      y: 90,
      width: 290,
      height: 95,
      color: 0xeadcff,
      roofColor: 0x6e3c98,
      label: 'DRAGON COURTYARD',
    });

    this.addInvisibleObstacle(3030, 45, 28, 385);
    this.addInvisibleObstacle(3622, 45, 28, 385);
    this.addInvisibleObstacle(3030, 398, 80, 32);
    this.addInvisibleObstacle(3270, 398, 130, 32);
    this.addInvisibleObstacle(3560, 398, 90, 32);

    const leftBarrier = this.addInvisibleObstacle(3110, 394, 160, 40);
    const rightBarrier = this.addInvisibleObstacle(3400, 394, 160, 40);
    const leftDoor = this.scene.add
      .rectangle(3190, 414, 150, 28, 0xb94f75)
      .setStrokeStyle(5, 0xffd4e5, 0.95)
      .setDepth(435);
    const rightDoor = this.scene.add
      .rectangle(3480, 414, 150, 28, 0xb94f75)
      .setStrokeStyle(5, 0xffd4e5, 0.95)
      .setDepth(435);
    const leftSeal = this.scene.add
      .circle(3300, 390, 16, 0xe3557d, 0.95)
      .setStrokeStyle(5, 0xffd0e0, 0.95)
      .setDepth(440);
    const rightSeal = this.scene.add
      .circle(3380, 390, 16, 0xe3557d, 0.95)
      .setStrokeStyle(5, 0xffd0e0, 0.95)
      .setDepth(440);
    const statusLabel = this.scene.add
      .text(3340, 470, 'ЗАЩИТА ДРАКОНА · 0/2', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#ffe0ed',
        backgroundColor: '#4a2343e8',
        padding: { x: 11, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(475);

    return new DragonCourtyard(
      this.scene,
      [leftBarrier, rightBarrier],
      [leftDoor, rightDoor],
      [leftSeal, rightSeal],
      statusLabel,
    );
  }

  private drawEnvironment(): void {
    const treePositions: ReadonlyArray<readonly [number, number, number]> = [
      [1050, 2330, 1],
      [1110, 2180, 0.9],
      [930, 1870, 1.1],
      [350, 1640, 1],
      [620, 1500, 0.85],
      [1120, 1190, 0.9],
      [360, 690, 1.15],
      [180, 300, 0.9],
      [720, 190, 1],
      [1030, 270, 0.88],
      [1540, 270, 1],
      [1570, 810, 0.92],
      [1980, 1970, 1.1],
      [2200, 1880, 0.8],
      [2440, 2260, 1],
      [2820, 2240, 1.15],
      [2780, 1830, 0.9],
      [3550, 760, 0.95],
      [2650, 470, 0.9],
    ];

    for (const [x, y, scale] of treePositions) {
      this.addTree(x, y, scale);
    }

    const bushes: ReadonlyArray<readonly [number, number]> = [
      [980, 1730],
      [1080, 1670],
      [750, 1790],
      [1940, 1300],
      [2050, 1340],
      [2360, 770],
      [2480, 720],
      [3160, 1640],
      [3300, 1580],
    ];

    for (const [x, y] of bushes) {
      this.scene.add
        .ellipse(x, y, 74, 42, 0x4d9e55, 0.95)
        .setStrokeStyle(5, 0x367b43, 0.8)
        .setDepth(y);
    }
  }

  private drawZoneLabels(): void {
    this.addZoneLabel(540, 2470, 'STARTER SUBURB');
    this.addZoneLabel(480, 210, 'PARK');
    this.addZoneLabel(2060, 510, 'CENTRAL HUB');
    this.addZoneLabel(3120, 2380, 'RICH DISTRICT');
    this.addZoneLabel(3280, 120, 'VIP ESTATE');
  }

  private addZoneLabel(x: number, y: number, text: string): void {
    this.scene.add
      .text(x, y, text, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#17324b',
        backgroundColor: '#ffffffb8',
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setAlpha(0.78)
      .setDepth(DEPTH.groundLabels);
  }

  private addBuilding(options: BuildingOptions): void {
    const { x, y, width, height, color, roofColor, label } = options;
    const bottom = y + height / 2;

    this.scene.add
      .rectangle(x + 14, y + 18, width, height, 0x18324a, 0.2)
      .setDepth(bottom - 2);

    const body = this.scene.add
      .rectangle(x, y, width, height, color)
      .setStrokeStyle(8, 0xffffff, 0.65)
      .setDepth(bottom);
    this.addStaticObstacle(body);

    this.scene.add
      .triangle(
        x,
        y - height * 0.42,
        -width * 0.54,
        height * 0.22,
        0,
        -height * 0.2,
        width * 0.54,
        height * 0.22,
        roofColor,
      )
      .setDepth(bottom + 0.1);

    this.scene.add
      .text(x, y + 12, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#4f3a2d',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(bottom + 0.2);
  }

  private addTree(x: number, y: number, scale: number): void {
    const depth = y;
    this.scene.add
      .ellipse(x + 8, y + 13, 78 * scale, 34 * scale, 0x18324a, 0.2)
      .setDepth(depth - 2);
    this.scene.add
      .rectangle(x, y, 22 * scale, 54 * scale, 0x7a5130)
      .setDepth(depth - 1);
    this.scene.add
      .circle(x, y - 35 * scale, 45 * scale, 0x3b9652)
      .setStrokeStyle(7, 0x69bd64, 0.9)
      .setDepth(depth);

    this.addInvisibleObstacle(
      x - 18 * scale,
      y - 6 * scale,
      36 * scale,
      48 * scale,
    );
  }

  private addBench(x: number, y: number, rotation: number): void {
    const bench = this.scene.add
      .rectangle(x, y, 82, 24, 0xa5683f)
      .setStrokeStyle(4, 0x6f442b, 0.95)
      .setRotation(rotation)
      .setDepth(y);
    this.scene.add
      .rectangle(x, y + 13, 72, 8, 0x704329)
      .setRotation(rotation)
      .setDepth(y - 1);
    this.addStaticObstacle(bench);
  }

  private addInvisibleObstacle(
    x: number,
    y: number,
    width: number,
    height: number,
  ): Phaser.GameObjects.Rectangle {
    const obstacle = this.scene.add
      .rectangle(x + width / 2, y + height / 2, width, height, 0xffffff, 0.001)
      .setDepth(DEPTH.ground + 1);
    this.addStaticObstacle(obstacle);
    return obstacle;
  }

  private addStaticObstacle<
    T extends Phaser.GameObjects.GameObject & {
      readonly x: number;
      readonly y: number;
      readonly displayWidth: number;
      readonly displayHeight: number;
    },
  >(obstacle: T): T {
    this.obstacles.add(obstacle);
    const halfWidth = obstacle.displayWidth / 2;
    const halfHeight = obstacle.displayHeight / 2;
    this.navigationBlockerSequence += 1;
    this.navigationBlockers.push({
      id: `world-blocker-${this.navigationBlockerSequence}`,
      minX: obstacle.x - halfWidth,
      minY: obstacle.y - halfHeight,
      maxX: obstacle.x + halfWidth,
      maxY: obstacle.y + halfHeight,
      isActive: () => obstacle.active,
    });
    return obstacle;
  }

  private createNavigationMarker(
    markerPosition: Readonly<{ x: number; y: number }>,
    text: string,
    color: number,
  ): Phaser.GameObjects.Container {
    const glow = this.scene.add.circle(0, 0, 62, color, 0.24);
    const arrow = this.scene.add.triangle(0, 0, 0, 24, -18, -12, 18, -12, color);
    const label = this.scene.add
      .text(0, -72, text, {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#17324b',
        backgroundColor: '#fff9d8ee',
        padding: { x: 12, y: 7 },
      })
      .setOrigin(0.5);

    const container = this.scene.add
      .container(markerPosition.x, markerPosition.y, [glow, arrow, label])
      .setDepth(DEPTH.groundLabels + 2)
      .setVisible(false);

    this.scene.tweens.add({
      targets: [glow, arrow],
      y: '+=10',
      alpha: { from: 0.35, to: 0.85 },
      yoyo: true,
      repeat: -1,
      duration: 650,
      ease: 'Sine.easeInOut',
    });

    return container;
  }
}
