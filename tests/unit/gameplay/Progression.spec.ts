import { describe, expect, it } from 'vitest';
import { applyXpGain, xpToLevelUp } from '@/gameplay/model/Progression';
import { createUnit } from '@/gameplay/model/Unit';
import { defaultStats } from '../helpers/testState';

function makeUnit() {
  return createUnit({
    id: 'u1',
    name: 'Test',
    faction: 'player',
    coord: { x: 0, y: 0 },
    stats: defaultStats(),
  });
}

describe('xpToLevelUp', () => {
  it('scales linearly with level', () => {
    expect(xpToLevelUp(1)).toBe(10);
    expect(xpToLevelUp(2)).toBe(20);
  });
});

describe('applyXpGain', () => {
  it('accumulates XP below the threshold without leveling up', () => {
    const unit = makeUnit();
    const result = applyXpGain(unit, 5);
    expect(result.leveledUp).toBe(false);
    expect(unit.xp).toBe(5);
    expect(unit.level).toBe(1);
  });

  it('levels up once the threshold is reached, carrying over remainder XP', () => {
    const unit = makeUnit();
    const result = applyXpGain(unit, 12);
    expect(result).toEqual({ leveledUp: true, levelsGained: 1, newLevel: 2 });
    expect(unit.level).toBe(2);
    expect(unit.xp).toBe(2);
  });

  it('grants +1 max AP per level as the v1 unlock', () => {
    const unit = makeUnit();
    const apBefore = unit.stats.maxAp;
    applyXpGain(unit, 10);
    expect(unit.stats.maxAp).toBe(apBefore + 1);
    expect(unit.stats.ap).toBe(apBefore + 1);
  });

  it('can chain multiple level-ups from a single large XP gain', () => {
    const unit = makeUnit();
    // level 1->2 costs 10, level 2->3 costs 20: 35 XP should yield exactly 2 levels with 5 remaining
    const result = applyXpGain(unit, 35);
    expect(result).toEqual({ leveledUp: true, levelsGained: 2, newLevel: 3 });
    expect(unit.xp).toBe(5);
  });
});
