import { defineConfig } from '@playwright/test';
import fs from 'node:fs';

// This sandboxed dev environment pre-installs a full Chromium build at a fixed
// path (not the versioned chrome-headless-shell Playwright's default config
// expects) and skips `playwright install`. Use it when present; elsewhere
// (a normal dev machine or CI with `playwright install` run) fall back to
// Playwright's own browser resolution.
const SANDBOX_CHROMIUM_PATH = '/opt/pw-browsers/chromium';
const executablePath = fs.existsSync(SANDBOX_CHROMIUM_PATH) ? SANDBOX_CHROMIUM_PATH : undefined;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  use: {
    baseURL: 'http://localhost:4173',
    screenshot: 'only-on-failure',
    launchOptions: executablePath ? { executablePath } : {},
  },
});
