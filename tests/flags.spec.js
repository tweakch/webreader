// @ts-check
import { test, expect } from '@playwright/test';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Navigate to the app with specific flag overrides set in localStorage. */
async function gotoWithFlags(page, overrides = {}) {
  await page.addInitScript((o) => {
    localStorage.setItem('__openfeature_overrides__', JSON.stringify(o));
  }, overrides);
  await page.goto('/app');
}

/** Open the first story in the sidebar. */
async function openFirstStory(page) {
  const hamburger = page.locator('[data-testid="menu-toggle"]');
  if (await hamburger.isVisible()) await hamburger.click();
  await page.locator('[data-testid="source-button"]').first().click();
  await page.locator('[data-testid="story-button"]').first().click();
  await page.waitForSelector('[data-testid="page-content"] p');
}

/** Navigate to the last page of the open story. */
async function goToLastPage(page) {
  await page.waitForSelector('[data-testid="page-counter"]');
  const text = await page.locator('[data-testid="page-counter"]').textContent();
  const total = parseInt(text.split('/')[1].trim(), 10);
  for (let i = 1; i < total; i++) {
    await page.locator('[data-testid="next-page"]').click();
    await page.waitForTimeout(200);
  }
}

// ─── Defaults reflect flags.json ────────────────────────────────────────────

test.describe('default flag values (no overrides)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('word-count is off by default - stat panel is not shown', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    await expect(page.getByText('Wörter')).not.toBeVisible();
  });

  test('font-size-controls is on by default - +/- buttons are visible', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    await expect(page.locator('[data-testid="font-increase"]')).toBeVisible();
    await expect(page.locator('[data-testid="font-decrease"]')).toBeVisible();
  });

  test('attribution is on by default - byline appears on last page', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    await goToLastPage(page);
    await expect(page.getByText('Jacob und Wilhelm Grimm')).toBeVisible();
  });

  test('typography-panel is on by default - clicking page counter opens panel', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    const counter = page.locator('[data-testid="page-counter"]');
    await counter.click();
    await expect(page.getByText('Zeilenabstand')).toBeVisible();
  });
});

// ─── Turning an off-by-default flag on ──────────────────────────────────────

test.describe('enabling flags via override', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('word-count: override on → stat panel with word count appears', async ({ page }) => {
    await gotoWithFlags(page, { 'word-count': 'on' });
    await openFirstStory(page);
    await expect(page.getByText('Wörter')).toBeVisible();
    // Value must be a non-zero number
    const value = page.locator('text=Wörter').locator('..').locator('span').last();
    const text = await value.textContent();
    expect(parseInt(text.replace(/\D/g, ''), 10)).toBeGreaterThan(0);
  });

  test('reading-duration: override on → reading time appears alongside word count', async ({ page }) => {
    await gotoWithFlags(page, { 'word-count': 'on', 'reading-duration': 'on' });
    await openFirstStory(page);
    await expect(page.getByText('Lesezeit')).toBeVisible();
    const value = await page.getByText(/~\d+ min/).textContent();
    expect(value).toMatch(/~\d+ min/);
  });
});

// ─── Turning an on-by-default flag off ──────────────────────────────────────

test.describe('disabling flags via override', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('font-size-controls: override off → +/- buttons are hidden', async ({ page }) => {
    await gotoWithFlags(page, { 'font-size-controls': 'off' });
    await openFirstStory(page);
    await expect(page.locator('[data-testid="font-increase"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="font-decrease"]')).not.toBeVisible();
  });

  test('attribution: override off → byline does not appear on last page', async ({ page }) => {
    await gotoWithFlags(page, { 'attribution': 'off' });
    await openFirstStory(page);
    await goToLastPage(page);
    await expect(page.getByText('Jacob und Wilhelm Grimm')).not.toBeVisible();
  });

  test('typography-panel: override off → clicking page counter does not open panel', async ({ page }) => {
    await gotoWithFlags(page, { 'typography-panel': 'off' });
    await openFirstStory(page);
    const counter = page.locator('[data-testid="page-counter"]');
    await counter.click();
    await expect(page.getByText('Zeilenabstand')).not.toBeVisible();
  });

  test('eink-flash: override off → page-turn overlay element is absent', async ({ page }) => {
    await gotoWithFlags(page, { 'eink-flash': 'off' });
    await openFirstStory(page);
    // The flash overlay is a sibling of page-content inside reader-viewport.
    // When the flag is off it is not rendered at all, so only page-content is present.
    const overlays = page.locator('[data-testid="reader-viewport"] > div:not([data-testid])');
    await expect(overlays).toHaveCount(0);
  });
});

// ─── Pinch-to-font-size flag behavior ────────────────────────────────────────

