import type { Unit } from '@/gameplay/model/Unit';
import type { GameState } from '@/gameplay/model/GameState';
import type { GameAction } from '@/gameplay/actions/GameAction';
import { coordEquals, manhattanDistance } from '@/gameplay/model/Grid';
import { computeReachableTiles } from '@/gameplay/systems/movement/Pathfinding';
import { isTileBlockedForMovement } from '@/gameplay/systems/movement/MovementSystem';
import { findVisibleEnemies, closestUnit } from '../Perception';

const LOW_HP_THRESHOLD = 0.3;

/** Below 30% HP with a visible threat, move to the reachable tile farthest from it. */
export function fleeAtLowHp(unit: Unit, state: GameState): GameAction | null {
  if (unit.stats.hp / unit.stats.maxHp > LOW_HP_THRESHOLD) return null;
  if (unit.stats.ap < 1) return null;

  const threats = findVisibleEnemies(unit, state);
  if (threats.length === 0) return null;
  const nearestThreat = closestUnit(unit.coord, threats);

  const reachable = computeReachableTiles(state.grid, unit.coord, unit.stats.moveRange, (c) =>
    isTileBlockedForMovement(state, c, unit.id),
  );
  if (reachable.length === 0) return null;

  const currentDistance = manhattanDistance(unit.coord, nearestThreat.coord);
  const best = reachable.reduce(
    (best, coord) => {
      const dist = manhattanDistance(coord, nearestThreat.coord);
      return dist > best.dist ? { coord, dist } : best;
    },
    { coord: unit.coord, dist: currentDistance },
  );

  if (coordEquals(best.coord, unit.coord)) return null;
  return { type: 'move', unitId: unit.id, to: best.coord };
}
