import type { PetId } from '../data/pets';

export type AssetCategory =
  | 'PLAYER'
  | 'PET'
  | 'OWNER'
  | 'GUARD'
  | 'BUILDING'
  | 'DECORATION'
  | 'INTERACTIVE'
  | 'STRUCTURE';

export interface VisualAssetDefinition<TId extends string = string> {
  readonly id: TId;
  readonly textureKey: string;
  readonly path: string | null;
  readonly category: AssetCategory;
  readonly displayWidth: number;
  readonly displayHeight: number;
  readonly originX: number;
  readonly originY: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly flipAllowed: boolean;
  readonly tint?: number;
  readonly fallbackKey: string;
}

function asset<TId extends string>(definition: VisualAssetDefinition<TId>): VisualAssetDefinition<TId> {
  return definition;
}

export const PLAYER_ASSET = asset({
  id: 'player', textureKey: 'asset-player-world',
  path: '/assets/characters/player/player_world.png', category: 'PLAYER',
  displayWidth: 48, displayHeight: 90, originX: 0.5, originY: 0.98,
  offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'player',
});

export const PET_ASSETS: Readonly<Record<PetId, VisualAssetDefinition<PetId>>> = {
  dog: asset({ id: 'dog', textureKey: 'asset-pet-dog', path: '/assets/pets/core/pet_dog.png', category: 'PET', displayWidth: 102, displayHeight: 68, originX: 0.526, originY: 0.875, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'dog' }),
  cat: asset({ id: 'cat', textureKey: 'asset-pet-cat', path: '/assets/pets/core/pet_cat.png', category: 'PET', displayWidth: 104, displayHeight: 69, originX: 0.497, originY: 0.856, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'cat' }),
  fox: asset({ id: 'fox', textureKey: 'asset-pet-fox', path: '/assets/pets/core/pet_fox.png', category: 'PET', displayWidth: 108, displayHeight: 72, originX: 0.488, originY: 0.843, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'fox' }),
  peacock: asset({ id: 'peacock', textureKey: 'asset-pet-peacock', path: '/assets/pets/core/pet_peacock.png', category: 'PET', displayWidth: 117, displayHeight: 78, originX: 0.498, originY: 0.825, offsetX: 0, offsetY: 0, flipAllowed: false, fallbackKey: 'peacock' }),
  panda: asset({ id: 'panda', textureKey: 'asset-pet-panda', path: '/assets/pets/core/pet_panda.png', category: 'PET', displayWidth: 108, displayHeight: 72, originX: 0.496, originY: 0.929, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'panda' }),
  'vip-a': asset({ id: 'vip-a', textureKey: 'asset-pet-vip-a', path: '/assets/pets/core/pet_vip_a.png', category: 'PET', displayWidth: 113, displayHeight: 75, originX: 0.501, originY: 0.878, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'vip-capybara' }),
  'vip-b': asset({ id: 'vip-b', textureKey: 'asset-pet-vip-b', path: '/assets/pets/core/pet_vip_b.png', category: 'PET', displayWidth: 113, displayHeight: 75, originX: 0.498, originY: 0.874, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'vip-owl' }),
  dragon: asset({ id: 'dragon', textureKey: 'asset-pet-dragon', path: '/assets/pets/core/pet_dragon.png', category: 'PET', displayWidth: 177, displayHeight: 118, originX: 0.475, originY: 0.831, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'dragon-prototype' }),
  'roam-01': asset({ id: 'roam-01', textureKey: 'asset-pet-roam-01', path: '/assets/pets/roaming/pet_roam_01.png', category: 'PET', displayWidth: 102, displayHeight: 68, originX: 0.509, originY: 0.816, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'roam-jumper' }),
  'roam-02': asset({ id: 'roam-02', textureKey: 'asset-pet-roam-02', path: '/assets/pets/roaming/pet_roam_02.png', category: 'PET', displayWidth: 105, displayHeight: 70, originX: 0.503, originY: 0.849, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'roam-raccoon' }),
  'roam-03': asset({ id: 'roam-03', textureKey: 'asset-pet-roam-03', path: '/assets/pets/roaming/pet_roam_03.png', category: 'PET', displayWidth: 113, displayHeight: 75, originX: 0.527, originY: 0.915, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'roam-alpaca' }),
  'roam-04': asset({ id: 'roam-04', textureKey: 'asset-pet-roam-04', path: '/assets/pets/roaming/pet_roam_04.png', category: 'PET', displayWidth: 105, displayHeight: 70, originX: 0.51, originY: 0.77, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'roam-chameleon' }),
  'roam-05': asset({ id: 'roam-05', textureKey: 'asset-pet-roam-05', path: '/assets/pets/roaming/pet_roam_05.png', category: 'PET', displayWidth: 108, displayHeight: 72, originX: 0.483, originY: 0.876, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'roam-gazelle' }),
  'roam-06': asset({ id: 'roam-06', textureKey: 'asset-pet-roam-06', path: '/assets/pets/roaming/pet_roam_06.png', category: 'PET', displayWidth: 113, displayHeight: 75, originX: 0.481, originY: 0.82, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'roam-griffin' }),
};

