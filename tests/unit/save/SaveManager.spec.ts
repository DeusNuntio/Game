import { describe, expect, it } from 'vitest';
import { SaveManager } from '@/save/SaveManager';
import { InMemoryStorageAdapter } from '@/save/InMemoryStorageAdapter';
import { GameEngine } from '@/gameplay/GameEngine';
import { createMission01 } from '@/data/missions/mission01';
import { makeTestState } from '../helpers/testState';

describe('SaveManager', () => {
  it('returns null when there is no save in the slot', () => {
    const manager = new SaveManager(new InMemoryStorageAdapter());
    expect(manager.load('autosave')).toBeNull();
    expect(manager.hasSave('autosave')).toBe(false);
  });

  it('round-trips a simple GameState exactly through save/load', () => {
    const manager = new SaveManager(new InMemoryStorageAdapter());
    const state = makeTestState({ units: [{ id: 'p1', faction: 'player', x: 1, y: 1 }] });

    manager.save('slot1', state);
    const loaded = manager.load('slot1');

    expect(loaded).toEqual(state);
    expect(manager.hasSave('slot1')).toBe(true);
  });

  it('round-trips a full mission state, including inventory/equipment/objectives, after some play', () => {
    const manager = new SaveManager(new InMemoryStorageAdapter());
    const engine = new GameEngine(createMission01());
    engine.dispatch({ type: 'equip', unitId: 'ghost', itemId: 'pistol_mk1' });

    manager.save('mission', engine.getState());
    const loaded = manager.load('mission');

    expect(loaded).toEqual(engine.getState());
    expect(loaded?.units.ghost?.equipped.weaponId).toBe('pistol_mk1');
    expect(loaded?.mission?.objectives).toHaveLength(2);
  });

  it('deleteSave removes the entry', () => {
    const manager = new SaveManager(new InMemoryStorageAdapter());
    const state = makeTestState();
    manager.save('slot1', state);

    manager.deleteSave('slot1');

    expect(manager.load('slot1')).toBeNull();
  });

  it('rejects a save from an incompatible version', () => {
    const storage = new InMemoryStorageAdapter();
    storage.setItem(
      'cyberpunk-tactics:save:slot1',
      JSON.stringify({ version: 999, timestamp: 0, state: makeTestState() }),
    );
    const manager = new SaveManager(storage);

    expect(manager.load('slot1')).toBeNull();
  });
});
