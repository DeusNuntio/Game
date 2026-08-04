import { createGrid, setTile, type Coord, type CoverMap, type Direction } from '@/gameplay/model/Grid';
import { createUnit, type Faction, type Unit, type UnitStats } from '@/gameplay/model/Unit';
import type { ConsoleState, DoorState, GameState } from '@/gameplay/model/GameState';
import type { Mission, Objective } from '@/gameplay/model/Mission';
import { computeInitiativeOrder } from '@/gameplay/systems/turns/InitiativeOrder';

/**
 * Reusable stat archetypes so 20 missions don't each hand-roll full UnitStats
 * blocks. Spread a template and override only what a specific mission needs
 * (id/name/coord/inventory/weapon/patrolRoute/individual stat tweaks).
 */
export const UNIT_TEMPLATES = {
  // --- player operatives ---
  runner: {
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
  ghost: {
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
  soldier: {
    maxHp: 16,
    hp: 16,
    maxAp: 2,
    ap: 2,
    baseAccuracy: 0.7,
    moveRange: 4,
    critChance: 0.1,
    hackSkill: 0.3,
    baseDamage: 4,
    initiative: 6,
  },
  medic: {
    maxHp: 11,
    hp: 11,
    maxAp: 2,
    ap: 2,
    baseAccuracy: 0.7,
    moveRange: 5,
    critChance: 0.1,
    hackSkill: 0.5,
    baseDamage: 2,
    initiative: 7,
  },
  // --- enemies ---
  guard: {
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
  heavyGuard: {
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
  sniperEnemy: {
    maxHp: 7,
    hp: 7,
    maxAp: 2,
    ap: 2,
    baseAccuracy: 0.8,
    moveRange: 3,
    critChance: 0.3,
    hackSkill: 0.1,
    baseDamage: 4,
    initiative: 7,
  },
  drone: {
    maxHp: 5,
    hp: 5,
    maxAp: 3,
    ap: 3,
    baseAccuracy: 0.5,
    moveRange: 6,
    critChance: 0.05,
    hackSkill: 0.05,
    baseDamage: 2,
    initiative: 6,
  },
  elite: {
    maxHp: 18,
    hp: 18,
    maxAp: 3,
    ap: 3,
    baseAccuracy: 0.7,
    moveRange: 4,
    critChance: 0.15,
    hackSkill: 0.3,
    baseDamage: 5,
    initiative: 10,
  },
} satisfies Record<string, UnitStats>;

export type UnitTemplateName = keyof typeof UNIT_TEMPLATES;

interface SpawnParams {
  id: string;
  name: string;
  template: UnitTemplateName;
  coord: Coord;
  /** Shallow-merged over the template's stats. */
  statOverrides?: Partial<UnitStats>;
  weaponId?: string;
  armorId?: string;
  inventory?: string[];
  aiProfileId?: string;
  patrolRoute?: Coord[];
}

/**
 * Fluent helper for hand-authoring mission grids without repeating the
 * perimeter-wall/tile/unit/door/console boilerplate every mission needs.
 * Not a general level-editor — just enough to keep 20 missions terse and
 * consistent. Call `.build()` last; it wires turn order and returns a
 * ready-to-dispatch GameState.
 */
export class MissionBuilder {
  private grid;
  private units: GameState['units'] = {};
  private doors: Record<string, DoorState> = {};
  private consoles: Record<string, ConsoleState> = {};
  private objectives: Objective[] = [];

  constructor(width: number, height: number) {
    this.grid = createGrid(width, height);
    for (let x = 0; x < width; x++) {
      this.wall(x, 0);
      this.wall(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      this.wall(0, y);
      this.wall(width - 1, y);
    }
  }

  private tileAt(x: number, y: number) {
    const tile = this.grid.tiles.find((t) => t.coord.x === x && t.coord.y === y);
    if (!tile) throw new Error(`MissionBuilder: tile (${x},${y}) out of bounds`);
    return tile;
  }

  wall(x: number, y: number): this {
    setTile(this.grid, { coord: { x, y }, type: 'wall', occupantId: null, cover: {} });
    return this;
  }

  /** Carves a straight run of walls, skipping any coords in `gaps` (e.g. door/opening positions). */
  wallLine(from: Coord, to: Coord, gaps: Coord[] = []): this {
    const isGap = (c: Coord) => gaps.some((g) => g.x === c.x && g.y === c.y);
    if (from.x === to.x) {
      const [y0, y1] = from.y <= to.y ? [from.y, to.y] : [to.y, from.y];
      for (let y = y0; y <= y1; y++) {
        const c = { x: from.x, y };
        if (!isGap(c)) this.wall(c.x, c.y);
      }
    } else if (from.y === to.y) {
      const [x0, x1] = from.x <= to.x ? [from.x, to.x] : [to.x, from.x];
      for (let x = x0; x <= x1; x++) {
        const c = { x, y: from.y };
        if (!isGap(c)) this.wall(c.x, c.y);
      }
    } else {
      throw new Error('wallLine: from/to must share an x or y coordinate');
    }
    return this;
  }

  floor(x: number, y: number): this {
    setTile(this.grid, { coord: { x, y }, type: 'floor', occupantId: null, cover: {} });
    return this;
  }

  cover(x: number, y: number, dir: Direction, level: 'half' | 'full'): this {
    const tile = this.tileAt(x, y);
    const covers: CoverMap = { ...tile.cover, [dir]: level };
    setTile(this.grid, { ...tile, cover: covers });
    return this;
  }

  door(x: number, y: number, doorId: string, opts: { requiresItemId?: string; open?: boolean } = {}): this {
    setTile(this.grid, { coord: { x, y }, type: 'door', occupantId: null, cover: {}, doorId });
    this.doors[doorId] = { open: opts.open ?? false, requiresItemId: opts.requiresItemId };
    return this;
  }

  console(
    x: number,
    y: number,
    consoleId: string,
    opts: { difficulty?: number; linkedDoorId?: string; puzzleGroupId?: string; sequenceIndex?: number } = {},
  ): this {
    const tile = this.tileAt(x, y);
    setTile(this.grid, { ...tile, consoleId });
    this.consoles[consoleId] = {
      hacked: false,
      difficulty: opts.difficulty ?? 0.5,
      linkedDoorId: opts.linkedDoorId,
      puzzleGroupId: opts.puzzleGroupId,
      sequenceIndex: opts.sequenceIndex,
    };
    return this;
  }

  extraction(x: number, y: number, extractionZoneId: string): this {
    const tile = this.tileAt(x, y);
    setTile(this.grid, { ...tile, extractionZoneId });
    return this;
  }

  groundItem(x: number, y: number, itemId: string): this {
    const tile = this.tileAt(x, y);
    setTile(this.grid, { ...tile, groundItemIds: [...(tile.groundItemIds ?? []), itemId] });
    return this;
  }

  private spawn(faction: Faction, params: SpawnParams): Unit {
    const stats: UnitStats = { ...UNIT_TEMPLATES[params.template], ...params.statOverrides };
    const unit = createUnit({
      id: params.id,
      name: params.name,
      faction,
      coord: params.coord,
      stats,
      aiProfileId: params.aiProfileId,
      patrolRoute: params.patrolRoute,
    });
    if (params.weaponId) unit.equipped.weaponId = params.weaponId;
    if (params.armorId) unit.equipped.armorId = params.armorId;
    if (params.inventory) unit.inventory.push(...params.inventory);

    this.units[unit.id] = unit;
    const tile = this.tileAt(params.coord.x, params.coord.y);
    tile.occupantId = unit.id;
    return unit;
  }

  player(params: SpawnParams): this {
    this.spawn('player', params);
    return this;
  }

  enemy(params: SpawnParams): this {
    this.spawn('enemy', { aiProfileId: 'utility', ...params });
    return this;
  }

  objective(objective: Objective): this {
    this.objectives.push(objective);
    return this;
  }

  build(meta: { id: string; name: string; briefing: string; seed?: number }): GameState {
    const mission: Mission = {
      id: meta.id,
      name: meta.name,
      briefing: meta.briefing,
      objectives: this.objectives,
      status: 'ongoing',
      alarmActive: false,
    };

    const state: GameState = {
      grid: this.grid,
      units: this.units,
      turn: { round: 1, order: [], activeIndex: 0 },
      rngState: (meta.seed ?? 0xc0ffee) ^ Date.now(),
      doors: this.doors,
      consoles: this.consoles,
      mission,
    };
    state.turn.order = computeInitiativeOrder(state);
    return state;
  }
}
