import type { Coord } from '../../model/Grid';
import { getTile } from '../../model/Grid';
import type { GameState } from '../../model/GameState';
import type { MoveAction } from '../../actions/GameAction';
import type { ActionRejectedEvent, GameEvent, UnitMovedEvent } from '../../actions/GameEvent';
import { findPath } from './Pathfinding';

export interface SystemResult {
  state: GameState;
  events: GameEvent[];
}

function rejected(action: MoveAction, reason: string): ActionRejectedEvent {
  return { type: 'actionRejected', action, reason };
}

/**
 * A tile blocks movement if it's a wall, a closed door, or occupied by another
 * living unit. Door open/closed state is tracked separately (see M7 InteractionSystem);
 * until that system exists, door tiles default to closed/blocked.
 */
export function isTileBlockedForMovement(state: GameState, coord: Coord, ignoreUnitId?: string): boolean {
  const tile = getTile(state.grid, coord);
  if (!tile) return true;
  if (tile.type === 'wall') return true;
  if (tile.type === 'door') {
    const doorOpen = state.doors?.[tile.doorId ?? '']?.open;
    if (!doorOpen) return true;
  }
  if (tile.occupantId && tile.occupantId !== ignoreUnitId) return true;
  return false;
}

export function resolveMove(state: GameState, action: MoveAction): SystemResult {
  const unit = state.units[action.unitId];
  if (!unit || !unit.alive) {
    return { state, events: [rejected(action, 'unit not found or dead')] };
  }
  if (unit.stats.ap < 1) {
    return { state, events: [rejected(action, 'not enough action points')] };
  }

  const path = findPath(state.grid, unit.coord, action.to, (c) =>
    isTileBlockedForMovement(state, c, unit.id),
  );
  if (!path) {
    return { state, events: [rejected(action, 'no valid path')] };
  }
  if (path.cost > unit.stats.moveRange) {
    return { state, events: [rejected(action, 'destination out of move range')] };
  }
  if (path.cost === 0) {
    return { state, events: [rejected(action, 'already at destination')] };
  }

  const fromTile = getTile(state.grid, unit.coord);
  const toTile = getTile(state.grid, action.to);
  if (fromTile) fromTile.occupantId = null;
  if (toTile) toTile.occupantId = unit.id;

  const from = { ...unit.coord };
  unit.coord = { ...action.to };
  unit.stats.ap -= 1;

  const event: UnitMovedEvent = { type: 'unitMoved', unitId: unit.id, from, to: unit.coord, path: path.path };
  return { state, events: [event] };
}
