import type { VisualAssetDefinition } from './assetManifest';

export function calculateAssetDisplaySize(
  definition: VisualAssetDefinition,
  frameWidth: number,
  frameHeight: number,
  requestedWidth = definition.displayWidth,
  requestedHeight = definition.displayHeight,
): { readonly width: number; readonly height: number } {
  if (frameWidth <= 0 || frameHeight <= 0) {
    throw new Error(`Invalid runtime frame for asset "${definition.id}".`);
  }
  const scaleByHeight =
    definition.category === 'PLAYER' ||
    definition.category === 'PET' ||
    definition.category === 'OWNER' ||
    definition.category === 'GUARD' ||
    definition.id === 'tree-round' ||
    definition.id === 'street-lamp';
  const aspectRatio = frameWidth / frameHeight;
  return scaleByHeight
    ? { width: requestedHeight * aspectRatio, height: requestedHeight }
    : { width: requestedWidth, height: requestedWidth / aspectRatio };
}