export const OWNER_ASSETS: Readonly<Record<string, VisualAssetDefinition>> = {
  owner: asset({ id: 'owner-dog', textureKey: 'asset-owner-dog', path: '/assets/characters/owners/owner_dog.png', category: 'OWNER', displayWidth: 59, displayHeight: 88, originX: 0.492, originY: 0.784, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'owner' }),
  'park-owner': asset({ id: 'owner-cat', textureKey: 'asset-owner-cat', path: '/assets/characters/owners/owner_cat.png', category: 'OWNER', displayWidth: 59, displayHeight: 88, originX: 0.511, originY: 0.858, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'park-owner' }),
  'hub-owner': asset({ id: 'owner-fox', textureKey: 'asset-owner-fox', path: '/assets/characters/owners/owner_fox.png', category: 'OWNER', displayWidth: 59, displayHeight: 89, originX: 0.528, originY: 0.893, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'hub-owner' }),
  'rich-owner': asset({ id: 'owner-peacock', textureKey: 'asset-owner-peacock', path: '/assets/characters/owners/owner_peacock.png', category: 'OWNER', displayWidth: 59, displayHeight: 89, originX: 0.524, originY: 0.89, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'rich-owner' }),
  'panda-owner': asset({ id: 'owner-panda', textureKey: 'asset-owner-panda', path: '/assets/characters/owners/owner_panda.png', category: 'OWNER', displayWidth: 62, displayHeight: 92, originX: 0.528, originY: 0.858, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'panda-owner' }),
  'rich-guard': asset({ id: 'guard-rich', textureKey: 'asset-guard-rich', path: '/assets/characters/guards/guard_rich.png', category: 'GUARD', displayWidth: 59, displayHeight: 89, originX: 0.516, originY: 0.9, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'rich-guard' }),
  'vip-owner-gold': asset({ id: 'owner-vip-a', textureKey: 'asset-owner-vip-a', path: '/assets/characters/owners/owner_vip_a.png', category: 'OWNER', displayWidth: 60, displayHeight: 90, originX: 0.456, originY: 0.867, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'vip-owner-gold' }),
  'vip-owner-purple': asset({ id: 'owner-vip-b', textureKey: 'asset-owner-vip-b', path: '/assets/characters/owners/owner_vip_b.png', category: 'OWNER', displayWidth: 60, displayHeight: 90, originX: 0.472, originY: 0.872, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'vip-owner-purple' }),
  'vip-guard-gold': asset({ id: 'guard-vip-gold', textureKey: 'asset-guard-vip', path: '/assets/characters/guards/guard_vip.png', category: 'GUARD', displayWidth: 59, displayHeight: 89, originX: 0.503, originY: 0.858, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'vip-guard-gold' }),
  'vip-guard-purple': asset({ id: 'guard-vip-purple', textureKey: 'asset-guard-vip', path: '/assets/characters/guards/guard_vip.png', category: 'GUARD', displayWidth: 59, displayHeight: 89, originX: 0.503, originY: 0.858, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'vip-guard-purple' }),
  'vip-boss': asset({ id: 'owner-dragon-boss', textureKey: 'asset-owner-dragon-boss', path: '/assets/characters/owners/owner_dragon_boss.png', category: 'OWNER', displayWidth: 51, displayHeight: 94, originX: 0.5, originY: 0.98, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'vip-boss' }),
};

