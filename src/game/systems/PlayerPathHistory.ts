import Phaser from 'phaser';

export interface BreadcrumbPoint {
  readonly sequence: number;
  readonly x: number;
  readonly y: number;
}

export class PlayerPathHistory {
  private readonly points: BreadcrumbPoint[] = [];
  private nextSequence = 0;

  public constructor(
    initialPosition: Phaser.Types.Math.Vector2Like,
    private readonly spacing: number,
    private readonly maxPoints: number,
  ) {
    this.reset(initialPosition);
  }

  public reset(position: Phaser.Types.Math.Vector2Like): void {
    this.points.length = 0;
    this.nextSequence = 0;
    this.appendPoint(position.x, position.y);
  }

  public record(position: Phaser.Types.Math.Vector2Like): void {
    const last = this.points.at(-1);
    if (last === undefined) {
      this.appendPoint(position.x, position.y);
      return;
    }

    const distance = Phaser.Math.Distance.Between(last.x, last.y, position.x, position.y);
    if (distance < this.spacing) {
      return;
    }

    const directionX = (position.x - last.x) / distance;
    const directionY = (position.y - last.y) / distance;
    const pointCount = Math.floor(distance / this.spacing);

    for (let index = 1; index <= pointCount; index += 1) {
      this.appendPoint(
        last.x + directionX * this.spacing * index,
        last.y + directionY * this.spacing * index,
      );
    }
  }

  public getNextFollowWaypoint(
    afterSequence: number | null,
    trailingDistance: number,
  ): BreadcrumbPoint | null {
    const cutoffIndex = this.findTrailingCutoffIndex(trailingDistance);
    if (cutoffIndex < 0) {
      return null;
    }

    const firstSequence = this.points[0]?.sequence;
    const minimumSequence =
      afterSequence === null || firstSequence === undefined
        ? Number.NEGATIVE_INFINITY
        : Math.max(afterSequence, firstSequence - 1);

    for (let index = 0; index <= cutoffIndex; index += 1) {
      const point = this.points[index];
      if (point !== undefined && point.sequence > minimumSequence) {
        return point;
      }
    }

    return null;
  }

  public getTrailingPoint(trailingDistance: number): BreadcrumbPoint | null {
    const cutoffIndex = this.findTrailingCutoffIndex(trailingDistance);
    return cutoffIndex >= 0 ? (this.points[cutoffIndex] ?? null) : null;
  }

  private findTrailingCutoffIndex(trailingDistance: number): number {
    let accumulatedDistance = 0;

    for (let index = this.points.length - 2; index >= 0; index -= 1) {
      const point = this.points[index];
      const nextPoint = this.points[index + 1];
      if (point === undefined || nextPoint === undefined) {
        continue;
      }

      accumulatedDistance += Phaser.Math.Distance.Between(
        point.x,
        point.y,
        nextPoint.x,
        nextPoint.y,
      );

      if (accumulatedDistance >= trailingDistance) {
        return index;
      }
    }

    return -1;
  }

  private appendPoint(x: number, y: number): void {
    this.points.push({ sequence: this.nextSequence, x, y });
    this.nextSequence += 1;

    const overflow = this.points.length - this.maxPoints;
    if (overflow > 0) {
      this.points.splice(0, overflow);
    }
  }
}
