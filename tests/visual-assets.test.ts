import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { calculateAssetDisplaySize } from '../src/game/assets/assetSizing';
import { ALL_VISUAL_ASSETS } from '../src/game/assets/assetManifest';

function pngDimensions(path: string): readonly [number, number] {
  const bytes = readFileSync(path);
  expect(bytes.subarray(1, 4).toString('ascii')).toBe('PNG');
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

describe('Stage 7B runtime visual assets', () => {
  const production = ALL_VISUAL_ASSETS.filter(
    (definition): definition is typeof definition & { readonly path: string } => definition.path !== null,
  );

  it('has positive visible targets and every required runtime PNG', () => {
    for (const definition of production) {
      expect(definition.displayWidth).toBeGreaterThan(0);
      expect(definition.displayHeight).toBeGreaterThan(0);
      const filePath = resolve(`public${definition.path}`);
      const [width, height] = pngDimensions(filePath);
      expect(width).toBeGreaterThan(24);
      expect(height).toBeGreaterThan(24);
    }
  });

  it('never distorts the cropped PNG aspect ratio', () => {
    for (const definition of production) {
      const [frameWidth, frameHeight] = pngDimensions(resolve(`public${definition.path}`));
      const display = calculateAssetDisplaySize(definition, frameWidth, frameHeight);
      expect(display.width / display.height).toBeCloseTo(frameWidth / frameHeight, 8);
    }
  });

  it('does not load one runtime path through competing texture keys', () => {
    const pathKeys = new Map<string, string>();
    for (const definition of production) {
      const existing = pathKeys.get(definition.path);
      expect(existing === undefined || existing === definition.textureKey).toBe(true);
      pathKeys.set(definition.path, definition.textureKey);
    }
  });

  it('keeps production collider alpha zero and perspective gate unrotated', () => {
    const worldBuilder = readFileSync(resolve('src/game/world/WorldBuilder.ts'), 'utf8');
    expect(worldBuilder).not.toContain('0.001');
    expect(worldBuilder).not.toMatch(/INTERACTIVE_ASSETS\.universalGate[\s\S]{0,180}Math\.PI\s*\/\s*2/);
  });
});
