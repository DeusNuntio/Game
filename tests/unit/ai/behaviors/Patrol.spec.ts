import { describe, expect, it } from 'vitest';
import { patrol } from '@/ai/behaviors/Patrol';
import { makeTestState } from '../../helpers/testState';

describe('patrol', () => {
  it('does nothing without a route', () => {
    const state = makeTestState({ units: [{ id: 'e1', faction: 'enemy', x: 0, y: 0 }] });
    expect(patrol(state.units.e1!, state)).toBeNull();
  });

  it('does nothing with a single-point route', () => {
    const state = makeTestState({ units: [{ id: 'e1', faction: 'enemy', x: 0, y: 0 }] });
    state.units.e1!.patrolRoute = [{ x: 0, y: 0 }];
    expect(patrol(state.units.e1!, state)).toBeNull();
  });

  it('does nothing without AP', () => {
    const state = makeTestState({
      units: [{ id: 'e1', faction: 'enemy', x: 0, y: 0, stats: { ap: 0 } }],
    });
    state.units.e1!.patrolRoute = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
    ];
    expect(patrol(state.units.e1!, state)).toBeNull();
  });

  it('moves toward the next waypoint when not currently on one', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [{ id: 'e1', faction: 'enemy', x: 1, y: 0, stats: { moveRange: 4 } }],
    });
    state.units.e1!.patrolRoute = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
    ];
    // not on either waypoint -> targets index 0 by default
    const action = patrol(state.units.e1!, state);
    expect(action).toEqual({ type: 'move', unitId: 'e1', to: { x: 0, y: 0 } });
  });

  it('cycles to the next waypoint once standing on the current one', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [{ id: 'e1', faction: 'enemy', x: 0, y: 0, stats: { moveRange: 4 } }],
    });
    state.units.e1!.patrolRoute = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
    ];
    const action = patrol(state.units.e1!, state);
    expect(action).toEqual({ type: 'move', unitId: 'e1', to: { x: 4, y: 0 } });
  });

  it('steps toward a distant waypoint without overshooting move range', () => {
    const state = makeTestState({
      width: 10,
      height: 1,
      units: [{ id: 'e1', faction: 'enemy', x: 0, y: 0, stats: { moveRange: 3 } }],
    });
    state.units.e1!.patrolRoute = [
      { x: 0, y: 0 },
      { x: 9, y: 0 },
    ];
    const action = patrol(state.units.e1!, state);
    expect(action).toEqual({ type: 'move', unitId: 'e1', to: { x: 3, y: 0 } });
  });
});
