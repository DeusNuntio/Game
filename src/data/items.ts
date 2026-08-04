import type { ArmorDef, ConsumableDef, ItemDef, QuestItemDef } from '@/gameplay/model/Item';
import { WEAPONS } from './weapons';

export const ARMORS: Record<string, ArmorDef> = {
  vest_light: { id: 'vest_light', name: 'Light Vest', kind: 'armor', hpBonus: 2, defenseMod: 0.05 },
  vest_heavy: { id: 'vest_heavy', name: 'Heavy Vest', kind: 'armor', hpBonus: 5, defenseMod: 0.1 },
};

export const CONSUMABLES: Record<string, ConsumableDef> = {
  medkit_small: { id: 'medkit_small', name: 'Small Medkit', kind: 'consumable', healAmount: 4 },
};

/** No gameplay stats — used by retrieveItem objectives and door keycard gates across the mission roster. */
export const QUEST_ITEMS: Record<string, QuestItemDef> = {
  keycard_exec: { id: 'keycard_exec', name: 'Executive Keycard', kind: 'questItem' },
  keycard_maintenance: { id: 'keycard_maintenance', name: 'Maintenance Keycard', kind: 'questItem' },
  keycard_medbay: { id: 'keycard_medbay', name: 'Medbay Keycard', kind: 'questItem' },
  keycard_vault: { id: 'keycard_vault', name: 'Vault Keycard', kind: 'questItem' },
  data_drive: { id: 'data_drive', name: 'Encrypted Data Drive', kind: 'questItem' },
  research_notes: { id: 'research_notes', name: 'Stolen Research Notes', kind: 'questItem' },
  financial_ledger: { id: 'financial_ledger', name: 'Shell Company Ledger', kind: 'questItem' },
  evidence_chip: { id: 'evidence_chip', name: 'Evidence Chip', kind: 'questItem' },
  prototype_core: { id: 'prototype_core', name: 'AI Prototype Core', kind: 'questItem' },
  vaccine_sample: { id: 'vaccine_sample', name: 'Vaccine Sample Case', kind: 'questItem' },
  black_box: { id: 'black_box', name: 'Flight Recorder', kind: 'questItem' },
  override_chip: { id: 'override_chip', name: 'Security Override Chip', kind: 'questItem' },
  hostage_beacon: { id: 'hostage_beacon', name: 'Hostage Tracking Beacon', kind: 'questItem' },
  informant_dossier: { id: 'informant_dossier', name: "Informant's Dossier", kind: 'questItem' },
  auction_lot: { id: 'auction_lot', name: 'Auction Lot Briefcase', kind: 'questItem' },
};

const ALL_ITEMS: Record<string, ItemDef> = { ...WEAPONS, ...ARMORS, ...CONSUMABLES, ...QUEST_ITEMS };

export function getItemDef(itemId: string): ItemDef | undefined {
  return ALL_ITEMS[itemId];
}