export const BUILDING_ASSETS = {
  baseHouse: asset({ id: 'base-house', textureKey: 'asset-building-base-house', path: '/assets/world/buildings/base_house.png', category: 'BUILDING', displayWidth: 500, displayHeight: 333, originX: 0.526, originY: 0.852, offsetX: 0, offsetY: 0, flipAllowed: false, fallbackKey: 'prototype-building' }),
  starterHouse: asset({ id: 'starter-house', textureKey: 'asset-building-starter-house', path: '/assets/world/buildings/starter_house.png', category: 'BUILDING', displayWidth: 500, displayHeight: 333, originX: 0.51, originY: 0.808, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'prototype-building' }),
  parkPavilion: asset({ id: 'park-pavilion', textureKey: 'asset-building-park-pavilion', path: '/assets/world/buildings/park_pavilion.png', category: 'BUILDING', displayWidth: 460, displayHeight: 307, originX: 0.5, originY: 0.98, offsetX: 0, offsetY: 0, flipAllowed: false, fallbackKey: 'prototype-building' }),
  hubBuilding: asset({ id: 'hub-building', textureKey: 'asset-building-hub', path: '/assets/world/buildings/hub_building.png', category: 'BUILDING', displayWidth: 530, displayHeight: 353, originX: 0.5, originY: 0.98, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'prototype-building' }),
  richEstate: asset({ id: 'rich-estate', textureKey: 'asset-building-rich-estate', path: '/assets/world/buildings/rich_estate.png', category: 'BUILDING', displayWidth: 720, displayHeight: 480, originX: 0.5, originY: 0.98, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'prototype-building' }),
  vipPalace: asset({ id: 'vip-palace', textureKey: 'asset-building-vip-palace', path: '/assets/world/buildings/vip_palace.png', category: 'BUILDING', displayWidth: 860, displayHeight: 573, originX: 0.5, originY: 0.98, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'prototype-building' }),
} as const;

export const DECORATION_ASSETS = {
  tree: asset({ id: 'tree-round', textureKey: 'asset-decoration-tree', path: '/assets/world/decorations/tree_round.png', category: 'DECORATION', displayWidth: 120, displayHeight: 160, originX: 0.5, originY: 0.98, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'prototype-tree' }),
  bush: asset({ id: 'bush', textureKey: 'asset-decoration-bush', path: '/assets/world/decorations/bush.png', category: 'DECORATION', displayWidth: 100, displayHeight: 67, originX: 0.508, originY: 0.855, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'rich-hedge' }),
  streetLamp: asset({ id: 'street-lamp', textureKey: 'asset-decoration-lamp', path: '/assets/world/decorations/street_lamp.png', category: 'DECORATION', displayWidth: 70, displayHeight: 120, originX: 0.5, originY: 0.98, offsetX: 0, offsetY: 0, flipAllowed: false, fallbackKey: 'rich-lamp' }),
  bench: asset({ id: 'bench', textureKey: 'asset-decoration-bench', path: '/assets/world/decorations/bench.png', category: 'DECORATION', displayWidth: 130, displayHeight: 87, originX: 0.5, originY: 0.98, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'prototype-bench' }),
  fountain: asset({ id: 'fountain', textureKey: 'asset-decoration-fountain', path: '/assets/world/decorations/fountain.png', category: 'DECORATION', displayWidth: 180, displayHeight: 120, originX: 0.497, originY: 0.832, offsetX: 0, offsetY: 0, flipAllowed: false, fallbackKey: 'prototype-fountain' }),
  car: asset({ id: 'generic-car', textureKey: 'asset-decoration-car', path: '/assets/world/decorations/generic_car.png', category: 'DECORATION', displayWidth: 175, displayHeight: 117, originX: 0.5, originY: 0.98, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'rich-car' }),
  sign: asset({ id: 'blank-sign', textureKey: 'asset-decoration-sign', path: '/assets/world/decorations/blank_sign.png', category: 'DECORATION', displayWidth: 170, displayHeight: 113, originX: 0.495, originY: 0.859, offsetX: 0, offsetY: 0, flipAllowed: false, fallbackKey: 'prototype-sign' }),
} as const;

