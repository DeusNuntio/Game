import { describe, expect, it } from 'vitest';
import { computeInitiativeOrder } from '@/gameplay/systems/turns/InitiativeOrder';
import { makeTestState } from '../../helpers/testState';

describe('computeInitiativeOrder', () => {
  it('sorts living units by initiative descending', () => {
    const state = makeTestState({
      units: [
        { id: 'slow', faction: 'player', x: 0, y: 0, stats: { initiative: 2 } },
        { id: 'fast', faction: 'enemy', x: 1, y: 0, stats: { initiative: 9 } },
        { id: 'mid', faction: 'player', x: 2, y: 0, stats: { initiative: 5 } },
      ],
    });
    expect(computeInitiativeOrder(state)).toEqual(['fast', 'mid', 'slow']);
  });

  it('breaks ties by id for determinism', () => {
    const state = makeTestState({
      units: [
        { id: 'b', faction: 'player', x: 0, y: 0, stats: { initiative: 5 } },
        { id: 'a', faction: 'enemy', x: 1, y: 0, stats: { initiative: 5 } },
      ],
    });
    expect(computeInitiativeOrder(state)).toEqual(['a', 'b']);
  });

  it('excludes dead units', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 1, y: 0 },
      ],
    });
    state.units.e1!.alive = false;
    expect(computeInitiativeOrder(state)).toEqual(['p1']);
  });
});
