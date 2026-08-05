import Phaser from 'phaser';

import type { ChaseParameters, WorldPoint } from '../data/encounters';
import { getOwnerAssetDefinition } from '../assets/assetManifest';
import { applyAssetDisplay, resolveVisualTexture } from '../assets/assetLoader';

const RETURN_WAYPOINT_REACHED_DISTANCE = 20;
const RETURN_HOME_REACHED_DISTANCE = 12;
const RETURN_STUCK_TIMEOUT_MS = 1800;
const RETURN_MAX_DURATION_MS = 30000;
const RETURN_PROGRESS_DISTANCE = 6;
const RETURN_RESET_FADE_MS = 220;
const IDLE_VISUAL_INTERVAL_MS = 100;

export enum OwnerState {
  Idle = 'IDLE',
  Chasing = 'CHASING',
  Returning = 'RETURNING',
}

export class OwnerNpc extends Phaser.Physics.Arcade.Sprite {
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly home: Phaser.Math.Vector2;
  private readonly returnRoutes: readonly (readonly Phaser.Math.Vector2[])[];
  private activeReturnRoute: readonly Phaser.Math.Vector2[] = [];
  private ownerState = OwnerState.Idle;
  private returnWaypointIndex = 0;
  private returningSince = 0;
  private lastReturnProgressAt = 0;
  private lastReturnDistance = Number.POSITIVE_INFINITY;
  private visualResetStartedAt = 0;
  private nextIdleVisualAt = 0;
  private readonly visualScaleX: number;
  private readonly visualScaleY: number;

  public constructor(
    scene: Phaser.Scene,
    home: Phaser.Math.Vector2,
    visualKey: string,
    private readonly chaseParameters: ChaseParameters,
    returnRoutes: readonly (readonly WorldPoint[])[] = [],
    private readonly returnResetAfterMs?: number,
  ) {
    const visual = getOwnerAssetDefinition(visualKey);
    const texture = resolveVisualTexture(scene, visual);
    super(scene, home.x + visual.offsetX, home.y + visual.offsetY, texture.textureKey);

    this.home = home.clone();
    this.returnRoutes = returnRoutes.map(
      (route) => route.map((point) => new Phaser.Math.Vector2(point.x, point.y)),
    );
    this.shadow = scene.add.ellipse(home.x, home.y + 22, 42, 17, 0x321f25, 0.28);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    if (texture.production) {
      applyAssetDisplay(this, visual);
    } else {
      this.setOrigin(0.5, 0.62);
    }
    this.visualScaleX = this.scaleX;
    this.visualScaleY = this.scaleY;
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    const colliderRadius = 19;
    const colliderCenterYOffset = -7;
    body.setCircle(
      colliderRadius,
      this.displayWidth / 2 - colliderRadius,
      this.originY * this.displayHeight + colliderCenterYOffset - colliderRadius,
    );
    this.shadow.setDepth(home.y - 2);
    this.setDepth(home.y);
  }

  public getState(): OwnerState {
    return this.ownerState;
  }

  public shiftTiming(deltaMs: number): void {
    if (deltaMs <= 0 || this.ownerState !== OwnerState.Returning) {
      return;
    }
    this.returningSince += deltaMs;
    this.lastReturnProgressAt += deltaMs;
    if (this.visualResetStartedAt > 0) {
      this.visualResetStartedAt += deltaMs;
    }
  }

  public startChase(): void {
    this.ownerState = OwnerState.Chasing;
    this.visualResetStartedAt = 0;
    this.setAlpha(1);
    this.shadow.setAlpha(0.28);
    this.setScale(this.visualScaleX, this.visualScaleY);
    this.setTint(0xffd1cc);
  }

  public returnHome(): void {
    if (
      Phaser.Math.Distance.Squared(this.x, this.y, this.home.x, this.home.y) <=
      RETURN_HOME_REACHED_DISTANCE * RETURN_HOME_REACHED_DISTANCE
    ) {
      this.settleAtHome();
      return;
    }

    this.ownerState = OwnerState.Returning;
    this.clearTint();
    const routeStart = this.findClosestReturnRouteStart();
    this.activeReturnRoute = routeStart.route;
    this.returnWaypointIndex = routeStart.index;
    this.returningSince = this.scene.time.now;
    this.lastReturnProgressAt = this.returningSince;
    this.lastReturnDistance = Number.POSITIVE_INFINITY;
    this.visualResetStartedAt = 0;
  }

