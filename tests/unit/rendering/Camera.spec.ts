import { describe, expect, it } from 'vitest';
import { createIsoCamera, gridToScreen, screenToGrid, isoDepth } from '@/rendering/Camera';

describe('isometric Camera projection', () => {
  it('round-trips every tile of a grid through gridToScreen -> screenToGrid', () => {
    const camera = createIsoCamera(10, 7);
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 7; y++) {
        const screen = gridToScreen(camera, { x, y });
        expect(screenToGrid(camera, screen.x, screen.y)).toEqual({ x, y });
      }
    }
  });

  it('keeps every tile center within the computed canvas bounds', () => {
    const camera = createIsoCamera(10, 7);
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 7; y++) {
        const { x: sx, y: sy } = gridToScreen(camera, { x, y });
        expect(sx).toBeGreaterThanOrEqual(0);
        expect(sx).toBeLessThanOrEqual(camera.canvasWidth);
        expect(sy).toBeGreaterThanOrEqual(0);
        expect(sy).toBeLessThanOrEqual(camera.canvasHeight);
      }
    }
  });

  it('moves right+down on screen as depth (x+y) increases', () => {
    const camera = createIsoCamera(5, 5);
    const near = gridToScreen(camera, { x: 0, y: 0 });
    const far = gridToScreen(camera, { x: 4, y: 4 });
    expect(isoDepth({ x: 4, y: 4 })).toBeGreaterThan(isoDepth({ x: 0, y: 0 }));
    expect(far.y).toBeGreaterThan(near.y);
  });
});
