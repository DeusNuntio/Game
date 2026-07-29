export interface Point {
  x: number;
  y: number;
}

export function diamondCorners(cx: number, cy: number, halfW: number, halfH: number): Point[] {
  return [
    { x: cx, y: cy - halfH }, // top
    { x: cx + halfW, y: cy }, // right
    { x: cx, y: cy + halfH }, // bottom
    { x: cx - halfW, y: cy }, // left
  ];
}

export function tracePolygon(ctx: CanvasRenderingContext2D, points: Point[]): void {
  ctx.beginPath();
  ctx.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i]!.x, points[i]!.y);
  ctx.closePath();
}

export function fillDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, halfW: number, halfH: number, fill: string, stroke?: string): void {
  tracePolygon(ctx, diamondCorners(cx, cy, halfW, halfH));
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export interface BlockColors {
  top: string;
  left: string;
  right: string;
  edge: string;
}

/**
 * Draws a raised rectangular block: a diamond top face `height` px above
 * (cx,cy), plus its two visible side faces down to floor level. Used for
 * walls/doors so the isometric scene reads as solid 3D geometry instead of
 * flat top-down tiles.
 */
export function drawBlock(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  halfW: number,
  halfH: number,
  height: number,
  colors: BlockColors,
): void {
  const topCorners = diamondCorners(cx, cy - height, halfW, halfH);
  const right = topCorners[1]!;
  const bottom = topCorners[2]!;
  const left = topCorners[3]!;

  tracePolygon(ctx, [left, bottom, { x: bottom.x, y: bottom.y + height }, { x: left.x, y: left.y + height }]);
  ctx.fillStyle = colors.left;
  ctx.fill();

  tracePolygon(ctx, [bottom, right, { x: right.x, y: right.y + height }, { x: bottom.x, y: bottom.y + height }]);
  ctx.fillStyle = colors.right;
  ctx.fill();

  tracePolygon(ctx, topCorners);
  ctx.fillStyle = colors.top;
  ctx.fill();
  ctx.strokeStyle = colors.edge;
  ctx.lineWidth = 1;
  ctx.stroke();
}
