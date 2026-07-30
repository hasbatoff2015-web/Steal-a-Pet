import type Phaser from 'phaser';

export interface PrototypeWorldLayout {
  playerSpawn: Phaser.Math.Vector2;
  playerDeliveryZone: Phaser.Geom.Rectangle;
  playerPetSlots: ReadonlyMap<string, Phaser.Math.Vector2>;
  parkGatePosition: Phaser.Math.Vector2;
  parkGateInteractionPoint: Phaser.Math.Vector2;
  parkNavigationMarker: Phaser.Math.Vector2;
  catNavigationMarker: Phaser.Math.Vector2;
  centralHubMarker: Phaser.Math.Vector2;
}

export const PROTOTYPE_LAYOUT = {
  playerSpawn: { x: 700, y: 2310 },
  playerDeliveryZone: { x: 545, y: 2120, width: 245, height: 210 },
  playerPetSlots: {
    dog: { x: 625, y: 2225 },
    cat: { x: 710, y: 2225 },
  },
  parkGatePosition: { x: 900, y: 1080 },
  parkGateInteractionPoint: { x: 900, y: 1165 },
  parkNavigationMarker: { x: 900, y: 1195 },
  catNavigationMarker: { x: 1330, y: 690 },
  centralHubMarker: { x: 1780, y: 760 },
} as const;
