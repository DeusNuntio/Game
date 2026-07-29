import type { Grid } from './Grid';
import { cloneGrid } from './Grid';
import type { Unit } from './Unit';
import { cloneUnit } from './Unit';

export interface TurnState {
  round: number;
  /** Unit ids in initiative order for the current round. */
  order: string[];
  activeIndex: number;
}

/** Minimal door-state placeholder; replaced by the full DoorState shape in M7. */
export interface DoorStateStub {
  open: boolean;
}

export interface GameState {
  grid: Grid;
  units: Record<string, Unit>;
  turn: TurnState;
  /** Seed/state for the deterministic Rng; advanced by any system that rolls dice. */
  rngState: number;
  /** Keyed by Tile.doorId. Populated by mission setup, mutated by M7 InteractionSystem. */
  doors?: Record<string, DoorStateStub>;
}

export function cloneGameState(state: GameState): GameState {
  const units: Record<string, Unit> = {};
  for (const [id, unit] of Object.entries(state.units)) {
    units[id] = cloneUnit(unit);
  }
  return {
    grid: cloneGrid(state.grid),
    units,
    turn: { ...state.turn, order: [...state.turn.order] },
    rngState: state.rngState,
    doors: state.doors
      ? Object.fromEntries(Object.entries(state.doors).map(([id, d]) => [id, { ...d }]))
      : undefined,
  };
}

export function getActiveUnitId(state: GameState): string | undefined {
  return state.turn.order[state.turn.activeIndex];
}

export function livingUnits(state: GameState): Unit[] {
  return Object.values(state.units).filter((u) => u.alive);
}
