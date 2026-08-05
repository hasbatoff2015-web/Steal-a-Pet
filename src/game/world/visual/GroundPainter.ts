import Phaser from 'phaser';

import { DEPTH } from '../../config/gameplay';
import { GROUND_REGIONS, GROUND_TEXTURE_COLORS, type GroundTextureKey } from './WorldVisualConfig';

const TILE_SIZE = 128;

export class GroundPainter {
  public constructor(private readonly scene: Phaser.Scene) {}

  public paint(): void {
    for (const key of Object.keys(GROUND_TEXTURE_COLORS) as GroundTextureKey[]) {
      this.ensureTexture(key);
    }
    for (const region of GROUND_REGIONS) {
      this.scene.add
        .tileSprite(region.x, region.y, region.width, region.height, region.textureKey)
        .setOrigin(0)
        .setDepth(DEPTH.ground);
    }
  }

  private ensureTexture(key: GroundTextureKey): void {
    if (this.scene.textures.exists(key)) return;
    const [base, shade, highlight] = GROUND_TEXTURE_COLORS[key];
    const canvasTexture = this.scene.textures.createCanvas(key, TILE_SIZE, TILE_SIZE);
    if (canvasTexture === null) return;
    const context = canvasTexture.context;
    context.fillStyle = Phaser.Display.Color.IntegerToColor(base).rgba;
    context.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    let seed = key.length * 7919;
    const random = (): number => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0xffffffff;
    };
    for (let index = 0; index < 38; index += 1) {
      const color = index % 3 === 0 ? highlight : shade;
      context.fillStyle = Phaser.Display.Color.IntegerToColor(color).rgba;
      context.globalAlpha = 0.08 + random() * 0.08;
      const x = Math.floor(random() * TILE_SIZE);
      const y = Math.floor(random() * TILE_SIZE);
      const size = 1 + Math.floor(random() * 3);
      context.fillRect(x, y, size, size);
    }
    context.globalAlpha = 1;
    canvasTexture.refresh();
  }
}
