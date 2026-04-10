// @ts-check
import { test, expect } from '@playwright/test';

test.describe('App Swipe to Unlock & Close', () => {
  
  test('should show lock screen on load and unlock on swipe up', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Verify lock screen is visible
    const lockScreen = page.locator('[data-testid="lock-screen"]');
    await expect(lockScreen).toBeVisible();
    await expect(lockScreen).toContainText('Swipe up to unlock');

    // Simulate swipe up
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Viewport size not found');
    const x = viewport.width / 2;
    const yStart = viewport.height * 0.8;
    const yEnd = viewport.height * 0.2;

    await page.mouse.move(x, yStart);
    await page.mouse.down();
    await page.mouse.move(x, yEnd, { steps: 10 });
    await page.mouse.up();

    // Verify lock screen is gone
    await expect(lockScreen).not.toBeAttached();
  });

  test('should show lock screen on close request and close on swipe down', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Unlock first
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Viewport size not found');
    const x = viewport.width / 2;
    await page.mouse.move(x, viewport.height * 0.8);
    await page.mouse.down();
    await page.mouse.move(x, viewport.height * 0.2, { steps: 5 });
    await page.mouse.up();
    await expect(page.locator('[data-testid="lock-screen"]')).not.toBeAttached();

    // Trigger close (open sidebar first)
    const menuToggle = page.locator('[data-testid="menu-toggle"]');
    if (await menuToggle.isVisible()) {
      await menuToggle.click();
      await page.waitForTimeout(300);
    }
    
    const closeBtn = page.locator('[data-testid="close-app-button"]');
    await closeBtn.click();

    // Verify lock screen reappears with "Swipe down to close"
    const lockScreen = page.locator('[data-testid="lock-screen"]');
    await expect(lockScreen).toBeVisible();
    await expect(lockScreen).toContainText('Swipe down to close');

    // Simulate swipe down
    await page.mouse.move(x, viewport.height * 0.2);
    await page.mouse.down();
    await page.mouse.move(x, viewport.height * 0.8, { steps: 10 });
    await page.mouse.up();

    // Verify redirection to home page
    await page.waitForURL('/');
    expect(page.url()).toBe(page.context()._options?.baseURL + '/');
  });
});
