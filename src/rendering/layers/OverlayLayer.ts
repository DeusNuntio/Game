import type { Unit } from '@/gameplay/model/Unit';
import type { Grid, Tile } from '@/gameplay/model/Grid';
import { gridToScreen, type Camera } from '../Camera';
import { COVER_COLORS } from '../AssetPlaceholders';

function drawHpBar(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, unit: Unit): void {
  const height = 5;
  const ratio = unit.stats.maxHp > 0 ? unit.stats.hp / unit.stats.maxHp : 0;
  ctx.fillStyle = '#1a1a24';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = ratio > 0.5 ? '#3ddc84' : ratio > 0.25 ? '#e8b339' : '#ff4d4d';
  ctx.fillRect(x, y, width * Math.max(0, ratio), height);
}

function drawApPips(ctx: CanvasRenderingContext2D, x: number, y: number, unit: Unit): void {
  const pipSize = 4;
  const gap = 3;
  for (let i = 0; i < unit.stats.maxAp; i++) {
    ctx.fillStyle = i < unit.stats.ap ? '#00ffc8' : '#2a2a38';
    ctx.fillRect(x + i * (pipSize + gap), y, pipSize, pipSize);
  }
}

function drawCoverIcons(ctx: CanvasRenderingContext2D, camera: Camera, tile: Tile): void {
  const { x, y } = gridToScreen(camera, tile.coord);
  const size = camera.tileSize;
  const edgeThickness = 4;

  const draw = (level: 'half' | 'full' | undefined, drawEdge: () => void) => {
    if (!level) return;
    ctx.fillStyle = COVER_COLORS[level];
    drawEdge();
  };

  draw(tile.cover.north === 'none' ? undefined : tile.cover.north, () =>
    ctx.fillRect(x, y, size, edgeThickness),
  );
  draw(tile.cover.south === 'none' ? undefined : tile.cover.south, () =>
    ctx.fillRect(x, y + size - edgeThickness, size, edgeThickness),
  );
  draw(tile.cover.west === 'none' ? undefined : tile.cover.west, () =>
    ctx.fillRect(x, y, edgeThickness, size),
  );
  draw(tile.cover.east === 'none' ? undefined : tile.cover.east, () =>
    ctx.fillRect(x + size - edgeThickness, y, edgeThickness, size),
  );
}

export function drawOverlayLayer(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  grid: Grid,
  units: Record<string, Unit>,
): void {
  for (const tile of grid.tiles) {
    drawCoverIcons(ctx, camera, tile);
  }

  for (const unit of Object.values(units)) {
    if (!unit.alive) continue;
    const { x, y } = gridToScreen(camera, unit.coord);
    const size = camera.tileSize;
    drawHpBar(ctx, x + 4, y + 3, size - 8, unit);
    drawApPips(ctx, x + 4, y + size - 10, unit);
  }
}