export const INTERACTIVE_ASSETS = {
  petPen: asset({ id: 'pet-pen', textureKey: 'asset-interactive-pet-pen', path: '/assets/world/interactive/pet_pen.png', category: 'INTERACTIVE', displayWidth: 760, displayHeight: 507, originX: 0.508, originY: 0.803, offsetX: 0, offsetY: 0, flipAllowed: false, fallbackKey: 'prototype-pet-pen' }),
  deliveryPad: asset({ id: 'delivery-pad', textureKey: 'asset-interactive-delivery-pad', path: '/assets/world/interactive/delivery_pad.png', category: 'INTERACTIVE', displayWidth: 280, displayHeight: 187, originX: 0.505, originY: 0.791, offsetX: 0, offsetY: 0, flipAllowed: false, fallbackKey: 'prototype-delivery-pad' }),
  upgradeStation: asset({ id: 'upgrade-station', textureKey: 'asset-interactive-upgrade-station', path: '/assets/world/interactive/update_station.png', category: 'INTERACTIVE', displayWidth: 145, displayHeight: 97, originX: 0.494, originY: 0.864, offsetX: 0, offsetY: 0, flipAllowed: false, fallbackKey: 'prototype-upgrade-station' }),
  universalGate: asset({ id: 'universal-gate', textureKey: 'asset-interactive-universal-gate', path: '/assets/world/interactive/universal_gate.png', category: 'INTERACTIVE', displayWidth: 245, displayHeight: 163, originX: 0.499, originY: 0.878, offsetX: 0, offsetY: 0, flipAllowed: false, fallbackKey: 'prototype-gate' }),
  securityBooth: asset({ id: 'security-booth', textureKey: 'asset-interactive-security-booth', path: null, category: 'INTERACTIVE', displayWidth: 105, displayHeight: 90, originX: 0.5, originY: 0.8, offsetX: 0, offsetY: 0, flipAllowed: false, fallbackKey: 'prototype-security-booth' }),
} as const;

export const STRUCTURE_ASSETS = {
  bridge: asset({ id: 'bridge', textureKey: 'asset-structure-bridge', path: null, category: 'STRUCTURE', displayWidth: 260, displayHeight: 260, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, flipAllowed: false, fallbackKey: 'prototype-bridge' }),
  fence: asset({ id: 'fence-segment', textureKey: 'asset-structure-fence', path: null, category: 'STRUCTURE', displayWidth: 96, displayHeight: 42, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, flipAllowed: true, fallbackKey: 'prototype-fence' }),
} as const;

export const ALL_VISUAL_ASSETS: readonly VisualAssetDefinition[] = [
  PLAYER_ASSET,
  ...Object.values(PET_ASSETS),
  ...Object.values(OWNER_ASSETS),
  ...Object.values(BUILDING_ASSETS),
  ...Object.values(DECORATION_ASSETS),
  ...Object.values(INTERACTIVE_ASSETS),
  ...Object.values(STRUCTURE_ASSETS),
];

export function getOwnerAssetDefinition(visualKey: string): VisualAssetDefinition {
  const definition = OWNER_ASSETS[visualKey];
  if (definition === undefined) {
    throw new Error(`Owner visual mapping is missing for fallback key "${visualKey}".`);
  }
  return definition;
}
