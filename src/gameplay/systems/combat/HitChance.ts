import type { CoverLevel } from '../../model/Grid';

export interface HitChanceInput {
  attackerAccuracy: number;
  coverLevel: CoverLevel;
  flanking: boolean;
}

const HALF_COVER_PENALTY = 0.25;
const FULL_COVER_PENALTY = 0.4;
const FLANK_BONUS = 0.15;
const MIN_HIT_CHANCE = 0.05;
const MAX_HIT_CHANCE = 0.95;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Pure hit-chance formula: base accuracy, minus cover penalty, plus flank bonus. */
export function calculateHitChance(input: HitChanceInput): number {
  let chance = input.attackerAccuracy;

  if (input.flanking) {
    chance += FLANK_BONUS;
  } else if (input.coverLevel === 'half') {
    chance -= HALF_COVER_PENALTY;
  } else if (input.coverLevel === 'full') {
    chance -= FULL_COVER_PENALTY;
  }

  return clamp(chance, MIN_HIT_CHANCE, MAX_HIT_CHANCE);
}
