import { describe, expect, it } from 'vitest';
import { createGrid, setTile } from '@/gameplay/model/Grid';
import { findPath } from '@/gameplay/systems/movement/Pathfinding';

describe('findPath', () => {
  it('finds the shortest path on an open grid', () => {
    const grid = createGrid(5, 5);
    const result = findPath(grid, { x: 0, y: 0 }, { x: 3, y: 0 }, () => false);
    expect(result).not.toBeNull();
    expect(result!.cost).toBe(3);
  });

  it('returns cost 0 and a single-tile path when start equals goal', () => {
    const grid = createGrid(3, 3);
    const result = findPath(grid, { x: 1, y: 1 }, { x: 1, y: 1 }, () => false);
    expect(result).toEqual({ path: [{ x: 1, y: 1 }], cost: 0 });
  });

  it('routes around a wall', () => {
    const grid = createGrid(3, 3);
    setTile(grid, { coord: { x: 1, y: 0 }, type: 'wall', occupantId: null, cover: {} });
    setTile(grid, { coord: { x: 1, y: 1 }, type: 'wall', occupantId: null, cover: {} });
    const isBlocked = (c: { x: number; y: number }) =>
      grid.tiles.some((t) => t.coord.x === c.x && t.coord.y === c.y && t.type === 'wall');
    const result = findPath(grid, { x: 0, y: 0 }, { x: 2, y: 0 }, isBlocked);
    expect(result).not.toBeNull();
    expect(result!.cost).toBeGreaterThan(2);
  });

  it('returns null when the goal is unreachable', () => {
    const grid = createGrid(3, 3);
    for (let y = 0; y < 3; y++) {
      setTile(grid, { coord: { x: 1, y }, type: 'wall', occupantId: null, cover: {} });
    }
    const isBlocked = (c: { x: number; y: number }) =>
      grid.tiles.some((t) => t.coord.x === c.x && t.coord.y === c.y && t.type === 'wall');
    const result = findPath(grid, { x: 0, y: 0 }, { x: 2, y: 0 }, isBlocked);
    expect(result).toBeNull();
  });

  it('returns null when the goal itself is blocked', () => {
    const grid = createGrid(3, 3);
    const result = findPath(grid, { x: 0, y: 0 }, { x: 1, y: 1 }, (c) => c.x === 1 && c.y === 1);
    expect(result).toBeNull();
  });
});
