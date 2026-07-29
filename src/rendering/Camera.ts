import type { Coord } from '@/gameplay/model/Grid';

export interface Camera {
  tileWidth: number;
  tileHeight: number;
  wallHeight: number;
  originX: number;
  originY: number;
  canvasWidth: number;
  canvasHeight: number;
}

const DEFAULT_TILE_WIDTH = 64;
const DEFAULT_TILE_HEIGHT = 32;
const DEFAULT_WALL_HEIGHT = 34;
const MARGIN = 32;

/**
 * Builds an isometric (2:1 diamond) camera sized to fit a grid of
 * `gridWidth` x `gridHeight` tiles with a comfortable margin, including
 * headroom above the map for wall extrusion. Unlike the old flat top-down
 * camera, origin/canvas size depend on the grid dimensions, so callers
 * build one camera per mission grid (see main.ts).
 */
export function createIsoCamera(
  gridWidth: number,
  gridHeight: number,
  tileWidth: number = DEFAULT_TILE_WIDTH,
  tileHeight: number = DEFAULT_TILE_HEIGHT,
  wallHeight: number = DEFAULT_WALL_HEIGHT,
): Camera {
  const halfW = tileWidth / 2;
  const halfH = tileHeight / 2;

  const originX = MARGIN + gridHeight * halfW;
  const originY = MARGIN + wallHeight;
  const canvasWidth = originX + gridWidth * halfW + MARGIN;
  const canvasHeight = originY + (gridWidth + gridHeight) * halfH + tileHeight + MARGIN;

  return { tileWidth, tileHeight, wallHeight, originX, originY, canvasWidth, canvasHeight };
}

/** Screen position of a tile's floor-level center (the diamond's midpoint). */
export function gridToScreen(camera: Camera, coord: Coord): { x: number; y: number } {
  const halfW = camera.tileWidth / 2;
  const halfH = camera.tileHeight / 2;
  return {
    x: camera.originX + (coord.x - coord.y) * halfW,
    y: camera.originY + (coord.x + coord.y) * halfH,
  };
}

/** Inverse of gridToScreen: which tile (if any) a screen-space point falls on. */
export function screenToGrid(camera: Camera, screenX: number, screenY: number): Coord {
  const halfW = camera.tileWidth / 2;
  const halfH = camera.tileHeight / 2;
  const dx = (screenX - camera.originX) / halfW;
  const dy = (screenY - camera.originY) / halfH;
  return {
    x: Math.round((dx + dy) / 2),
    y: Math.round((dy - dx) / 2),
  };
}

/** Sort key for painter's-algorithm draw order: lower depth is drawn first (further back). */
export function isoDepth(coord: Coord): number {
  return coord.x + coord.y;
}

/** Where a unit token visually stands — lifted above the floor diamond so it doesn't look painted onto the tile. */
export function tokenCenter(camera: Camera, coord: Coord): { x: number; y: number } {
  const floor = gridToScreen(camera, coord);
  return { x: floor.x, y: floor.y - camera.tileHeight * 0.55 };
}
