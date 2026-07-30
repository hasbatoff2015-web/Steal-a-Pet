import { ZoneId } from './zones';

export enum PetRarity {
  Common = 'COMMON',
  Uncommon = 'UNCOMMON',
  Rare = 'RARE',
  Legendary = 'LEGENDARY',
}

export const PET_RARITY_LABELS: Readonly<Record<PetRarity, string>> = {
  [PetRarity.Common]: 'Обычный',
  [PetRarity.Uncommon]: 'Необычный',
  [PetRarity.Rare]: 'Редкий',
  [PetRarity.Legendary]: 'Легендарный',
};

export interface PetDefinition {
  readonly id: string;
  readonly displayName: string;
  readonly rarity: PetRarity;
  readonly incomePerSecond: number;
  readonly visualKey: string;
  readonly zoneId: ZoneId;
  readonly prototypeColor: number;
}

export const PET_DEFINITIONS = {
  dog: {
    id: 'dog',
    displayName: 'Собака',
    rarity: PetRarity.Common,
    incomePerSecond: 1,
    visualKey: 'dog',
    zoneId: ZoneId.StarterSuburb,
    prototypeColor: 0xd79a52,
  },
  cat: {
    id: 'cat',
    displayName: 'Кот',
    rarity: PetRarity.Uncommon,
    incomePerSecond: 2,
    visualKey: 'cat',
    zoneId: ZoneId.Park,
    prototypeColor: 0xa777d4,
  },
} as const satisfies Readonly<Record<string, PetDefinition>>;

export type PetId = keyof typeof PET_DEFINITIONS;

export const LEGENDARY_TARGET = {
  id: 'dragon',
  displayName: 'Дракон',
  rarity: PetRarity.Legendary,
  zoneId: ZoneId.VipEstate,
} as const;

export function getPetDefinition(petId: PetId): PetDefinition {
  return PET_DEFINITIONS[petId];
}
