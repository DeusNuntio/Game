import type { Coord, Grid } from '../../model/Grid';
import { getTile } from '../../model/Grid';
import { getCoverLevel } from './Cover';

/**
 * A defender is flanked when the attacker fires from a direction that grants no
 * cover, but the defender's tile does provide cover from at least one other
 * direction (i.e. the attacker has maneuvered around the defender's cover).
 */
export function isFlanking(grid: Grid, defenderCoord: Coord, attackerCoord: Coord): boolean {
  const coverFromAttackDirection = getCoverLevel(grid, defenderCoord, attackerCoord);
  if (coverFromAttackDirection !== 'none') return false;

  const tile = getTile(grid, defenderCoord);
  if (!tile) return false;
  return Object.values(tile.cover).some((level) => level && level !== 'none');
}
