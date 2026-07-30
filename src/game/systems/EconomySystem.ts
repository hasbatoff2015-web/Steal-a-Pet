export class EconomySystem {
  private readonly incomeSources = new Map<string, number>();
  private money = 0;

  public update(deltaMs: number): void {
    if (this.incomeSources.size === 0) {
      return;
    }

    this.money += this.getIncomePerSecond() * (deltaMs / 1000);
  }

  public addIncomeSource(id: string, incomePerSecond: number): void {
    this.incomeSources.set(id, incomePerSecond);
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
