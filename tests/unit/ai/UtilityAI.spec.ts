import { describe, expect, it } from 'vitest';
import { UtilityAI } from '@/ai/UtilityAI';
import { makeTestState } from '../helpers/testState';

describe('UtilityAI.decide', () => {
  const ai = new UtilityAI();

  it('attacks a visible enemy when healthy and in the open', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'e1', faction: 'enemy', x: 2, y: 0 },
        { id: 'p1', faction: 'player', x: 0, y: 0 },
      ],
    });
    expect(ai.decide(state.units.e1!, state)).toEqual({
      type: 'attack',
      attackerId: 'e1',
      targetId: 'p1',
    });
  });

  it('flees when badly hurt, overriding attack', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'e1', faction: 'enemy', x: 2, y: 0, stats: { hp: 1, maxHp: 10 } },
        { id: 'p1', faction: 'player', x: 0, y: 0 },
      ],
    });
    const action = ai.decide(state.units.e1!, state);
    expect(action.type).toBe('move');
  });

  it('ends the turn when there is nothing to do', () => {
    const state = makeTestState({ units: [{ id: 'e1', faction: 'enemy', x: 0, y: 0, stats: { ap: 0 } }] });
    expect(ai.decide(state.units.e1!, state)).toEqual({ type: 'endTurn', unitId: 'e1' });
  });

  it('patrols instead of attacking while the mission is unalarmed', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'e1', faction: 'enemy', x: 2, y: 0 },
        { id: 'p1', faction: 'player', x: 0, y: 0 },
      ],
    });
    state.units.e1!.patrolRoute = [
      { x: 2, y: 0 },
      { x: 4, y: 0 },
    ];
    state.mission = {
      id: 'm',
      name: 'm',
      briefing: '',
      status: 'ongoing',
      alarmActive: false,
      objectives: [],
    };

    const action = ai.decide(state.units.e1!, state);

    expect(action).toEqual({ type: 'move', unitId: 'e1', to: { x: 4, y: 0 } });
  });

  it('switches back to full combat AI once the mission alarm is active', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'e1', faction: 'enemy', x: 2, y: 0 },
        { id: 'p1', faction: 'player', x: 0, y: 0 },
      ],
    });
    state.units.e1!.patrolRoute = [
      { x: 2, y: 0 },
      { x: 4, y: 0 },
    ];
    state.mission = {
      id: 'm',
      name: 'm',
      briefing: '',
      status: 'ongoing',
      alarmActive: true,
      objectives: [],
    };

    const action = ai.decide(state.units.e1!, state);

    expect(action).toEqual({ type: 'attack', attackerId: 'e1', targetId: 'p1' });
  });
});
