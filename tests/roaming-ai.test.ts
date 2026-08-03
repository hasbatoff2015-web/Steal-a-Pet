import { describe, expect, it } from 'vitest';
import { ROAMING_BEHAVIOR_PROFILES, ROAMING_PET_DEFINITIONS, RoamingBehaviorId } from '../src/game/data/roamingPets';
import { chooseFleeWaypoint, RoamingAiModel, RoamingPetState } from '../src/game/systems/RoamingAiModel';

describe('roaming waypoint AI', () => {
  it('uses only connected waypoints and flees farther from the player', () => {
    const definition = ROAMING_PET_DEFINITIONS[0]!;
    const map = new Map(definition.waypoints.map((item) => [item.id, item]));
    const current = map.get(definition.spawnWaypointId)!;
    const chosen = chooseFleeWaypoint(current, map, current.x - 100, current.y, 0);
    expect(current.neighborIds).toContain(chosen.id);
    expect((chosen.x - (current.x - 100)) ** 2 + (chosen.y - current.y) ** 2).toBeGreaterThan(100 ** 2);
  });
  it('drains stamina only near the player, becomes tired and can be captured', () => {
    const profile = { ...ROAMING_BEHAVIOR_PROFILES[RoamingBehaviorId.Curious], staminaSeconds: 0.2, tiredWindowMs: 100 };
    const model = new RoamingAiModel(profile, 'a', 0);
    expect(model.update(100, 10, false)).toBe(RoamingPetState.Fleeing);
    expect(model.update(100, 10, false)).toBe(RoamingPetState.Tired);
    expect(model.capture()).toBe(true);
    expect(model.getSnapshot().state).toBe(RoamingPetState.Following);
    model.deliver(); expect(model.getSnapshot().state).toBe(RoamingPetState.AtPlayerBase);
  });
  it('recovers after a missed tired window', () => {
    const profile = { ...ROAMING_BEHAVIOR_PROFILES[RoamingBehaviorId.Curious], staminaSeconds: 0.05, tiredWindowMs: 50 };
    const model = new RoamingAiModel(profile, 'a', 0);
    model.update(50, 0, false); expect(model.getSnapshot().state).toBe(RoamingPetState.Tired);
    model.update(60, 500, false); expect(model.getSnapshot().state).toBe(RoamingPetState.Alert);
  });
});
