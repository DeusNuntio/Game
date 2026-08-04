import { describe, expect, it } from 'vitest';
import { setTile } from '@/gameplay/model/Grid';
import { GameEngine } from '@/gameplay/GameEngine';
import type { Mission } from '@/gameplay/model/Mission';
import { createMission01 } from '@/data/missions/mission01';
import { makeTestState } from '../../helpers/testState';

function twoObjectiveMission(): Mission {
  return {
    id: 'test_mission',
    name: 'Test Mission',
    briefing: '',
    status: 'ongoing',
    alarmActive: true, // tests dispatch attacks directly; keep AI/patrol semantics out of scope here
    objectives: [
      { id: 'eliminate_guards', type: 'eliminateAll', description: '', complete: false },
      { id: 'hack_security', type: 'hackConsole', description: '', consoleId: 'c1', complete: false },
    ],
  };
}

describe('GameEngine mission integration — two solution paths', () => {
  it('wins via the eliminateAll path when the sole guard dies', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'guard1', faction: 'enemy', x: 1, y: 0, stats: { hp: 1 } },
      ],
    });
    state.mission = twoObjectiveMission();
    state.rngState = 66; // guaranteed hit+crit
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'attack', attackerId: 'p1', targetId: 'guard1' });

    expect(events.some((e) => e.type === 'objectiveCompleted' && e.objectiveId === 'eliminate_guards')).toBe(
      true,
    );
    expect(events.some((e) => e.type === 'missionWon')).toBe(true);
    expect(engine.getState().mission?.status).toBe('won');
  });

  it('wins via the hackConsole path even while the guard is still alive', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'guard1', faction: 'enemy', x: 5, y: 5, stats: { hp: 100 } },
      ],
    });
    setTile(state.grid, {
      coord: { x: 1, y: 0 },
      type: 'floor',
      occupantId: null,
      cover: {},
      consoleId: 'c1',
    });
    state.mission = twoObjectiveMission();
    state.rngState = 66; // guaranteed hack success (hackSkill 0.5 vs difficulty default 0.5)
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'hack', unitId: 'p1', consoleId: 'c1' });

    expect(events.some((e) => e.type === 'missionWon')).toBe(true);
    const mission = engine.getState().mission!;
    expect(mission.status).toBe('won');
    expect(mission.objectives.find((o) => o.id === 'eliminate_guards')?.complete).toBe(false);
    expect(mission.objectives.find((o) => o.id === 'hack_security')?.complete).toBe(true);
    // the guard is still alive -- this really was the non-lethal solution path
    expect(engine.getState().units.guard1?.alive).toBe(true);
  });

  it('loses once all player units are dead', () => {
    const state = makeTestState({
      units: [
        { id: 'guard1', faction: 'enemy', x: 0, y: 0 },
        { id: 'p1', faction: 'player', x: 1, y: 0, stats: { hp: 1 } },
      ],
      // guard1 first in initiative so it can act
    });
    state.mission = twoObjectiveMission();
    state.rngState = 66; // guaranteed hit+crit
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'attack', attackerId: 'guard1', targetId: 'p1' });

    expect(events.some((e) => e.type === 'missionLost')).toBe(true);
    expect(engine.getState().mission?.status).toBe('lost');
  });

  it('does not re-fire mission events once the mission has already ended', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'guard1', faction: 'enemy', x: 1, y: 0, stats: { hp: 1 } },
        { id: 'p2', faction: 'player', x: 2, y: 0 },
      ],
    });
    state.mission = twoObjectiveMission();
    state.rngState = 66;
    const engine = new GameEngine(state);

    engine.dispatch({ type: 'attack', attackerId: 'p1', targetId: 'guard1' });
    expect(engine.getState().mission?.status).toBe('won');

    const laterEvents = engine.dispatch({ type: 'endTurn', unitId: 'p2' });
    expect(laterEvents.some((e) => e.type === 'missionWon')).toBe(false);
  });
});

describe('createMission01', () => {
  it('produces a valid, non-overlapping starting layout with both objectives present', () => {
    const state = createMission01();

    const unitIds = Object.keys(state.units);
    expect(unitIds).toHaveLength(5);
    expect(state.turn.order.sort()).toEqual([...unitIds].sort());

    const coordsSeen = new Set<string>();
    for (const unit of Object.values(state.units)) {
      const key = `${unit.coord.x},${unit.coord.y}`;
      expect(coordsSeen.has(key)).toBe(false);
      coordsSeen.add(key);
      const tile = state.grid.tiles.find((t) => t.coord.x === unit.coord.x && t.coord.y === unit.coord.y);
      expect(tile?.type).not.toBe('wall');
    }

    expect(state.mission?.objectives.map((o) => o.id).sort()).toEqual(['eliminate_guards', 'hack_security']);
    expect(state.mission?.status).toBe('ongoing');
    expect(state.doors?.server_door?.open).toBe(false);
    expect(state.consoles?.security1?.hacked).toBe(false);
  });
});
