// @ts-check
import { test, expect } from '@playwright/test';
import { disableAppAnimation } from './test-utils';

/**
 * Seeds feature-flag overrides + optional childAge into localStorage before
 * the app boots. Mirrors disableAppAnimation's addInitScript pattern.
 */
async function seedYoungReader(page, { flags = {}, childAge = null } = {}) {
  await page.addInitScript((payload) => {
    const overrides = JSON.parse(localStorage.getItem('wr-feature-overrides') ?? '{}');
    Object.assign(overrides, payload.flags);
    localStorage.setItem('wr-feature-overrides', JSON.stringify(overrides));
    if (payload.childAge != null) {
      localStorage.setItem('wr-child-age', String(payload.childAge));
    }
  }, { flags, childAge });
}

async function openMenu(page) {
  const hamburger = page.locator('[data-testid="menu-toggle"]');
  if (await hamburger.isVisible()) {
    await hamburger.click();
    await page.waitForTimeout(200);
  }
}

test.describe('Young-reader features', () => {
  test.beforeEach(async ({ page }) => {
    await disableAppAnimation(page);
  });

  test('illustrations: cover image renders on the title page', async ({ page }) => {
    await seedYoungReader(page, { flags: { illustrations: true } });
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openMenu(page);

    // Drill into the base Grimm source. `.first()` is unstable now that
    // curated Grimm collections also appear as sources; `data-source-id`
    // is stable regardless of the label's lazy-metadata state.
    const grimmSrc = page.locator('[data-testid="source-button"][data-source-id="grimm"]');
    await expect(grimmSrc).toBeVisible({ timeout: 5000 });
    await grimmSrc.click();

    const aschenputtel = page.locator('[data-testid="story-button"]', { hasText: 'Aschenputtel' });
    await expect(aschenputtel).toBeVisible({ timeout: 5000 });
    await aschenputtel.click();

    await page.waitForSelector('[data-testid="page-content"]');
    const cover = page.locator('[data-testid="story-cover"]');
    await expect(cover).toBeVisible();
    const src = await cover.getAttribute('src');
    // Cover may be served as a file (`cover.svg`) or inlined as a
    // `data:image/svg+xml,...` URL depending on collection packaging.
    expect(src).toMatch(/(?:cover\.svg$|^data:image\/svg\+xml,)/);
  });

  test('age-filter: picker is hidden by default and shown when flag is on', async ({ page }) => {
    // First visit: flag off — picker should not appear
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openMenu(page);
    await expect(page.locator('[data-testid="age-filter"]')).toHaveCount(0);

    // Re-open with flag on
    await seedYoungReader(page, { flags: { 'age-filter': true } });
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openMenu(page);
    await expect(page.locator('[data-testid="age-filter"]')).toBeVisible();
  });

  test('age-filter: age 6 hides Blaubart (ageMin 12) but keeps Aschenputtel (6-12)', async ({ page }) => {
    await seedYoungReader(page, { flags: { 'age-filter': true }, childAge: 6 });
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openMenu(page);

    // Drill into the base Grimm source (see note above about `.first()`
    // instability and why `data-source-id` is the stable selector).
    const grimmSrc = page.locator('[data-testid="source-button"][data-source-id="grimm"]');
    await expect(grimmSrc).toBeVisible({ timeout: 5000 });
    await grimmSrc.click();

    // Aschenputtel (6-12) should remain; Blaubart (12+) should be filtered out.
    // Wait for any Grimm story to render so metadata has had a tick to load.
    await expect(
      page.locator('[data-testid="story-button"]', { hasText: 'Aschenputtel' }),
    ).toBeVisible({ timeout: 5000 });

    // Loaded metadata drives the filter — Blaubart should disappear after the
    // lazy metadata fetch settles. Poll briefly to absorb that.
    await expect.poll(
      () => page.locator('[data-testid="story-button"]', { hasText: /^Blaubart$/ }).count(),
      { timeout: 10_000 },
    ).toBe(0);
  });

  test('child-profile umbrella: forces age-filter picker on', async ({ page }) => {
    // Only child-profile is enabled — age-filter flag itself stays off.
    await seedYoungReader(page, { flags: { 'child-profile': true } });
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await openMenu(page);
    // Umbrella flips age-filter on as a derived value, so the picker appears.
    await expect(page.locator('[data-testid="age-filter"]')).toBeVisible();
  });
});
