import type { SkillNode } from '@/gameplay/model/Progression';

/**
 * Placeholder skill tree content (2 nodes) proving the data model works end to
 * end. Not yet spent/selected by any system — a future skill-tree UI will read
 * this catalog and dispatch unlock choices without changing SkillNode's shape.
 */
export const SKILL_NODES: Record<string, SkillNode> = {
  steady_aim: {
    id: 'steady_aim',
    name: 'Steady Aim',
    description: '+10% Trefferchance.',
    prereqIds: [],
    effect: { kind: 'bonusAccuracy', amount: 0.1 },
  },
  toughness: {
    id: 'toughness',
    name: 'Toughness',
    description: '+2 maximale Lebenspunkte.',
    prereqIds: ['steady_aim'],
    effect: { kind: 'bonusMaxHp', amount: 2 },
  },
};
