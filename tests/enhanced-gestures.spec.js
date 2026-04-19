// @ts-check
import { test, expect } from '@playwright/test';
import { disableAppAnimation } from './test-utils';

async function enableEnhancedGestures(page) {
  await page.addInitScript(() => {
    const overrides = JSON.parse(localStorage.getItem('wr-feature-overrides') ?? '{}');
    overrides['enhanced-gestures'] = true;
    localStorage.setItem('wr-feature-overrides', JSON.stringify(overrides));
  });
}

async function openFirstStory(page) {
  await page.goto('/app');
  await page.waitForLoadState('networkidle');
  const menuToggle = page.locator('[data-testid="menu-toggle"]');
  if (await menuToggle.isVisible()) {
    await menuToggle.click();
    await page.waitForTimeout(100);
  }
  const firstSource = page.locator('[data-testid="source-button"]').first();
  if (await firstSource.isVisible()) await firstSource.click();
  const firstStory = page.locator('[data-testid="story-button"]').first();
  await firstStory.click();
  await page.waitForSelector('[data-testid="reader-viewport"]');
}

async function dispatchSwipe(page, selector, from, to) {
  await page.evaluate(({ selector, from, to }) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`No element: ${selector}`);
    const mkTouch = (x, y) => ({
      identifier: 1, target: el, clientX: x, clientY: y, pageX: x, pageY: y,
    });
    const fire = (type, x, y) => {
      const touch = mkTouch(x, y);
      const event = new TouchEvent(type, {
        bubbles: true, cancelable: true,
        touches: type === 'touchend' ? [] : [touch],
        targetTouches: type === 'touchend' ? [] : [touch],
        changedTouches: [touch],
      });
      el.dispatchEvent(event);
    };
    fire('touchstart', from.x, from.y);
    fire('touchmove',  to.x,   to.y);
    fire('touchend',   to.x,   to.y);
  }, { selector, from, to });
}

test.describe('Enhanced gestures', () => {
  test.beforeEach(async ({ page, browser }) => {
    await disableAppAnimation(page);
    await enableEnhancedGestures(page);
    if (!browser.browserType().name().includes('chromium')) test.skip();
  });

  test('swipe down from the top edge opens the header drawer', async ({ page }) => {
    await openFirstStory(page);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('no viewport');
    const cx = viewport.width / 2;
    await dispatchSwipe(page, '[data-testid="reader-viewport"]',
      { x: cx, y: 10 }, { x: cx, y: 180 });
    const drawer = page.locator('[data-testid="gesture-header-drawer"]');
    await expect(drawer).toHaveAttribute('data-open', 'true');
  });

  test('swipe up from the bottom edge opens the footer drawer with page picker', async ({ page }) => {
    await openFirstStory(page);
    const reader = await page.locator('[data-testid="reader-viewport"]').boundingBox();
    if (!reader) throw new Error('no viewport');
    const cx = reader.x + reader.width / 2;
    const yBottom = reader.y + reader.height - 10;
    await dispatchSwipe(page, '[data-testid="reader-viewport"]',
      { x: cx, y: yBottom }, { x: cx, y: yBottom - 200 });
    const drawer = page.locator('[data-testid="gesture-footer-drawer"]');
    await expect(drawer).toHaveAttribute('data-open', 'true');
    await expect(page.locator('[data-testid="gesture-footer-drawer-grid"]')).toBeVisible();
  });

  test('swipe left from the right edge opens the right drawer', async ({ page }) => {
    await openFirstStory(page);
    const reader = await page.locator('[data-testid="reader-viewport"]').boundingBox();
    if (!reader) throw new Error('no viewport');
    const cy = reader.y + reader.height / 2;
    const xRight = reader.x + reader.width - 10;
    await dispatchSwipe(page, '[data-testid="reader-viewport"]',
      { x: xRight, y: cy }, { x: xRight - 200, y: cy });
    const drawer = page.locator('[data-testid="gesture-right-drawer"]');
    await expect(drawer).toHaveAttribute('data-open', 'true');
    await expect(page.locator('[data-testid="gesture-right-toc"]')).toBeVisible();
  });

  test('long swipe down past 60% shows the reload indicator', async ({ page }) => {
    await openFirstStory(page);
    const reader = await page.locator('[data-testid="reader-viewport"]').boundingBox();
    if (!reader) throw new Error('no viewport');
    const cx = reader.x + reader.width / 2;
    // Only dispatch start + move (no end) so the indicator is still visible.
    await page.evaluate(({ cx, yStart, yMove }) => {
      const el = document.querySelector('[data-testid="reader-viewport"]');
      const mk = (x, y) => ({ identifier: 1, target: el, clientX: x, clientY: y, pageX: x, pageY: y });
      const start = new TouchEvent('touchstart', { bubbles: true, cancelable: true,
        touches: [mk(cx, yStart)], targetTouches: [mk(cx, yStart)], changedTouches: [mk(cx, yStart)] });
      const move = new TouchEvent('touchmove', { bubbles: true, cancelable: true,
        touches: [mk(cx, yMove)], targetTouches: [mk(cx, yMove)], changedTouches: [mk(cx, yMove)] });
      el.dispatchEvent(start);
      el.dispatchEvent(move);
    }, { cx, yStart: reader.y + 100, yMove: reader.y + reader.height * 0.9 });
    await expect(page.locator('[data-testid="gesture-reload-indicator"]')).toBeVisible();
  });
});
