import type { Unit } from '@/gameplay/model/Unit';
import type { GameState } from '@/gameplay/model/GameState';
import type { GameAction } from '@/gameplay/actions/GameAction';
import { coordEquals } from '@/gameplay/model/Grid';
import { computeReachableTiles } from '@/gameplay/systems/movement/Pathfinding';
import { isTileBlockedForMovement } from '@/gameplay/systems/movement/MovementSystem';
import { getCoverLevel } from '@/gameplay/systems/combat/Cover';
import { findVisibleEnemies, closestUnit } from '../Perception';

const MIN_AP_TO_REPOSITION = 2;

/**
 * If the unit is exposed (no cover against the nearest visible threat) and has
 * enough AP left to still act after moving, relocate to a reachable tile that
 * does grant cover. Skipped once cover is already held, so it can't oscillate.
 */
export function seekCover(unit: Unit, state: GameState): GameAction | null {
  if (unit.stats.ap < MIN_AP_TO_REPOSITION) return null;

  const threats = findVisibleEnemies(unit, state);
  if (threats.length === 0) return null;
  const nearestThreat = closestUnit(unit.coord, threats);

  const currentCover = getCoverLevel(state.grid, unit.coord, nearestThreat.coord);
  if (currentCover !== 'none') return null;

  const reachable = computeReachableTiles(state.grid, unit.coord, unit.stats.moveRange, (c) =>
    isTileBlockedForMovement(state, c, unit.id),
  );
  const covered = reachable.find(
    (coord) => getCoverLevel(state.grid, coord, nearestThreat.coord) !== 'none',
  );
  if (!covered || coordEquals(covered, unit.coord)) return null;

  return { type: 'move', unitId: unit.id, to: covered };
}
