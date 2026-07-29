import { createGrid } from '@/gameplay/model/Grid';
import type { GameState } from '@/gameplay/model/GameState';
import { createUnit, type Faction, type UnitStats } from '@/gameplay/model/Unit';

export function defaultStats(overrides: Partial<UnitStats> = {}): UnitStats {
  return {
    maxHp: 10,
    hp: 10,
    maxAp: 2,
    ap: 2,
    baseAccuracy: 0.75,
    moveRange: 4,
    critChance: 0.1,
    hackSkill: 0.5,
    baseDamage: 3,
    ...overrides,
  };
}

export function makeTestState(params?: {
  width?: number;
  height?: number;
  units?: { id: string; faction: Faction; x: number; y: number; stats?: Partial<UnitStats> }[];
}): GameState {
  const width = params?.width ?? 6;
  const height = params?.height ?? 6;
  const grid = createGrid(width, height);
  const units: GameState['units'] = {};

  for (const u of params?.units ?? []) {
    const unit = createUnit({
      id: u.id,
      name: u.id,
      faction: u.faction,
      coord: { x: u.x, y: u.y },
      stats: defaultStats(u.stats),
    });
    units[unit.id] = unit;
    const tile = grid.tiles.find((t) => t.coord.x === u.x && t.coord.y === u.y);
    if (tile) tile.occupantId = unit.id;
  }

  return {
    grid,
    units,
    turn: { round: 1, order: Object.keys(units), activeIndex: 0 },
    rngState: 12345,
  };
}
