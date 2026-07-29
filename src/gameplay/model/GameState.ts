import type { Grid } from './Grid';
import { cloneGrid } from './Grid';
import type { Unit } from './Unit';
import { cloneUnit } from './Unit';
import type { Mission } from './Mission';

export interface TurnState {
  round: number;
  /** Unit ids in initiative order for the current round. */
  order: string[];
  activeIndex: number;
}

export interface DoorState {
  open: boolean;
}

export interface ConsoleState {
  hacked: boolean;
  /** [0,1]; higher is harder. Offsets the hacking unit's hackSkill in the skill check. */
  difficulty: number;
}

export interface GameState {
  grid: Grid;
  units: Record<string, Unit>;
  turn: TurnState;
  /** Seed/state for the deterministic Rng; advanced by any system that rolls dice. */
  rngState: number;
  /** Keyed by Tile.doorId. Populated by mission setup, mutated by the InteractionSystem. */
  doors?: Record<string, DoorState>;
  /** Keyed by Tile.consoleId. Populated by mission setup, mutated by the InteractionSystem. */
  consoles?: Record<string, ConsoleState>;
  /** Absent for ad-hoc/test states; present for any state built from mission data. */
  mission?: Mission;
}

function cloneRecord<T>(record: Record<string, T> | undefined): Record<string, T> | undefined {
  if (!record) return undefined;
  return Object.fromEntries(Object.entries(record).map(([id, value]) => [id, { ...value }]));
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
    doors: cloneRecord(state.doors),
    consoles: cloneRecord(state.consoles),
    mission: state.mission
      ? { ...state.mission, objectives: state.mission.objectives.map((o) => ({ ...o })) }
      : undefined,
  };
}

export function getActiveUnitId(state: GameState): string | undefined {
  return state.turn.order[state.turn.activeIndex];
}

export function livingUnits(state: GameState): Unit[] {
  return Object.values(state.units).filter((u) => u.alive);
}
