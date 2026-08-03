import { getPetDefinition, type PetId } from '../data/pets';
import {
  DOUBLE_DASH_UPGRADE,
  FAST_DASH_UPGRADE,
  type UpgradeId,
} from '../data/upgrades';
import {
  CENTRAL_HUB_GATE_DEFINITION,
  PARK_GATE_DEFINITION,
  RICH_DISTRICT_GATE_DEFINITION,
  VIP_ESTATE_GATE_DEFINITION,
  ZoneId,
} from '../data/zones';

export const RICH_PET_IDS = [
  'peacock',
  'panda',
] as const satisfies readonly PetId[];
export const VIP_PET_IDS = [
  'vip-a',
  'vip-b',
] as const satisfies readonly PetId[];

export enum ProgressionStage {
  FirstPet = 'FIRST_PET',
  EarnForPark = 'EARN_FOR_PARK',
  UnlockPark = 'UNLOCK_PARK',
  StealParkPet = 'STEAL_PARK_PET',
  ReturnParkPet = 'RETURN_PARK_PET',
  EarnForCentralHub = 'EARN_FOR_CENTRAL_HUB',
  UnlockCentralHub = 'UNLOCK_CENTRAL_HUB',
  StealHubPet = 'STEAL_HUB_PET',
  ReturnHubPet = 'RETURN_HUB_PET',
  EarnForDashUpgrade = 'EARN_FOR_DASH_UPGRADE',
  BuyDashUpgrade = 'BUY_DASH_UPGRADE',
  EarnForRichDistrict = 'EARN_FOR_RICH_DISTRICT',
  UnlockRichDistrict = 'UNLOCK_RICH_DISTRICT',
  StealRichPets = 'STEAL_RICH_PETS',
  ReturnRichPet = 'RETURN_RICH_PET',
  EarnForDoubleDash = 'EARN_FOR_DOUBLE_DASH',
  BuyDoubleDash = 'BUY_DOUBLE_DASH',
  EarnForVipEstate = 'EARN_FOR_VIP_ESTATE',
  UnlockVipEstate = 'UNLOCK_VIP_ESTATE',
  StealVipPets = 'STEAL_VIP_PETS',
  ReturnVipPet = 'RETURN_VIP_PET',
  DragonAvailable = 'DRAGON_AVAILABLE',
  ReturnDragon = 'RETURN_DRAGON',
  CampaignComplete = 'CAMPAIGN_COMPLETE',
}

export interface ProgressionSnapshot {
  readonly deliveredPetIds: readonly PetId[];
  readonly unlockedZones: readonly ZoneId[];
  readonly campaignStage: ProgressionStage;
}

export interface ProgressionInitialState {
  readonly deliveredPetIds?: readonly PetId[];
  readonly unlockedZones?: readonly ZoneId[];
  readonly activePetId?: PetId | null;
}

export class ProgressionSystem {
  private readonly deliveredPetIds = new Set<PetId>();
  private readonly unlockedZones = new Set<ZoneId>([ZoneId.StarterSuburb]);
  private activePetId: PetId | null;
  private campaignStage = ProgressionStage.FirstPet;

  public constructor(
    private readonly isUpgradePurchased: (upgradeId: UpgradeId) => boolean,
    initialState: ProgressionInitialState = {},
  ) {
    for (const petId of initialState.deliveredPetIds ?? []) {
      this.deliveredPetIds.add(petId);
    }
    for (const zoneId of initialState.unlockedZones ?? []) {
      this.unlockedZones.add(zoneId);
    }
    this.activePetId = initialState.activePetId ?? null;
  }

  public updateForMoney(money: number): void {
    this.campaignStage = this.deriveStage(money);
  }

  public startTheft(petId: PetId, money: number): void {
    this.activePetId = petId;
    this.updateForMoney(money);
  }

  public cancelTheft(money: number): void {
    this.activePetId = null;
    this.updateForMoney(money);
  }

  public deliverPet(petId: PetId, money: number): void {
    this.deliveredPetIds.add(petId);
    this.activePetId = null;
    this.updateForMoney(money);
  }

  public unlockZone(zoneId: ZoneId, money: number): void {
    this.unlockedZones.add(zoneId);
    this.updateForMoney(money);
  }

  public notifyUpgradePurchased(money: number): void {
    this.updateForMoney(money);
  }

