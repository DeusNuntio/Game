import type { Unit } from '@/gameplay/model/Unit';
import type { GameState } from '@/gameplay/model/GameState';
import type { GameAction } from '@/gameplay/actions/GameAction';
import { findVisibleEnemies, weakestUnit } from '../Perception';

/** "In range" for v1 means "has line of sight" — no weapon max-range modeled yet (see M9). */
export function attackIfInRange(unit: Unit, state: GameState): GameAction | null {
  if (unit.stats.ap < 1) return null;
  const visible = findVisibleEnemies(unit, state);
  if (visible.length === 0) return null;
  const target = weakestUnit(visible);
  return { type: 'attack', attackerId: unit.id, targetId: target.id };
}
