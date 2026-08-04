import { manhattanDistance } from '../../model/Grid';
import type { GameState } from '../../model/GameState';
import type { GameAction } from '../../actions/GameAction';
import type { AlarmTriggeredEvent, GameEvent } from '../../actions/GameEvent';
import { hasLineOfSight } from '../combat/LineOfSight';

/** Generous cap so distant, unrelated enemies on a big map don't count as "spotting" — LOS is the real gate. */
const DETECTION_RANGE = 10;

function anyEnemySpotsPlayer(state: GameState): boolean {
  const enemies = Object.values(state.units).filter((u) => u.alive && u.faction === 'enemy');
  const players = Object.values(state.units).filter((u) => u.alive && u.faction === 'player');

  return enemies.some((enemy) =>
    players.some(
      (player) =>
        manhattanDistance(enemy.coord, player.coord) <= DETECTION_RANGE &&
        hasLineOfSight(state.grid, state, enemy.coord, player.coord),
    ),
  );
}

/**
 * Missions start unalarmed (enemies patrol, see UtilityAI). This is the single
 * place that flips alarmActive to true — once tripped it never resets for the
 * rest of the mission. Checked after every dispatch, so it catches: firing a
 * weapon (always alarms — gunfire is loud), a failed hack, hacking a puzzle
 * console out of order, or simply being seen (LOS from any living enemy to any
 * living player unit).
 */
export function evaluateAlarm(state: GameState, action: GameAction, priorEvents: GameEvent[]): GameEvent[] {
  if (!state.mission || state.mission.alarmActive) return [];

  let reason: AlarmTriggeredEvent['reason'] | null = null;
  if (action.type === 'attack') {
    reason = 'attack';
  } else if (priorEvents.some((e) => e.type === 'puzzleOrderViolated')) {
    reason = 'puzzleOrderViolated';
  } else if (priorEvents.some((e) => e.type === 'consoleHackFailed')) {
    reason = 'hackFailed';
  } else if (anyEnemySpotsPlayer(state)) {
    reason = 'spotted';
  }

  if (!reason) return [];
  state.mission.alarmActive = true;
  return [{ type: 'alarmTriggered', reason }];
}
