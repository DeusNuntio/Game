import type { Unit } from './Unit';

/** XP required to advance FROM this level (unit.xp resets to the remainder on level-up). */
export function xpToLevelUp(level: number): number {
  return level * 10;
}

/**
 * The v1 level-up reward is a single hardcoded unlock (+1 max AP). A full skill
 * tree (see SkillNode below) can replace this with a player choice later without
 * changing the XP/leveling math here.
 */
function applyLevelUpReward(unit: Unit): void {
  unit.stats.maxAp += 1;
  unit.stats.ap += 1;
}

export interface LevelUpResult {
  leveledUp: boolean;
  levelsGained: number;
  newLevel: number;
}

export function applyXpGain(unit: Unit, amount: number): LevelUpResult {
  unit.xp += amount;
  let levelsGained = 0;
  while (unit.xp >= xpToLevelUp(unit.level)) {
    unit.xp -= xpToLevelUp(unit.level);
    unit.level += 1;
    levelsGained += 1;
    applyLevelUpReward(unit);
  }
  return { leveledUp: levelsGained > 0, levelsGained, newLevel: unit.level };
}

/**
 * Skill tree data model, prepared for a full tree later (see plan v1 scope notes).
 * v1 does not spend/unlock these automatically — they exist so a future UI can
 * let players choose unlocks without an architecture change.
 */
export type SkillEffect =
  | { kind: 'bonusMaxAp'; amount: number }
  | { kind: 'bonusMaxHp'; amount: number }
  | { kind: 'bonusAccuracy'; amount: number };

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  prereqIds: string[];
  effect: SkillEffect;
}
