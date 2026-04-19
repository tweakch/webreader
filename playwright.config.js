import { defineConfig, devices } from '@playwright/test';

// When BASE_URL is set (CI against a Vercel preview), skip spinning the local
// dev server and run against the real deployed artifact. Locally and in the
// default CI flow, fall back to starting `npm run dev`.
const baseURL = process.env.BASE_URL || 'http://localhost:5173';
const usingRemote = Boolean(process.env.BASE_URL);

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.js'],
  testIgnore: ['**/unit/**'],
  // Visual regression tests are gated behind RUN_VISUAL=1 until the
  // baseline PNGs have been committed via the seed-visual-baselines
  // workflow. Skip by default so a fresh clone doesn't fail CI on a
  // missing snapshot.
  grepInvert: process.env.RUN_VISUAL ? undefined : /@visual/,
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }], ['json', { outputFile: 'test-results/results.json' }]]
    : 'list',
  use: {
    baseURL,
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: usingRemote
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 15000,
      },
});
