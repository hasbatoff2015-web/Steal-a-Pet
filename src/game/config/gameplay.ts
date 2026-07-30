export const WORLD = {
  width: 3840,
  height: 2560,
} as const;

export const PLAYER_CONFIG = {
  speed: 230,
  radius: 19,
  dashSpeed: 590,
  dashDurationMs: 170,
  dashCooldownMs: 900,
  trailIntervalMs: 42,
} as const;

export const PET_CONFIG = {
  interactionRadius: 92,
  followDistance: 76,
  followSpeed: 285,
  catchUpSpeed: 390,
  teleportDistance: 560,
  breadcrumbSpacing: 18,
  breadcrumbReachDistance: 10,
  breadcrumbMaxPoints: 160,
  deliveryDistance: 190,
} as const;

export const DEPTH = {
  ground: 0,
  groundLabels: 20,
  ui: 100_000,
} as const;
