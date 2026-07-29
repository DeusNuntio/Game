import type { ArmorDef, ConsumableDef, ItemDef } from '@/gameplay/model/Item';
import { WEAPONS } from './weapons';

export const ARMORS: Record<string, ArmorDef> = {
  vest_light: { id: 'vest_light', name: 'Light Vest', kind: 'armor', hpBonus: 2, defenseMod: 0.05 },
  vest_heavy: { id: 'vest_heavy', name: 'Heavy Vest', kind: 'armor', hpBonus: 5, defenseMod: 0.1 },
};

export const CONSUMABLES: Record<string, ConsumableDef> = {
  medkit_small: { id: 'medkit_small', name: 'Small Medkit', kind: 'consumable', healAmount: 4 },
};

const ALL_ITEMS: Record<string, ItemDef> = { ...WEAPONS, ...ARMORS, ...CONSUMABLES };

export function getItemDef(itemId: string): ItemDef | undefined {
  return ALL_ITEMS[itemId];
}
