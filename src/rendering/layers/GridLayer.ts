import type { Grid, Tile } from '@/gameplay/model/Grid';
import type { GameState } from '@/gameplay/model/GameState';
import { Rng } from '@/core/Rng';
import { gridToScreen, isoDepth, type Camera } from '../Camera';
import { diamondCorners, drawBlock, fillDiamond, tracePolygon } from '../IsoShapes';
import { DOOR_CLOSED_BLOCK, DOOR_OPEN_BLOCK, FLOOR_COLORS, WALL_BLOCK } from '../AssetPlaceholders';

const CIRCUIT_SEED_BASE = 0x1337;

/** Deterministic per-tile "circuit board" line pattern — static across redraws, no animation loop needed. */
function drawCircuitPattern(ctx: CanvasRenderingContext2D, cx: number, cy: number, halfW: number, halfH: number, tileIndex: number): void {
  const rng = new Rng(CIRCUIT_SEED_BASE + tileIndex * 2654435761);
  if (rng.next() > 0.65) return; // leave most tiles bare so the pattern reads as sparse detail, not noise

  ctx.save();
  tracePolygon(ctx, diamondCorners(cx, cy, halfW * 0.94, halfH * 0.94));
  ctx.clip();

  ctx.strokeStyle = FLOOR_COLORS.circuit;
  ctx.lineWidth = 1;
  const segments = 1 + Math.floor(rng.next() * 2);
  for (let i = 0; i < segments; i++) {
    const startX = cx + (rng.next() - 0.5) * halfW;
    const startY = cy + (rng.next() - 0.5) * halfH;
    const midX = startX + (rng.next() - 0.5) * halfW;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(midX, startY);
    ctx.lineTo(midX, startY + (rng.next() - 0.5) * halfH);
    ctx.stroke();

    ctx.fillStyle = FLOOR_COLORS.circuitNode;
    ctx.beginPath();
    ctx.arc(startX, startY, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFloorTile(ctx: CanvasRenderingContext2D, camera: Camera, tile: Tile, tileIndex: number): void {
  const { x: cx, y: cy } = gridToScreen(camera, tile.coord);
  const halfW = camera.tileWidth / 2;
  const halfH = camera.tileHeight / 2;

  fillDiamond(ctx, cx, cy, halfW, halfH, FLOOR_COLORS.base, 'rgba(255,255,255,0.04)');
  if (tile.type === 'objective') {
    fillDiamond(ctx, cx, cy, halfW, halfH, FLOOR_COLORS.objectiveTint);
  }
  drawCircuitPattern(ctx, cx, cy, halfW, halfH, tileIndex);
}

function drawRaisedTile(ctx: CanvasRenderingContext2D, camera: Camera, tile: Tile, state: GameState): void {
  const { x: cx, y: cy } = gridToScreen(camera, tile.coord);
  const halfW = camera.tileWidth / 2;
  const halfH = camera.tileHeight / 2;

  if (tile.type === 'wall') {
    drawBlock(ctx, cx, cy, halfW, halfH, camera.wallHeight, WALL_BLOCK);
  } else if (tile.type === 'door') {
    const open = state.doors?.[tile.doorId ?? '']?.open ?? false;
    const colors = open ? DOOR_OPEN_BLOCK : DOOR_CLOSED_BLOCK;
    drawBlock(ctx, cx, cy, halfW, halfH, camera.wallHeight * (open ? 0.25 : 0.7), colors);
  }
}

/** Pass 1: flat floor diamonds (any draw order — they never overlap). */
export function drawFloorLayer(ctx: CanvasRenderingContext2D, camera: Camera, grid: Grid): void {
  for (const tile of grid.tiles) {
    if (tile.type === 'wall') continue; // walls have no floor showing beneath them
    const tileIndex = tile.coord.y * grid.width + tile.coord.x;
    drawFloorTile(ctx, camera, tile, tileIndex);
  }
}

/** Pass 2: raised wall/door blocks, back-to-front so nearer geometry correctly overlaps farther geometry. */
export function drawRaisedLayer(ctx: CanvasRenderingContext2D, camera: Camera, grid: Grid, state: GameState): void {
  const raised = grid.tiles.filter((t) => t.type === 'wall' || t.type === 'door');
  raised.sort((a, b) => isoDepth(a.coord) - isoDepth(b.coord));
  for (const tile of raised) {
    drawRaisedTile(ctx, camera, tile, state);
  }
}
