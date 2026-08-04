import { Rng } from '../../../core/Rng';
import { manhattanDistance } from '../../model/Grid';
import type { GameState } from '../../model/GameState';
import type { HackAction } from '../../actions/GameAction';
import type { ActionRejectedEvent, GameEvent } from '../../actions/GameEvent';
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
 * Two extra wrinkles on top of the plain check:
 *  - linkedDoorId: success also remotely opens that door (a "control room"
 *    puzzle — hack here to unlock a door elsewhere).
 *  - puzzleGroupId/sequenceIndex: hacking a step before its prerequisites are
 *    done still resolves normally (success/fail), but always trips the alarm
 *    via a PuzzleOrderViolatedEvent — the puzzle's "penalty for guessing wrong".
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

  let outOfOrder = false;
  if (current?.puzzleGroupId !== undefined && (current.sequenceIndex ?? 0) > 0) {
    const priorSteps = Object.values(state.consoles ?? {}).filter(
      (c) => c.puzzleGroupId === current.puzzleGroupId && (c.sequenceIndex ?? 0) < current.sequenceIndex!,
    );
    outOfOrder = priorSteps.some((c) => !c.hacked);
  }

  const rng = new Rng(state.rngState);
  const successChance = clamp(unit.stats.hackSkill - difficulty + 0.5, 0.05, 0.95);
  const success = rng.chance(successChance);
  state.rngState = rng.getState();
  unit.stats.ap -= 1;

  state.consoles ??= {};
  state.consoles[action.consoleId] = { ...current, hacked: success, difficulty };

  const events: GameEvent[] = [];
  if (success) {
    events.push({ type: 'consoleHacked', consoleId: action.consoleId, unitId: unit.id });
    if (current?.linkedDoorId) {
      state.doors ??= {};
      state.doors[current.linkedDoorId] = { ...state.doors[current.linkedDoorId], open: true };
      events.push({ type: 'doorToggled', doorId: current.linkedDoorId, open: true });
    }
  } else {
    events.push({ type: 'consoleHackFailed', consoleId: action.consoleId, unitId: unit.id });
  }

  if (outOfOrder) {
    events.push({
      type: 'puzzleOrderViolated',
      consoleId: action.consoleId,
      puzzleGroupId: current!.puzzleGroupId!,
    });
  }

  return { state, events };
}
