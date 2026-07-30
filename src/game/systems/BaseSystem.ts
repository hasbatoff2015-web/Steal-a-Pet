import Phaser from 'phaser';

export class BaseSystem {
  public constructor(
    private readonly deliveryZone: Phaser.Geom.Rectangle,
    private readonly petSlots: ReadonlyMap<string, Phaser.Math.Vector2>,
  ) {}

  public canDeliver(
    playerPosition: Phaser.Types.Math.Vector2Like,
    petPosition: Phaser.Types.Math.Vector2Like,
    allowedPetDistance: number,
  ): boolean {
    return (
      this.deliveryZone.contains(playerPosition.x, playerPosition.y) &&
      Phaser.Math.Distance.Between(
        playerPosition.x,
        playerPosition.y,
        petPosition.x,
        petPosition.y,
      ) <= allowedPetDistance
    );
  }

  public getPetSlot(petId: string): Phaser.Math.Vector2 {
    const slot = this.petSlots.get(petId);
    if (slot === undefined) {
      throw new Error(`No player-base slot configured for pet "${petId}".`);
    }
    return slot;
  }
}
