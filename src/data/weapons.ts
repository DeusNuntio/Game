import type { WeaponDef } from '@/gameplay/model/Item';

/** Placeholder-tier weapon catalog — numbers only, no real names/lore needed yet. */
export const WEAPONS: Record<string, WeaponDef> = {
  pistol_mk1: {
    id: 'pistol_mk1',
    name: 'Sidearm Mk1',
    kind: 'weapon',
    damageMin: 2,
    damageMax: 4,
    accuracyMod: 0.05,
    critChanceMod: 0,
    apCost: 1,
  },
  smg_mk1: {
    id: 'smg_mk1',
    name: 'SMG Mk1',
    kind: 'weapon',
    damageMin: 2,
    damageMax: 5,
    accuracyMod: -0.05,
    critChanceMod: 0.05,
    apCost: 1,
  },
  rifle_mk1: {
    id: 'rifle_mk1',
    name: 'Rifle Mk1',
    kind: 'weapon',
    damageMin: 4,
    damageMax: 7,
    accuracyMod: 0,
    critChanceMod: 0.1,
    apCost: 1,
  },
};
