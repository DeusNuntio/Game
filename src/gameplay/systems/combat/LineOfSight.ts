import type { Coord, Grid } from '../../model/Grid';
import { getTile } from '../../model/Grid';
import type { GameState } from '../../model/GameState';

/** Bresenham line, inclusive of both endpoints. */
export function bresenhamLine(from: Coord, to: Coord): Coord[] {
  const points: Coord[] = [];
  let x0 = from.x;
  let y0 = from.y;
  const x1 = to.x;
  const y1 = to.y;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  for (;;) {
    points.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
  return points;
}

function blocksSight(grid: Grid, state: GameState, coord: Coord): boolean {
  const tile = getTile(grid, coord);
  if (!tile) return true;
  if (tile.type === 'wall') return true;
  if (tile.type === 'door') {
    const open = state.doors?.[tile.doorId ?? '']?.open ?? false;
    return !open;
  }
  return false;
}

/**
 * Whether `from` has an unobstructed line of sight to `to`. Full/half cover does
 * NOT block sight in this model (you can see over/around cover) — only walls and
 * closed doors do. Endpoints (the units' own tiles) are never treated as blockers.
 */
export function hasLineOfSight(grid: Grid, state: GameState, from: Coord, to: Coord): boolean {
  const points = bresenhamLine(from, to);
  for (let i = 1; i < points.length - 1; i++) {
    if (blocksSight(grid, state, points[i]!)) return false;
  }
  return true;
}
