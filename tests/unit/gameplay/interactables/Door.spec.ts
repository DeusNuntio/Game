import { describe, expect, it } from 'vitest';
import { setTile } from '@/gameplay/model/Grid';
import { GameEngine } from '@/gameplay/GameEngine';
import { makeTestState } from '../../helpers/testState';

function withDoor(state: ReturnType<typeof makeTestState>) {
  setTile(state.grid, {
    coord: { x: 2, y: 0 },
    type: 'door',
    occupantId: null,
    cover: {},
    doorId: 'd1',
  });
  state.doors = { d1: { open: false } };
  return state;
}

describe('resolveOpenDoor', () => {
  it('opens an adjacent closed door and consumes 1 AP', () => {
    const state = withDoor(makeTestState({ units: [{ id: 'p1', faction: 'player', x: 1, y: 0 }] }));
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'openDoor', unitId: 'p1', doorId: 'd1' });

    expect(events[0]).toEqual({ type: 'doorToggled', doorId: 'd1', open: true });
    expect(engine.getState().doors?.d1?.open).toBe(true);
    expect(engine.getState().units.p1?.stats.ap).toBe(1);
  });

  it('rejects opening a door that is out of interaction range', () => {
    const state = withDoor(makeTestState({ units: [{ id: 'p1', faction: 'player', x: 5, y: 5 }] }));
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'openDoor', unitId: 'p1', doorId: 'd1' });

    expect(events[0]).toMatchObject({ type: 'actionRejected', reason: 'too far from door' });
  });

  it('rejects opening an already-open door', () => {
    const state = withDoor(makeTestState({ units: [{ id: 'p1', faction: 'player', x: 1, y: 0 }] }));
    state.doors!.d1!.open = true;
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'openDoor', unitId: 'p1', doorId: 'd1' });

    expect(events[0]).toMatchObject({ type: 'actionRejected', reason: 'door already open' });
  });

  it('an opened door stops blocking movement and line of sight', () => {
    const state = withDoor(
      makeTestState({
        width: 5,
        height: 1,
        units: [{ id: 'p1', faction: 'player', x: 1, y: 0 }],
      }),
    );
    const engine = new GameEngine(state);

    let events = engine.dispatch({ type: 'move', unitId: 'p1', to: { x: 3, y: 0 } });
    expect(events[0]).toMatchObject({ type: 'actionRejected' });

    engine.dispatch({ type: 'openDoor', unitId: 'p1', doorId: 'd1' });
    events = engine.dispatch({ type: 'move', unitId: 'p1', to: { x: 3, y: 0 } });
    expect(events[0]).toMatchObject({ type: 'unitMoved' });
  });

  it('rejects opening a keycard-locked door without the item', () => {
    const state = withDoor(makeTestState({ units: [{ id: 'p1', faction: 'player', x: 1, y: 0 }] }));
    state.doors!.d1!.requiresItemId = 'keycard_alpha';
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'openDoor', unitId: 'p1', doorId: 'd1' });

    expect(events[0]).toMatchObject({ type: 'actionRejected', reason: 'requires keycard' });
    expect(engine.getState().doors?.d1?.open).toBe(false);
  });

  it('opens a keycard-locked door once the unit carries the item', () => {
    const state = withDoor(makeTestState({ units: [{ id: 'p1', faction: 'player', x: 1, y: 0 }] }));
    state.doors!.d1!.requiresItemId = 'keycard_alpha';
    state.units.p1!.inventory.push('keycard_alpha');
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'openDoor', unitId: 'p1', doorId: 'd1' });

    expect(events[0]).toMatchObject({ type: 'doorToggled', open: true });
  });
});
