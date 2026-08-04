import type { Unit } from '@/gameplay/model/Unit';
import type { GameState } from '@/gameplay/model/GameState';
import type { GameAction } from '@/gameplay/actions/GameAction';
import { coordEquals, manhattanDistance } from '@/gameplay/model/Grid';
import { computeReachableTiles } from '@/gameplay/systems/movement/Pathfinding';
import { isTileBlockedForMovement } from '@/gameplay/systems/movement/MovementSystem';

/**
 * Unaware enemies walk a fixed waypoint loop instead of fighting — this is
 * the whole mechanism behind "not played in combat mode until the alarm goes
 * off". No persisted "next waypoint index" is needed: whichever waypoint the
 * unit currently stands on determines the next target (cycling), so this stays
 * a pure, stateless decision like every other behavior. Units with no route,
 * or already at ap 0, just hold position (falls through to endTurn).
 */
export function patrol(unit: Unit, state: GameState): GameAction | null {
  const route = unit.patrolRoute;
  if (!route || route.length < 2) return null;
  if (unit.stats.ap < 1) return null;

  const atIndex = route.findIndex((c) => coordEquals(c, unit.coord));
  const targetIndex = atIndex >= 0 ? (atIndex + 1) % route.length : 0;
  const target = route[targetIndex]!;
  if (coordEquals(unit.coord, target)) return null;

  const reachable = computeReachableTiles(state.grid, unit.coord, unit.stats.moveRange, (c) =>
    isTileBlockedForMovement(state, c, unit.id),
  );
  if (reachable.length === 0) return null;

  const currentDistance = manhattanDistance(unit.coord, target);
  const best = reachable.reduce(
    (best, coord) => {
      const dist = manhattanDistance(coord, target);
      return dist < best.dist ? { coord, dist } : best;
    },
    { coord: unit.coord, dist: currentDistance },
  );

  if (coordEquals(best.coord, unit.coord)) return null;
  return { type: 'move', unitId: unit.id, to: best.coord };
}
