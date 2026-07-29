import { getTile } from '../../model/Grid';
import type { GameState } from '../../model/GameState';
import type { Unit } from '../../model/Unit';
import { addItem } from '../../model/Inventory';
import type { PickupItemAction } from '../../actions/GameAction';
import type { ActionRejectedEvent, ItemPickedUpEvent, LootDroppedEvent } from '../../actions/GameEvent';
import type { SystemResult } from '../movement/MovementSystem';

/** Called by AttackResolver when a unit dies: dumps everything they carried onto their tile. */
export function dropLoot(state: GameState, unit: Unit): LootDroppedEvent | null {
  const items = [...unit.inventory];
  if (unit.equipped.weaponId) items.push(unit.equipped.weaponId);
  if (unit.equipped.armorId) items.push(unit.equipped.armorId);
  if (items.length === 0) return null;

  const tile = getTile(state.grid, unit.coord);
  if (tile) {
    tile.groundItemIds = [...(tile.groundItemIds ?? []), ...items];
  }
  unit.inventory = [];
  unit.equipped = { weaponId: null, armorId: null };

  return { type: 'lootDropped', unitId: unit.id, coord: { ...unit.coord }, itemIds: items };
}

function rejected(action: PickupItemAction, reason: string): ActionRejectedEvent {
  return { type: 'actionRejected', action, reason };
}

/** Free action (0 AP): picks up an item lying on the unit's own tile. */
export function resolvePickupItem(state: GameState, action: PickupItemAction): SystemResult {
  const unit = state.units[action.unitId];
  if (!unit || !unit.alive) {
    return { state, events: [rejected(action, 'unit not found or dead')] };
  }

  const tile = getTile(state.grid, unit.coord);
  if (!tile?.groundItemIds?.includes(action.itemId)) {
    return { state, events: [rejected(action, 'item not on this tile')] };
  }

  tile.groundItemIds = tile.groundItemIds.filter((id) => id !== action.itemId);
  addItem(unit, action.itemId);

  const event: ItemPickedUpEvent = { type: 'itemPickedUp', unitId: unit.id, itemId: action.itemId };
  return { state, events: [event] };
}
