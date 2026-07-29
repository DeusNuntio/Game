import type { Unit } from '@/gameplay/model/Unit';
import type { CoverLevel, Direction, Grid, Tile } from '@/gameplay/model/Grid';
import type { GameState } from '@/gameplay/model/GameState';
import { gridToScreen, tokenCenter, type Camera } from '../Camera';
import { diamondCorners } from '../IsoShapes';
import { CONSOLE_COLORS, COVER_COLORS, LOOT_COLOR } from '../AssetPlaceholders';

function drawHpBar(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, unit: Unit): void {
  const height = 5;
  const ratio = unit.stats.maxHp > 0 ? unit.stats.hp / unit.stats.maxHp : 0;
  ctx.fillStyle = 'rgba(10,10,16,0.85)';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = ratio > 0.5 ? '#3ddc84' : ratio > 0.25 ? '#e8b339' : '#ff4d4d';
  ctx.fillRect(x, y, width * Math.max(0, ratio), height);
}

function drawApPips(ctx: CanvasRenderingContext2D, x: number, y: number, unit: Unit): void {
  const pipSize = 4;
  const gap = 3;
  for (let i = 0; i < unit.stats.maxAp; i++) {
    ctx.fillStyle = i < unit.stats.ap ? '#00ffc8' : 'rgba(42,42,56,0.85)';
    ctx.fillRect(x + i * (pipSize + gap), y, pipSize, pipSize);
  }
}

// Grid cardinal direction -> which pair of diamond corners forms that edge (see Camera projection notes).
const CORNER_INDEX: Record<Direction, [number, number]> = {
  north: [0, 1], // top -> right
  east: [1, 2], // right -> bottom
  south: [2, 3], // bottom -> left
  west: [3, 0], // left -> top
};

function drawCoverEdge(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  tile: Tile,
  direction: Direction,
  level: CoverLevel | undefined,
): void {
  if (!level || level === 'none') return;
  const { x: cx, y: cy } = gridToScreen(camera, tile.coord);
  const corners = diamondCorners(cx, cy, camera.tileWidth / 2, camera.tileHeight / 2);
  const [aIdx, bIdx] = CORNER_INDEX[direction];
  const a = corners[aIdx]!;
  const b = corners[bIdx]!;

  ctx.save();
  ctx.strokeStyle = COVER_COLORS[level];
  ctx.shadowColor = COVER_COLORS[level];
  ctx.shadowBlur = 6;
  ctx.lineWidth = level === 'full' ? 4 : 2.5;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
}

function drawConsoleIcon(ctx: CanvasRenderingContext2D, camera: Camera, tile: Tile, state: GameState): void {
  if (!tile.consoleId) return;
  const { x: cx, y: cy } = gridToScreen(camera, tile.coord);
  const hacked = state.consoles?.[tile.consoleId]?.hacked ?? false;
  const color = hacked ? CONSOLE_COLORS.hacked : CONSOLE_COLORS.idle;
  const w = camera.tileWidth * 0.18;
  const h = camera.tileHeight * 0.4;

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = color;
  ctx.fillRect(cx - w / 2, cy - h, w, h * 0.7);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - w / 2, cy - h, w, h * 0.7);
  ctx.restore();
}

function drawLootIcon(ctx: CanvasRenderingContext2D, camera: Camera, tile: Tile): void {
  if (!tile.groundItemIds || tile.groundItemIds.length === 0) return;
  const { x: cx, y: cy } = gridToScreen(camera, tile.coord);
  const size = camera.tileHeight * 0.22;

  ctx.save();
  ctx.translate(cx, cy - size);
  ctx.rotate(Math.PI / 4);
  ctx.shadowColor = LOOT_COLOR;
  ctx.shadowBlur = 8;
  ctx.fillStyle = LOOT_COLOR;
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.restore();
}

/** Flat-on-the-floor decorations (cover, consoles, loot) — draw before units so tokens stand in front of them. */
export function drawTileOverlay(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  grid: Grid,
  state: GameState,
): void {
  for (const tile of grid.tiles) {
    drawCoverEdge(ctx, camera, tile, 'north', tile.cover.north);
    drawCoverEdge(ctx, camera, tile, 'south', tile.cover.south);
    drawCoverEdge(ctx, camera, tile, 'east', tile.cover.east);
    drawCoverEdge(ctx, camera, tile, 'west', tile.cover.west);
    drawConsoleIcon(ctx, camera, tile, state);
    drawLootIcon(ctx, camera, tile);
  }
}

/** HP/AP readouts above each unit token — draw after units so the bars are never occluded. */
export function drawUnitBars(ctx: CanvasRenderingContext2D, camera: Camera, units: Record<string, Unit>): void {
  for (const unit of Object.values(units)) {
    if (!unit.alive) continue;
    const { x: cx, y: bodyY } = tokenCenter(camera, unit.coord);
    const barWidth = camera.tileWidth * 0.4;
    drawHpBar(ctx, cx - barWidth / 2, bodyY - camera.tileWidth * 0.16 - 12, barWidth, unit);
    drawApPips(ctx, cx - barWidth / 2, bodyY - camera.tileWidth * 0.16 - 5, unit);
  }
}
