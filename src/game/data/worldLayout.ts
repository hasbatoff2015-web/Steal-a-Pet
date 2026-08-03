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
  centralHubGatePosition: Phaser.Math.Vector2;
  centralHubGateInteractionPoint: Phaser.Math.Vector2;
  foxNavigationMarker: Phaser.Math.Vector2;
  richDistrictGatePosition: Phaser.Math.Vector2;
  richDistrictGateInteractionPoint: Phaser.Math.Vector2;
  richDistrictNavigationMarker: Phaser.Math.Vector2;
  peacockNavigationMarker: Phaser.Math.Vector2;
  pandaNavigationMarker: Phaser.Math.Vector2;
  upgradeNavigationMarker: Phaser.Math.Vector2;
  upgradeStationPosition: Phaser.Math.Vector2;
}

export const PROTOTYPE_LAYOUT = {
  playerSpawn: { x: 700, y: 2310 },
  playerDeliveryZone: { x: 545, y: 2120, width: 245, height: 210 },
  playerPetSlots: {
    dog: { x: 590, y: 2185 },
    cat: { x: 680, y: 2185 },
    fox: { x: 760, y: 2185 },
    peacock: { x: 625, y: 2260 },
    panda: { x: 725, y: 2260 },
  },
  parkGatePosition: { x: 900, y: 1080 },
  parkGateInteractionPoint: { x: 900, y: 1165 },
  parkNavigationMarker: { x: 900, y: 1195 },
  catNavigationMarker: { x: 1330, y: 690 },
  centralHubMarker: { x: 1550, y: 650 },
  centralHubGatePosition: { x: 1675, y: 650 },
  centralHubGateInteractionPoint: { x: 1575, y: 650 },
  foxNavigationMarker: { x: 2340, y: 1740 },
  richDistrictGatePosition: { x: 2663, y: 1460 },
  richDistrictGateInteractionPoint: { x: 2555, y: 1460 },
  richDistrictNavigationMarker: { x: 2525, y: 1460 },
  peacockNavigationMarker: { x: 3120, y: 1210 },
  pandaNavigationMarker: { x: 3550, y: 2160 },
  upgradeNavigationMarker: { x: 815, y: 1970 },
  upgradeStationPosition: { x: 815, y: 1970 },
} as const;
