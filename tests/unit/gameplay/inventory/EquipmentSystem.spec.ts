import { describe, expect, it } from 'vitest';
import { GameEngine } from '@/gameplay/GameEngine';
import { makeTestState } from '../../helpers/testState';

describe('resolveEquip', () => {
  it('equips a weapon from inventory into the weapon slot, free of AP cost', () => {
    const state = makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0, stats: { ap: 2 } }] });
    state.units.p1!.inventory = ['pistol_mk1'];
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'equip', unitId: 'p1', itemId: 'pistol_mk1' });

    expect(events[0]).toEqual({ type: 'itemEquipped', unitId: 'p1', itemId: 'pistol_mk1', slot: 'weapon' });
    const unit = engine.getState().units.p1!;
    expect(unit.equipped.weaponId).toBe('pistol_mk1');
    expect(unit.inventory).not.toContain('pistol_mk1');
    expect(unit.stats.ap).toBe(2);
  });

  it('swaps the previously equipped weapon back into inventory', () => {
    const state = makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] });
    state.units.p1!.equipped.weaponId = 'pistol_mk1';
    state.units.p1!.inventory = ['smg_mk1'];
    const engine = new GameEngine(state);

    engine.dispatch({ type: 'equip', unitId: 'p1', itemId: 'smg_mk1' });

    const unit = engine.getState().units.p1!;
    expect(unit.equipped.weaponId).toBe('smg_mk1');
    expect(unit.inventory).toContain('pistol_mk1');
  });

  it('rejects equipping an item not in inventory', () => {
    const state = makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] });
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'equip', unitId: 'p1', itemId: 'pistol_mk1' });

    expect(events[0]).toMatchObject({ type: 'actionRejected', reason: 'item not in inventory' });
  });

  it('rejects equipping a consumable', () => {
    const state = makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] });
    state.units.p1!.inventory = ['medkit_small'];
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'equip', unitId: 'p1', itemId: 'medkit_small' });

    expect(events[0]).toMatchObject({ type: 'actionRejected', reason: 'item is not equippable' });
  });

  it('rejects equipping a quest item', () => {
    const state = makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] });
    state.units.p1!.inventory = ['keycard_exec'];
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'equip', unitId: 'p1', itemId: 'keycard_exec' });

    expect(events[0]).toMatchObject({ type: 'actionRejected', reason: 'item is not equippable' });
  });
});
