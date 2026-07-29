import { describe, expect, it } from 'vitest';
import { Rng } from '@/core/Rng';
import { rollAttack } from '@/gameplay/systems/combat/AttackResolver';
import { GameEngine } from '@/gameplay/GameEngine';
import { makeTestState } from '../../helpers/testState';

describe('rollAttack (deterministic seeds)', () => {
  it('hits and crits with seed 66 (roll1≈0.145, roll2≈0.005)', () => {
    const state = makeTestState();
    const rng = new Rng(66);
    const result = rollAttack(state, 0.75, 0.1, 4, 4, { x: 0, y: 0 }, { x: 1, y: 0 }, rng);
    expect(result.hit).toBe(true);
    expect(result.crit).toBe(true);
    expect(result.damage).toBe(6); // 4 * 1.5
  });

  it('hits without a crit with seed 8 (roll1≈0.156, roll2≈0.625)', () => {
    const state = makeTestState();
    const rng = new Rng(8);
    const result = rollAttack(state, 0.75, 0.1, 4, 4, { x: 0, y: 0 }, { x: 1, y: 0 }, rng);
    expect(result.hit).toBe(true);
    expect(result.crit).toBe(false);
    expect(result.damage).toBe(4);
  });

  it('misses with seed 12345 (roll1≈0.980, above the 0.95 max hit chance)', () => {
    const state = makeTestState();
    const rng = new Rng(12345);
    const result = rollAttack(state, 0.75, 0.1, 4, 4, { x: 0, y: 0 }, { x: 1, y: 0 }, rng);
    expect(result.hit).toBe(false);
    expect(result.damage).toBe(0);
  });
});

describe('resolveAttackAction', () => {
  it('applies damage, decrements AP, and emits attackResolved on a hit', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 1, y: 0, stats: { hp: 10 } },
      ],
    });
    state.rngState = 66;
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'attack', attackerId: 'p1', targetId: 'e1' });

    expect(events[0]).toMatchObject({ type: 'attackResolved', hit: true, crit: true, damage: 5 });
    const next = engine.getState();
    expect(next.units.p1?.stats.ap).toBe(1);
    expect(next.units.e1?.stats.hp).toBe(5);
  });

  it('kills the target and emits unitDied when hp drops to 0', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 1, y: 0, stats: { hp: 4 } },
      ],
    });
    state.rngState = 66; // guaranteed hit+crit, 5 damage
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'attack', attackerId: 'p1', targetId: 'e1' });

    expect(events.some((e) => e.type === 'unitDied')).toBe(true);
    const next = engine.getState();
    expect(next.units.e1?.alive).toBe(false);
    const tile = next.grid.tiles.find((t) => t.coord.x === 1 && t.coord.y === 0);
    expect(tile?.occupantId).toBeNull();
  });

  it('rejects an attack when there is no line of sight', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 2, y: 0 },
      ],
    });
    const wallTile = state.grid.tiles.find((t) => t.coord.x === 1 && t.coord.y === 0)!;
    wallTile.type = 'wall';
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'attack', attackerId: 'p1', targetId: 'e1' });

    expect(events[0]).toMatchObject({ type: 'actionRejected', reason: 'no line of sight to target' });
  });

  it('rejects an attack against an already-dead target', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 1, y: 0 },
      ],
    });
    state.units.e1!.alive = false;
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'attack', attackerId: 'p1', targetId: 'e1' });

    expect(events[0]).toMatchObject({ type: 'actionRejected', reason: 'target not found or dead' });
  });

  it('uses the equipped weapon damage range instead of baseDamage when equipped', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0 },
        { id: 'e1', faction: 'enemy', x: 1, y: 0, stats: { hp: 100 } },
      ],
    });
    state.units.p1!.equipped.weaponId = 'rifle_mk1'; // damage 4-7, no accuracyMod, +0.1 crit
    state.rngState = 66; // guaranteed hit+crit
    const engine = new GameEngine(state);

    const events = engine.dispatch({ type: 'attack', attackerId: 'p1', targetId: 'e1' });

    expect(events[0]?.type).toBe('attackResolved');
    if (events[0]?.type === 'attackResolved') {
      expect(events[0].crit).toBe(true);
      // rifle damage roll is in [4,7], crit multiplies by 1.5 and rounds
      expect(events[0].damage).toBeGreaterThanOrEqual(Math.round(4 * 1.5));
      expect(events[0].damage).toBeLessThanOrEqual(Math.round(7 * 1.5));
    }
  });

  it('spends the weapon apCost instead of a flat 1 AP', () => {
    const state = makeTestState({
      units: [
        { id: 'p1', faction: 'player', x: 0, y: 0, stats: { ap: 1 } },
        { id: 'e1', faction: 'enemy', x: 1, y: 0 },
      ],
    });
    state.units.p1!.equipped.weaponId = 'pistol_mk1'; // apCost 1
    const engine = new GameEngine(state);

    engine.dispatch({ type: 'attack', attackerId: 'p1', targetId: 'e1' });

    expect(engine.getState().units.p1?.stats.ap).toBe(0);
  });
});
