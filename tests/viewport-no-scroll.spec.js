// @ts-check
import { test, expect } from '@playwright/test';
import { disableAppAnimation, enableAppAnimation } from './test-utils';

/**
 * Viewport no-scroll tests.
 *
 * The /app route must fill the viewport exactly — no horizontal and no
 * vertical document-level scrollbars — across all common breakpoints.
 *
 * The AppAnimationWrapper is `fixed inset-0` so the reader is anchored to
 * the visible viewport and cannot cause the body/document to overflow.
 * Scrollbars inside the reader (page content, sidebar list) are intentional
 * and checked elsewhere; here we only assert on the document/body level.
 */

const VIEWPORTS = [
  { name: 'mobile-portrait (iPhone X)', width: 375, height: 812 },
  { name: 'mobile-landscape', width: 812, height: 375 },
  { name: 'tablet-portrait (iPad)', width: 768, height: 1024 },
  { name: 'tablet-landscape (iPad)', width: 1024, height: 768 },
  { name: 'desktop-md', width: 1280, height: 800 },
  { name: 'desktop-lg', width: 1920, height: 1080 },
  { name: 'tiny', width: 320, height: 568 },
];

/** Read document-level scroll metrics from the page. */
async function getDocumentScrollMetrics(page) {
  return await page.evaluate(() => ({
    docScrollW: document.documentElement.scrollWidth,
    docScrollH: document.documentElement.scrollHeight,
    docClientW: document.documentElement.clientWidth,
    docClientH: document.documentElement.clientHeight,
    bodyScrollW: document.body.scrollWidth,
    bodyScrollH: document.body.scrollHeight,
    innerW: window.innerWidth,
    innerH: window.innerHeight,
  }));
}

test.describe('Viewport no-scroll (/app)', () => {
  test.beforeEach(async ({ page }) => {
    await disableAppAnimation(page);
  });

  for (const vp of VIEWPORTS) {
    test(`/app fits the ${vp.name} viewport without document scrollbars`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/app');
      await page.waitForLoadState('networkidle');

      const m = await getDocumentScrollMetrics(page);

      // No horizontal document overflow
      expect(m.docScrollW,
        `documentElement.scrollWidth (${m.docScrollW}) must not exceed clientWidth (${m.docClientW}) on ${vp.name}`)
        .toBeLessThanOrEqual(m.docClientW);
      expect(m.bodyScrollW,
        `body.scrollWidth (${m.bodyScrollW}) must not exceed innerWidth (${m.innerW}) on ${vp.name}`)
        .toBeLessThanOrEqual(m.innerW);

      // No vertical document overflow
      expect(m.docScrollH,
        `documentElement.scrollHeight (${m.docScrollH}) must not exceed clientHeight (${m.docClientH}) on ${vp.name}`)
        .toBeLessThanOrEqual(m.docClientH);
      expect(m.bodyScrollH,
        `body.scrollHeight (${m.bodyScrollH}) must not exceed innerHeight (${m.innerH}) on ${vp.name}`)
        .toBeLessThanOrEqual(m.innerH);
    });
  }

  test('the animation wrapper exactly fills the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    const box = await page.locator('.app-enter').first().boundingBox();
    expect(box).not.toBeNull();
    // Exact fill: top-left corner at origin, size equals viewport
    expect(box.x).toBe(0);
    expect(box.y).toBe(0);
    expect(box.width).toBe(1280);
    expect(box.height).toBe(800);
  });

  test('body does not overflow the viewport once a story is open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Open sidebar (mobile), drill into a 2-level source, open the first story
    const toggle = page.locator('[data-testid="menu-toggle"]');
    if (await toggle.isVisible()) {
      await toggle.click();
      await page.waitForTimeout(300);
    }
    const sourceBtns = page.locator('[data-testid="source-button"]');
    const count = await sourceBtns.count();
    for (let i = 0; i < count; i++) {
      await sourceBtns.nth(i).click();
      await page.waitForTimeout(300);
      if (await page.locator('[data-testid="directory-button"]').first().isVisible({ timeout: 300 }).catch(() => false)) {
        await page.locator('[data-testid="back-to-sources"]').click();
        await page.waitForTimeout(200);
        continue;
      }
      break;
    }
    const storyBtn = page.locator('[data-testid="story-button"]').first();
    await expect(storyBtn).toBeVisible({ timeout: 5000 });
    await storyBtn.click();
    await expect(page.locator('[data-testid="page-content"]')).toBeVisible({ timeout: 8000 });

    const m = await getDocumentScrollMetrics(page);
    expect(m.bodyScrollH).toBeLessThanOrEqual(m.innerH);
    expect(m.bodyScrollW).toBeLessThanOrEqual(m.innerW);
    expect(m.docScrollH).toBeLessThanOrEqual(m.docClientH);
    expect(m.docScrollW).toBeLessThanOrEqual(m.docClientW);
  });
});

// ─── Lock-screen (animation flag on) ─────────────────────────────────────────

test.describe('Viewport no-scroll (/app, lock screen on)', () => {
  test.beforeEach(async ({ page }) => {
    await enableAppAnimation(page);
  });

  for (const vp of VIEWPORTS) {
    test(`/app with lock-screen fits the ${vp.name} viewport without document scrollbars`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/app');
      await page.waitForLoadState('networkidle');

      // Lock screen is visible
      await expect(page.locator('[data-testid="lock-screen"]')).toBeVisible();

      const m = await getDocumentScrollMetrics(page);
      expect(m.docScrollW).toBeLessThanOrEqual(m.docClientW);
      expect(m.docScrollH).toBeLessThanOrEqual(m.docClientH);
      expect(m.bodyScrollW).toBeLessThanOrEqual(m.innerW);
      expect(m.bodyScrollH).toBeLessThanOrEqual(m.innerH);
    });
  }
});
