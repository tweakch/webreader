// @ts-check
import { test, expect } from '@playwright/test';
import { disableAppAnimation } from './test-utils';

/**
 * Visual regression on the reading surface.
 *
 * One snapshot per canonical breakpoint of page 1 of the first story.
 * Pagination bugs show up here as pixel diffs before users find them.
 *
 * Snapshots are generated on first run (`--update-snapshots`). Commit the
 * generated PNGs under `tests/visual-reading-surface.spec.js-snapshots/`.
 */

const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

for (const bp of BREAKPOINTS) {
  test.describe(`reading surface @ ${bp.name} (${bp.width}x${bp.height})`, () => {
    test.use({ viewport: { width: bp.width, height: bp.height } });

    test.beforeEach(async ({ page }) => {
      await disableAppAnimation(page);
    });

    test('page 1 of first story is pixel-stable @visual', async ({ page }) => {
      await page.goto('/app');
      await page.waitForLoadState('networkidle');

      const hamburger = page.locator('[data-testid="menu-toggle"]');
      if (await hamburger.isVisible().catch(() => false)) {
        await hamburger.click();
        await page.waitForTimeout(200);
      }
      const source = page.locator('[data-testid="source-button"]').first();
      if (await source.isVisible({ timeout: 2000 }).catch(() => false)) {
        await source.click();
        await page.waitForTimeout(200);
      }
      const story = page.locator('[data-testid="story-button"]').first();
      await expect(story).toBeVisible({ timeout: 5000 });
      await story.click();
      await page.waitForSelector('[data-testid="page-content"] p');

      const reader = page.locator('[data-testid="reader-viewport"]');
      await expect(reader).toHaveScreenshot(`reading-surface-${bp.name}.png`, {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
      });
    });
  });
}
