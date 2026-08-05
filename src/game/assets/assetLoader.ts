import Phaser from 'phaser';

import {
  ALL_VISUAL_ASSETS,
  type VisualAssetDefinition,
} from './assetManifest';
import { calculateAssetDisplaySize } from './assetSizing';

const warnedAssetIds = new Set<string>();

export function preloadVisualAssets(scene: Phaser.Scene): void {
  const queuedKeys = new Set<string>();
  for (const definition of ALL_VISUAL_ASSETS) {
    if (
      definition.path === null ||
      scene.textures.exists(definition.textureKey) ||
      queuedKeys.has(definition.textureKey)
    ) continue;
    queuedKeys.add(definition.textureKey);
    scene.load.image(definition.textureKey, definition.path);
  }

  if (!isDevelopmentMode()) return;
  scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
    const definition = ALL_VISUAL_ASSETS.find((candidate) => candidate.textureKey === file.key);
    if (definition !== undefined) warnOnce(definition, 'не удалось загрузить');
  });
}

export function resolveVisualTexture(
  scene: Phaser.Scene,
  definition: VisualAssetDefinition,
): { readonly textureKey: string; readonly production: boolean } {
  if (definition.path !== null && scene.textures.exists(definition.textureKey)) {
    return { textureKey: definition.textureKey, production: true };
  }
  if (isDevelopmentMode()) warnOnce(definition, definition.path === null ? 'файл отсутствует' : 'texture не загружена');
  return { textureKey: definition.fallbackKey, production: false };
}

export function applyAssetDisplay(
  gameObject: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
  definition: VisualAssetDefinition,
  displayWidth = definition.displayWidth,
  displayHeight = definition.displayHeight,
): void {
  const frameWidth = gameObject.frame.realWidth;
  const frameHeight = gameObject.frame.realHeight;
  const { width: targetWidth, height: targetHeight } = calculateAssetDisplaySize(
    definition, frameWidth, frameHeight, displayWidth, displayHeight,
  );
  const cropPadding = 12;
  gameObject
    .setDisplaySize(targetWidth, targetHeight)
    .setOrigin(0.5, 1 - cropPadding / frameHeight);
  if (definition.tint !== undefined) gameObject.setTint(definition.tint);
}

function warnOnce(definition: VisualAssetDefinition, reason: string): void {
  if (warnedAssetIds.has(definition.id)) return;
  warnedAssetIds.add(definition.id);
  console.warn(
    `[assets] ${definition.id}: ${reason}; используется fallback "${definition.fallbackKey}".`,
  );
}

function isDevelopmentMode(): boolean {
  return new URLSearchParams(window.location.search).get('dev') === '1';
}
