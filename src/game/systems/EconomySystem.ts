export class EconomySystem {
  private readonly incomeSources = new Map<string, number>();
  private money: number;

  public constructor(initialMoney = 0) {
    this.money = Math.max(0, initialMoney);
  }

  public update(deltaMs: number): void {
    if (this.incomeSources.size === 0) {
      return;
    }

    this.money += this.getIncomePerSecond() * (deltaMs / 1000);
  }

  public addIncomeSource(id: string, incomePerSecond: number): void {
    this.incomeSources.set(id, incomePerSecond);
  }

  public canAfford(amount: number): boolean {
    return amount >= 0 && this.money >= amount;
  }

  public spend(amount: number): boolean {
    if (!this.canAfford(amount)) {
      return false;
    }

    this.money -= amount;
    return true;
  }

  public addMoney(amount: number): void {
    if (amount > 0) {
      this.money += amount;
    }
  }

  public getMoney(): number {
    return this.money;
  }

  public getDisplayedMoney(): number {
    return Math.floor(this.money);
  }

  public getIncomePerSecond(): number {
    let total = 0;
    for (const income of this.incomeSources.values()) {
      total += income;
    }
    return total;
  }
}
