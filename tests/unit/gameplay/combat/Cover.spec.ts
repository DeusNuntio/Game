import { describe, expect, it } from 'vitest';
import { setTile } from '@/gameplay/model/Grid';
import { getCoverLevel } from '@/gameplay/systems/combat/Cover';
import { makeTestState } from '../../helpers/testState';

describe('getCoverLevel', () => {
  it('returns none when the tile has no cover data', () => {
    const state = makeTestState();
    expect(getCoverLevel(state.grid, { x: 2, y: 2 }, { x: 2, y: 0 })).toBe('none');
  });

  it('returns the cover level matching the attacker direction', () => {
    const state = makeTestState();
    setTile(state.grid, {
      coord: { x: 2, y: 2 },
      type: 'floor',
      occupantId: null,
      cover: { north: 'half', east: 'full' },
    });
    // attacker north of defender -> half cover
    expect(getCoverLevel(state.grid, { x: 2, y: 2 }, { x: 2, y: 0 })).toBe('half');
    // attacker east of defender -> full cover
    expect(getCoverLevel(state.grid, { x: 2, y: 2 }, { x: 4, y: 2 })).toBe('full');
    // attacker south of defender -> no cover defined for that side
    expect(getCoverLevel(state.grid, { x: 2, y: 2 }, { x: 2, y: 4 })).toBe('none');
  });
});
