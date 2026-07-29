import { GameEngine } from '@/gameplay/GameEngine';
import type { GameEvent } from '@/gameplay/actions/GameEvent';
import { getActiveUnitId } from '@/gameplay/model/GameState';
import type { EnemyAI } from './EnemyAI';

/** Hard cap so a misbehaving AI (or an unexpected rejection loop) can't hang the game. */
const MAX_ACTIONS_PER_TURN = 8;

/**
 * Drives one enemy unit's whole turn: repeatedly asks `ai` for the next action
 * and dispatches it, until the unit ends its turn, dies, stops being the active
 * unit, or the safety cap is hit. Kept separate from UtilityAI so the decision
 * logic stays pure and unit-testable without a GameEngine instance.
 */
export function runEnemyTurn(engine: GameEngine, ai: EnemyAI, unitId: string): GameEvent[] {
  const allEvents: GameEvent[] = [];

  for (let i = 0; i < MAX_ACTIONS_PER_TURN; i++) {
    const state = engine.getState();
    const unit = state.units[unitId];
    if (!unit || !unit.alive) break;
    if (getActiveUnitId(state) !== unitId) break;

    const action = ai.decide(unit, state);
    const events = engine.dispatch(action);
    allEvents.push(...events);

    if (action.type === 'endTurn') break;
    if (events.some((e) => e.type === 'actionRejected')) {
      allEvents.push(...engine.dispatch({ type: 'endTurn', unitId }));
      break;
    }
  }

  return allEvents;
}
