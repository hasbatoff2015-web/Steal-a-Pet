export interface GroundRegion {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly textureKey: GroundTextureKey;
}

export type GroundTextureKey =
  | 'visual-ground-grass'
  | 'visual-ground-park'
  | 'visual-ground-hub'
  | 'visual-ground-rich'
  | 'visual-ground-vip';

export const GROUND_REGIONS: readonly GroundRegion[] = [
  { x: 0, y: 0, width: 4608, height: 3072, textureKey: 'visual-ground-grass' },
  { x: 0, y: 0, width: 1680, height: 900, textureKey: 'visual-ground-park' },
  { x: 1650, y: 350, width: 1000, height: 1860, textureKey: 'visual-ground-hub' },
  { x: 2500, y: 850, width: 2108, height: 2222, textureKey: 'visual-ground-rich' },
  { x: 2700, y: 0, width: 1908, height: 920, textureKey: 'visual-ground-vip' },
];

export const GROUND_TEXTURE_COLORS: Readonly<Record<GroundTextureKey, readonly [number, number, number]>> = {
  'visual-ground-grass': [0x8bd067, 0x7fc55e, 0x9bd978],
  'visual-ground-park': [0x70c979, 0x62ba6d, 0x83d786],
  'visual-ground-hub': [0xe7ca82, 0xd9b96f, 0xf0d898],
  'visual-ground-rich': [0xa8dfc9, 0x91d1ba, 0xb9e8d6],
  'visual-ground-vip': [0xc9a9ea, 0xb895db, 0xd8bbed],
};

export interface DecorPlacement {
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly tint?: number;
  readonly flipX?: boolean;
}

export const DECOR_TREES: readonly DecorPlacement[] = [
  { x: 130, y: 1540, scale: 1.05 }, { x: 250, y: 1510, scale: 0.86 },
  { x: 1280, y: 2180, scale: 1.08 }, { x: 1400, y: 2250, scale: 0.92 },
  { x: 160, y: 170, scale: 1.1 }, { x: 290, y: 190, scale: 0.86 },
  { x: 650, y: 160, scale: 1.08 }, { x: 760, y: 210, scale: 0.9 },
  { x: 1260, y: 180, scale: 1.12 }, { x: 1390, y: 220, scale: 0.88 },
  { x: 1810, y: 430, scale: 0.9 }, { x: 2500, y: 420, scale: 1.05 },
  { x: 1820, y: 1860, scale: 1.06 }, { x: 2480, y: 1950, scale: 0.92 },
  { x: 2790, y: 1120, scale: 0.88 }, { x: 3740, y: 1120, scale: 1.05 },
  { x: 2850, y: 2480, scale: 1.02 }, { x: 3750, y: 2500, scale: 0.9 },
  { x: 2780, y: 180, scale: 0.9 }, { x: 3820, y: 170, scale: 1.04 },
  { x: 2860, y: 760, scale: 0.88 }, { x: 3810, y: 760, scale: 0.96 },
  { x: 4160, y: 1020, scale: 1.06 }, { x: 4450, y: 1320, scale: 0.9 },
];

export const DECOR_BUSHES: readonly DecorPlacement[] = [
  { x: 210, y: 1810 }, { x: 1080, y: 1840 }, { x: 1180, y: 2350 },
  { x: 330, y: 300 }, { x: 520, y: 290 }, { x: 1040, y: 250 }, { x: 1480, y: 300 },
  { x: 1820, y: 930, tint: 0xffbd7a }, { x: 2500, y: 970, tint: 0xff9db5 },
  { x: 1880, y: 1740 }, { x: 2460, y: 1770 },
  { x: 2780, y: 1480 }, { x: 2900, y: 1480 }, { x: 3420, y: 1500 }, { x: 3570, y: 1580 },
  { x: 2780, y: 650, tint: 0xf4d86f }, { x: 2920, y: 750, tint: 0xe8c85d },
  { x: 3650, y: 740, tint: 0xe8c85d }, { x: 3800, y: 650, tint: 0xf4d86f },
];

export const DECOR_LAMPS: readonly DecorPlacement[] = [
  { x: 1840, y: 740 }, { x: 2040, y: 850 }, { x: 2260, y: 1240 }, { x: 2420, y: 1500 },
  { x: 2800, y: 1370 }, { x: 3050, y: 1430 }, { x: 3410, y: 1510 }, { x: 3650, y: 1740 },
  { x: 3130, y: 750, tint: 0xffe49a }, { x: 3560, y: 750, tint: 0xffe49a },
  { x: 3140, y: 580, tint: 0xffe49a }, { x: 3550, y: 580, tint: 0xffe49a },
];

export const DECOR_CARS: readonly DecorPlacement[] = [
  { x: 2360, y: 610, flipX: true }, { x: 2530, y: 1550 },
  { x: 2820, y: 1040 }, { x: 3740, y: 1180, flipX: true },
  { x: 2910, y: 2290, flipX: true }, { x: 3630, y: 2350 },
];
