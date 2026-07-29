import { Rng } from '../../../core/Rng';
import { manhattanDistance } from '../../model/Grid';
import type { GameState } from '../../model/GameState';
import type { HackAction } from '../../actions/GameAction';
import type { ActionRejectedEvent, ConsoleHackedEvent, ConsoleHackFailedEvent } from '../../actions/GameEvent';
import type { SystemResult } from '../movement/MovementSystem';
import { findConsoleTile } from './InteractionSystem';

const INTERACTION_RANGE = 1;
const DEFAULT_DIFFICULTY = 0.5;

function rejected(action: HackAction, reason: string): ActionRejectedEvent {
  return { type: 'actionRejected', action, reason };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Hack skill check: unit.stats.hackSkill vs the console's difficulty, resolved
 * as a single deterministic Rng roll (same pattern as combat's hit chance) so
 * it stays swappable for a richer minigame later without touching callers.
 */
export function resolveHack(state: GameState, action: HackAction): SystemResult {
  const unit = state.units[action.unitId];
  if (!unit || !unit.alive) {
    return { state, events: [rejected(action, 'unit not found or dead')] };
  }
  if (unit.stats.ap < 1) {
    return { state, events: [rejected(action, 'not enough action points')] };
  }

  const consoleTile = findConsoleTile(state.grid, action.consoleId);
  if (!consoleTile) {
    return { state, events: [rejected(action, 'console not found')] };
  }
  if (manhattanDistance(unit.coord, consoleTile.coord) > INTERACTION_RANGE) {
    return { state, events: [rejected(action, 'too far from console')] };
  }

  const current = state.consoles?.[action.consoleId];
  if (current?.hacked) {
    return { state, events: [rejected(action, 'console already hacked')] };
  }
  const difficulty = current?.difficulty ?? DEFAULT_DIFFICULTY;

  const rng = new Rng(state.rngState);
  const successChance = clamp(unit.stats.hackSkill - difficulty + 0.5, 0.05, 0.95);
  const success = rng.chance(successChance);
  state.rngState = rng.getState();
  unit.stats.ap -= 1;

  state.consoles ??= {};
  if (success) {
    state.consoles[action.consoleId] = { hacked: true, difficulty };
    const event: ConsoleHackedEvent = { type: 'consoleHacked', consoleId: action.consoleId, unitId: unit.id };
    return { state, events: [event] };
  }

  state.consoles[action.consoleId] = { hacked: false, difficulty };
  const event: ConsoleHackFailedEvent = {
    type: 'consoleHackFailed',
    consoleId: action.consoleId,
    unitId: unit.id,
  };
  return { state, events: [event] };
}
