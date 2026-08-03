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
  vipEstateGatePosition: Phaser.Math.Vector2;
  vipEstateGateInteractionPoint: Phaser.Math.Vector2;
  vipEstateNavigationMarker: Phaser.Math.Vector2;
  vipANavigationMarker: Phaser.Math.Vector2;
  vipBNavigationMarker: Phaser.Math.Vector2;
  dragonNavigationMarker: Phaser.Math.Vector2;
  upgradeNavigationMarker: Phaser.Math.Vector2;
  upgradeStationPosition: Phaser.Math.Vector2;
  trackingStationPosition: Phaser.Math.Vector2;
  stealthStationPosition: Phaser.Math.Vector2;
}

export const PROTOTYPE_LAYOUT = {
  playerSpawn: { x: 700, y: 2310 },
  playerDeliveryZone: { x: 545, y: 2120, width: 245, height: 210 },
  playerPetSlots: {
    dog: { x: 580, y: 2170 },
    cat: { x: 655, y: 2170 },
    fox: { x: 730, y: 2170 },
    peacock: { x: 575, y: 2235 },
    panda: { x: 650, y: 2235 },
    'vip-a': { x: 735, y: 2235 },
    'vip-b': { x: 585, y: 2295 },
    dragon: { x: 700, y: 2290 },
    'roam-01': { x: 360, y: 2525 },
    'roam-02': { x: 440, y: 2525 },
    'roam-03': { x: 520, y: 2525 },
    'roam-04': { x: 360, y: 2605 },
    'roam-05': { x: 440, y: 2605 },
    'roam-06': { x: 520, y: 2605 },
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
  vipEstateGatePosition: { x: 3350, y: 847 },
  vipEstateGateInteractionPoint: { x: 3350, y: 930 },
  vipEstateNavigationMarker: { x: 3350, y: 970 },
  vipANavigationMarker: { x: 2880, y: 610 },
  vipBNavigationMarker: { x: 3740, y: 590 },
  dragonNavigationMarker: { x: 3340, y: 430 },
  upgradeNavigationMarker: { x: 815, y: 1970 },
  upgradeStationPosition: { x: 820, y: 1900 },
  trackingStationPosition: { x: 1030, y: 2010 },
  stealthStationPosition: { x: 1030, y: 2220 },
} as const;
