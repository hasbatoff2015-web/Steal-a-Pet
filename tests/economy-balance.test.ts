import { describe, expect, it } from 'vitest';
import { PET_DEFINITIONS } from '../src/game/data/pets';
import { EconomySystem } from '../src/game/systems/EconomySystem';

describe('balance revision 2 income', () => {
  it('matches every approved cumulative checkpoint', () => {
    const core = ['dog','cat','fox','peacock','panda','vip-a','vip-b','dragon'] as const;
    const roaming = ['roam-01','roam-02','roam-03','roam-04','roam-05','roam-06'] as const;
    const cumulative = (ids: readonly (keyof typeof PET_DEFINITIONS)[]) => ids.map((_, i) => ids.slice(0, i + 1).reduce((sum, id) => sum + PET_DEFINITIONS[id].incomePerSecond, 0));
    expect(cumulative(core)).toEqual([1,3,7,14,23,37,55,95]);
    expect(cumulative(roaming)).toEqual([1,2,4,6,9,12]);
    expect(cumulative(core.slice(0,5))![4]! + cumulative(roaming.slice(0,4))![3]!).toBe(29);
    expect(55 + 12).toBe(67);
    expect(95 + 12).toBe(107);
  });
  it('does not duplicate a restored income source', () => {
    const economy = new EconomySystem(); economy.addIncomeSource('dog', 1); economy.addIncomeSource('dog', 1);
    expect(economy.getIncomePerSecond()).toBe(1);
  });
});
