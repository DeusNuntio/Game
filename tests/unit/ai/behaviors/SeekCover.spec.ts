import { describe, expect, it } from 'vitest';
import { setTile } from '@/gameplay/model/Grid';
import { seekCover } from '@/ai/behaviors/SeekCover';
import { makeTestState } from '../../helpers/testState';

describe('seekCover', () => {
  it('does nothing without enough AP to reposition', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'e1', faction: 'enemy', x: 2, y: 0, stats: { ap: 1 } },
        { id: 'p1', faction: 'player', x: 0, y: 0 },
      ],
    });
    expect(seekCover(state.units.e1!, state)).toBeNull();
  });

  it('does nothing when already in cover against the nearest threat', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'e1', faction: 'enemy', x: 2, y: 0, stats: { ap: 2 } },
        { id: 'p1', faction: 'player', x: 0, y: 0 },
      ],
    });
    setTile(state.grid, {
      coord: { x: 2, y: 0 },
      type: 'floor',
      occupantId: 'e1',
      cover: { west: 'full' },
    });
    expect(seekCover(state.units.e1!, state)).toBeNull();
  });

  it('moves to a reachable tile that grants cover against the nearest threat', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'e1', faction: 'enemy', x: 2, y: 0, stats: { ap: 2, moveRange: 4 } },
        { id: 'p1', faction: 'player', x: 0, y: 0 },
      ],
    });
    setTile(state.grid, {
      coord: { x: 4, y: 0 },
      type: 'floor',
      occupantId: null,
      cover: { west: 'full' },
    });
    const action = seekCover(state.units.e1!, state);
    expect(action).toEqual({ type: 'move', unitId: 'e1', to: { x: 4, y: 0 } });
  });
});
