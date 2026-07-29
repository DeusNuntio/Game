import type { Coord } from '@/gameplay/model/Grid';

export interface Camera {
  tileSize: number;
  originX: number;
  originY: number;
}

export function createCamera(tileSize = 48, originX = 8, originY = 8): Camera {
  return { tileSize, originX, originY };
}

export function gridToScreen(camera: Camera, coord: Coord): { x: number; y: number } {
  return {
    x: camera.originX + coord.x * camera.tileSize,
    y: camera.originY + coord.y * camera.tileSize,
  };
}

export function screenToGrid(camera: Camera, screenX: number, screenY: number): Coord {
  return {
    x: Math.floor((screenX - camera.originX) / camera.tileSize),
    y: Math.floor((screenY - camera.originY) / camera.tileSize),
  };
}
