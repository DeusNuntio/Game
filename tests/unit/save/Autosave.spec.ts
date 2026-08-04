import { describe, expect, it, vi } from 'vitest';
import { GameEngine } from '@/gameplay/GameEngine';
import { SaveManager } from '@/save/SaveManager';
import { InMemoryStorageAdapter } from '@/save/InMemoryStorageAdapter';
import { wireAutosave, AUTOSAVE_SLOT } from '@/save/Autosave';
import { makeTestState } from '../helpers/testState';

describe('wireAutosave', () => {
  it('autosaves when a new round starts', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 1, y: 0 },
      ],
    });
    const engine = new GameEngine(state);
    const manager = new SaveManager(new InMemoryStorageAdapter());
    wireAutosave(engine, manager);

    expect(manager.hasSave(AUTOSAVE_SLOT)).toBe(false);
    engine.dispatch({ type: 'endTurn', unitId: 'p1' });
    engine.dispatch({ type: 'endTurn', unitId: 'e1' }); // wraps into round 2

    expect(manager.hasSave(AUTOSAVE_SLOT)).toBe(true);
    expect(manager.load(AUTOSAVE_SLOT)?.turn.round).toBe(2);
  });

  it('autosaves on missionWon', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'guard1', faction: 'enemy', x: 1, y: 0, stats: { hp: 1 } },
      ],
    });
    state.mission = {
      id: 'm',
      name: 'm',
      briefing: '',
      alarmActive: true,
      status: 'ongoing',
      objectives: [{ id: 'kill', type: 'eliminateAll', description: '', complete: false }],
    };
    state.rngState = 66; // guaranteed hit+crit
    const engine = new GameEngine(state);
    const manager = new SaveManager(new InMemoryStorageAdapter());
    wireAutosave(engine, manager);

    engine.dispatch({ type: 'attack', attackerId: 'p1', targetId: 'guard1' });

    expect(manager.load(AUTOSAVE_SLOT)?.mission?.status).toBe('won');
  });

  it('the returned unsubscribe function stops future autosaves', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 1, y: 0 },
      ],
    });
    const engine = new GameEngine(state);
    const manager = new SaveManager(new InMemoryStorageAdapter());
    const saveSpy = vi.spyOn(manager, 'save');
    const unsubscribe = wireAutosave(engine, manager);
    unsubscribe();

    engine.dispatch({ type: 'endTurn', unitId: 'p1' });
    engine.dispatch({ type: 'endTurn', unitId: 'e1' });

    expect(saveSpy).not.toHaveBeenCalled();
  });
});
