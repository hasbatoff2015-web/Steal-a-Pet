export class EconomySystem {
  private readonly incomeSources = new Map<string, number>();
  private money: number;
  private totalIncomePerSecond = 0;

  public constructor(initialMoney = 0) {
    this.money = Math.max(0, initialMoney);
  }

  public update(deltaMs: number): void {
    if (this.incomeSources.size === 0) {
      return;
    }

    this.money += this.totalIncomePerSecond * (deltaMs / 1000);
  }

  public addIncomeSource(id: string, incomePerSecond: number): void {
    const previousIncome = this.incomeSources.get(id) ?? 0;
    this.incomeSources.set(id, incomePerSecond);
    this.totalIncomePerSecond += incomePerSecond - previousIncome;
  }

  public removeIncomeSource(id: string): boolean {
    const income = this.incomeSources.get(id);
    if (income === undefined) {
      return false;
    }

    this.incomeSources.delete(id);
    this.totalIncomePerSecond -= income;
    return true;
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
    return this.totalIncomePerSecond;
  }
}
