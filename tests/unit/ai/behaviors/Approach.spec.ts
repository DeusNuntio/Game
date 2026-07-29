import { describe, expect, it } from 'vitest';
import { setTile } from '@/gameplay/model/Grid';
import { approach } from '@/ai/behaviors/Approach';
import { makeTestState } from '../../helpers/testState';

describe('approach', () => {
  it('does nothing when an enemy is already visible', () => {
    const state = makeTestState({
      units: [
        { id: 'e1', faction: 'enemy', x: 0, y: 0 },
        { id: 'p1', faction: 'player', x: 1, y: 0 },
      ],
    });
    expect(approach(state.units.e1!, state)).toBeNull();
  });

  it('does nothing when there are no living enemies at all', () => {
    const state = makeTestState({ units: [{ id: 'e1', faction: 'enemy', x: 0, y: 0 }] });
    expect(approach(state.units.e1!, state)).toBeNull();
  });

  it('moves toward the nearest (currently unseen) enemy, reducing distance', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'e1', faction: 'enemy', x: 0, y: 0, stats: { moveRange: 4 } },
        { id: 'p1', faction: 'player', x: 4, y: 0 },
      ],
    });
    // block direct line of sight so the enemy is not "visible" yet
    setTile(state.grid, { coord: { x: 2, y: 0 }, type: 'wall', occupantId: null, cover: {} });

    const action = approach(state.units.e1!, state);
    expect(action?.type).toBe('move');
    if (action?.type === 'move') {
      expect(action.to.x).toBeGreaterThan(0);
      expect(action.to.x).toBeLessThan(2); // can't walk through the wall at x=2
    }
  });
});
