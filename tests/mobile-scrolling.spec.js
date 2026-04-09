// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Mobile scrolling tests.
 *
 * The sidebar story list lives in a flex column (aside flex flex-col).
 * Without min-h-0 on the flex-1 overflow-y-auto child, min-height:auto
 * prevents the div from shrinking to its flex-allocated height, so
 * overflow-y:auto never fires and the list spills past the viewport
 * instead of scrolling.
 *
 * These tests verify scrollable containers work correctly on a mobile
 * viewport by checking scrollHeight > clientHeight and that programmatic
 * scroll actually moves the scroll position.
 */

const MOBILE = { width: 375, height: 812 };

// ─── helpers ────────────────────────────────────────────────────────────────

/** Open sidebar on mobile via the menu-toggle button. */
async function openSidebar(page) {
  const toggle = page.locator('[data-testid="menu-toggle"]');
  if (await toggle.isVisible()) {
    await toggle.click();
    await page.waitForTimeout(300);
  }
}

/** Drill into the first source that has story-buttons (not directories). */
async function drillToStories(page) {
  const sourceBtns = page.locator('[data-testid="source-button"]');
  const count = await sourceBtns.count();
  for (let i = 0; i < count; i++) {
    await sourceBtns.nth(i).click();
    await page.waitForTimeout(300);
    // Skip sources that show directory-buttons instead of story-buttons
    const dirBtn = page.locator('[data-testid="directory-button"]').first();
    if (await dirBtn.isVisible({ timeout: 400 }).catch(() => false)) {
      const back = page.locator('[data-testid="back-to-sources"]');
      await back.click();
      await page.waitForTimeout(200);
      continue;
    }
    const storyBtn = page.locator('[data-testid="story-button"]').first();
    if (await storyBtn.isVisible({ timeout: 400 }).catch(() => false)) {
      return true;
    }
  }
  return false;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('Mobile scrolling', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
  });

  test('sidebar scroll container is taller than its visible area when story list is long', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    await openSidebar(page);

    const found = await drillToStories(page);
    test.skip(!found, 'No source with story-buttons found');

    // The scrollable container is the first direct div child of the aside
    const scrollContainer = page.locator('aside > div').first();
    await expect(scrollContainer).toBeVisible({ timeout: 3000 });

    const { scrollHeight, clientHeight } = await scrollContainer.evaluate(el => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));

    expect(clientHeight).toBeGreaterThan(0);
    expect(scrollHeight).toBeGreaterThan(clientHeight);
    console.log(`✓ Sidebar scroll container: clientHeight=${clientHeight}, scrollHeight=${scrollHeight}`);
  });

  test('sidebar story list can be scrolled on mobile', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    await openSidebar(page);

    const found = await drillToStories(page);
    test.skip(!found, 'No source with story-buttons found');

    const scrollContainer = page.locator('aside > div').first();
    await expect(scrollContainer).toBeVisible({ timeout: 3000 });

    // Scroll down 300 px programmatically (simulates a touch swipe)
    const scrollTopAfter = await scrollContainer.evaluate(el => {
      el.scrollTop = 300;
      return el.scrollTop;
    });

    expect(scrollTopAfter).toBeGreaterThan(0);
    console.log(`✓ Sidebar scrollTop after scroll: ${scrollTopAfter}`);
  });

  test('story buttons move upward in the container when scrolled down', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    await openSidebar(page);

    const found = await drillToStories(page);
    test.skip(!found, 'No source with story-buttons found');

    const allStoryBtns = page.locator('[data-testid="story-button"]');
    const count = await allStoryBtns.count();
    test.skip(count < 5, 'Not enough stories to test scroll movement');

    const scrollContainer = page.locator('aside > div').first();

    // Record the Y position of the last story button before scrolling.
    // Playwright returns null for elements with no bounding box (off-screen in a clipped overflow),
    // so we use evaluate on the element itself which always gives a position relative to the page.
    const lastBtn = allStoryBtns.nth(count - 1);
    const yBefore = await lastBtn.evaluate(el => el.getBoundingClientRect().top);

    // Scroll the container down 300 px
    await scrollContainer.evaluate(el => { el.scrollTop = 300; });
    await page.waitForTimeout(100);

    // After scrolling down, the last button's top position should have decreased
    // (it moved upward relative to the viewport).
    const yAfter = await lastBtn.evaluate(el => el.getBoundingClientRect().top);

    expect(yAfter).toBeLessThan(yBefore);
    console.log(`✓ Last story button moved from y=${yBefore.toFixed(0)} to y=${yAfter.toFixed(0)} after scrolling`);
  });

  test('sidebar scrollTop resets to 0 when navigating back to source list', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    await openSidebar(page);

    const found = await drillToStories(page);
    test.skip(!found, 'No source with story-buttons found');

    const scrollContainer = page.locator('aside > div').first();

    // Scroll down
    await scrollContainer.evaluate(el => { el.scrollTop = 300; });

    // Go back to source list
    const backBtn = page.locator('[data-testid="back-to-sources"]');
    await expect(backBtn).toBeVisible({ timeout: 3000 });
    await backBtn.click();
    await page.waitForTimeout(300);

    // Source list is shown again
    await expect(page.locator('[data-testid="source-button"]').first()).toBeVisible({ timeout: 3000 });

    // Scroll position should be at or near the top (source list is short)
    const scrollTop = await scrollContainer.evaluate(el => el.scrollTop);
    expect(scrollTop).toBeLessThanOrEqual(10);
    console.log(`✓ Scroll position after back-to-sources: ${scrollTop}`);
  });
});
