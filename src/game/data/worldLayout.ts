import type Phaser from 'phaser';

export interface PrototypeWorldLayout {
  playerSpawn: Phaser.Math.Vector2;
  playerDeliveryZone: Phaser.Geom.Rectangle;
  playerPetSlot: Phaser.Math.Vector2;
  npcHome: Phaser.Math.Vector2;
  petHome: Phaser.Math.Vector2;
  parkMarker: Phaser.Math.Vector2;
}

export const PROTOTYPE_LAYOUT = {
  playerSpawn: { x: 700, y: 2310 },
  playerDeliveryZone: { x: 545, y: 2120, width: 245, height: 210 },
  playerPetSlot: { x: 660, y: 2225 },
  npcHome: { x: 1500, y: 1580 },
  petHome: { x: 1640, y: 1580 },
  parkMarker: { x: 900, y: 810 },
} as const;
