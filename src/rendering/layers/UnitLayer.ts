import type { Unit } from '@/gameplay/model/Unit';
import { gridToScreen, isoDepth, tokenCenter, type Camera } from '../Camera';
import { getUnitVisual } from '../AssetPlaceholders';

function drawShadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, camera: Camera): void {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, camera.tileWidth * 0.22, camera.tileHeight * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fill();
  ctx.restore();
}

function drawToken(
  ctx: CanvasRenderingContext2D,
  shape: 'circle' | 'triangle' | 'square',
  cx: number,
  cy: number,
  r: number,
): void {
  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else if (shape === 'square') {
    ctx.rect(cx - r, cy - r, r * 2, r * 2);
  } else {
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy + r);
    ctx.lineTo(cx - r, cy + r);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();
}

export function drawUnitLayer(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  units: Record<string, Unit>,
  selectedUnitId?: string,
): void {
  const alive = Object.values(units)
    .filter((u) => u.alive)
    .sort((a, b) => isoDepth(a.coord) - isoDepth(b.coord));

  for (const unit of alive) {
    const { x: cx, y: floorY } = gridToScreen(camera, unit.coord);
    const { y: bodyY } = tokenCenter(camera, unit.coord);
    const r = camera.tileWidth * 0.16;

    drawShadow(ctx, cx, floorY, camera);

    const visual = getUnitVisual(unit.faction);
    ctx.save();
    ctx.shadowColor = visual.glow;
    ctx.shadowBlur = 14;
    ctx.fillStyle = visual.fill;
    ctx.strokeStyle = visual.outline;
    ctx.lineWidth = 2;
    drawToken(ctx, visual.shape, cx, bodyY, r);
    ctx.restore();

    if (unit.id === selectedUnitId) {
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(cx, bodyY, r + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
