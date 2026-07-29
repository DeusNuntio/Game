import { test, expect } from '@playwright/test';

test('menu -> mission select -> mission -> move action, driven through real input', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('.main-menu')).toBeVisible();
  await page.click('button:has-text("Neues Spiel")');

  await expect(page.locator('.mission-select')).toBeVisible();
  await page.click('button:has-text("Serverraum-Infiltration")');

  await expect(page.locator('#game-canvas')).toBeVisible();
  await expect(page.locator('.turn-indicator')).toContainText('Runde 1');
  await expect(page.locator('.objective-tracker')).toContainText('Alle Wachen ausschalten');
  await expect(page.locator('.objective-tracker')).toContainText('Sicherheitskonsole hacken');

  const startingApText = await page.locator('.turn-indicator').textContent();
  expect(startingApText).toMatch(/AP 2\/2/);

  // Drive a real move through InputManager: arm "Bewegen", click one tile over on the canvas.
  // Screen coords computed from the isometric projection (createIsoCamera for the
  // 10x7 mission01 grid: tileWidth 64, tileHeight 32, wallHeight 34, margin 32 ->
  // halfW 32, halfH 16, originX 256, originY 66). gridToScreen(x,y) = (originX +
  // (x-y)*halfW, originY + (x+y)*halfH).
  await page.click('button:has-text("Bewegen")');
  const canvasBox = await page.locator('#game-canvas').boundingBox();
  if (!canvasBox) throw new Error('canvas bounding box unavailable');
  const activeUnitText = await page.locator('.turn-indicator').textContent();
  const isGhostActive = activeUnitText?.includes('Ghost');
  // Ghost spawns at (1,4) -> move to (2,4); Runner spawns at (1,2) -> move to (2,2).
  const target = isGhostActive ? { x: 2, y: 4 } : { x: 2, y: 2 };
  const halfW = 32;
  const halfH = 16;
  const originX = 256;
  const originY = 66;
  const screenX = originX + (target.x - target.y) * halfW;
  const screenY = originY + (target.x + target.y) * halfH;
  await page.mouse.click(canvasBox.x + screenX, canvasBox.y + screenY);

  await expect(page.locator('.turn-indicator')).toContainText('AP 1/2');

  await page.screenshot({ path: 'test-results/smoke-after-move.png' });

  // Return to main menu proves the screen router also works from mid-game.
  await page.click('button:has-text("Hauptmenü")');
  await expect(page.locator('.main-menu')).toBeVisible();
});
