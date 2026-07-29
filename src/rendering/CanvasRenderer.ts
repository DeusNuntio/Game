import type { GameState } from '@/gameplay/model/GameState';
import { createCamera, type Camera } from './Camera';
import { drawGridLayer } from './layers/GridLayer';
import { drawUnitLayer } from './layers/UnitLayer';
import { drawOverlayLayer } from './layers/OverlayLayer';

export interface RenderView {
  selectedUnitId?: string;
}

/**
 * The only module allowed to touch the Canvas 2D context. Draws the full scene
 * fresh each call (grids in this vertical slice are small, so immediate-mode
 * redraw is simpler and cheap) from a read-only GameState snapshot + view state.
 * Swapping this for a WebGL/3D renderer later never requires touching gameplay/.
 */
export class CanvasRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  readonly camera: Camera;

  constructor(canvas: HTMLCanvasElement, camera: Camera = createCamera()) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;
    this.camera = camera;
  }

  render(state: GameState, view: RenderView = {}): void {
    const { ctx, camera } = this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawGridLayer(ctx, camera, state.grid, state);
    drawOverlayLayer(ctx, camera, state.grid, state.units);
    drawUnitLayer(ctx, camera, state.units, view.selectedUnitId);
  }
}
