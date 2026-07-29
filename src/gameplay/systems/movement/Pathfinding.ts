import type { Coord, Grid } from '../../model/Grid';
import { coordKey, manhattanDistance, neighbors4 } from '../../model/Grid';

export interface PathResult {
  path: Coord[]; // includes start and goal
  cost: number; // number of steps (path.length - 1)
}

/**
 * Simple A* over a 4-directional grid. `isBlocked` is supplied by the caller so
 * different systems can plug in different blocking rules (walls, closed doors,
 * occupied tiles) without this module knowing about GameState shape.
 */
export function findPath(
  grid: Grid,
  start: Coord,
  goal: Coord,
  isBlocked: (c: Coord) => boolean,
): PathResult | null {
  if (coordKey(start) === coordKey(goal)) {
    return { path: [start], cost: 0 };
  }
  if (isBlocked(goal)) {
    return null;
  }

  const open = new Map<string, Coord>();
  open.set(coordKey(start), start);
  const cameFrom = new Map<string, Coord>();
  const gScore = new Map<string, number>([[coordKey(start), 0]]);
  const fScore = new Map<string, number>([[coordKey(start), manhattanDistance(start, goal)]]);
  const visited = new Set<string>();

  while (open.size > 0) {
    let currentKey = '';
    let current: Coord | null = null;
    let bestF = Infinity;
    for (const [key, coord] of open) {
      const f = fScore.get(key) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        currentKey = key;
        current = coord;
      }
    }
    if (!current) break;

    if (coordKey(current) === coordKey(goal)) {
      const path: Coord[] = [current];
      let key = currentKey;
      while (cameFrom.has(key)) {
        const prev = cameFrom.get(key)!;
        path.unshift(prev);
        key = coordKey(prev);
      }
      return { path, cost: path.length - 1 };
    }

    open.delete(currentKey);
    visited.add(currentKey);

    for (const neighbor of neighbors4(grid, current)) {
      const neighborKey = coordKey(neighbor);
      if (visited.has(neighborKey)) continue;
      if (isBlocked(neighbor)) continue;

      const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;
      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + manhattanDistance(neighbor, goal));
        open.set(neighborKey, neighbor);
      }
    }
  }

  return null;
}
