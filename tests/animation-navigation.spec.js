// @ts-check
import { test, expect } from '@playwright/test';
import { disableAppAnimation } from './test-utils';

/**
 * Animation & Navigation Flow Tests
 *
 * Covers four areas:
 *
 *  A. App onload animation
 *     The AppAnimationWrapper mounts with class="app-enter", which triggers the
 *     appSlideUp keyframe (translateY 100%→0, opacity 0→1, 650 ms).
 *
 *  B. App onClose animation
 *     pagehide / beforeunload listeners swap .app-enter → .app-exit, which
 *     triggers the appSlideDown keyframe (translateY 0→100%, opacity 1→0, 450 ms).
 *
 *  C. Sidebar open/close (transition-transform duration-300)
 *     On mobile the sidebar lives off-screen (-translate-x-full).  menu-toggle
 *     flips it to translate-x-0; story selection flips it back.
 *
 *  D. Navigation depth permutations
 *     D1 – 2-level (source → story list, e.g. Grimm)
 *     D2 – 3-level (source → directory list → story list, e.g. Swiss)
 *          Requires the story-directories feature flag to be enabled.
 *
 * Playwright is configured with reducedMotion:'reduce', so CSS animations
 * (.app-enter / .app-exit) complete instantly and CSS transitions run
 * at 0-duration.  Tests check class names and element visibility rather
 * than elapsed time.
 */

// ─── helpers ────────────────────────────────────────────────────────────────

/** Set the story-directories feature override in localStorage before the page
 *  initialises so that it is read by the React hook on first render. */
async function enableDirectoriesFlag(page) {
  await page.addInitScript(() => {
    const overrides = JSON.parse(localStorage.getItem('wr-feature-overrides') ?? '{}');
    overrides['story-directories'] = true;
    localStorage.setItem('wr-feature-overrides', JSON.stringify(overrides));
  });
}

/** Click menu-toggle if it is visible (mobile), then wait for the 300 ms
 *  transition to settle. */
async function openSidebarIfNeeded(page) {
  const toggle = page.locator('[data-testid="menu-toggle"]');
  if (await toggle.isVisible()) {
    await toggle.click();
    await page.waitForTimeout(300);
  }
}

/** Walk through every source button until one reveals directory-button items.
 *  Returns true when a source with directories is active; false if none found. */
async function drillIntoSourceWithDirectories(page) {
  const sourceBtns = page.locator('[data-testid="source-button"]');
  const count = await sourceBtns.count();
  for (let i = 0; i < count; i++) {
    await sourceBtns.nth(i).click();
    await page.waitForTimeout(200);
    const dirBtn = page.locator('[data-testid="directory-button"]').first();
    if (await dirBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      return true;
    }
    // Go back to source list and try the next source
    const back = page.locator('[data-testid="back-to-sources"]');
    if (await back.isVisible({ timeout: 300 }).catch(() => false)) {
      await back.click();
      await page.waitForTimeout(200);
    }
  }
  return false;
}

import { enableAppAnimation } from './test-utils';

// ─── A. App onload animation ─────────────────────────────────────────────────

test.describe('A – App onload animation', () => {
  test('wrapper has .app-enter on first paint', async ({ page }) => {
    await enableAppAnimation(page);
    await page.goto('/app');
    // Check class before networkidle so we catch it at the earliest possible moment
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.app-enter').first()).toBeAttached();
  });

  test('.app-exit is absent on load', async ({ page }) => {
    await enableAppAnimation(page);
    await page.goto('/app');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.app-exit')).not.toBeAttached();
  });

  test('wrapper rendered with width:100% height:100% inline styles', async ({ page }) => {
    await enableAppAnimation(page);
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    const styles = await page.locator('.app-enter').first().evaluate(el => ({
      width: el.style.width,
      height: el.style.height,
    }));
    expect(styles.width).toBe('100%');
    expect(styles.height).toBe('100%');
  });
});

// ─── B. App onClose animation ────────────────────────────────────────────────

test.describe('B – App onClose animation', () => {
  test.beforeEach(async ({ page }) => {
    await disableAppAnimation(page);
  });

  test('pagehide swaps .app-enter → .app-exit', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Initial state
    await expect(page.locator('.app-enter').first()).toBeAttached();

    // Simulate browser tab/window close
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));

    await expect(page.locator('.app-exit').first()).toBeAttached();
    await expect(page.locator('.app-enter')).not.toBeAttached();
  });

  test('beforeunload also triggers .app-exit', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.dispatchEvent(new Event('beforeunload')));

    await expect(page.locator('.app-exit').first()).toBeAttached();
  });

  test('fresh navigation resets to .app-enter (no residual .app-exit)', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Trigger exit on first load
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    await expect(page.locator('.app-exit').first()).toBeAttached();

    // Navigate again — the component remounts with app-enter
    await page.goto('/app');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('.app-enter').first()).toBeAttached();
    await expect(page.locator('.app-exit')).not.toBeAttached();
  });
});

