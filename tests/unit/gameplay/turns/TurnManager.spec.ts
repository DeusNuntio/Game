import { describe, expect, it } from 'vitest';
import { GameEngine } from '@/gameplay/GameEngine';
import { makeTestState } from '../../helpers/testState';

describe('endTurn', () => {
  it('advances to the next unit in order and refills their AP', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0, stats: { ap: 0 } },
        { id: 'e1', faction: 'enemy', x: 1, y: 0, stats: { ap: 0, maxAp: 2 } },
      ],
    });
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'endTurn', unitId: 'p1' });

    expect(events).toEqual([
      { type: 'turnEnded', unitId: 'p1' },
      { type: 'turnStarted', round: 1, unitId: 'e1' },
    ]);
    expect(engine.getState().units.e1?.stats.ap).toBe(2);
    expect(engine.getState().turn.activeIndex).toBe(1);
  });

  it('starts a new round and recomputes initiative order when the order wraps', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 1, y: 0 },
      ],
    });
    const engine = new GameEngine(state);
    engine.dispatch({ type: 'endTurn', unitId: 'p1' });

    const events = engine.dispatch({ type: 'endTurn', unitId: 'e1' });

    expect(events.some((e) => e.type === 'roundStarted' && e.round === 2)).toBe(true);
    expect(engine.getState().turn.round).toBe(2);
    expect(engine.getState().turn.activeIndex).toBe(0);
  });

  it('rejects endTurn from a unit that is not currently active', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 1, y: 0 },
      ],
    });
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'endTurn', unitId: 'e1' });

    expect(events[0]).toMatchObject({ type: 'actionRejected' });
  });

  it('rejects move/attack from a unit whose turn it is not', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 1, y: 0 },
      ],
    });
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'move', unitId: 'e1', to: { x: 2, y: 0 } });

    expect(events[0]).toMatchObject({ type: 'actionRejected', reason: "not this unit's turn" });
    expect(engine.getState().units.e1?.coord).toEqual({ x: 1, y: 0 });
  });
});
