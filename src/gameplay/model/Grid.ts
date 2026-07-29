export interface Coord {
  x: number;
  y: number;
}

export function coordKey(c: Coord): string {
  return `${c.x},${c.y}`;
}

export function coordEquals(a: Coord, b: Coord): boolean {
  return a.x === b.x && a.y === b.y;
}

export function manhattanDistance(a: Coord, b: Coord): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export type TileType = 'floor' | 'wall' | 'door' | 'objective';
export type CoverLevel = 'none' | 'half' | 'full';
export type Direction = 'north' | 'south' | 'east' | 'west';

/**
 * Cover this tile grants to whoever stands on it, indexed by the direction an
 * attacker is firing FROM (i.e. cover.north = protection against an attacker
 * north of this tile). Populated by mission data / the interactables system (doors).
 */
export type CoverMap = Partial<Record<Direction, CoverLevel>>;

export interface Tile {
  coord: Coord;
  type: TileType;
  occupantId: string | null;
  cover: CoverMap;
  /** Set when type === 'door'; links this tile to a DoorState in GameState.doors. */
  doorId?: string;
  /** Set on any walkable tile that holds a hackable console/terminal. */
  consoleId?: string;
  /** Item def ids lying on the ground here (dropped loot), pickable by any unit standing on the tile. */
  groundItemIds?: string[];
}

export interface Grid {
  width: number;
  height: number;
  tiles: Tile[]; // row-major: index = y * width + x
}

export function createGrid(width: number, height: number, defaultType: TileType = 'floor'): Grid {
  const tiles: Tile[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push({ coord: { x, y }, type: defaultType, occupantId: null, cover: {} });
    }
  }
  return { width, height, tiles };
}

export function inBounds(grid: Grid, c: Coord): boolean {
  return c.x >= 0 && c.y >= 0 && c.x < grid.width && c.y < grid.height;
}

function tileIndex(grid: Grid, c: Coord): number {
  return c.y * grid.width + c.x;
}

export function getTile(grid: Grid, c: Coord): Tile | undefined {
  if (!inBounds(grid, c)) return undefined;
  return grid.tiles[tileIndex(grid, c)];
}

export function setTile(grid: Grid, tile: Tile): void {
  grid.tiles[tileIndex(grid, tile.coord)] = tile;
}

const NEIGHBOR_OFFSETS: { dir: Direction; dx: number; dy: number }[] = [
  { dir: 'north', dx: 0, dy: -1 },
  { dir: 'south', dx: 0, dy: 1 },
  { dir: 'east', dx: 1, dy: 0 },
  { dir: 'west', dx: -1, dy: 0 },
];

export function neighbors4(grid: Grid, c: Coord): Coord[] {
  const result: Coord[] = [];
  for (const { dx, dy } of NEIGHBOR_OFFSETS) {
    const n = { x: c.x + dx, y: c.y + dy };
    if (inBounds(grid, n)) result.push(n);
  }
  return result;
}

/** Direction an attacker at `from` is firing from, relative to `to` (dominant axis). */
export function directionBetween(from: Coord, to: Coord): Direction {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? 'east' : 'west';
  }
  return dy > 0 ? 'south' : 'north';
}

export function cloneGrid(grid: Grid): Grid {
  return {
    width: grid.width,
    height: grid.height,
    tiles: grid.tiles.map((tile) => ({
      ...tile,
      coord: { ...tile.coord },
      cover: { ...tile.cover },
      groundItemIds: tile.groundItemIds ? [...tile.groundItemIds] : undefined,
    })),
  };
}
