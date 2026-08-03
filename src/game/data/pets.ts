import { ZoneId } from './zones';

export enum PetRarity {
  Common = 'COMMON',
  Uncommon = 'UNCOMMON',
  Rare = 'RARE',
  Legendary = 'LEGENDARY',
}

export enum PetSourceType {
  Heist = 'HEIST',
  Roaming = 'ROAMING',
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
  readonly sourceType: PetSourceType;
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
    sourceType: PetSourceType.Heist,
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
    sourceType: PetSourceType.Heist,
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
    incomePerSecond: 4,
    visualKey: 'fox',
    zoneId: ZoneId.CentralHub,
    prototypeColor: 0xf28a32,
    sourceType: PetSourceType.Heist,
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
    incomePerSecond: 7,
    visualKey: 'peacock',
    zoneId: ZoneId.RichDistrict,
    prototypeColor: 0x29a9b8,
    sourceType: PetSourceType.Heist,
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
    incomePerSecond: 9,
    visualKey: 'panda',
    zoneId: ZoneId.RichDistrict,
    prototypeColor: 0xf4f1e8,
    sourceType: PetSourceType.Heist,
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
    incomePerSecond: 14,
    visualKey: 'vip-capybara',
    zoneId: ZoneId.VipEstate,
    prototypeColor: 0xe9bd48,
    sourceType: PetSourceType.Heist,
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
    incomePerSecond: 18,
    visualKey: 'vip-owl',
    zoneId: ZoneId.VipEstate,
    prototypeColor: 0x9b78d1,
    sourceType: PetSourceType.Heist,
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
    incomePerSecond: 40,
    visualKey: 'dragon-prototype',
    zoneId: ZoneId.VipEstate,
    prototypeColor: 0x8c4fd6,
    sourceType: PetSourceType.Heist,
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
  'roam-01': {
    id: 'roam-01',
    displayName: 'Прыгун',
    rarity: PetRarity.Common,
    incomePerSecond: 1,
    visualKey: 'roam-jumper',
    zoneId: ZoneId.StarterSuburb,
    prototypeColor: 0xf2c94c,
    sourceType: PetSourceType.Roaming,
    prototypeVisual: {
      shadowWidth: 40, npcScale: 0.94, playerBaseScale: 1,
      playerBaseTint: 0xffefad, idlePhase: 0.3, idleBobAmplitude: 5,
      idleBobPeriodMs: 230, idleSwayAmplitude: 3, idleSwayPeriodMs: 430,
      idleRotationAmplitude: 0.06, idleRotationPeriodMs: 360,
    },
  },
  'roam-02': {
    id: 'roam-02',
    displayName: 'Енот',
    rarity: PetRarity.Common,
    incomePerSecond: 1,
    visualKey: 'roam-raccoon',
    zoneId: ZoneId.Park,
    prototypeColor: 0x7f8c9a,
    sourceType: PetSourceType.Roaming,
    prototypeVisual: {
      shadowWidth: 42, npcScale: 0.96, playerBaseScale: 1,
      playerBaseTint: 0xdce6ee, idlePhase: 1.1, idleBobAmplitude: 3,
      idleBobPeriodMs: 280, idleSwayAmplitude: 5, idleSwayPeriodMs: 390,
      idleRotationAmplitude: 0.07, idleRotationPeriodMs: 330,
    },
  },
  'roam-03': {
    id: 'roam-03',
    displayName: 'Альпака',
    rarity: PetRarity.Uncommon,
    incomePerSecond: 2,
    visualKey: 'roam-alpaca',
    zoneId: ZoneId.CentralHub,
    prototypeColor: 0xe7c7a3,
    sourceType: PetSourceType.Roaming,
    prototypeVisual: {
      shadowWidth: 46, npcScale: 1, playerBaseScale: 1.04,
      playerBaseTint: 0xffead4, idlePhase: 1.8, idleBobAmplitude: 3,
      idleBobPeriodMs: 310, idleSwayAmplitude: 3, idleSwayPeriodMs: 510,
      idleRotationAmplitude: 0.04, idleRotationPeriodMs: 420,
    },
  },
  'roam-04': {
    id: 'roam-04',
    displayName: 'Хамелеон',
    rarity: PetRarity.Uncommon,
    incomePerSecond: 2,
    visualKey: 'roam-chameleon',
    zoneId: ZoneId.CentralHub,
    prototypeColor: 0x53bd76,
    sourceType: PetSourceType.Roaming,
    prototypeVisual: {
      shadowWidth: 38, npcScale: 0.9, playerBaseScale: 0.98,
      playerBaseTint: 0xc8ffd4, idlePhase: 2.5, idleBobAmplitude: 2,
      idleBobPeriodMs: 340, idleSwayAmplitude: 6, idleSwayPeriodMs: 460,
      idleRotationAmplitude: 0.08, idleRotationPeriodMs: 370,
    },
  },
  'roam-05': {
    id: 'roam-05',
    displayName: 'Газель',
    rarity: PetRarity.Rare,
    incomePerSecond: 3,
    visualKey: 'roam-gazelle',
    zoneId: ZoneId.RichDistrict,
    prototypeColor: 0xdca866,
    sourceType: PetSourceType.Roaming,
    prototypeVisual: {
      shadowWidth: 48, npcScale: 1.02, playerBaseScale: 1.05,
      playerBaseTint: 0xffddb5, idlePhase: 3.2, idleBobAmplitude: 4,
      idleBobPeriodMs: 250, idleSwayAmplitude: 5, idleSwayPeriodMs: 400,
      idleRotationAmplitude: 0.05, idleRotationPeriodMs: 320,
    },
  },
  'roam-06': {
    id: 'roam-06',
    displayName: 'Мини-грифон',
    rarity: PetRarity.Rare,
    incomePerSecond: 3,
    visualKey: 'roam-griffin',
    zoneId: ZoneId.RichDistrict,
    prototypeColor: 0xb978d4,
    sourceType: PetSourceType.Roaming,
    prototypeVisual: {
      shadowWidth: 51, npcScale: 1.02, playerBaseScale: 1.06,
      playerBaseTint: 0xeed2ff, idlePhase: 4.1, idleBobAmplitude: 5,
      idleBobPeriodMs: 240, idleSwayAmplitude: 5, idleSwayPeriodMs: 410,
      idleRotationAmplitude: 0.06, idleRotationPeriodMs: 340,
      idleScalePulse: 0.035,
    },
  },
} as const satisfies Readonly<Record<string, PetDefinition>>;

export type PetId = keyof typeof PET_DEFINITIONS;

export const PET_IDS = Object.keys(PET_DEFINITIONS) as PetId[];
export const CORE_PET_IDS = PET_IDS.filter(
  (petId) => PET_DEFINITIONS[petId].sourceType === PetSourceType.Heist,
);
export const ROAMING_PET_IDS = PET_IDS.filter(
  (petId) => PET_DEFINITIONS[petId].sourceType === PetSourceType.Roaming,
);
export const LEGENDARY_TARGET = PET_DEFINITIONS.dragon;

export function getPetDefinition(petId: PetId): PetDefinition {
  return PET_DEFINITIONS[petId];
}
