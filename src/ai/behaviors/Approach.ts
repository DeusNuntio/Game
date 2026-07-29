import type { Unit } from '@/gameplay/model/Unit';
import type { GameState } from '@/gameplay/model/GameState';
import type { GameAction } from '@/gameplay/actions/GameAction';
import { coordEquals, manhattanDistance } from '@/gameplay/model/Grid';
import { computeReachableTiles } from '@/gameplay/systems/movement/Pathfinding';
import { isTileBlockedForMovement } from '@/gameplay/systems/movement/MovementSystem';
import { findVisibleEnemies, findAllEnemies, closestUnit } from '../Perception';

/**
 * No enemy currently visible: advance on the nearest known living enemy (by true
 * position — this simple AI doesn't model imperfect memory/stealth) so it can
 * eventually get a line of sight and let attackIfInRange/seekCover take over.
 */
export function approach(unit: Unit, state: GameState): GameAction | null {
  if (unit.stats.ap < 1) return null;
  if (findVisibleEnemies(unit, state).length > 0) return null;

  const allEnemies = findAllEnemies(unit, state);
  if (allEnemies.length === 0) return null;
  const target = closestUnit(unit.coord, allEnemies);

  const reachable = computeReachableTiles(state.grid, unit.coord, unit.stats.moveRange, (c) =>
    isTileBlockedForMovement(state, c, unit.id),
  );
  if (reachable.length === 0) return null;

  const currentDistance = manhattanDistance(unit.coord, target.coord);
  const best = reachable.reduce(
    (best, coord) => {
      const dist = manhattanDistance(coord, target.coord);
      return dist < best.dist ? { coord, dist } : best;
    },
    { coord: unit.coord, dist: currentDistance },
  );

  if (coordEquals(best.coord, unit.coord)) return null;
  return { type: 'move', unitId: unit.id, to: best.coord };
}
