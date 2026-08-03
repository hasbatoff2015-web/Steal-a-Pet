import { describe, expect, it } from 'vitest';

import { DashChargeController } from '../src/game/systems/DashChargeController';

describe('Double Dash charge runtime', () => {
  it('keeps the Stage 3 single-charge behavior before the upgrade', () => {
    const charges = new DashChargeController(900);
    expect(charges.tryConsume(0, true)).toBe(true);
    expect(charges.getCharges()).toBe(0);
    expect(charges.tryConsume(170, true)).toBe(false);
    charges.update(899);
    expect(charges.getCharges()).toBe(0);
    charges.update(900);
    expect(charges.getCharges()).toBe(1);
  });

  it('spends separate presses and restores two charges sequentially', () => {
    const charges = new DashChargeController(650);
    charges.setMaxCharges(2, 0);

    expect(charges.tryConsume(0, true)).toBe(true);
    expect(charges.getCharges()).toBe(1);
    expect(charges.tryConsume(100, false)).toBe(false);
    expect(charges.getCharges()).toBe(1);
    expect(charges.tryConsume(170, true)).toBe(true);
    expect(charges.getCharges()).toBe(0);
    expect(charges.tryConsume(340, true)).toBe(false);

    charges.update(650);
    expect(charges.getCharges()).toBe(1);
    charges.update(1299);
    expect(charges.getCharges()).toBe(1);
    charges.update(1300);
    expect(charges.getCharges()).toBe(2);
  });

  it('does not consume a hidden-tab time jump as recharge time', () => {
    const charges = new DashChargeController(650, 2);
    expect(charges.tryConsume(100, true)).toBe(true);
    charges.shiftTiming(10_000);
    charges.update(10_649);
    expect(charges.getCharges()).toBe(1);
    charges.update(10_750);
    expect(charges.getCharges()).toBe(2);
  });
});
