import type { GameState } from '../../model/GameState';
import { getActiveUnitId } from '../../model/GameState';
import type { EndTurnAction } from '../../actions/GameAction';
import type {
  ActionRejectedEvent,
  GameEvent,
  RoundStartedEvent,
  TurnEndedEvent,
  TurnStartedEvent,
} from '../../actions/GameEvent';
import type { SystemResult } from '../movement/MovementSystem';
import { computeInitiativeOrder } from './InitiativeOrder';

function rejected(action: EndTurnAction, reason: string): ActionRejectedEvent {
  return { type: 'actionRejected', action, reason };
}

/**
 * Ends the acting unit's turn and advances to the next living unit in initiative
 * order. When the order is exhausted, starts a new round: recomputes initiative
 * (units that died mid-round drop out) and resets everyone's baseline for a
 * fresh pass. The newly active unit has its AP refilled to max here — this is
 * the only place AP is restored.
 */
export function resolveEndTurn(state: GameState, action: EndTurnAction): SystemResult {
  const activeId = getActiveUnitId(state);
  if (activeId !== action.unitId) {
    return { state, events: [rejected(action, "not this unit's turn")] };
  }
  const unit = state.units[action.unitId];
  if (!unit) {
    return { state, events: [rejected(action, 'unit not found')] };
  }

  const events: GameEvent[] = [];
  const endedEvent: TurnEndedEvent = { type: 'turnEnded', unitId: unit.id };
  events.push(endedEvent);

  let nextIndex = state.turn.activeIndex + 1;
  if (nextIndex >= state.turn.order.length) {
    state.turn.round += 1;
    state.turn.order = computeInitiativeOrder(state);
    nextIndex = 0;
    const roundEvent: RoundStartedEvent = { type: 'roundStarted', round: state.turn.round };
    events.push(roundEvent);
  }
  state.turn.activeIndex = nextIndex;

  const nextUnitId = state.turn.order[nextIndex];
  const nextUnit = nextUnitId ? state.units[nextUnitId] : undefined;
  if (nextUnit) {
    nextUnit.stats.ap = nextUnit.stats.maxAp;
    const startedEvent: TurnStartedEvent = {
      type: 'turnStarted',
      round: state.turn.round,
      unitId: nextUnit.id,
    };
    events.push(startedEvent);
  }

  return { state, events };
}