  public isPetDelivered(petId: PetId): boolean {
    return this.deliveredPetIds.has(petId);
  }

  public isZoneUnlocked(zoneId: ZoneId): boolean {
    return this.unlockedZones.has(zoneId);
  }

  public isCampaignComplete(): boolean {
    return this.deliveredPetIds.has('dragon');
  }

  public getStage(): ProgressionStage {
    return this.campaignStage;
  }

  public getRichPetDeliveryCount(): number {
    return this.countDelivered(RICH_PET_IDS);
  }

  public getVipPetDeliveryCount(): number {
    return this.countDelivered(VIP_PET_IDS);
  }

  public getMissingVipPetId(): (typeof VIP_PET_IDS)[number] | null {
    return (
      VIP_PET_IDS.find((petId) => !this.deliveredPetIds.has(petId)) ?? null
    );
  }

  public getObjective(money: number): string {
    switch (this.campaignStage) {
      case ProgressionStage.FirstPet:
        return this.stealObjective('dog');
      case ProgressionStage.EarnForPark:
        return this.earnObjective(PARK_GATE_DEFINITION, money);
      case ProgressionStage.UnlockPark:
        return 'Открой PARK у моста';
      case ProgressionStage.StealParkPet:
        return `Исследуй PARK · ${this.stealObjective('cat')}`;
      case ProgressionStage.ReturnParkPet:
        return this.returnObjective('cat');
      case ProgressionStage.EarnForCentralHub:
        return this.earnObjective(CENTRAL_HUB_GATE_DEFINITION, money);
      case ProgressionStage.UnlockCentralHub:
        return 'Открой CENTRAL HUB';
      case ProgressionStage.StealHubPet:
        return `Исследуй CENTRAL HUB · ${this.stealObjective('fox')}`;
      case ProgressionStage.ReturnHubPet:
        return this.returnObjective('fox');
      case ProgressionStage.EarnForDashUpgrade:
        return `Накопи ${FAST_DASH_UPGRADE.cost} монет на «Быстрый рывок» (${Math.floor(money)}/${FAST_DASH_UPGRADE.cost})`;
      case ProgressionStage.BuyDashUpgrade:
        return 'Купи улучшение «Быстрый рывок» на базе';
      case ProgressionStage.EarnForRichDistrict:
        return this.earnObjective(RICH_DISTRICT_GATE_DEFINITION, money);
      case ProgressionStage.UnlockRichDistrict:
        return 'Открой RICH DISTRICT';
      case ProgressionStage.StealRichPets: {
        const deliveredCount = this.getRichPetDeliveryCount();
        if (deliveredCount === 0) {
          return 'Укради питомцев в RICH DISTRICT: 0/2';
        }
        const missingPetId = RICH_PET_IDS.find(
          (petId) => !this.deliveredPetIds.has(petId),
        );
        return missingPetId === undefined
          ? 'Укради питомцев в RICH DISTRICT: 2/2'
          : `Укради второго питомца: ${getPetDefinition(missingPetId).displayName}`;
      }
      case ProgressionStage.ReturnRichPet:
        return this.returnObjective(this.activePetId);
      case ProgressionStage.EarnForDoubleDash:
        return `Накопи ${DOUBLE_DASH_UPGRADE.cost} монет на «Двойной рывок» (${Math.floor(money)}/${DOUBLE_DASH_UPGRADE.cost})`;
      case ProgressionStage.BuyDoubleDash:
        return 'Купи улучшение «Двойной рывок» на базе';
      case ProgressionStage.EarnForVipEstate:
        return this.earnObjective(VIP_ESTATE_GATE_DEFINITION, money);
      case ProgressionStage.UnlockVipEstate:
        return 'Открой VIP ESTATE';
      case ProgressionStage.StealVipPets: {
        const deliveredCount = this.getVipPetDeliveryCount();
        if (deliveredCount === 0) {
          return 'Укради VIP-питомцев: 0/2';
        }
        const missingPetId = this.getMissingVipPetId();
        return missingPetId === null
          ? 'Укради VIP-питомцев: 2/2'
          : `Укради второго VIP-питомца: ${getPetDefinition(missingPetId).displayName}`;
      }
      case ProgressionStage.ReturnVipPet:
        return this.returnObjective(this.activePetId);
      case ProgressionStage.DragonAvailable:
        return `Защита снята · ${this.stealObjective('dragon')}`;
      case ProgressionStage.ReturnDragon:
        return `ФИНАЛ · ${this.returnObjective('dragon')}`;
      case ProgressionStage.CampaignComplete:
        return 'Кампания завершена · исследуй мир';
    }
  }

