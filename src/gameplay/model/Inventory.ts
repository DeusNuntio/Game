import type { Unit } from './Unit';

export function addItem(unit: Unit, itemId: string): void {
  unit.inventory.push(itemId);
}

/** Returns true if the item was present and removed. */
export function removeItem(unit: Unit, itemId: string): boolean {
  const index = unit.inventory.indexOf(itemId);
  if (index < 0) return false;
  unit.inventory.splice(index, 1);
  return true;
}
