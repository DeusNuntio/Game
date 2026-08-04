import { manhattanDistance } from '../../model/Grid';
import type { GameState } from '../../model/GameState';
import type { OpenDoorAction } from '../../actions/GameAction';
import type { ActionRejectedEvent, DoorToggledEvent } from '../../actions/GameEvent';
import type { SystemResult } from '../movement/MovementSystem';
import { findDoorTile } from './InteractionSystem';

const INTERACTION_RANGE = 1;

function rejected(action: OpenDoorAction, reason: string): ActionRejectedEvent {
  return { type: 'actionRejected', action, reason };
}

export function resolveOpenDoor(state: GameState, action: OpenDoorAction): SystemResult {
  const unit = state.units[action.unitId];
  if (!unit || !unit.alive) {
    return { state, events: [rejected(action, 'unit not found or dead')] };
  }
  if (unit.stats.ap < 1) {
    return { state, events: [rejected(action, 'not enough action points')] };
  }

  const doorTile = findDoorTile(state.grid, action.doorId);
  if (!doorTile) {
    return { state, events: [rejected(action, 'door not found')] };
  }
  if (manhattanDistance(unit.coord, doorTile.coord) > INTERACTION_RANGE) {
    return { state, events: [rejected(action, 'too far from door')] };
  }

  const current = state.doors?.[action.doorId];
  if (current?.open) {
    return { state, events: [rejected(action, 'door already open')] };
  }
  if (current?.requiresItemId && !unit.inventory.includes(current.requiresItemId)) {
    return { state, events: [rejected(action, 'requires keycard')] };
  }

  state.doors ??= {};
  state.doors[action.doorId] = { ...current, open: true };
  unit.stats.ap -= 1;

  const event: DoorToggledEvent = { type: 'doorToggled', doorId: action.doorId, open: true };
  return { state, events: [event] };
}
