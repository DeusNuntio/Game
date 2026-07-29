import { describe, expect, it } from 'vitest';
import { setTile } from '@/gameplay/model/Grid';
import { hasLineOfSight, bresenhamLine } from '@/gameplay/systems/combat/LineOfSight';
import { makeTestState } from '../../helpers/testState';

describe('bresenhamLine', () => {
  it('produces an inclusive straight horizontal line', () => {
    const points = bresenhamLine({ x: 0, y: 0 }, { x: 3, y: 0 });
    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ]);
  });
});

describe('hasLineOfSight', () => {
  it('sees clearly across open floor', () => {
    const state = makeTestState({ width: 5, height: 5 });
    expect(hasLineOfSight(state.grid, state, { x: 0, y: 0 }, { x: 4, y: 0 })).toBe(true);
  });

  it('is blocked by a wall between attacker and target', () => {
    const state = makeTestState({ width: 5, height: 5 });
    setTile(state.grid, { coord: { x: 2, y: 0 }, type: 'wall', occupantId: null, cover: {} });
    expect(hasLineOfSight(state.grid, state, { x: 0, y: 0 }, { x: 4, y: 0 })).toBe(false);
  });

  it('is blocked by a closed door and clear once opened', () => {
    const state = makeTestState({ width: 5, height: 5 });
    setTile(state.grid, {
      coord: { x: 2, y: 0 },
      type: 'door',
      occupantId: null,
      cover: {},
      doorId: 'd1',
    });
    state.doors = { d1: { open: false } };
    expect(hasLineOfSight(state.grid, state, { x: 0, y: 0 }, { x: 4, y: 0 })).toBe(false);

    state.doors!.d1!.open = true;
    expect(hasLineOfSight(state.grid, state, { x: 0, y: 0 }, { x: 4, y: 0 })).toBe(true);
  });

  it('is not blocked by a wall at the target tile itself', () => {
    const state = makeTestState({ width: 3, height: 1 });
    setTile(state.grid, { coord: { x: 2, y: 0 }, type: 'wall', occupantId: null, cover: {} });
    expect(hasLineOfSight(state.grid, state, { x: 0, y: 0 }, { x: 2, y: 0 })).toBe(true);
  });
});
