import { describe, expect, it } from 'vitest';
import { attackIfInRange } from '@/ai/behaviors/AttackIfInRange';
import { makeTestState } from '../../helpers/testState';

describe('attackIfInRange', () => {
  it('does nothing without AP', () => {
    const state = makeTestState({
      units: [
        { id: 'e1', faction: 'enemy', x: 0, y: 0, stats: { ap: 0 } },
        { id: 'p1', faction: 'player', x: 1, y: 0 },
      ],
    });
    expect(attackIfInRange(state.units.e1!, state)).toBeNull();
  });

  it('does nothing without a visible enemy', () => {
    const state = makeTestState({ units: [{ id: 'e1', faction: 'enemy', x: 0, y: 0 }] });
    expect(attackIfInRange(state.units.e1!, state)).toBeNull();
  });

  it('targets the weakest visible enemy', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'e1', faction: 'enemy', x: 2, y: 0 },
        { id: 'p1', faction: 'player', x: 0, y: 0, stats: { hp: 10 } },
        { id: 'p2', faction: 'player', x: 4, y: 0, stats: { hp: 2 } },
      ],
    });
    const action = attackIfInRange(state.units.e1!, state);
    expect(action).toEqual({ type: 'attack', attackerId: 'e1', targetId: 'p2' });
  });
});
