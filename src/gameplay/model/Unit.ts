import type { Coord } from './Grid';

export type Faction = 'player' | 'enemy';

export interface UnitStats {
  maxHp: number;
  hp: number;
  maxAp: number;
  ap: number;
  /** Base chance to hit [0,1] before cover/flanking/weapon modifiers. */
  baseAccuracy: number;
  /** Max tiles a single Move action can traverse. */
  moveRange: number;
  critChance: number;
  /** Skill used to resolve console hacks [0,1]. */
  hackSkill: number;
  /** Placeholder unarmed/base damage; overridden once a weapon is equipped (M9). */
  baseDamage: number;
}

export interface StatusEffect {
  id: string;
  remainingTurns: number;
}

export interface Equipped {
  weaponId: string | null;
  armorId: string | null;
}

export interface Unit {
  id: string;
  name: string;
  faction: Faction;
  coord: Coord;
  stats: UnitStats;
  equipped: Equipped;
  inventory: string[];
  level: number;
  xp: number;
  statusEffects: StatusEffect[];
  aiProfileId?: string;
  alive: boolean;
}

export function createUnit(params: {
  id: string;
  name: string;
  faction: Faction;
  coord: Coord;
  stats: UnitStats;
  aiProfileId?: string;
}): Unit {
  return {
    id: params.id,
    name: params.name,
    faction: params.faction,
    coord: params.coord,
    stats: { ...params.stats },
    equipped: { weaponId: null, armorId: null },
    inventory: [],
    level: 1,
    xp: 0,
    statusEffects: [],
    aiProfileId: params.aiProfileId,
    alive: true,
  };
}

export function cloneUnit(unit: Unit): Unit {
  return {
    ...unit,
    coord: { ...unit.coord },
    stats: { ...unit.stats },
    equipped: { ...unit.equipped },
    inventory: [...unit.inventory],
    statusEffects: unit.statusEffects.map((s) => ({ ...s })),
  };
}
