import type { Grid } from '@/gameplay/model/Grid';
import type { GameState } from '@/gameplay/model/GameState';
import { gridToScreen, type Camera } from '../Camera';
import { TILE_COLORS } from '../AssetPlaceholders';

export function drawGridLayer(ctx: CanvasRenderingContext2D, camera: Camera, grid: Grid, state: GameState): void {
  for (const tile of grid.tiles) {
    const { x, y } = gridToScreen(camera, tile.coord);
    const size = camera.tileSize;

    let fill: string = TILE_COLORS.floor;
    if (tile.type === 'wall') fill = TILE_COLORS.wall;
    else if (tile.type === 'objective') fill = TILE_COLORS.objective;
    else if (tile.type === 'door') {
      const open = state.doors?.[tile.doorId ?? '']?.open ?? false;
      fill = open ? TILE_COLORS.doorOpen : TILE_COLORS.doorClosed;
    }

    ctx.fillStyle = fill;
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = TILE_COLORS.gridLine;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
  }
}
