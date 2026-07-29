import { EventBus } from '../core/EventBus';
import type { GameState } from './model/GameState';
import { cloneGameState, getActiveUnitId } from './model/GameState';
import type { GameAction } from './actions/GameAction';
import { actingUnitId } from './actions/GameAction';
import type { ActionRejectedEvent, GameEvent } from './actions/GameEvent';
import { resolveMove } from './systems/movement/MovementSystem';
import { resolveAttackAction } from './systems/combat/AttackResolver';
import { resolveEndTurn } from './systems/turns/TurnManager';
import { resolveOpenDoor } from './systems/interactables/Door';
import { resolveHack } from './systems/interactables/Console';

/**
 * The single mutation point for GameState. Every consumer (UI, AI, tests) calls
 * dispatch(); nothing else is allowed to touch state directly. Internally this
 * works on a fresh clone so a failed/rejected action never corrupts the live state,
 * and routes to the system responsible for that action type.
 */
export class GameEngine {
  private state: GameState;
  readonly events: EventBus<GameEvent>;

  constructor(initialState: GameState, eventBus: EventBus<GameEvent> = new EventBus()) {
    this.state = initialState;
    this.events = eventBus;
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  dispatch(action: GameAction): GameEvent[] {
    const working = cloneGameState(this.state);
    const { state: nextState, events } = applyAction(working, action);
    this.state = nextState;
    this.events.emitAll(events);
    return events;
  }
}

/** Every action except endTurn (which validates ownership itself) must come from the active unit. */
function checkTurnOwnership(state: GameState, action: GameAction): ActionRejectedEvent | null {
  if (action.type === 'endTurn') return null;
  const active = getActiveUnitId(state);
  if (active !== undefined && actingUnitId(action) !== active) {
    return { type: 'actionRejected', action, reason: 'not this unit\'s turn' };
  }
  return null;
}

function applyAction(state: GameState, action: GameAction): { state: GameState; events: GameEvent[] } {
  const ownershipRejection = checkTurnOwnership(state, action);
  if (ownershipRejection) {
    return { state, events: [ownershipRejection] };
  }

  switch (action.type) {
    case 'move':
      return resolveMove(state, action);
    case 'attack':
      return resolveAttackAction(state, action);
    case 'endTurn':
      return resolveEndTurn(state, action);
    case 'openDoor':
      return resolveOpenDoor(state, action);
    case 'hack':
      return resolveHack(state, action);
    default: {
      const exhaustive: never = action;
      throw new Error(`Unhandled action type: ${JSON.stringify(exhaustive)}`);
    }
  }
}
