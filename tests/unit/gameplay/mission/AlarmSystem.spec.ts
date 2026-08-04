import { describe, expect, it } from 'vitest';
import { setTile } from '@/gameplay/model/Grid';
import { GameEngine } from '@/gameplay/GameEngine';
import type { Mission } from '@/gameplay/model/Mission';
import { makeTestState } from '../../helpers/testState';

function unalarmedMission(): Mission {
  return {
    id: 'm1',
    name: 'test',
    briefing: '',
    status: 'ongoing',
    alarmActive: false,
    objectives: [{ id: 'kill', type: 'eliminateAll', description: '', complete: false }],
  };
}

describe('evaluateAlarm (via GameEngine.dispatch)', () => {
  it('stays unalarmed while no enemy has line of sight and nothing loud happens', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 4, y: 0 },
      ],
    });
    setTile(state.grid, { coord: { x: 2, y: 0 }, type: 'wall', occupantId: null, cover: {} });
    state.mission = unalarmedMission();
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'move', unitId: 'p1', to: { x: 1, y: 0 } });

    expect(events.some((e) => e.type === 'alarmTriggered')).toBe(false);
    expect(engine.getState().mission?.alarmActive).toBe(false);
  });

  it('triggers when an enemy gets line of sight to a player unit', () => {
    const state = makeTestState({
      width: 5,
      height: 1,
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 4, y: 0 },
      ],
    });
    state.mission = unalarmedMission();
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'move', unitId: 'p1', to: { x: 1, y: 0 } });

    expect(events).toContainEqual({ type: 'alarmTriggered', reason: 'spotted' });
    expect(engine.getState().mission?.alarmActive).toBe(true);
  });

  it('always triggers on an attack, even without prior detection', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 1, y: 0 },
      ],
    });
    state.mission = unalarmedMission();
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'attack', attackerId: 'p1', targetId: 'e1' });

    expect(events).toContainEqual({ type: 'alarmTriggered', reason: 'attack' });
  });

  it('triggers on a failed hack', () => {
    const state = makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] });
    setTile(state.grid, {
      coord: { x: 1, y: 0 },
      type: 'floor',
      occupantId: null,
      cover: {},
      consoleId: 'c1',
    });
    state.mission = unalarmedMission();
    state.rngState = 12345; // guaranteed miss/fail seed (see AttackResolver test notes)
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'hack', unitId: 'p1', consoleId: 'c1' });

    expect(events.some((e) => e.type === 'consoleHackFailed')).toBe(true);
    expect(events).toContainEqual({ type: 'alarmTriggered', reason: 'hackFailed' });
  });

  it('never fires a second alarmTriggered event once already active', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 1, y: 0 },
        { id: 'p2', faction: 'player', x: 2, y: 0 },
      ],
    });
    state.mission = unalarmedMission();
    const engine = new GameEngine(state);

    engine.dispatch({ type: 'attack', attackerId: 'p1', targetId: 'e1' });
    expect(engine.getState().mission?.alarmActive).toBe(true);

    const laterEvents = engine.dispatch({ type: 'endTurn', unitId: 'e1' });
    expect(laterEvents.some((e) => e.type === 'alarmTriggered')).toBe(false);
  });
});
