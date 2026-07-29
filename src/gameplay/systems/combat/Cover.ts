import type { Coord, CoverLevel, Grid } from '../../model/Grid';
import { directionBetween, getTile } from '../../model/Grid';

/** Cover the defender's tile grants against an attacker firing from `attackerCoord`. */
export function getCoverLevel(grid: Grid, defenderCoord: Coord, attackerCoord: Coord): CoverLevel {
  const tile = getTile(grid, defenderCoord);
  if (!tile) return 'none';
  const direction = directionBetween(attackerCoord, defenderCoord);
  return tile.cover[direction] ?? 'none';
}
