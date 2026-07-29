import { EventBus } from '../core/EventBus';
import type { GameState } from './model/GameState';
import { cloneGameState } from './model/GameState';
import type { GameAction } from './actions/GameAction';
import type { GameEvent } from './actions/GameEvent';
import { resolveMove } from './systems/movement/MovementSystem';

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

function applyAction(state: GameState, action: GameAction): { state: GameState; events: GameEvent[] } {
  switch (action.type) {
    case 'move':
      return resolveMove(state, action);
    default:
      throw new Error(`Unhandled action type: ${JSON.stringify(action)}`);
  }
}
