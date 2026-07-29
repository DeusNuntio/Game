import { describe, expect, it } from 'vitest';
import { calculateHitChance } from '@/gameplay/systems/combat/HitChance';

describe('calculateHitChance', () => {
  it('returns base accuracy with no cover and no flank', () => {
    expect(calculateHitChance({ attackerAccuracy: 0.75, coverLevel: 'none', flanking: false })).toBeCloseTo(
      0.75,
    );
  });

  it('applies half-cover penalty', () => {
    expect(calculateHitChance({ attackerAccuracy: 0.75, coverLevel: 'half', flanking: false })).toBeCloseTo(
      0.5,
    );
  });

  it('applies full-cover penalty', () => {
    expect(calculateHitChance({ attackerAccuracy: 0.75, coverLevel: 'full', flanking: false })).toBeCloseTo(
      0.35,
    );
  });

  it('applies flank bonus and ignores cover while flanking', () => {
    expect(calculateHitChance({ attackerAccuracy: 0.75, coverLevel: 'full', flanking: true })).toBeCloseTo(
      0.9,
    );
  });

  it('clamps to the [0.05, 0.95] range', () => {
    expect(calculateHitChance({ attackerAccuracy: 1.5, coverLevel: 'none', flanking: true })).toBeCloseTo(
      0.95,
    );
    expect(calculateHitChance({ attackerAccuracy: 0.1, coverLevel: 'full', flanking: false })).toBeCloseTo(
      0.05,
    );
  });
});
