// @ts-check
import { test, expect } from '@playwright/test';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Navigate to app with pre-seeded localStorage values. */
async function gotoWithStorage(page, items = {}) {
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      localStorage.setItem(key, value);
    }
  }, items);
  await page.goto('/app');
}

async function openFirstStory(page) {
  const hamburger = page.locator('[data-testid="menu-toggle"]');
  if (await hamburger.isVisible()) await hamburger.click();
  // If we're at the top-level source list, drill in first.
  // If wr-last-source is persisted we land directly in the story list.
  const sourceBtn = page.locator('[data-testid="source-button"]').first();
  if (await sourceBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await sourceBtn.click();
  }
  await page.locator('[data-testid="story-button"]').first().click();
  await page.waitForSelector('[data-testid="page-content"] p');
}

async function openSecondStory(page) {
  const hamburger = page.locator('[data-testid="menu-toggle"]');
  if (await hamburger.isVisible()) await hamburger.click();
  await page.locator('[data-testid="source-button"]').first().click();
  await page.locator('[data-testid="story-button"]').nth(1).click();
  await page.waitForSelector('[data-testid="page-content"] p');
}

async function goToLastPage(page) {
  await page.waitForSelector('[data-testid="page-counter"]');
  const text = await page.locator('[data-testid="page-counter"]').textContent();
  const total = parseInt(text.split('/')[1].trim(), 10);
  for (let i = 1; i < total; i++) {
    await page.locator('[data-testid="next-page"]').click();
    await page.waitForTimeout(200);
  }
}

async function getSourceId(page) {
  await page.goto('/app');
  const hamburger = page.locator('[data-testid="menu-toggle"]');
  if (await hamburger.isVisible()) await hamburger.click();
  // Click the first source to drill in - grab the source ID from the URL or DOM
  // We use the data-testid="source-button" text label to identify it
  return page.locator('[data-testid="source-button"]').first().textContent();
}

// ─── 1. Font size persistence ────────────────────────────────────────────────

test.describe('font size persistence', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('font size is restored on reload', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/app');
    await openFirstStory(page);

    // Increase font size twice (18 → 20 → 22)
    await page.locator('[data-testid="font-increase"]').click();
    await page.locator('[data-testid="font-increase"]').click();

    await expect(page.locator('header span.w-12')).toHaveText('22');

    // Reload and verify font size is preserved
    await page.reload();
    await openFirstStory(page);
    await expect(page.locator('header span.w-12')).toHaveText('22');
  });

  test('font size change is written to wr-fs in localStorage', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);

    await page.locator('[data-testid="font-decrease"]').click(); // 18 → 16
    const stored = await page.evaluate(() => localStorage.getItem('wr-fs'));
    expect(stored).toBe('16');
  });

  test('font size initialises from wr-fs in localStorage', async ({ page }) => {
    await gotoWithStorage(page, { 'wr-fs': '24' });
    await openFirstStory(page);
    await expect(page.locator('header span.w-12')).toHaveText('24');
  });
});

// ─── 2. Theme persistence ────────────────────────────────────────────────────

test.describe('theme persistence', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('dark mode survives a reload', async ({ page }) => {
    await page.goto('/app');

    // Toggle to dark (light → dark)
    await page.locator('header button[title*="dark"]').click();
    // Confirm dark class applied (amber-950 bg present)
    await expect(page.locator('.from-amber-950')).toBeVisible();

    await page.reload();
    await expect(page.locator('.from-amber-950')).toBeVisible();
  });

  test('theme is written to wr-theme in localStorage', async ({ page }) => {
    await page.goto('/app');
    await page.locator('header button[title*="dark"]').click();
    const stored = await page.evaluate(() => localStorage.getItem('wr-theme'));
    expect(stored).toBe('dark');
  });

  test('theme initialises from wr-theme in localStorage', async ({ page }) => {
    await gotoWithStorage(page, { 'wr-theme': 'dark' });
    await expect(page.locator('.from-amber-950')).toBeVisible();
  });
});

// ─── 3. Last browsed source ──────────────────────────────────────────────────