  public getSnapshot(): ProgressionSnapshot {
    return {
      deliveredPetIds: [...this.deliveredPetIds],
      unlockedZones: [...this.unlockedZones],
      campaignStage: this.campaignStage,
    };
  }

  private deriveStage(money: number): ProgressionStage {
    if (this.isUpgradePurchased(DOUBLE_DASH_UPGRADE.id)) {
      if (!this.unlockedZones.has(ZoneId.VipEstate)) {
        return money >= VIP_ESTATE_GATE_DEFINITION.cost
          ? ProgressionStage.UnlockVipEstate
          : ProgressionStage.EarnForVipEstate;
      }
      if (this.activePetId === 'vip-a' || this.activePetId === 'vip-b') {
        return ProgressionStage.ReturnVipPet;
      }
      if (this.activePetId === 'dragon') {
        return ProgressionStage.ReturnDragon;
      }
      if (this.getVipPetDeliveryCount() < VIP_PET_IDS.length) {
        return ProgressionStage.StealVipPets;
      }
      return this.deliveredPetIds.has('dragon')
        ? ProgressionStage.CampaignComplete
        : ProgressionStage.DragonAvailable;
    }
    if (this.isUpgradePurchased(FAST_DASH_UPGRADE.id)) {
      if (!this.unlockedZones.has(ZoneId.RichDistrict)) {
        return money >= RICH_DISTRICT_GATE_DEFINITION.cost
          ? ProgressionStage.UnlockRichDistrict
          : ProgressionStage.EarnForRichDistrict;
      }
      if (this.activePetId === 'peacock' || this.activePetId === 'panda') {
        return ProgressionStage.ReturnRichPet;
      }
      if (this.getRichPetDeliveryCount() < RICH_PET_IDS.length) {
        return ProgressionStage.StealRichPets;
      }
      return money >= DOUBLE_DASH_UPGRADE.cost
        ? ProgressionStage.BuyDoubleDash
        : ProgressionStage.EarnForDoubleDash;
    }
    if (this.deliveredPetIds.has('fox')) {
      return money >= FAST_DASH_UPGRADE.cost
        ? ProgressionStage.BuyDashUpgrade
        : ProgressionStage.EarnForDashUpgrade;
    }
    if (this.activePetId === 'fox') {
      return ProgressionStage.ReturnHubPet;
    }
    if (this.deliveredPetIds.has('cat')) {
      if (!this.unlockedZones.has(ZoneId.CentralHub)) {
        return money >= CENTRAL_HUB_GATE_DEFINITION.cost
          ? ProgressionStage.UnlockCentralHub
          : ProgressionStage.EarnForCentralHub;
      }
      return ProgressionStage.StealHubPet;
    }
    if (this.activePetId === 'cat') {
      return ProgressionStage.ReturnParkPet;
    }
    if (!this.deliveredPetIds.has('dog')) {
      return ProgressionStage.FirstPet;
    }
    if (!this.unlockedZones.has(ZoneId.Park)) {
      return money >= PARK_GATE_DEFINITION.cost
        ? ProgressionStage.UnlockPark
        : ProgressionStage.EarnForPark;
    }
    return ProgressionStage.StealParkPet;
  }

  private countDelivered(petIds: readonly PetId[]): number {
    return petIds.reduce(
      (count, petId) => count + Number(this.deliveredPetIds.has(petId)),
      0,
    );
  }

  private stealObjective(petId: PetId): string {
    return `Укради питомца: ${getPetDefinition(petId).displayName}`;
  }

  private returnObjective(petId: PetId | null): string {
    return petId === null
      ? 'Верни питомца на базу'
      : `Верни питомца на базу: ${getPetDefinition(petId).displayName}`;
  }

  private earnObjective(
    definition: { readonly displayName: string; readonly cost: number },
    money: number,
  ): string {
    return `Накопи ${definition.cost} монет для ${definition.displayName} (${Math.floor(money)}/${definition.cost})`;
  }
}
