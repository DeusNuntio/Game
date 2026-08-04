export interface WeaponDef {
  id: string;
  name: string;
  kind: 'weapon';
  damageMin: number;
  damageMax: number;
  accuracyMod: number;
  critChanceMod: number;
  apCost: number;
}

export interface ArmorDef {
  id: string;
  name: string;
  kind: 'armor';
  hpBonus: number;
  /** Subtracted from an attacker's hit chance against a wearer of this armor. */
  defenseMod: number;
}

export interface ConsumableDef {
  id: string;
  name: string;
  kind: 'consumable';
  healAmount: number;
}

/** No gameplay stats — keycards, data drives, dossiers, ... used purely by mission objectives/door gates. */
export interface QuestItemDef {
  id: string;
  name: string;
  kind: 'questItem';
}

export type ItemDef = WeaponDef | ArmorDef | ConsumableDef | QuestItemDef;
