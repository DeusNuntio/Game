import { getItemDef } from '@/data/items';
import type { GameState } from '../../model/GameState';
import { addItem, removeItem } from '../../model/Inventory';
import type { EquipItemAction } from '../../actions/GameAction';
import type { ActionRejectedEvent, ItemEquippedEvent } from '../../actions/GameEvent';
import type { SystemResult } from '../movement/MovementSystem';

function rejected(action: EquipItemAction, reason: string): ActionRejectedEvent {
  return { type: 'actionRejected', action, reason };
}

/** Free action (0 AP): swaps an inventory item into the matching equipment slot. */
export function resolveEquip(state: GameState, action: EquipItemAction): SystemResult {
  const unit = state.units[action.unitId];
  if (!unit || !unit.alive) {
    return { state, events: [rejected(action, 'unit not found or dead')] };
  }
  if (!unit.inventory.includes(action.itemId)) {
    return { state, events: [rejected(action, 'item not in inventory')] };
  }
  const def = getItemDef(action.itemId);
  if (!def || def.kind === 'consumable') {
    return { state, events: [rejected(action, 'item is not equippable')] };
  }

  const slot = def.kind === 'weapon' ? 'weaponId' : 'armorId';
  const previous = unit.equipped[slot];

  removeItem(unit, action.itemId);
  unit.equipped[slot] = action.itemId;
  if (previous) addItem(unit, previous);

  const event: ItemEquippedEvent = {
    type: 'itemEquipped',
    unitId: unit.id,
    itemId: action.itemId,
    slot: def.kind,
  };
  return { state, events: [event] };
}
