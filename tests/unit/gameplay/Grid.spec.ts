import { describe, expect, it } from 'vitest';
import { createGrid, getTile, inBounds, neighbors4, setTile, directionBetween } from '@/gameplay/model/Grid';

describe('Grid', () => {
  it('creates a grid of the requested size with default floor tiles', () => {
    const grid = createGrid(3, 2);
    expect(grid.tiles).toHaveLength(6);
    expect(getTile(grid, { x: 2, y: 1 })?.type).toBe('floor');
  });

  it('reports out-of-bounds coordinates correctly', () => {
    const grid = createGrid(3, 3);
    expect(inBounds(grid, { x: 0, y: 0 })).toBe(true);
    expect(inBounds(grid, { x: 2, y: 2 })).toBe(true);
    expect(inBounds(grid, { x: 3, y: 0 })).toBe(false);
    expect(inBounds(grid, { x: -1, y: 0 })).toBe(false);
  });

  it('returns only in-bounds 4-directional neighbors', () => {
    const grid = createGrid(3, 3);
    const corner = neighbors4(grid, { x: 0, y: 0 });
    expect(corner).toHaveLength(2);
    const center = neighbors4(grid, { x: 1, y: 1 });
    expect(center).toHaveLength(4);
  });

  it('setTile replaces the tile at that coordinate', () => {
    const grid = createGrid(2, 2);
    setTile(grid, { coord: { x: 1, y: 0 }, type: 'wall', occupantId: null, cover: {} });
    expect(getTile(grid, { x: 1, y: 0 })?.type).toBe('wall');
  });

  it('derives dominant attack direction between two coords', () => {
    expect(directionBetween({ x: 5, y: 0 }, { x: 0, y: 0 })).toBe('east');
    expect(directionBetween({ x: -5, y: 0 }, { x: 0, y: 0 })).toBe('west');
    expect(directionBetween({ x: 0, y: 5 }, { x: 0, y: 0 })).toBe('south');
    expect(directionBetween({ x: 0, y: -5 }, { x: 0, y: 0 })).toBe('north');
  });
});
