import Phaser from 'phaser';

import { DEPTH, WORLD } from '../config/gameplay';
import { PROTOTYPE_LAYOUT, type PrototypeWorldLayout } from '../data/worldLayout';
import { PARK_GATE_DEFINITION } from '../data/zones';
import { ZoneGate } from './ZoneGate';

export interface WorldBuildResult extends PrototypeWorldLayout {
  obstacles: Phaser.Physics.Arcade.StaticGroup;
  parkGate: ZoneGate;
  parkNavigationMarkerView: Phaser.GameObjects.Container;
  catNavigationMarkerView: Phaser.GameObjects.Container;
  centralHubMarkerView: Phaser.GameObjects.Container;
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

  public constructor(private readonly scene: Phaser.Scene) {
    this.obstacles = scene.physics.add.staticGroup();
  }

  public build(parkUnlocked: boolean): WorldBuildResult {
    this.scene.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);

    this.drawZoneGrounds();
    this.drawRoads();
    this.drawRiverAndBridge();
    const parkGate = this.createParkGate();
    if (parkUnlocked) {
      parkGate.unlock(false);
    }
    this.drawPlayerBase();
    this.drawNpcBase();
    this.drawParkEnvironment();
    this.drawParkEncounter();
    this.drawParkBoundary();
    this.drawFutureDistricts();
    this.drawEnvironment();
    this.drawZoneLabels();

    const playerPetSlots = new Map<string, Phaser.Math.Vector2>(
      Object.entries(PROTOTYPE_LAYOUT.playerPetSlots).map(([petId, point]) => [
        petId,
        new Phaser.Math.Vector2(point.x, point.y),
      ]),
    );

    return {
      obstacles: this.obstacles,
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
      parkGate,
      parkNavigationMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.parkNavigationMarker,
        'PARK · 25 МОНЕТ',
        0xffd43b,
      ),
      catNavigationMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.catNavigationMarker,
        'ЦЕЛЬ: КОТ',
        0xc997ff,
      ),
      centralHubMarkerView: this.createNavigationMarker(
        PROTOTYPE_LAYOUT.centralHubMarker,
        'СЛЕДУЮЩАЯ ЦЕЛЬ:\nCENTRAL HUB →',
        0x71d8ff,
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

  private drawPlayerBase(): void {
    const yard = this.scene.add.graphics().setDepth(DEPTH.ground + 4);
    yard.fillStyle(0xdff4af, 0.92);
    yard.fillRoundedRect(170, 1840, 720, 610, 42);
    yard.lineStyle(12, 0x4a9c68, 0.95);
    yard.strokeRoundedRect(170, 1840, 720, 610, 42);

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
    hedge.fillRoundedRect(1640, 745, 70, 365, 22);
    hedge.lineStyle(6, 0x69ba63, 0.95);
    hedge.strokeRoundedRect(1640, 0, 70, 555, 22);
    hedge.strokeRoundedRect(1640, 745, 70, 365, 22);

    this.addInvisibleObstacle(1640, 0, 70, 555);
    this.addInvisibleObstacle(1640, 745, 70, 365);

    const upperPost = this.scene.add
      .rectangle(1675, 580, 42, 70, 0x355f78)
      .setStrokeStyle(5, 0xffffff, 0.75)
      .setDepth(650);
    const lowerPost = this.scene.add
      .rectangle(1675, 720, 42, 70, 0x355f78)
      .setStrokeStyle(5, 0xffffff, 0.75)
      .setDepth(720);
    this.obstacles.add(upperPost);
    this.obstacles.add(lowerPost);
    this.addInvisibleObstacle(1648, 610, 54, 80);

    this.scene.add
      .text(1618, 650, 'CENTRAL HUB →\nСЛЕДУЮЩИЙ ЭТАП', {
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#203f54e8',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0.5)
      .setDepth(DEPTH.groundLabels + 1);
  }

  private drawFutureDistricts(): void {
    this.addGate(1760, 1460, 'RICH DISTRICT →', 0x337e78);
    this.addGate(2850, 650, 'VIP ESTATE', 0x7450a8);

    this.addBuilding({
      x: 2270,
      y: 1080,
      width: 420,
      height: 280,
      color: 0xffe6a3,
      roofColor: 0xd99a37,
      label: 'MARKET',
    });
    this.addBuilding({
      x: 3020,
      y: 1080,
      width: 500,
      height: 300,
      color: 0xd8fff7,
      roofColor: 0x4c9e96,
      label: 'RICH VILLA',
    });
    this.addBuilding({
      x: 3290,
      y: 390,
      width: 560,
      height: 330,
      color: 0xf0e2ff,
      roofColor: 0x7d58a8,
      label: 'VIP ESTATE',
    });
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
      [3450, 1880, 1],
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
    this.obstacles.add(body);

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

  private addGate(x: number, y: number, label: string, color: number): void {
    const left = this.scene.add
      .rectangle(x, y - 82, 42, 118, color)
      .setStrokeStyle(5, 0xffffff, 0.72)
      .setDepth(y);
    const right = this.scene.add
      .rectangle(x, y + 82, 42, 118, color)
      .setStrokeStyle(5, 0xffffff, 0.72)
      .setDepth(y + 140);

    this.obstacles.add(left);
    this.obstacles.add(right);

    this.scene.add
      .text(x, y, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#203043dd',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(y + 1);
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
    this.obstacles.add(bench);
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
    this.obstacles.add(obstacle);
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
