import type { Grid, Tile } from '../../model/Grid';

export function findDoorTile(grid: Grid, doorId: string): Tile | undefined {
  return grid.tiles.find((t) => t.doorId === doorId);
}

export function findConsoleTile(grid: Grid, consoleId: string): Tile | undefined {
  return grid.tiles.find((t) => t.consoleId === consoleId);
}
