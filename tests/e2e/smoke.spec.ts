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

  // Drive a real move through InputManager: arm "Bewegen", click one tile east on the canvas.
  await page.click('button:has-text("Bewegen")');
  const canvasBox = await page.locator('#game-canvas').boundingBox();
  if (!canvasBox) throw new Error('canvas bounding box unavailable');
  const activeUnitText = await page.locator('.turn-indicator').textContent();
  const isGhostActive = activeUnitText?.includes('Ghost');
  const startY = isGhostActive ? 4 : 2; // ghost spawns at (1,4), runner at (1,2)
  await page.mouse.click(canvasBox.x + 8 + 48 * 2.5, canvasBox.y + 8 + 48 * (startY + 0.5));

  await expect(page.locator('.turn-indicator')).toContainText('AP 1/2');

  await page.screenshot({ path: 'test-results/smoke-after-move.png' });

  // Return to main menu proves the screen router also works from mid-game.
  await page.click('button:has-text("Hauptmenü")');
  await expect(page.locator('.main-menu')).toBeVisible();
});