test.describe('pinch-font-size gesture flag', () => {
  test.use({
    viewport: { width: 820, height: 1180 },
    hasTouch: true,
    isMobile: true,
  });

  test('pinch-font-size: override on → pinch gesture increases font size', async ({ page }) => {
    await gotoWithFlags(page, { 'pinch-font-size': 'on' });
    await openFirstStory(page);

    const value = page.locator('header [data-testid="font-increase"]').locator('xpath=following-sibling::span[1]');
    const beforeText = await value.textContent();
    const before = parseInt((beforeText ?? '').trim(), 10);

    const viewport = page.locator('[data-testid="reader-viewport"]');
    await viewport.dispatchEvent('touchstart', {
      touches: [
        { identifier: 1, clientX: 260, clientY: 520 },
        { identifier: 2, clientX: 340, clientY: 520 },
      ],
      changedTouches: [
        { identifier: 1, clientX: 260, clientY: 520 },
        { identifier: 2, clientX: 340, clientY: 520 },
      ],
    });

    await viewport.dispatchEvent('touchmove', {
      touches: [
        { identifier: 1, clientX: 220, clientY: 520 },
        { identifier: 2, clientX: 380, clientY: 520 },
      ],
      changedTouches: [
        { identifier: 1, clientX: 220, clientY: 520 },
        { identifier: 2, clientX: 380, clientY: 520 },
      ],
    });

    await viewport.dispatchEvent('touchend', {
      touches: [],
      changedTouches: [
        { identifier: 1, clientX: 220, clientY: 520 },
        { identifier: 2, clientX: 380, clientY: 520 },
      ],
    });

    await expect.poll(async () => {
      const text = await value.textContent();
      return parseInt((text ?? '').trim(), 10);
    }).toBeGreaterThan(before);
  });

  test('pinch-font-size: override off → pinch gesture does not change font size', async ({ page }) => {
    await gotoWithFlags(page, { 'pinch-font-size': 'off' });
    await openFirstStory(page);

    const value = page.locator('header [data-testid="font-increase"]').locator('xpath=following-sibling::span[1]');
    const beforeText = await value.textContent();
    const before = parseInt((beforeText ?? '').trim(), 10);

    const viewport = page.locator('[data-testid="reader-viewport"]');
    await viewport.dispatchEvent('touchstart', {
      touches: [
        { identifier: 1, clientX: 260, clientY: 520 },
        { identifier: 2, clientX: 340, clientY: 520 },
      ],
      changedTouches: [
        { identifier: 1, clientX: 260, clientY: 520 },
        { identifier: 2, clientX: 340, clientY: 520 },
      ],
    });

    await viewport.dispatchEvent('touchmove', {
      touches: [
        { identifier: 1, clientX: 220, clientY: 520 },
        { identifier: 2, clientX: 380, clientY: 520 },
      ],
      changedTouches: [
        { identifier: 1, clientX: 220, clientY: 520 },
        { identifier: 2, clientX: 380, clientY: 520 },
      ],
    });

    await viewport.dispatchEvent('touchend', {
      touches: [],
      changedTouches: [
        { identifier: 1, clientX: 220, clientY: 520 },
        { identifier: 2, clientX: 380, clientY: 520 },
      ],
    });

    await expect.poll(async () => {
      const text = await value.textContent();
      return parseInt((text ?? '').trim(), 10);
    }).toBe(before);
  });

  test('pinch-font-size: override on → pinch-in gesture decreases font size', async ({ page }) => {
    await gotoWithFlags(page, { 'pinch-font-size': 'on' });
    await openFirstStory(page);

    const value = page.locator('header [data-testid="font-increase"]').locator('xpath=following-sibling::span[1]');
    const beforeText = await value.textContent();
    const before = parseInt((beforeText ?? '').trim(), 10);

    const viewport = page.locator('[data-testid="reader-viewport"]');
    await viewport.dispatchEvent('touchstart', {
      touches: [
        { identifier: 1, clientX: 220, clientY: 520 },
        { identifier: 2, clientX: 380, clientY: 520 },
      ],
      changedTouches: [
        { identifier: 1, clientX: 220, clientY: 520 },
        { identifier: 2, clientX: 380, clientY: 520 },
      ],
    });

    await viewport.dispatchEvent('touchmove', {
      touches: [
        { identifier: 1, clientX: 260, clientY: 520 },
        { identifier: 2, clientX: 340, clientY: 520 },
      ],
      changedTouches: [
        { identifier: 1, clientX: 260, clientY: 520 },
        { identifier: 2, clientX: 340, clientY: 520 },
      ],
    });

    await viewport.dispatchEvent('touchend', {
      touches: [],
      changedTouches: [
        { identifier: 1, clientX: 260, clientY: 520 },
        { identifier: 2, clientX: 340, clientY: 520 },
      ],
    });

    await expect.poll(async () => {
      const text = await value.textContent();
      return parseInt((text ?? '').trim(), 10);
    }).toBeLessThan(before);
  });
});

// ─── Overrides are isolated between tests ───────────────────────────────────

test.describe('override isolation', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('flags return to defaults when no override is set', async ({ page }) => {
    // No addInitScript call - localStorage is clean for this context
    await page.goto('/app');
    await openFirstStory(page);
    // word-count is off by default
    await expect(page.getByText('Wörter')).not.toBeVisible();
    // font-size-controls is on by default
    await expect(page.locator('[data-testid="font-increase"]')).toBeVisible();
  });
});
