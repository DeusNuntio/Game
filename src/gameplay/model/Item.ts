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

export type ItemDef = WeaponDef | ArmorDef | ConsumableDef;
