import { describe, expect, it } from 'vitest';
import type { UpgradeId } from '../src/game/data/upgrades';
import { ZoneId } from '../src/game/data/zones';
import { ProgressionStage, ProgressionSystem } from '../src/game/systems/ProgressionSystem';

function makeProgression(upgrades: readonly UpgradeId[], pets: readonly import('../src/game/data/pets').PetId[], zones: readonly ZoneId[]): ProgressionSystem {
  const purchased = new Set(upgrades);
  const progression = new ProgressionSystem((id) => purchased.has(id), { deliveredPetIds: pets, unlockedZones: zones });
  progression.updateForMoney(0); return progression;
}

describe('Stage 6 campaign progression', () => {
  it('prioritizes the first roaming pet after Cat', () => {
    const progression = makeProgression([], ['dog', 'cat'], [ZoneId.StarterSuburb, ZoneId.Park]);
    expect(progression.getStage()).toBe(ProgressionStage.FindFirstRoamingPet);
    progression.deliverPet('roam-01', 0);
    expect(progression.getStage()).toBe(ProgressionStage.EarnForCentralHub);
  });
  it('requires two roaming pets before Rich progression', () => {
    const progression = makeProgression(['fast-dash'], ['dog', 'cat', 'fox', 'roam-01'], [ZoneId.StarterSuburb, ZoneId.Park, ZoneId.CentralHub]);
    expect(progression.getStage()).toBe(ProgressionStage.FindTwoRoamingPets);
    progression.deliverPet('roam-02', 600);
    expect(progression.getStage()).toBe(ProgressionStage.UnlockRichDistrict);
  });
  it('walks through four and six roaming thresholds', () => {
    const zones = [ZoneId.StarterSuburb, ZoneId.Park, ZoneId.CentralHub, ZoneId.RichDistrict];
    const four = ['dog','cat','fox','peacock','panda','roam-01','roam-02','roam-03','roam-04'] as const;
    expect(makeProgression(['fast-dash'], four, zones).getStage()).toBe(ProgressionStage.EarnForRunnerShoes);
    expect(makeProgression(['fast-dash','runner-shoes'], four, zones).getStage()).toBe(ProgressionStage.EarnForDoubleDash);
    expect(makeProgression(['fast-dash','runner-shoes','double-dash'], four, zones).getStage()).toBe(ProgressionStage.FindAllRoamingPets);
  });
  it('keeps migrated Dragon completion complete even at 8/14', () => {
    const progression = makeProgression(['fast-dash','double-dash'], ['dog','cat','fox','peacock','panda','vip-a','vip-b','dragon'], Object.values(ZoneId));
    expect(progression.isCampaignComplete()).toBe(true);
    expect(progression.getStage()).toBe(ProgressionStage.CampaignComplete);
  });
});
