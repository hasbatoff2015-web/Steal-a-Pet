export class DashChargeController {
  private maxCharges: number;
  private charges: number;
  private nextChargeAt = 0;

  public constructor(
    private cooldownMs: number,
    maxCharges = 1,
  ) {
    this.cooldownMs = Math.max(1, cooldownMs);
    this.maxCharges = Math.max(1, Math.floor(maxCharges));
    this.charges = this.maxCharges;
  }

  public update(time: number): void {
    while (
      this.charges < this.maxCharges &&
      this.nextChargeAt > 0 &&
      time >= this.nextChargeAt
    ) {
      this.charges += 1;
      this.nextChargeAt =
        this.charges < this.maxCharges
          ? this.nextChargeAt + this.cooldownMs
          : 0;
    }
  }

  public tryConsume(time: number, canStartDash: boolean): boolean {
    this.update(time);
    if (!canStartDash || this.charges <= 0) {
      return false;
    }

    const wasFullyCharged = this.charges === this.maxCharges;
    this.charges -= 1;
    if (wasFullyCharged) {
      this.nextChargeAt = time + this.cooldownMs;
    }
    return true;
  }

  public setCooldownMs(cooldownMs: number, time: number): void {
    const nextCooldownMs = Math.max(1, cooldownMs);
    const remainingMs = Math.max(0, this.nextChargeAt - time);
    const elapsedMs = Math.max(0, this.cooldownMs - remainingMs);

    this.cooldownMs = nextCooldownMs;
    if (this.charges < this.maxCharges && remainingMs > 0) {
      this.nextChargeAt = time + Math.max(0, nextCooldownMs - elapsedMs);
    }
  }

  public setMaxCharges(maxCharges: number, time: number): void {
    const nextMaxCharges = Math.max(1, Math.floor(maxCharges));
    if (nextMaxCharges === this.maxCharges) {
      return;
    }

    const increased = nextMaxCharges > this.maxCharges;
    this.maxCharges = nextMaxCharges;
    this.charges = increased
      ? nextMaxCharges
      : Math.min(this.charges, nextMaxCharges);
    this.nextChargeAt =
      this.charges < this.maxCharges ? time + this.cooldownMs : 0;
  }

  public getRechargeRatio(time: number): number {
    if (this.charges >= this.maxCharges || this.nextChargeAt <= 0) {
      return 1;
    }
    return Math.max(
      0,
      Math.min(1, 1 - (this.nextChargeAt - time) / this.cooldownMs),
    );
  }

  public getCharges(): number {
    return this.charges;
  }

  public getMaxCharges(): number {
    return this.maxCharges;
  }

  public getCooldownMs(): number {
    return this.cooldownMs;
  }
}
