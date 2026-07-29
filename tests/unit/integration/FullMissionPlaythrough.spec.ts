import { describe, expect, it } from 'vitest';
import { GameEngine } from '@/gameplay/GameEngine';
import { createMission01 } from '@/data/missions/mission01';
import { SaveManager } from '@/save/SaveManager';
import { InMemoryStorageAdapter } from '@/save/InMemoryStorageAdapter';
import { wireAutosave, AUTOSAVE_SLOT } from '@/save/Autosave';

/**
 * End-to-end engine-level playthrough of the real mission01 data (not a
 * synthetic test fixture): breach the door, cross the server room, and hack
 * the console — the non-lethal solution path — driven entirely through
 * GameEngine.dispatch(), exactly like the UI/AI would. Proves movement,
 * interactables, mission win/lose, and autosave all cooperate correctly
 * against the actual shipped mission.
 */
describe('full mission01 playthrough (hack-console solution path)', () => {
  it('wins the mission by breaching the door and hacking the console, without firing a shot', () => {
    const initialState = createMission01();
    initialState.rngState = 66; // guaranteed hack success on the first roll
    const engine = new GameEngine(initialState);
    const saveManager = new SaveManager(new InMemoryStorageAdapter());
    wireAutosave(engine, saveManager, AUTOSAVE_SLOT);

    // Round 1, Ghost's turn (highest initiative, spawns at (1,4)): approach the door and open it.
    expect(engine.getState().turn.order[0]).toBe('ghost');
    let events = engine.dispatch({ type: 'move', unitId: 'ghost', to: { x: 4, y: 3 } });
    expect(events[0]).toMatchObject({ type: 'unitMoved' });

    events = engine.dispatch({ type: 'openDoor', unitId: 'ghost', doorId: 'server_door' });
    expect(events[0]).toMatchObject({ type: 'doorToggled', open: true });
    expect(engine.getState().units.ghost?.stats.ap).toBe(0);

    engine.dispatch({ type: 'endTurn', unitId: 'ghost' });

    // Skip every other unit's turn this round (runner + all three guards) — this
    // test is about movement/hacking/objectives, not combat/AI, which have
    // their own dedicated tests.
    for (const unitId of ['runner', 'guard1', 'guard2', 'heavy']) {
      expect(engine.getState().turn.order[engine.getState().turn.activeIndex]).toBe(unitId);
      engine.dispatch({ type: 'endTurn', unitId });
    }

    expect(engine.getState().turn.round).toBe(2);
    expect(engine.getState().turn.order[engine.getState().turn.activeIndex]).toBe('ghost');
    expect(engine.getState().units.ghost?.stats.ap).toBe(2); // refilled at round start

    // Round 2, Ghost's turn: cross the now-open door into the server room and hack the console.
    events = engine.dispatch({ type: 'move', unitId: 'ghost', to: { x: 7, y: 5 } });
    expect(events[0]).toMatchObject({ type: 'unitMoved' });

    events = engine.dispatch({ type: 'hack', unitId: 'ghost', consoleId: 'security1' });

    expect(events).toContainEqual({ type: 'consoleHacked', consoleId: 'security1', unitId: 'ghost' });
    expect(events.some((e) => e.type === 'objectiveCompleted' && e.objectiveId === 'hack_security')).toBe(
      true,
    );
    expect(events.some((e) => e.type === 'missionWon')).toBe(true);

    const finalState = engine.getState();
    expect(finalState.mission?.status).toBe('won');
    expect(finalState.mission?.objectives.find((o) => o.id === 'eliminate_guards')?.complete).toBe(false);
    // Every guard survived — this really was the non-lethal path.
    expect(['guard1', 'guard2', 'heavy'].every((id) => finalState.units[id]?.alive)).toBe(true);

    // The missionWon event should have triggered an autosave.
    const saved = saveManager.load(AUTOSAVE_SLOT);
    expect(saved?.mission?.status).toBe('won');
  });
});