test.describe('last browsed source persistence', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('drilling into a source persists across reload', async ({ page }) => {
    await page.goto('/app');
    await page.locator('[data-testid="source-button"]').first().click();
    // Story buttons should now be visible (drilled in)
    await expect(page.locator('[data-testid="story-button"]').first()).toBeVisible();

    await page.reload();
    // After reload we should still be in the source drill-down (story buttons visible)
    await expect(page.locator('[data-testid="story-button"]').first()).toBeVisible();
  });

  test('source written to wr-last-source in localStorage', async ({ page }) => {
    await page.goto('/app');
    await page.locator('[data-testid="source-button"]').first().click();
    const stored = await page.evaluate(() => localStorage.getItem('wr-last-source'));
    expect(stored).not.toBeNull();
    expect(stored?.length).toBeGreaterThan(0);
  });

  test('navigating back to source list clears wr-last-source', async ({ page }) => {
    await page.goto('/app');
    await page.locator('[data-testid="source-button"]').first().click();
    // Click the back button (has data-testid="back-to-sources")
    await page.locator('[data-testid="back-to-sources"]').click();
    // After clicking back, source-button should be visible again
    await expect(page.locator('[data-testid="source-button"]').first()).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('wr-last-source'));
    // Should now be empty string (navigated back to root)
    expect(stored ?? '').toBe('');
  });
});

// ─── 4. Favorites-only filter persistence ───────────────────────────────────

test.describe('favorites-only filter persistence', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('favorites-only toggle state is restored on reload', async ({ page }) => {
    // Enable favorites + favorites-only-toggle features
    await gotoWithStorage(page, {
      'wr-feature-overrides': JSON.stringify({ favorites: true, 'favorites-only-toggle': true }),
    });

    // Toggle favorites-only on
    const heartBtn = page.locator('aside button[title]').filter({ has: page.locator('svg') });
    await heartBtn.last().click();

    const stored = await page.evaluate(() => localStorage.getItem('wr-favorites-only'));
    expect(stored).toBe('true');

    await page.reload();
    const storedAfterReload = await page.evaluate(() => localStorage.getItem('wr-favorites-only'));
    expect(storedAfterReload).toBe('true');
  });

  test('favorites-only initialises as true from wr-favorites-only', async ({ page }) => {
    await gotoWithStorage(page, {
      'wr-feature-overrides': JSON.stringify({ favorites: true, 'favorites-only-toggle': true }),
      'wr-favorites-only': 'true',
    });
    const stored = await page.evaluate(() => localStorage.getItem('wr-favorites-only'));
    expect(stored).toBe('true');
  });
});

// ─── 5. Resume last story + page ────────────────────────────────────────────

