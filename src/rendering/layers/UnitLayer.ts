import type { Unit } from '@/gameplay/model/Unit';
import { gridToScreen, type Camera } from '../Camera';
import { getUnitVisual } from '../AssetPlaceholders';

function drawShape(
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
  for (const unit of Object.values(units)) {
    if (!unit.alive) continue;
    const { x, y } = gridToScreen(camera, unit.coord);
    const size = camera.tileSize;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.32;

    const visual = getUnitVisual(unit.faction);
    ctx.fillStyle = visual.fill;
    ctx.strokeStyle = visual.outline;
    ctx.lineWidth = 2;
    drawShape(ctx, visual.shape, cx, cy, r);

    if (unit.id === selectedUnitId) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
