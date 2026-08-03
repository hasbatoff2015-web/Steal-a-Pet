import Phaser from 'phaser';

export class VipEstatePreview {
  private complete: boolean | null = null;

  public constructor(private readonly statusLabel: Phaser.GameObjects.Text) {}

  public setRichDistrictComplete(complete: boolean): void {
    if (complete === this.complete) {
      return;
    }

    this.complete = complete;
    this.statusLabel
      .setText(
        complete
          ? 'VIP ESTATE\nФИНАЛЬНАЯ ЗОНА\nСКОРО'
          : 'VIP ESTATE\nФИНАЛЬНАЯ ЗОНА · ЗАКРЫТО',
      )
      .setColor(complete ? '#fff3b5' : '#efe3ff');
  }
}
