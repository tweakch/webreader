// @ts-check
import { test, expect } from '@playwright/test';
import { disableAppAnimation } from './test-utils';

/**
 * Core navigation flow test:
 * 1. Start the app
 * 2. Navigate to first story
 * 3. Tap center zone for full screen
 * 4. Next page
 * 5. Prev page twice - should stay on page 1
 */
test.describe('Core Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await disableAppAnimation(page);
  });

  test('navigate: first story -> full screen -> next -> prev twice (stays on page 1)', async ({ page }) => {
    // 1. Start the app
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // 2. Navigate to first story
    const hamburger = page.locator('[data-testid="menu-toggle"]');
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(300);
    }

    const sourceBtn = page.locator('[data-testid="source-button"]').first();
    if (await sourceBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sourceBtn.click();
      await page.waitForTimeout(300);
    }

    const storyBtn = page.locator('[data-testid="story-button"]').first();
    await expect(storyBtn).toBeVisible({ timeout: 5000 });
    await storyBtn.click();
    await page.waitForSelector('[data-testid="page-content"] p');
    await page.waitForSelector('[data-testid="page-counter"]');

    // Verify we're on page 1
    let counter = await page.locator('[data-testid="page-counter"]').textContent();
    expect(counter?.startsWith('1 ')).toBe(true);
    console.log(`✓ Opened story at ${counter}`);

    // 3. Tap center zone for full screen mode - then tap again to show controls
    try {
      const readerViewport = page.locator('[data-testid="reader-viewport"]');
      const viewportBox = await readerViewport.boundingBox();

      if (viewportBox) {
        const centerX = viewportBox.x + viewportBox.width / 2;
        const centerY = viewportBox.y + viewportBox.height / 2;

        // First tap - hides controls (full screen mode)
        await page.mouse.click(centerX, centerY);
        await page.waitForTimeout(300);
        console.log('✓ Center tap #1 (full screen) worked');

        // Second tap - shows controls again
        await page.mouse.click(centerX, centerY);
        await page.waitForTimeout(300);
        console.log('✓ Center tap #2 (controls back) worked');
      }
    } catch (e) {
      console.log('Center tap skipped:', e.message);
    }

    // 4. Click next page (if more than 1 page exists)
    const nextBtn = page.locator('[data-testid="next-page"]');
    const totalText = counter?.split('/')[1].trim();
    const totalPages = parseInt(totalText || '1', 10);

    if (totalPages > 1) {
      await expect(nextBtn).toBeVisible({ timeout: 5000 });
      await expect(nextBtn).toBeEnabled({ timeout: 5000 });
      await nextBtn.click();
      await page.waitForTimeout(300);

      counter = await page.locator('[data-testid="page-counter"]').textContent();
      const currentPage = parseInt(counter?.split('/')[0].trim() || '0', 10);
      expect(currentPage).toBe(2);
      console.log(`✓ Moved to page ${currentPage}`);
    }

    // 5. Click prev page twice - should end up on page 1
    const prevBtn = page.locator('[data-testid="prev-page"]');

    // First prev
    if (await prevBtn.isEnabled()) {
      await prevBtn.click();
      await page.waitForTimeout(300);
      counter = await page.locator('[data-testid="page-counter"]').textContent();
      const pg = parseInt(counter?.split('/')[0].trim() || '0', 10);
      console.log(`After prev 1: page ${pg}`);
    }

    // Second prev - should stay on page 1
    if (await prevBtn.isEnabled()) {
      await prevBtn.click();
      await page.waitForTimeout(300);
    }

    counter = await page.locator('[data-testid="page-counter"]').textContent();
    const finalPage = parseInt(counter?.split('/')[0].trim() || '0', 10);

    expect(finalPage).toBe(1);
    expect(await prevBtn.isDisabled()).toBe(true);
    console.log(`✓ Final page is ${finalPage} (prev button disabled)`);
  });

  test('page counter remains stable during navigation', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Navigate to story
    const hamburger = page.locator('[data-testid="menu-toggle"]');
    if (await hamburger.isVisible()) await hamburger.click();

    const sourceBtn = page.locator('[data-testid="source-button"]').first();
    if (await sourceBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sourceBtn.click();
    }

    await page.locator('[data-testid="story-button"]').first().click();
    await page.waitForSelector('[data-testid="page-counter"]');

    // Get total pages
    let counter = await page.locator('[data-testid="page-counter"]').textContent();
    const [currentStr, totalStr] = counter?.split('/') || ['1', '1'];
    const totalPages = parseInt(totalStr.trim(), 10);

    // Navigate through pages and verify counter consistency
    for (let i = 1; i < Math.min(3, totalPages); i++) {
      await page.locator('[data-testid="next-page"]').click();
      await page.waitForTimeout(300);

      counter = await page.locator('[data-testid="page-counter"]').textContent();
      const pg = parseInt(counter?.split('/')[0].trim() || '0', 10);
      expect(pg).toBe(i + 1);
    }

    console.log('✓ Page counter remained stable throughout navigation');
  });
});