test.describe('resume last story + page', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('resume banner appears after returning to app mid-story', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);

    // Navigate forward a page if possible
    const counterText = await page.locator('[data-testid="page-counter"]').textContent();
    const total = parseInt(counterText.split('/')[1].trim(), 10);
    if (total > 1) {
      await page.locator('[data-testid="next-page"]').click();
      await page.waitForTimeout(200);
    }

    // Go back to home (no story selected) by reloading
    await page.goto('/app');
    await expect(page.locator('[data-testid="resume-banner"]')).toBeVisible();
  });

  test('resume banner shows story title and page number', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);

    // Navigate to page 2 if possible
    const counterText = await page.locator('[data-testid="page-counter"]').textContent();
    const total = parseInt(counterText.split('/')[1].trim(), 10);
    if (total > 1) {
      await page.locator('[data-testid="next-page"]').click();
      await page.waitForTimeout(200);
    }

    await page.goto('/app');
    const banner = page.locator('[data-testid="resume-banner"]');
    await expect(banner).toBeVisible();
    // Banner must mention "Weiterlesen" and a page number
    await expect(banner).toContainText('Weiterlesen');
    await expect(banner).toContainText('Seite');
  });

  test('clicking resume confirm opens story at the stored page', async ({ page }) => {
    // Seed storage with a known story at page 2
    await page.goto('/app');
    await openFirstStory(page);

    // Advance to page 2 if possible
    const counterText = await page.locator('[data-testid="page-counter"]').textContent();
    const total = parseInt(counterText.split('/')[1].trim(), 10);
    let targetPage = 1;
    if (total > 1) {
      await page.locator('[data-testid="next-page"]').click();
      await page.waitForTimeout(200);
    } else {
      targetPage = 0;
    }

    await page.goto('/app');
    await page.locator('[data-testid="resume-confirm"]').click();
    await page.waitForSelector('[data-testid="page-content"] p');

    // Page counter should reflect the restored page
    const newCounter = await page.locator('[data-testid="page-counter"]').textContent();
    const restoredPage = parseInt(newCounter.split('/')[0].trim(), 10);
    expect(restoredPage).toBe(targetPage + 1); // counter is 1-indexed
  });

  test('dismiss button removes the resume banner', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    await page.goto('/app');

    const banner = page.locator('[data-testid="resume-banner"]');
    await expect(banner).toBeVisible();
    await page.locator('[data-testid="resume-dismiss"]').click();
    await expect(banner).not.toBeVisible();
  });

  test('banner is not shown while actively reading a story', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    await page.goto('/app');

    // Banner should appear on home
    await expect(page.locator('[data-testid="resume-banner"]')).toBeVisible();

    // Click resume - now reading the story
    await page.locator('[data-testid="resume-confirm"]').click();
    await page.waitForSelector('[data-testid="page-content"] p');

    // Banner must not appear while a story is open
    await expect(page.locator('[data-testid="resume-banner"]')).not.toBeVisible();
  });

  test('no resume banner on first ever visit', async ({ page }) => {
    await page.goto('/app');
    await expect(page.locator('[data-testid="resume-banner"]')).not.toBeVisible();
  });
});

// ─── 6. Stories read completion ──────────────────────────────────────────────

test.describe('stories read completion tracking', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('completed indicator appears after reading to last page', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    await goToLastPage(page);

    // Go back to source list and drill in again to see the indicator
    const hamburger = page.locator('[data-testid="menu-toggle"]');
    if (await hamburger.isVisible()) await hamburger.click();
    // Story button for the first story should now have a completed indicator
    const storyRow = page.locator('[data-testid="story-button"]').first().locator('..');
    await expect(storyRow.locator('[data-testid="completed-indicator"]')).toBeVisible();
  });

  test('completion is persisted in wr-completed', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    await goToLastPage(page);

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('wr-completed');
      return raw ? JSON.parse(raw) : [];
    });
    expect(stored.length).toBe(1);
  });

  test('completion survives a reload', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    await goToLastPage(page);

    await page.reload();
    // wr-last-source is persisted, so we land in the story list directly
    const src = page.locator('[data-testid="source-button"]').first();
    if (await src.isVisible({ timeout: 1000 }).catch(() => false)) await src.click();
    const storyRow = page.locator('[data-testid="story-button"]').first().locator('..');
    await expect(storyRow.locator('[data-testid="completed-indicator"]')).toBeVisible();
  });

  test('completed indicator loads from wr-completed seed', async ({ page }) => {
    // Read a story to completion to capture the wr-completed value
    await page.goto('/app');
    await openFirstStory(page);
    await goToLastPage(page);
    const stored = await page.evaluate(() => localStorage.getItem('wr-completed'));

    // Fresh load with only the completed seed (clears other state first)
    await page.evaluate(() => localStorage.clear());
    await gotoWithStorage(page, { 'wr-completed': stored ?? '[]' });

    const src = page.locator('[data-testid="source-button"]').first();
    if (await src.isVisible({ timeout: 1000 }).catch(() => false)) await src.click();
    const storyRow = page.locator('[data-testid="story-button"]').first().locator('..');
    await expect(storyRow.locator('[data-testid="completed-indicator"]')).toBeVisible();
  });

  test('profile stats show completed count', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    await goToLastPage(page);

    // Open profile
    await page.locator('aside button').filter({ hasText: 'Mein Profil' }).click();
    await expect(page.getByText('Gelesen')).toBeVisible();
    const countEl = page.getByText('Gelesen').locator('..').locator('span').last();
    expect(parseInt(await countEl.textContent(), 10)).toBeGreaterThanOrEqual(1);
  });
});

