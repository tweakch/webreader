// @ts-check
import { test, expect } from '@playwright/test';
import { disableAppAnimation } from './test-utils';

/**
 * Paper UI — chrome recedes while reading.
 *
 * When a story is open and the user sits still, the nav bar and top bar fade
 * out so nothing but the text remains. Any pointer motion or key press
 * summons them back. This spec guards both directions.
 */

async function openFirstStory(page) {
  await page.goto('/app');
  await page.waitForLoadState('networkidle');

  const menuToggle = page.locator('[data-testid="menu-toggle"]');
  if (await menuToggle.isVisible()) {
    await menuToggle.click();
    await page.waitForTimeout(100);
  }

  const firstSource = page.locator('[data-testid="source-button"]').first();
  if (await firstSource.isVisible({ timeout: 2000 }).catch(() => false)) {
    await firstSource.click();
  }

  const firstStory = page.locator('[data-testid="story-button"]').first();
  await expect(firstStory).toBeVisible({ timeout: 5000 });
  await firstStory.click();
  await page.waitForSelector('[data-testid="reader-viewport"]');
}

test.describe('Paper UI: chrome recedes while reading', () => {
  test.beforeEach(async ({ page }) => {
    await disableAppAnimation(page);
  });

  test('nav bar is visible when the story opens', async ({ page }) => {
    await openFirstStory(page);
    const navBar = page.locator('[data-testid="nav-bar"]');
    await expect(navBar).toBeVisible();
    await expect(navBar).toHaveAttribute('aria-hidden', 'false');
  });

  test('nav bar fades after idle and returns on interaction', async ({ page }) => {
    await openFirstStory(page);
    const navBar = page.locator('[data-testid="nav-bar"]');
    await expect(navBar).toHaveAttribute('aria-hidden', 'false');

    // Wait past the 2.5s idle window; absolutely nothing happens while we wait.
    await page.waitForTimeout(3200);
    await expect(navBar).toHaveAttribute('aria-hidden', 'true');

    // A keypress wakes the chrome back up.
    await page.keyboard.press('ArrowDown');
    await expect(navBar).toHaveAttribute('aria-hidden', 'false');
  });
});
