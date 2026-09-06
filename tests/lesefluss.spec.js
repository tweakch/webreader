// @ts-check
import { test, expect } from '@playwright/test';
import { disableAppAnimation } from './test-utils';

/**
 * Option 3 Lesefluss feel: chrome-hide via existing middle-tap, plus one
 * illustration-pack slot on the Rotkäppchen pilot. Target ~540px mobile.
 */

async function seedFlags(page, flags) {
  await page.addInitScript((payload) => {
    const overrides = JSON.parse(localStorage.getItem('wr-feature-overrides') ?? '{}');
    Object.assign(overrides, payload);
    localStorage.setItem('wr-feature-overrides', JSON.stringify(overrides));
  }, flags);
}

async function openGrimmStory(page, title) {
  await page.goto('/app');
  await page.waitForLoadState('networkidle');
  const hamburger = page.locator('[data-testid="menu-toggle"]');
  if (await hamburger.isVisible()) {
    await hamburger.click();
    await page.waitForTimeout(200);
  }
  const grimmSrc = page.locator('[data-testid="source-button"][data-source-id="grimm"]');
  await expect(grimmSrc).toBeVisible({ timeout: 5000 });
  await grimmSrc.click();
  const story = page.locator('[data-testid="story-button"]', { hasText: title });
  await expect(story).toBeVisible({ timeout: 5000 });
  await story.click();
  await page.waitForSelector('[data-testid="page-content"]');
}

async function tapReaderZone(page, testId) {
  const zone = page.locator(`[data-testid="${testId}"]`);
  await expect(zone).toBeAttached();
  const box = await zone.boundingBox();
  if (!box) throw new Error(`${testId} has no box`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(200);
}

test.describe('Lesefluss chrome-hide + illustration slot', () => {
  test.use({ viewport: { width: 540, height: 780 } });

  test.beforeEach(async ({ page }) => {
    await disableAppAnimation(page);
  });

  test('middle tap collapses chrome so the reader uses the full screen', async ({ page }) => {
    await seedFlags(page, { 'enhanced-gestures': false });
    await openGrimmStory(page, 'Aschenputtel');

    const header = page.locator('[data-testid="app-top-bar"]');
    const nav = page.locator('[data-testid="nav-bar"]');
    const reader = page.locator('[data-testid="reader-viewport"]');

    await expect(header).toBeVisible();
    await expect(nav).toBeVisible();
    const shownHeight = await reader.evaluate((el) => el.clientHeight);

    await tapReaderZone(page, 'tap-zone-middle');

    await expect(header).toHaveAttribute('aria-hidden', 'true');
    await expect(nav).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('[data-testid="profile-fab"]')).toHaveCount(0);
    const headerBox = await header.boundingBox();
    const navBox = await nav.boundingBox();
    expect(headerBox?.height ?? 0).toBeLessThan(2);
    expect(navBox?.height ?? 0).toBeLessThan(2);

    const hiddenHeight = await reader.evaluate((el) => el.clientHeight);
    expect(hiddenHeight).toBeGreaterThan(shownHeight);

    await tapReaderZone(page, 'tap-zone-middle');
    await expect(header).toHaveAttribute('aria-hidden', 'false');
    await expect(nav).toHaveAttribute('aria-hidden', 'false');
    await expect(page.locator('[data-testid="page-counter"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-fab"]')).toBeVisible();
  });

  test('pilot pack slot renders when illustrations is on', async ({ page }) => {
    await seedFlags(page, { illustrations: true, 'enhanced-gestures': false });
    await openGrimmStory(page, 'Rotkäppchen');

    await expect(page.locator('[data-testid="page-content"]')).toBeVisible();
    expect(await page.locator('[data-testid="story-illustration-slot"]').count()).toBe(0);

    await tapReaderZone(page, 'tap-zone-right');
    await expect(page.locator('[data-testid="story-illustration-slot"]')).toBeVisible();
    const src = await page.locator('[data-testid="story-illustration-slot"]').getAttribute('src');
    expect(src).toMatch(/waldweg|\.svg|data:image\/svg/);
  });

  test('missing pack leaves paging without a slot page', async ({ page }) => {
    await seedFlags(page, { illustrations: true, 'enhanced-gestures': false });
    await openGrimmStory(page, 'Aschenputtel');

    expect(await page.locator('[data-testid="story-illustration-slot"]').count()).toBe(0);
    await tapReaderZone(page, 'tap-zone-right');
    expect(await page.locator('[data-testid="story-illustration-slot"]').count()).toBe(0);
    await expect(page.locator('[data-testid="page-content"] p')).toBeVisible();
  });
});

