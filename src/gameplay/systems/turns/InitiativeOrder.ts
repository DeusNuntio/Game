import type { GameState } from '../../model/GameState';

/**
 * Living units sorted by initiative (descending); ties broken by id for
 * deterministic, reproducible ordering across identical seeds/saves.
 */
export function computeInitiativeOrder(state: GameState): string[] {
  return Object.values(state.units)
    .filter((unit) => unit.alive)
    .sort((a, b) => b.stats.initiative - a.stats.initiative || a.id.localeCompare(b.id))
    .map((unit) => unit.id);
}
