import { describe, expect, it } from 'vitest';

import type { PetId } from '../src/game/data/pets';
import type { UpgradeId } from '../src/game/data/upgrades';
import { ZoneId } from '../src/game/data/zones';
import {
  ProgressionStage,
  ProgressionSystem,
} from '../src/game/systems/ProgressionSystem';

function createRichProgression(): {
  progression: ProgressionSystem;
  purchasedUpgrades: Set<UpgradeId>;
} {
  const purchasedUpgrades = new Set<UpgradeId>(['fast-dash']);
  const progression = new ProgressionSystem(
    (upgradeId) => purchasedUpgrades.has(upgradeId),
    {
      deliveredPetIds: ['dog', 'cat', 'fox'],
      unlockedZones: [
        ZoneId.StarterSuburb,
        ZoneId.Park,
        ZoneId.CentralHub,
        ZoneId.RichDistrict,
      ],
    },
  );
  progression.updateForMoney(0);
  return { progression, purchasedUpgrades };
}

function deliverInOrder(order: readonly PetId[]): ProgressionSystem {
  const { progression } = createRichProgression();
  for (const petId of order) {
    progression.startTheft(petId, 0);
    expect(progression.getStage()).toBe(ProgressionStage.ReturnRichPet);
    progression.deliverPet(petId, 0);
  }
  return progression;
}

describe('Rich District progression', () => {
  it('supports Peacock followed by Panda', () => {
    const progression = deliverInOrder(['peacock', 'panda']);
    expect(progression.getRichPetDeliveryCount()).toBe(2);
    expect(progression.getStage()).toBe(ProgressionStage.EarnForDoubleDash);
  });

  it('supports Panda followed by Peacock', () => {
    const progression = deliverInOrder(['panda', 'peacock']);
    expect(progression.getRichPetDeliveryCount()).toBe(2);
    expect(progression.getStage()).toBe(ProgressionStage.EarnForDoubleDash);
  });

  it('completes Rich District only after both pets and Double Dash', () => {
    const { progression, purchasedUpgrades } = createRichProgression();
    progression.deliverPet('peacock', 250);
    expect(progression.getStage()).toBe(ProgressionStage.StealRichPets);
    progression.deliverPet('panda', 250);
    expect(progression.getStage()).toBe(ProgressionStage.BuyDoubleDash);
    purchasedUpgrades.add('double-dash');
    progression.notifyUpgradePurchased(0);
    expect(progression.getStage()).toBe(ProgressionStage.EarnForVipEstate);
  });
});

function createVipProgression(): ProgressionSystem {
  const purchasedUpgrades = new Set<UpgradeId>(['fast-dash', 'double-dash']);
  const progression = new ProgressionSystem(
    (upgradeId) => purchasedUpgrades.has(upgradeId),
    {
      deliveredPetIds: ['dog', 'cat', 'fox', 'peacock', 'panda'],
      unlockedZones: Object.values(ZoneId),
    },
  );
  progression.updateForMoney(0);
  return progression;
}

describe('VIP Estate and final progression', () => {
  it.each([
    ['vip-a', 'vip-b'],
    ['vip-b', 'vip-a'],
  ] as const)('supports free VIP order %s → %s', (first, second) => {
    const progression = createVipProgression();
    progression.startTheft(first, 0);
    expect(progression.getStage()).toBe(ProgressionStage.ReturnVipPet);
    progression.deliverPet(first, 0);
    expect(progression.getMissingVipPetId()).toBe(second);
    expect(progression.getStage()).toBe(ProgressionStage.StealVipPets);
    progression.deliverPet(second, 0);
    expect(progression.getVipPetDeliveryCount()).toBe(2);
    expect(progression.getStage()).toBe(ProgressionStage.DragonAvailable);
  });

  it('does not complete the campaign until Dragon delivery', () => {
    const progression = createVipProgression();
    progression.deliverPet('vip-a', 0);
    progression.deliverPet('vip-b', 0);
    expect(progression.isCampaignComplete()).toBe(false);
    progression.startTheft('dragon', 0);
    expect(progression.getStage()).toBe(ProgressionStage.ReturnDragon);
    progression.deliverPet('dragon', 0);
    expect(progression.isCampaignComplete()).toBe(true);
    expect(progression.getStage()).toBe(ProgressionStage.CampaignComplete);
  });
});
