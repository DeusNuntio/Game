import type { Coord } from '@/gameplay/model/Grid';
import { manhattanDistance } from '@/gameplay/model/Grid';
import { hasLineOfSight } from '@/gameplay/systems/combat/LineOfSight';
import type { Unit } from '@/gameplay/model/Unit';
import type { GameState } from '@/gameplay/model/GameState';

export function findVisibleEnemies(unit: Unit, state: GameState): Unit[] {
  return Object.values(state.units).filter(
    (other) =>
      other.alive &&
      other.faction !== unit.faction &&
      hasLineOfSight(state.grid, state, unit.coord, other.coord),
  );
}

/** All living units of the opposing faction regardless of line of sight (used to advance on an unseen enemy). */
export function findAllEnemies(unit: Unit, state: GameState): Unit[] {
  return Object.values(state.units).filter((other) => other.alive && other.faction !== unit.faction);
}

export function closestUnit(from: Coord, units: Unit[]): Unit {
  return units.reduce((closest, u) =>
    manhattanDistance(u.coord, from) < manhattanDistance(closest.coord, from) ? u : closest,
  );
}

export function weakestUnit(units: Unit[]): Unit {
  return units.reduce((weakest, u) => (u.stats.hp < weakest.stats.hp ? u : weakest));
}
