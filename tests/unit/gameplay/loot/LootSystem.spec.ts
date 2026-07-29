import { describe, expect, it } from 'vitest';
import { GameEngine } from '@/gameplay/GameEngine';
import { makeTestState } from '../../helpers/testState';

describe('dropLoot (via lethal attack)', () => {
  it('drops equipped weapon/armor and inventory onto the tile on death', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 1, y: 0, stats: { hp: 1 } },
      ],
    });
    state.units.e1!.equipped.weaponId = 'pistol_mk1';
    state.units.e1!.inventory = ['medkit_small'];
    state.rngState = 66; // guaranteed hit
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'attack', attackerId: 'p1', targetId: 'e1' });

    const lootEvent = events.find((e) => e.type === 'lootDropped');
    expect(lootEvent).toBeDefined();
    if (lootEvent?.type === 'lootDropped') {
      expect(lootEvent.itemIds.sort()).toEqual(['medkit_small', 'pistol_mk1']);
    }
    const tile = engine.getState().grid.tiles.find((t) => t.coord.x === 1 && t.coord.y === 0);
    expect(tile?.groundItemIds?.sort()).toEqual(['medkit_small', 'pistol_mk1']);
    expect(engine.getState().units.e1?.inventory).toEqual([]);
    expect(engine.getState().units.e1?.equipped.weaponId).toBeNull();
  });

  it('emits no lootDropped event when the unit carried nothing', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 1, y: 0, stats: { hp: 1 } },
      ],
    });
    state.rngState = 66;
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'attack', attackerId: 'p1', targetId: 'e1' });

    expect(events.some((e) => e.type === 'lootDropped')).toBe(false);
  });
});

describe('resolvePickupItem', () => {
  it('picks up an item lying on the unit\'s own tile', () => {
    const state = makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] });
    const tile = state.grid.tiles.find((t) => t.coord.x === 0 && t.coord.y === 0)!;
    tile.groundItemIds = ['pistol_mk1'];
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'pickupItem', unitId: 'p1', itemId: 'pistol_mk1' });

    expect(events[0]).toEqual({ type: 'itemPickedUp', unitId: 'p1', itemId: 'pistol_mk1' });
    expect(engine.getState().units.p1?.inventory).toContain('pistol_mk1');
    const nextTile = engine.getState().grid.tiles.find((t) => t.coord.x === 0 && t.coord.y === 0);
    expect(nextTile?.groundItemIds).not.toContain('pistol_mk1');
  });

  it('rejects picking up an item that is not on the unit\'s tile', () => {
    const state = makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] });
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'pickupItem', unitId: 'p1', itemId: 'pistol_mk1' });

    expect(events[0]).toMatchObject({ type: 'actionRejected', reason: 'item not on this tile' });
  });
});
