import { describe, expect, it } from 'vitest';
import { setTile } from '@/gameplay/model/Grid';
import { isFlanking } from '@/gameplay/systems/combat/Flanking';
import { makeTestState } from '../../helpers/testState';

describe('isFlanking', () => {
  it('is not flanking when the defender has cover from that direction', () => {
    const state = makeTestState();
    setTile(state.grid, {
      coord: { x: 2, y: 2 },
      type: 'floor',
      occupantId: null,
      cover: { north: 'full' },
    });
    expect(isFlanking(state.grid, { x: 2, y: 2 }, { x: 2, y: 0 })).toBe(false);
  });

  it('is flanking when attacking from an uncovered side while cover exists elsewhere', () => {
    const state = makeTestState();
    setTile(state.grid, {
      coord: { x: 2, y: 2 },
      type: 'floor',
      occupantId: null,
      cover: { north: 'full' },
    });
    expect(isFlanking(state.grid, { x: 2, y: 2 }, { x: 4, y: 2 })).toBe(true);
  });

  it('is not flanking when the defender has no cover anywhere (just in the open)', () => {
    const state = makeTestState();
    expect(isFlanking(state.grid, { x: 2, y: 2 }, { x: 4, y: 2 })).toBe(false);
  });
});
