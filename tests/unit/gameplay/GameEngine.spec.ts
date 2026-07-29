import { describe, expect, it } from 'vitest';
import { GameEngine } from '@/gameplay/GameEngine';
import { makeTestState } from '../helpers/testState';

describe('GameEngine.dispatch(move)', () => {
  it('moves a unit within range and consumes 1 AP', () => {
    const state = makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] });
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'move', unitId: 'p1', to: { x: 2, y: 0 } });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: 'unitMoved', unitId: 'p1' });
    const next = engine.getState();
    expect(next.units.p1?.coord).toEqual({ x: 2, y: 0 });
    expect(next.units.p1?.stats.ap).toBe(1);
  });

  it('rejects a move beyond move range', () => {
    const state = makeTestState({
      units: [{ id: 'p1', faction: 'player', x: 0, y: 0, stats: { moveRange: 1 } }],
    });
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'move', unitId: 'p1', to: { x: 4, y: 0 } });

    expect(events[0]).toMatchObject({ type: 'actionRejected', reason: 'destination out of move range' });
    expect(engine.getState().units.p1?.coord).toEqual({ x: 0, y: 0 });
  });

  it('rejects a move onto an occupied tile', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'p2', faction: 'player', x: 1, y: 0 },
      ],
    });
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'move', unitId: 'p1', to: { x: 1, y: 0 } });

    expect(events[0]?.type).toBe('actionRejected');
  });

  it('rejects a move when the unit has no AP left', () => {
    const state = makeTestState({
      units: [{ id: 'p1', faction: 'player', x: 0, y: 0, stats: { ap: 0 } }],
    });
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'move', unitId: 'p1', to: { x: 1, y: 0 } });

    expect(events[0]).toMatchObject({ type: 'actionRejected', reason: 'not enough action points' });
  });

  it('updates tile occupancy on move', () => {
    const state = makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] });
    const engine = new GameEngine(state);

    engine.dispatch({ type: 'move', unitId: 'p1', to: { x: 1, y: 0 } });

    const next = engine.getState();
    const oldTile = next.grid.tiles.find((t) => t.coord.x === 0 && t.coord.y === 0);
    const newTile = next.grid.tiles.find((t) => t.coord.x === 1 && t.coord.y === 0);
    expect(oldTile?.occupantId).toBeNull();
    expect(newTile?.occupantId).toBe('p1');
  });

  it('emits events through the event bus', () => {
    const state = makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] });
    const engine = new GameEngine(state);
    const received: string[] = [];
    engine.events.on('unitMoved', (e) => received.push(e.unitId));

    engine.dispatch({ type: 'move', unitId: 'p1', to: { x: 1, y: 0 } });

    expect(received).toEqual(['p1']);
  });
});
