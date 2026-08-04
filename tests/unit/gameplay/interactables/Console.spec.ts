import { describe, expect, it } from 'vitest';
import { setTile } from '@/gameplay/model/Grid';
import { GameEngine } from '@/gameplay/GameEngine';
import { makeTestState } from '../../helpers/testState';

function withConsole(state: ReturnType<typeof makeTestState>) {
  setTile(state.grid, {
    coord: { x: 2, y: 0 },
    type: 'floor',
    occupantId: null,
    cover: {},
    consoleId: 'c1',
  });
  return state;
}

describe('resolveHack', () => {
  it('succeeds with a favorable seed (roll1≈0.145 < 0.5 successChance)', () => {
    const state = withConsole(makeTestState({ units: [{ id: 'p1', faction: 'player', x: 1, y: 0 }] }));
    state.rngState = 66;
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'hack', unitId: 'p1', consoleId: 'c1' });

    expect(events[0]).toEqual({ type: 'consoleHacked', consoleId: 'c1', unitId: 'p1' });
    expect(engine.getState().consoles?.c1?.hacked).toBe(true);
    expect(engine.getState().units.p1?.stats.ap).toBe(1);
  });

  it('fails with an unfavorable seed (roll1≈0.980 > 0.5 successChance) but still spends AP', () => {
    const state = withConsole(makeTestState({ units: [{ id: 'p1', faction: 'player', x: 1, y: 0 }] }));
    state.rngState = 12345;
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'hack', unitId: 'p1', consoleId: 'c1' });

    expect(events[0]).toEqual({ type: 'consoleHackFailed', consoleId: 'c1', unitId: 'p1' });
    expect(engine.getState().consoles?.c1?.hacked).toBe(false);
    expect(engine.getState().units.p1?.stats.ap).toBe(1);
  });

  it('rejects hacking when out of range', () => {
    const state = withConsole(makeTestState({ units: [{ id: 'p1', faction: 'player', x: 5, y: 5 }] }));
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'hack', unitId: 'p1', consoleId: 'c1' });

    expect(events[0]).toMatchObject({ type: 'actionRejected', reason: 'too far from console' });
  });

  it('rejects hacking an already-hacked console', () => {
    const state = withConsole(makeTestState({ units: [{ id: 'p1', faction: 'player', x: 1, y: 0 }] }));
    state.consoles = { c1: { hacked: true, difficulty: 0.5 } };
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'hack', unitId: 'p1', consoleId: 'c1' });

    expect(events[0]).toMatchObject({ type: 'actionRejected', reason: 'console already hacked' });
  });

  it('opens a linked door remotely on a successful hack', () => {
    const state = withConsole(makeTestState({ units: [{ id: 'p1', faction: 'player', x: 1, y: 0 }] }));
    state.consoles = { c1: { hacked: false, difficulty: 0.5, linkedDoorId: 'd1' } };
    state.doors = { d1: { open: false } };
    state.rngState = 66; // guaranteed success

    const engine = new GameEngine(state);
    const events = engine.dispatch({ type: 'hack', unitId: 'p1', consoleId: 'c1' });

    expect(events).toContainEqual({ type: 'doorToggled', doorId: 'd1', open: true });
    expect(engine.getState().doors?.d1?.open).toBe(true);
  });

  it('flags an out-of-order puzzle hack while still resolving the skill check normally', () => {
    const state = withConsole(makeTestState({ units: [{ id: 'p1', faction: 'player', x: 1, y: 0 }] }));
    state.consoles = {
      c0: { hacked: false, difficulty: 0.5, puzzleGroupId: 'relays', sequenceIndex: 0 },
      c1: { hacked: false, difficulty: 0.5, puzzleGroupId: 'relays', sequenceIndex: 1 },
    };
    state.rngState = 66; // guaranteed success

    const engine = new GameEngine(state);
    // hacking c1 (index 1) before c0 (index 0) is done -> out of order
    const events = engine.dispatch({ type: 'hack', unitId: 'p1', consoleId: 'c1' });

    expect(events).toContainEqual({
      type: 'puzzleOrderViolated',
      consoleId: 'c1',
      puzzleGroupId: 'relays',
    });
    expect(engine.getState().consoles?.c1?.hacked).toBe(true); // the roll itself still succeeded
  });

  it('does not flag a puzzle hack performed in the correct order', () => {
    const state = withConsole(makeTestState({ units: [{ id: 'p1', faction: 'player', x: 1, y: 0 }] }));
    state.consoles = {
      c0: { hacked: true, difficulty: 0.5, puzzleGroupId: 'relays', sequenceIndex: 0 },
      c1: { hacked: false, difficulty: 0.5, puzzleGroupId: 'relays', sequenceIndex: 1 },
    };
    state.rngState = 66;

    const engine = new GameEngine(state);
    const events = engine.dispatch({ type: 'hack', unitId: 'p1', consoleId: 'c1' });

    expect(events.some((e) => e.type === 'puzzleOrderViolated')).toBe(false);
  });
});