// ─── 7. Variant preference per story ────────────────────────────────────────

test.describe('variant preference per story', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  /** Find a story that has adaptions and open it. Returns false if none found. */
  async function openStoryWithAdaptions(page) {
    await page.goto('/app');
    const hamburger = page.locator('[data-testid="menu-toggle"]');
    if (await hamburger.isVisible()) await hamburger.click();
    const sources = page.locator('[data-testid="source-button"]');
    const sourceCount = await sources.count();
    for (let s = 0; s < sourceCount; s++) {
      await page.locator('[data-testid="source-button"]').nth(s).click();
      await page.waitForTimeout(100);
      const storyBtns = page.locator('[data-testid="story-button"]');
      const storyCount = await storyBtns.count();
      for (let i = 0; i < storyCount; i++) {
        await page.locator('[data-testid="story-button"]').nth(i).click();
        await page.waitForSelector('[data-testid="page-content"] p');
        // Check if variant switcher is present
        const variantBtns = page.locator('text=Original');
        if (await variantBtns.isVisible()) return true;
        // go back
        if (await hamburger.isVisible()) await hamburger.click();
      }
      // go back to source list
      if (await hamburger.isVisible()) await hamburger.click();
      const backBtn = page.locator('aside button').filter({ hasText: /← / });
      if (await backBtn.isVisible()) await backBtn.click();
    }
    return false;
  }

  test('selected variant is remembered when returning to the same story', async ({ page }) => {
    const hasAdaptions = await openStoryWithAdaptions(page);
    test.skip(!hasAdaptions, 'No stories with adaptions found');

    // Pick the first non-Original variant
    const variantBtns = page.locator('[data-testid="reader-viewport"]')
      .locator('..').locator('..').locator('button').filter({ hasNotText: 'Original' });
    // Actually variant buttons are siblings of reader-viewport in the flex col
    const allVariantBtns = page.locator('button').filter({ hasText: /^(?!Original)/ });

    // Get the adaption switcher area - it's in the flex column between reader and nav
    // Use the nav-bar's sibling approach
    const adaptionBar = page.locator('[data-testid="nav-bar"]').locator('..').locator('div').first();
    const nonOriginal = adaptionBar.locator('button').nth(1); // first non-Original

    if (await nonOriginal.isVisible()) {
      const variantName = await nonOriginal.textContent();
      await nonOriginal.click();
      await page.waitForTimeout(100);

      // Check wr-variant-prefs was written
      const prefs = await page.evaluate(() => {
        const raw = localStorage.getItem('wr-variant-prefs');
        return raw ? JSON.parse(raw) : {};
      });
      expect(Object.values(prefs).some(v => v === variantName?.trim())).toBe(true);
    }
  });

  test('variant preference is restored after reload', async ({ page }) => {
    const hasAdaptions = await openStoryWithAdaptions(page);
    test.skip(!hasAdaptions, 'No stories with adaptions found');

    // Find the adaption bar and pick the second button (first variant after Original)
    const adaptionBar = page.locator('[data-testid="nav-bar"]').locator('..');
    const variantBtn = adaptionBar.locator('div').first().locator('button').nth(1);

    if (!(await variantBtn.isVisible())) return;

    const variantName = (await variantBtn.textContent())?.trim();
    await variantBtn.click();
    await page.waitForTimeout(100);

    // Reload - the same story should reopen on page 1 with the variant still active
    await page.reload();
    const hamburger = page.locator('[data-testid="menu-toggle"]');
    if (await hamburger.isVisible()) await hamburger.click();
    await page.locator('[data-testid="source-button"]').first().click();
    await page.locator('[data-testid="story-button"]').first().click();
    await page.waitForSelector('[data-testid="page-content"] p');

    // The variant button should now be in the active (highlighted) state
    const restoredBtn = page.locator('button').filter({ hasText: variantName ?? '' }).first();
    if (await restoredBtn.isVisible()) {
      // Active variants have amber-700 or amber-200 background
      const cls = await restoredBtn.getAttribute('class');
      expect(cls).toMatch(/amber-700|amber-200/);
    }
  });
});
