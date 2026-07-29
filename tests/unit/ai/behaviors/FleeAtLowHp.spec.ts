import { describe, expect, it } from 'vitest';
import { fleeAtLowHp } from '@/ai/behaviors/FleeAtLowHp';
import { makeTestState } from '../../helpers/testState';

describe('fleeAtLowHp', () => {
  it('does nothing above the low-hp threshold', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'e1', faction: 'enemy', x: 2, y: 0, stats: { hp: 8, maxHp: 10 } },
        { id: 'p1', faction: 'player', x: 0, y: 0 },
      ],
    });
    expect(fleeAtLowHp(state.units.e1!, state)).toBeNull();
  });

  it('does nothing when no threat is visible', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [{ id: 'e1', faction: 'enemy', x: 2, y: 0, stats: { hp: 1, maxHp: 10 } }],
    });
    expect(fleeAtLowHp(state.units.e1!, state)).toBeNull();
  });

  it('does nothing with no AP left', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'e1', faction: 'enemy', x: 2, y: 0, stats: { hp: 1, maxHp: 10, ap: 0 } },
        { id: 'p1', faction: 'player', x: 0, y: 0 },
      ],
    });
    expect(fleeAtLowHp(state.units.e1!, state)).toBeNull();
  });

  it('moves to the reachable tile farthest from the nearest threat', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'e1', faction: 'enemy', x: 2, y: 0, stats: { hp: 1, maxHp: 10, moveRange: 4 } },
        { id: 'p1', faction: 'player', x: 0, y: 0 },
      ],
    });
    const action = fleeAtLowHp(state.units.e1!, state);
    expect(action).toEqual({ type: 'move', unitId: 'e1', to: { x: 4, y: 0 } });
  });
});