  public updateNpc(chaseTarget: Phaser.Types.Math.Vector2Like): void {
    if (this.ownerState === OwnerState.Idle) {
      if (this.scene.time.now < this.nextIdleVisualAt) {
        return;
      }
      this.nextIdleVisualAt = this.scene.time.now + IDLE_VISUAL_INTERVAL_MS;
      const idleScale = 1 + Math.sin(this.scene.time.now / 350) * 0.025;
      this.setScale(this.visualScaleX * idleScale, this.visualScaleY * idleScale);
      return;
    }

    if (this.ownerState === OwnerState.Chasing) {
      this.scene.physics.moveTo(
        this,
        chaseTarget.x,
        chaseTarget.y,
        this.chaseParameters.npcSpeed,
      );
    } else {
      this.updateReturn();
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.lengthSq() > 4) {
      this.setFlipX(body.velocity.x < 0);
    }

    this.shadow.setPosition(this.x, this.y + 20);
    this.shadow.setDepth(this.y - 2);
    this.setDepth(this.y);
  }

  private updateReturn(): void {
    const now = this.scene.time.now;
    if (this.visualResetStartedAt > 0) {
      this.updateVisualReturnReset(now);
      return;
    }

    const target = this.activeReturnRoute[this.returnWaypointIndex] ?? this.home;
    const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
    const reachedDistance =
      target === this.home
        ? RETURN_HOME_REACHED_DISTANCE
        : RETURN_WAYPOINT_REACHED_DISTANCE;

    if (distance <= reachedDistance) {
      if (target === this.home) {
        this.settleAtHome();
        return;
      }

      this.returnWaypointIndex += 1;
      this.lastReturnDistance = Number.POSITIVE_INFINITY;
      this.lastReturnProgressAt = this.scene.time.now;
      return;
    }

    if (distance <= this.lastReturnDistance - RETURN_PROGRESS_DISTANCE) {
      this.lastReturnDistance = distance;
      this.lastReturnProgressAt = now;
    }

    if (
      (this.returnResetAfterMs !== undefined &&
        now - this.returningSince >= this.returnResetAfterMs) ||
      now - this.returningSince >= RETURN_MAX_DURATION_MS ||
      now - this.lastReturnProgressAt >= RETURN_STUCK_TIMEOUT_MS
    ) {
      if (
        this.returnResetAfterMs !== undefined &&
        now - this.returningSince >= this.returnResetAfterMs
      ) {
        this.beginVisualReturnReset(now);
      } else {
        this.settleAtHome();
      }
      return;
    }

    this.scene.physics.moveTo(
      this,
      target.x,
      target.y,
      this.chaseParameters.returnSpeed,
    );
  }

  private beginVisualReturnReset(now: number): void {
    this.visualResetStartedAt = now;
    this.setVelocity(0, 0);
  }

  private updateVisualReturnReset(now: number): void {
    const progress = Phaser.Math.Clamp(
      (now - this.visualResetStartedAt) / RETURN_RESET_FADE_MS,
      0,
      1,
    );
    this.setAlpha(1 - progress);
    this.shadow.setAlpha(0.28 * (1 - progress));
    if (progress >= 1) {
      this.settleAtHome();
    }
  }

  private findClosestReturnRouteStart(): {
    route: readonly Phaser.Math.Vector2[];
    index: number;
  } {
    let closestRoute: readonly Phaser.Math.Vector2[] = [];
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const route of this.returnRoutes) {
      for (let index = 0; index < route.length; index += 1) {
        const waypoint = route[index];
        if (waypoint === undefined) {
          continue;
        }
        const distance = Phaser.Math.Distance.Squared(
          this.x,
          this.y,
          waypoint.x,
          waypoint.y,
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closestRoute = route;
          closestIndex = index;
        }
      }
    }

    return { route: closestRoute, index: closestIndex };
  }

  private settleAtHome(): void {
    this.setPosition(this.home.x, this.home.y);
    this.setVelocity(0, 0);
    this.ownerState = OwnerState.Idle;
    this.activeReturnRoute = [];
    this.returnWaypointIndex = 0;
    this.lastReturnDistance = Number.POSITIVE_INFINITY;
    this.visualResetStartedAt = 0;
    this.setAlpha(1);
    this.shadow.setAlpha(0.28);
  }
}
