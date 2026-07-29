import { createGrid, setTile } from '@/gameplay/model/Grid';
import { createUnit } from '@/gameplay/model/Unit';
import type { GameState } from '@/gameplay/model/GameState';
import type { Mission } from '@/gameplay/model/Mission';
import { computeInitiativeOrder } from '@/gameplay/systems/turns/InitiativeOrder';

/**
 * Vertical-slice mission: infiltrate a corp server room. Two solutions:
 *  - Eliminate all guards, or
 *  - Reach and hack the security console without wiping the guards out.
 * A closed door gates the server room; cover tiles flank the choke point.
 */
export function createMission01(): GameState {
  const grid = createGrid(10, 7);

  // Perimeter walls.
  for (let x = 0; x < 10; x++) {
    setTile(grid, { coord: { x, y: 0 }, type: 'wall', occupantId: null, cover: {} });
    setTile(grid, { coord: { x, y: 6 }, type: 'wall', occupantId: null, cover: {} });
  }
  for (let y = 0; y < 7; y++) {
    setTile(grid, { coord: { x: 0, y }, type: 'wall', occupantId: null, cover: {} });
    setTile(grid, { coord: { x: 9, y }, type: 'wall', occupantId: null, cover: {} });
  }

  // Interior wall separating entry corridor from the server room, with a door choke point.
  for (let y = 1; y < 6; y++) {
    if (y === 3) continue; // gap for the door
    setTile(grid, { coord: { x: 5, y }, type: 'wall', occupantId: null, cover: {} });
  }
  setTile(grid, { coord: { x: 5, y: 3 }, type: 'door', occupantId: null, cover: {}, doorId: 'server_door' });

  // Cover near the choke point on both sides.
  setTile(grid, { coord: { x: 4, y: 2 }, type: 'floor', occupantId: null, cover: { east: 'full' } });
  setTile(grid, { coord: { x: 4, y: 4 }, type: 'floor', occupantId: null, cover: { east: 'full' } });
  setTile(grid, { coord: { x: 6, y: 2 }, type: 'floor', occupantId: null, cover: { west: 'half' } });
  setTile(grid, { coord: { x: 6, y: 4 }, type: 'floor', occupantId: null, cover: { west: 'half' } });

  // Security console tucked in the back corner of the server room.
  setTile(grid, {
    coord: { x: 8, y: 5 },
    type: 'floor',
    occupantId: null,
    cover: {},
    consoleId: 'security1',
  });

  const units: GameState['units'] = {};

  const runner = createUnit({
    id: 'runner',
    name: 'Runner',
    faction: 'player',
    coord: { x: 1, y: 2 },
    stats: {
      maxHp: 12,
      hp: 12,
      maxAp: 2,
      ap: 2,
      baseAccuracy: 0.75,
      moveRange: 5,
      critChance: 0.15,
      hackSkill: 0.65,
      baseDamage: 3,
      initiative: 8,
    },
  });
  runner.inventory.push('smg_mk1', 'medkit_small');

  const ghost = createUnit({
    id: 'ghost',
    name: 'Ghost',
    faction: 'player',
    coord: { x: 1, y: 4 },
    stats: {
      maxHp: 9,
      hp: 9,
      maxAp: 2,
      ap: 2,
      baseAccuracy: 0.8,
      moveRange: 6,
      critChance: 0.2,
      hackSkill: 0.85,
      baseDamage: 2,
      initiative: 9,
    },
  });
  ghost.inventory.push('pistol_mk1');

  const guard1 = createUnit({
    id: 'guard1',
    name: 'Corp Guard',
    faction: 'enemy',
    coord: { x: 7, y: 2 },
    stats: {
      maxHp: 8,
      hp: 8,
      maxAp: 2,
      ap: 2,
      baseAccuracy: 0.6,
      moveRange: 4,
      critChance: 0.05,
      hackSkill: 0.2,
      baseDamage: 2,
      initiative: 5,
    },
    aiProfileId: 'utility',
  });
  guard1.equipped.weaponId = 'pistol_mk1';

  const guard2 = createUnit({
    id: 'guard2',
    name: 'Corp Guard',
    faction: 'enemy',
    coord: { x: 7, y: 4 },
    stats: {
      maxHp: 8,
      hp: 8,
      maxAp: 2,
      ap: 2,
      baseAccuracy: 0.6,
      moveRange: 4,
      critChance: 0.05,
      hackSkill: 0.2,
      baseDamage: 2,
      initiative: 4,
    },
    aiProfileId: 'utility',
  });
  guard2.equipped.weaponId = 'pistol_mk1';

  const heavy = createUnit({
    id: 'heavy',
    name: 'Corp Heavy',
    faction: 'enemy',
    coord: { x: 8, y: 3 },
    stats: {
      maxHp: 12,
      hp: 12,
      maxAp: 2,
      ap: 2,
      baseAccuracy: 0.55,
      moveRange: 3,
      critChance: 0.05,
      hackSkill: 0.1,
      baseDamage: 3,
      initiative: 3,
    },
    aiProfileId: 'utility',
  });
  heavy.equipped.weaponId = 'smg_mk1';

  for (const unit of [runner, ghost, guard1, guard2, heavy]) {
    units[unit.id] = unit;
    const tile = grid.tiles.find((t) => t.coord.x === unit.coord.x && t.coord.y === unit.coord.y);
    if (tile) tile.occupantId = unit.id;
  }

  const mission: Mission = {
    id: 'mission01',
    name: 'Serverraum-Infiltration',
    objectives: [
      {
        id: 'eliminate_guards',
        type: 'eliminateAll',
        description: 'Alle Wachen ausschalten',
        complete: false,
      },
      {
        id: 'hack_security',
        type: 'hackConsole',
        description: 'Sicherheitskonsole hacken',
        consoleId: 'security1',
        complete: false,
      },
    ],
    status: 'ongoing',
  };

  const state: GameState = {
    grid,
    units,
    turn: { round: 1, order: [], activeIndex: 0 },
    rngState: 0xc0ffee ^ Date.now(),
    doors: { server_door: { open: false } },
    consoles: { security1: { hacked: false, difficulty: 0.5 } },
    mission,
  };
  state.turn.order = computeInitiativeOrder(state);

  return state;
}