// ─── C. Sidebar open/close animation ─────────────────────────────────────────

test.describe('C – Sidebar open/close animation', () => {
  test.beforeEach(async ({ page }) => {
    await disableAppAnimation(page);
  });

  test('sidebar carries transition-transform duration-300 classes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toHaveClass(/transition-transform/);
    await expect(sidebar).toHaveClass(/duration-300/);
  });

  test('sidebar starts off-screen on mobile (-translate-x-full)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toHaveClass(/-translate-x-full/);
  });

  test('menu-toggle slides sidebar in (translate-x-0)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="menu-toggle"]').click();
    await page.waitForTimeout(300);

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toHaveClass(/translate-x-0/);
    await expect(sidebar).not.toHaveClass(/-translate-x-full/);
  });

  test('sidebar slides back out after selecting a story', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Open sidebar
    await page.locator('[data-testid="menu-toggle"]').click();
    await page.waitForTimeout(300);

    // Drill to stories
    const sourceBtn = page.locator('[data-testid="source-button"]').first();
    await expect(sourceBtn).toBeVisible({ timeout: 3000 });
    await sourceBtn.click();
    await page.waitForTimeout(300);

    // If directories are shown, drill one deeper
    const dirBtn = page.locator('[data-testid="directory-button"]').first();
    if (await dirBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await dirBtn.click();
      await page.waitForTimeout(300);
    }

    // Select story — sidebar must close
    const storyBtn = page.locator('[data-testid="story-button"]').first();
    await expect(storyBtn).toBeVisible({ timeout: 5000 });
    await storyBtn.click();
    await page.waitForTimeout(300);

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toHaveClass(/-translate-x-full/);
  });

  test('menu-toggle is hidden on desktop viewport (sidebar always visible)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // menu-toggle has lg:hidden — not visible at desktop width
    await expect(page.locator('[data-testid="menu-toggle"]')).not.toBeVisible();
  });
});

// ─── D1. 2-level navigation (source → story) ─────────────────────────────────

test.describe('D1 – 2-level navigation (source → story)', () => {
  test.beforeEach(async ({ page }) => {
    await disableAppAnimation(page);
  });

  test('source list is visible on load; story list is not', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openSidebarIfNeeded(page);

    await expect(page.locator('[data-testid="source-button"]').first()).toBeVisible({ timeout: 3000 });
    // No story-button should be directly visible before drilling in
    await expect(page.locator('[data-testid="story-button"]').first()).not.toBeVisible();
  });

  test('clicking a source renders back-to-sources and stories (or directories)', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openSidebarIfNeeded(page);

    await page.locator('[data-testid="source-button"]').first().click();
    await page.waitForTimeout(300);

    await expect(page.locator('[data-testid="back-to-sources"]')).toBeVisible({ timeout: 3000 });
    const itemCount = await page
      .locator('[data-testid="story-button"], [data-testid="directory-button"]')
      .count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('back-to-sources returns to source list', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openSidebarIfNeeded(page);

    await page.locator('[data-testid="source-button"]').first().click();
    await page.waitForTimeout(300);

    await page.locator('[data-testid="back-to-sources"]').click();
    await page.waitForTimeout(300);

    await expect(page.locator('[data-testid="source-button"]').first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-testid="back-to-sources"]')).not.toBeVisible();
  });

  test('selecting a story opens the reader (page-content + page-counter visible)', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openSidebarIfNeeded(page);

    // Find a 2-level source (Grimm has no directories)
    const sourceBtns = page.locator('[data-testid="source-button"]');
    const count = await sourceBtns.count();
    let landed = false;
    for (let i = 0; i < count; i++) {
      await sourceBtns.nth(i).click();
      await page.waitForTimeout(300);
      // Skip if this source shows directories
      if (await page.locator('[data-testid="directory-button"]').first().isVisible({ timeout: 300 }).catch(() => false)) {
        await page.locator('[data-testid="back-to-sources"]').click();
        await page.waitForTimeout(200);
        continue;
      }
      landed = true;
      break;
    }
    if (!landed) test.skip(true, 'No 2-level source found');

    const storyBtn = page.locator('[data-testid="story-button"]').first();
    await expect(storyBtn).toBeVisible({ timeout: 5000 });
    await storyBtn.click();

    await expect(page.locator('[data-testid="page-content"]')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('[data-testid="page-counter"]')).toBeVisible({ timeout: 5000 });
  });

  test('multiple back-and-forth drills stay consistent', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openSidebarIfNeeded(page);

    for (let round = 0; round < 3; round++) {
      await page.locator('[data-testid="source-button"]').first().click();
      await page.waitForTimeout(200);
      await expect(page.locator('[data-testid="back-to-sources"]')).toBeVisible({ timeout: 3000 });

      await page.locator('[data-testid="back-to-sources"]').click();
      await page.waitForTimeout(200);
      await expect(page.locator('[data-testid="source-button"]').first()).toBeVisible({ timeout: 3000 });
    }
  });
});

