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
import { resolveEquip } from './systems/inventory/EquipmentSystem';
import { resolvePickupItem } from './systems/loot/LootSystem';
import { evaluateObjectives } from './systems/mission/ObjectiveTracker';
import { evaluateMissionOutcome } from './systems/mission/WinLoseEvaluator';

/**
 * The single mutation point for GameState. Every consumer (UI, AI, tests) calls
 * dispatch(); nothing else is allowed to touch state directly. Internally this
 * works on a fresh clone so a failed/rejected action never corrupts the live state,
 * and routes to the system responsible for that action type. After the action
 * resolves, mission objectives/win-lose are re-evaluated if a mission is active.
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
    events.push(...evaluateMission(nextState));
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
    case 'equip':
      return resolveEquip(state, action);
    case 'pickupItem':
      return resolvePickupItem(state, action);
    default: {
      const exhaustive: never = action;
      throw new Error(`Unhandled action type: ${JSON.stringify(exhaustive)}`);
    }
  }
}

/** Mutates state.mission in place (objective completion + status) and returns any newly-fired mission events. */
function evaluateMission(state: GameState): GameEvent[] {
  if (!state.mission || state.mission.status !== 'ongoing') return [];

  const events: GameEvent[] = [];
  const previouslyComplete = new Set(state.mission.objectives.filter((o) => o.complete).map((o) => o.id));
  const nextObjectives = evaluateObjectives(state);
  state.mission.objectives = nextObjectives;

  for (const objective of nextObjectives) {
    if (objective.complete && !previouslyComplete.has(objective.id)) {
      events.push({ type: 'objectiveCompleted', objectiveId: objective.id });
    }
  }

  const outcome = evaluateMissionOutcome(state);
  if (outcome !== 'ongoing') {
    state.mission.status = outcome;
    events.push(outcome === 'won' ? { type: 'missionWon' } : { type: 'missionLost' });
  }

  return events;
}
