import { describe, expect, it } from 'vitest';
import { GameEngine } from '@/gameplay/GameEngine';
import { UtilityAI } from '@/ai/UtilityAI';
import { runEnemyTurn } from '@/ai/AiController';
import { makeTestState } from '../helpers/testState';

describe('runEnemyTurn', () => {
  it('attacks with every AP then ends its own turn', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'e1', faction: 'enemy', x: 2, y: 0, stats: { ap: 2, maxAp: 2 } },
        { id: 'p1', faction: 'player', x: 0, y: 0, stats: { hp: 100, maxHp: 100 } },
      ],
    });
    const engine = new GameEngine(state);
    const ai = new UtilityAI();

    const events = runEnemyTurn(engine, ai, 'e1');

    const attackEvents = events.filter((e) => e.type === 'attackResolved');
    expect(attackEvents).toHaveLength(2);
    expect(events.some((e) => e.type === 'turnEnded' && e.unitId === 'e1')).toBe(true);
    expect(engine.getState().units.e1?.stats.ap).toBe(0);
  });

  it('stops immediately if the unit is already dead', () => {
    const state = makeTestState({
      units: [
        { id: 'e1', faction: 'enemy', x: 0, y: 0 },
        { id: 'p1', faction: 'player', x: 1, y: 0 },
      ],
    });
    state.units.e1!.alive = false;
    const engine = new GameEngine(state);

    const events = runEnemyTurn(engine, new UtilityAI(), 'e1');

    expect(events).toEqual([]);
  });
});