// ─── D2. 3-level navigation (source → directory → story) ─────────────────────

test.describe('D2 – 3-level navigation (source → directory → story)', () => {
  test.beforeEach(async ({ page }) => {
    await disableAppAnimation(page);
    await enableDirectoriesFlag(page);
  });

  test('source with directories shows directory-button list (not story-button)', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openSidebarIfNeeded(page);

    const found = await drillIntoSourceWithDirectories(page);
    test.skip(!found, 'No source with directories found in this build');

    await expect(page.locator('[data-testid="directory-button"]').first()).toBeVisible({ timeout: 3000 });
    // Stories are not yet visible — we are at the directory level
    await expect(page.locator('[data-testid="story-button"]').first()).not.toBeVisible();
  });

  test('clicking a directory renders back-to-directories and story list', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openSidebarIfNeeded(page);

    const found = await drillIntoSourceWithDirectories(page);
    test.skip(!found, 'No source with directories found in this build');

    await page.locator('[data-testid="directory-button"]').first().click();
    await page.waitForTimeout(300);

    await expect(page.locator('[data-testid="back-to-directories"]')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-testid="story-button"]').first()).toBeVisible({ timeout: 3000 });
    // Directory buttons should no longer be visible
    await expect(page.locator('[data-testid="directory-button"]').first()).not.toBeVisible();
  });

  test('back-to-directories returns to directory list', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openSidebarIfNeeded(page);

    const found = await drillIntoSourceWithDirectories(page);
    test.skip(!found, 'No source with directories found in this build');

    await page.locator('[data-testid="directory-button"]').first().click();
    await page.waitForTimeout(300);

    await page.locator('[data-testid="back-to-directories"]').click();
    await page.waitForTimeout(300);

    // Back at directory level: directories visible, back-to-sources visible,
    // back-to-directories gone, stories gone
    await expect(page.locator('[data-testid="directory-button"]').first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-testid="back-to-sources"]')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-testid="back-to-directories"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="story-button"]').first()).not.toBeVisible();
  });

  test('back-to-sources from directory level returns to source list', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openSidebarIfNeeded(page);

    const found = await drillIntoSourceWithDirectories(page);
    test.skip(!found, 'No source with directories found in this build');

    await page.locator('[data-testid="back-to-sources"]').click();
    await page.waitForTimeout(300);

    await expect(page.locator('[data-testid="source-button"]').first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-testid="back-to-sources"]')).not.toBeVisible();
  });

  test('full 3-level flow: source → directory → story → reader', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openSidebarIfNeeded(page);

    const found = await drillIntoSourceWithDirectories(page);
    test.skip(!found, 'No source with directories found in this build');

    // Depth 2 → depth 3
    await page.locator('[data-testid="directory-button"]').first().click();
    await page.waitForTimeout(300);

    const storyBtn = page.locator('[data-testid="story-button"]').first();
    await expect(storyBtn).toBeVisible({ timeout: 5000 });
    await storyBtn.click();

    await expect(page.locator('[data-testid="page-content"]')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('[data-testid="page-counter"]')).toBeVisible({ timeout: 5000 });
  });

  test('3-level: sidebar closes on story selection (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="menu-toggle"]').click();
    await page.waitForTimeout(300);

    const found = await drillIntoSourceWithDirectories(page);
    test.skip(!found, 'No source with directories found in this build');

    await page.locator('[data-testid="directory-button"]').first().click();
    await page.waitForTimeout(300);

    await page.locator('[data-testid="story-button"]').first().click();
    await page.waitForTimeout(300);

    // Sidebar must have slid back off-screen
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toHaveClass(/-translate-x-full/);
  });

  test('navigating back through all 3 levels leaves source list visible', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openSidebarIfNeeded(page);

    const found = await drillIntoSourceWithDirectories(page);
    test.skip(!found, 'No source with directories found in this build');

    // Drill to story level
    await page.locator('[data-testid="directory-button"]').first().click();
    await page.waitForTimeout(300);

    // Back to directories
    await page.locator('[data-testid="back-to-directories"]').click();
    await page.waitForTimeout(300);

    // Back to sources
    await page.locator('[data-testid="back-to-sources"]').click();
    await page.waitForTimeout(300);

    await expect(page.locator('[data-testid="source-button"]').first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-testid="back-to-sources"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="back-to-directories"]')).not.toBeVisible();
  });
});
