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

export interface PetPrototypeVisual {
  readonly shadowWidth: number;
  readonly npcScale: number;
  readonly playerBaseScale: number;
  readonly playerBaseTint: number;
  readonly idlePhase: number;
  readonly idleBobAmplitude: number;
  readonly idleBobPeriodMs: number;
  readonly idleSwayAmplitude: number;
  readonly idleSwayPeriodMs: number;
  readonly idleRotationAmplitude: number;
  readonly idleRotationPeriodMs: number;
  readonly idleScalePulse?: number;
}

export interface PetDefinition {
  readonly id: string;
  readonly displayName: string;
  readonly rarity: PetRarity;
  readonly incomePerSecond: number;
  readonly visualKey: string;
  readonly zoneId: ZoneId;
  readonly prototypeColor: number;
  readonly prototypeVisual: PetPrototypeVisual;
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
    prototypeVisual: {
      shadowWidth: 43,
      npcScale: 1,
      playerBaseScale: 1.06,
      playerBaseTint: 0xfff3a6,
      idlePhase: 0,
      idleBobAmplitude: 3,
      idleBobPeriodMs: 280,
      idleSwayAmplitude: 0,
      idleSwayPeriodMs: 520,
      idleRotationAmplitude: 0.05,
      idleRotationPeriodMs: 430,
    },
  },
  cat: {
    id: 'cat',
    displayName: 'Кот',
    rarity: PetRarity.Uncommon,
    incomePerSecond: 2,
    visualKey: 'cat',
    zoneId: ZoneId.Park,
    prototypeColor: 0xa777d4,
    prototypeVisual: {
      shadowWidth: 38,
      npcScale: 0.94,
      playerBaseScale: 1,
      playerBaseTint: 0xf1ddff,
      idlePhase: Math.PI * 0.65,
      idleBobAmplitude: 3,
      idleBobPeriodMs: 220,
      idleSwayAmplitude: 4,
      idleSwayPeriodMs: 520,
      idleRotationAmplitude: 0.05,
      idleRotationPeriodMs: 320,
    },
  },
  fox: {
    id: 'fox',
    displayName: 'Лиса',
    rarity: PetRarity.Rare,
    incomePerSecond: 5,
    visualKey: 'fox',
    zoneId: ZoneId.CentralHub,
    prototypeColor: 0xf28a32,
    prototypeVisual: {
      shadowWidth: 47,
      npcScale: 1.04,
      playerBaseScale: 1.08,
      playerBaseTint: 0xffdfba,
      idlePhase: Math.PI * 1.15,
      idleBobAmplitude: 3,
      idleBobPeriodMs: 245,
      idleSwayAmplitude: 6,
      idleSwayPeriodMs: 460,
      idleRotationAmplitude: 0.065,
      idleRotationPeriodMs: 290,
    },
  },
  peacock: {
    id: 'peacock',
    displayName: 'Павлин',
    rarity: PetRarity.Rare,
    incomePerSecond: 10,
    visualKey: 'peacock',
    zoneId: ZoneId.RichDistrict,
    prototypeColor: 0x29a9b8,
    prototypeVisual: {
      shadowWidth: 62,
      npcScale: 0.98,
      playerBaseScale: 1.02,
      playerBaseTint: 0xd4ffff,
      idlePhase: Math.PI * 1.55,
      idleBobAmplitude: 3,
      idleBobPeriodMs: 310,
      idleSwayAmplitude: 5,
      idleSwayPeriodMs: 620,
      idleRotationAmplitude: 0.035,
      idleRotationPeriodMs: 510,
      idleScalePulse: 0.045,
    },
  },
  panda: {
    id: 'panda',
    displayName: 'Панда',
    rarity: PetRarity.Rare,
    incomePerSecond: 14,
    visualKey: 'panda',
    zoneId: ZoneId.RichDistrict,
    prototypeColor: 0xf4f1e8,
    prototypeVisual: {
      shadowWidth: 54,
      npcScale: 1.02,
      playerBaseScale: 1.06,
      playerBaseTint: 0xfff8df,
      idlePhase: Math.PI * 0.3,
      idleBobAmplitude: 2,
      idleBobPeriodMs: 360,
      idleSwayAmplitude: 0,
      idleSwayPeriodMs: 520,
      idleRotationAmplitude: 0.04,
      idleRotationPeriodMs: 430,
      idleScalePulse: 0.025,
    },
  },
  'vip-a': {
    id: 'vip-a',
    displayName: 'Золотая Капибара',
    rarity: PetRarity.Rare,
    incomePerSecond: 24,
    visualKey: 'vip-capybara',
    zoneId: ZoneId.VipEstate,
    prototypeColor: 0xe9bd48,
    prototypeVisual: {
      shadowWidth: 66,
      npcScale: 1.04,
      playerBaseScale: 1.08,
      playerBaseTint: 0xffed9e,
      idlePhase: Math.PI * 0.45,
      idleBobAmplitude: 2.5,
      idleBobPeriodMs: 380,
      idleSwayAmplitude: 4,
      idleSwayPeriodMs: 660,
      idleRotationAmplitude: 0.035,
      idleRotationPeriodMs: 520,
      idleScalePulse: 0.025,
    },
  },
  'vip-b': {
    id: 'vip-b',
    displayName: 'Королевская Сова',
    rarity: PetRarity.Rare,
    incomePerSecond: 36,
    visualKey: 'vip-owl',
    zoneId: ZoneId.VipEstate,
    prototypeColor: 0x9b78d1,
    prototypeVisual: {
      shadowWidth: 58,
      npcScale: 1.02,
      playerBaseScale: 1.06,
      playerBaseTint: 0xeee1ff,
      idlePhase: Math.PI * 1.75,
      idleBobAmplitude: 4,
      idleBobPeriodMs: 300,
      idleSwayAmplitude: 3,
      idleSwayPeriodMs: 480,
      idleRotationAmplitude: 0.045,
      idleRotationPeriodMs: 370,
      idleScalePulse: 0.035,
    },
  },
  dragon: {
    id: 'dragon',
    displayName: 'Дракон',
    rarity: PetRarity.Legendary,
    incomePerSecond: 100,
    visualKey: 'dragon-prototype',
    zoneId: ZoneId.VipEstate,
    prototypeColor: 0x8c4fd6,
    prototypeVisual: {
      shadowWidth: 92,
      npcScale: 1.12,
      playerBaseScale: 1.18,
      playerBaseTint: 0xffe7a3,
      idlePhase: Math.PI * 0.95,
      idleBobAmplitude: 5,
      idleBobPeriodMs: 420,
      idleSwayAmplitude: 6,
      idleSwayPeriodMs: 720,
      idleRotationAmplitude: 0.035,
      idleRotationPeriodMs: 560,
      idleScalePulse: 0.04,
    },
  },
} as const satisfies Readonly<Record<string, PetDefinition>>;

export type PetId = keyof typeof PET_DEFINITIONS;

export const PET_IDS = Object.keys(PET_DEFINITIONS) as PetId[];
export const LEGENDARY_TARGET = PET_DEFINITIONS.dragon;

export function getPetDefinition(petId: PetId): PetDefinition {
  return PET_DEFINITIONS[petId];
}
