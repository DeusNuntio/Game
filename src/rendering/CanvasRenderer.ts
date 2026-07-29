import type { GameState } from '@/gameplay/model/GameState';
import type { Camera } from './Camera';
import { drawFloorLayer, drawRaisedLayer } from './layers/GridLayer';
import { drawUnitLayer } from './layers/UnitLayer';
import { drawTileOverlay, drawUnitBars } from './layers/OverlayLayer';
import { SCENE_BACKGROUND } from './AssetPlaceholders';

export interface RenderView {
  selectedUnitId?: string;
}

/**
 * The only module allowed to touch the Canvas 2D context. Draws the full scene
 * fresh each call (grids in this vertical slice are small, so immediate-mode
 * redraw is simpler and cheap) from a read-only GameState snapshot + view state.
 * Isometric painter's algorithm: background -> flat floor -> raised walls/doors
 * (depth-sorted) -> flat decorations (cover/console/loot) -> unit tokens
 * (depth-sorted, always drawn on top of walls for gameplay readability) -> HP/AP
 * bars. Swapping this for a WebGL/3D renderer later never requires touching
 * gameplay/.
 */
export class CanvasRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  readonly camera: Camera;

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;
    this.camera = camera;
  }

  render(state: GameState, view: RenderView = {}): void {
    const { ctx, camera } = this;
    this.drawBackground();
    drawFloorLayer(ctx, camera, state.grid);
    drawRaisedLayer(ctx, camera, state.grid, state);
    drawTileOverlay(ctx, camera, state.grid, state);
    drawUnitLayer(ctx, camera, state.units, view.selectedUnitId);
    drawUnitBars(ctx, camera, state.units);
  }

  private drawBackground(): void {
    const { ctx } = this;
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, SCENE_BACKGROUND.top);
    gradient.addColorStop(1, SCENE_BACKGROUND.bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
