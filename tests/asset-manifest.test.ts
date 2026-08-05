import { describe, expect, it } from 'vitest';

import { ALL_VISUAL_ASSETS, OWNER_ASSETS, PET_ASSETS } from '../src/game/assets/assetManifest';
import { PET_DEFINITIONS } from '../src/game/data/pets';

describe('production visual asset manifest', () => {
  it('maps every gameplay pet id to one production texture', () => {
    expect(Object.keys(PET_ASSETS).sort()).toEqual(Object.keys(PET_DEFINITIONS).sort());
    expect(Object.values(PET_ASSETS).every((definition) => definition.path !== null)).toBe(true);
  });

  it('keeps texture keys unique unless a role intentionally shares an image', () => {
    const keyToPath = new Map<string, string>();
    for (const definition of ALL_VISUAL_ASSETS.filter(({ path }) => path !== null)) {
      const priorPath = keyToPath.get(definition.textureKey);
      expect(priorPath === undefined || priorPath === definition.path).toBe(true);
      keyToPath.set(definition.textureKey, definition.path!);
    }
  });

  it('covers every current owner and guard prototype role', () => {
    expect(Object.keys(OWNER_ASSETS).sort()).toEqual([
      'hub-owner', 'owner', 'panda-owner', 'park-owner', 'rich-guard', 'rich-owner',
      'vip-boss', 'vip-guard-gold', 'vip-guard-purple', 'vip-owner-gold', 'vip-owner-purple',
    ]);
  });

  it('limits procedural fallbacks to absent delivered files', () => {
    expect(ALL_VISUAL_ASSETS.filter(({ path }) => path === null).map(({ id }) => id).sort())
      .toEqual(['bridge', 'fence-segment', 'security-booth']);
  });
});
