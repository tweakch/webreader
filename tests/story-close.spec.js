// @ts-check
import { test, expect } from '@playwright/test';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Open the sidebar (hamburger visible only below lg breakpoint),
 * drill into the first source, and open the first story.
 */
async function openFirstStory(page) {
  const hamburger = page.locator('[data-testid="menu-toggle"]');
  if (await hamburger.isVisible()) {
    await hamburger.click();
  }
  await page.locator('[data-testid="source-button"]').first().click();
  await page.locator('[data-testid="story-button"]').first().click();
  // Wait until page-content is rendered and at least one paragraph exists
  await page.waitForSelector('[data-testid="page-content"] p');
}

/**
 * Navigate to the last page of a story using the next-page button.
 */
async function navigateToLastPage(page) {
  const counterText = await page.locator('[data-testid="page-counter"]').textContent();
  const total = parseInt(counterText.split('/')[1].trim(), 10);

  // If already on last page, return
  const currentText = await page.locator('[data-testid="page-counter"]').textContent();
  const current = parseInt(currentText.split('/')[0].trim(), 10);
  if (current === total) return;

  // Navigate to last page
  for (let i = current; i < total; i++) {
    await page.locator('[data-testid="next-page"]').click();
    await page.waitForTimeout(150);
  }
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('Schließen (Close) Button', () => {
  test('close button appears only on the last page', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);

    const counterText = await page.locator('[data-testid="page-counter"]').textContent();
    const total = parseInt(counterText.split('/')[1].trim(), 10);

    // Check first page - button should not be visible
    let closeButton = page.locator('[data-testid="story-close"]');
    await expect(closeButton).not.toBeVisible();

    // Navigate through pages
    if (total > 1) {
      for (let i = 1; i < total; i++) {
        await page.locator('[data-testid="next-page"]').click();
        await page.waitForTimeout(150);

        // Before last page - button should not be visible
        if (i < total - 1) {
          closeButton = page.locator('[data-testid="story-close"]');
          await expect(closeButton).not.toBeVisible();
        }
      }

      // On last page - button should be visible
      closeButton = page.locator('[data-testid="story-close"]');
      await expect(closeButton).toBeVisible();
    }
  });

  test('close button is clickable on last page', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    await navigateToLastPage(page);

    const closeButton = page.locator('[data-testid="story-close"]');
    await expect(closeButton).toBeEnabled();

    // Verify the button has the correct text
    await expect(closeButton).toContainText('Schließen');
  });

  test('clicking close button returns to story list', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);

    // Verify story is open
    const pageContent = page.locator('[data-testid="page-content"]');
    await expect(pageContent).toBeVisible();

    await navigateToLastPage(page);

    // Click the close button
    const closeButton = page.locator('[data-testid="story-close"]');
    await closeButton.click();

    // Wait for navigation
    await page.waitForTimeout(300);

    // Verify story is closed (page-content should not be visible)
    await expect(pageContent).not.toBeVisible();

    // Verify the menu is back to initial state (sidebar should be collapsible)
    const pageCounter = page.locator('[data-testid="page-counter"]');
    await expect(pageCounter).not.toBeVisible();
  });

  test('close button has X icon', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    await navigateToLastPage(page);

    const closeButton = page.locator('[data-testid="story-close"]');

    // Check for SVG icon (lucide-react X icon)
    const icon = closeButton.locator('svg');
    await expect(icon).toBeVisible();
  });

  test('close button has correct title attribute', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    await navigateToLastPage(page);

    const closeButton = page.locator('[data-testid="story-close"]');
    await expect(closeButton).toHaveAttribute('title', 'Zur Übersicht');
  });

  test('close button styling in light mode', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    await navigateToLastPage(page);

    const closeButton = page.locator('[data-testid="story-close"]');

    // Check that button is visible and has expected classes
    await expect(closeButton).toHaveClass(/px-4/);
    await expect(closeButton).toHaveClass(/py-2/);
    await expect(closeButton).toHaveClass(/rounded-xl/);
    await expect(closeButton).toHaveClass(/transition-colors/);
  });

  test('close button is keyboard accessible', async ({ page }) => {
    await page.goto('/app');
    await openFirstStory(page);
    await navigateToLastPage(page);

    // Get the close button
    const closeButton = page.locator('[data-testid="story-close"]');

    const pageContent = page.locator('[data-testid="page-content"]');
    await expect(pageContent).toBeVisible();

    // Focus and activate the button programmatically
    await closeButton.focus();
    await closeButton.press('Enter');

    await page.waitForTimeout(300);

    // Verify story was closed
    await expect(pageContent).not.toBeVisible();
  });

  test('close button is visible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/app');
    await openFirstStory(page);
    await navigateToLastPage(page);

    const closeButton = page.locator('[data-testid="story-close"]');
    await expect(closeButton).toBeVisible();
    await expect(closeButton).toBeEnabled();
    await expect(closeButton).toContainText('Schließen');
  });

  test('close button is visible on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/app');
    await openFirstStory(page);
    await navigateToLastPage(page);

    const closeButton = page.locator('[data-testid="story-close"]');
    await expect(closeButton).toBeVisible();
    await expect(closeButton).toBeEnabled();
    await expect(closeButton).toContainText('Schließen');
  });

  test('close button closes story even after reaching end via prev/next navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/app');
    await openFirstStory(page);

    // Get total pages
    const counterText = await page.locator('[data-testid="page-counter"]').textContent();
    const total = parseInt(counterText.split('/')[1].trim(), 10);

    if (total > 1) {
      // Navigate to second-to-last page
      for (let i = 1; i < total - 1; i++) {
        await page.locator('[data-testid="next-page"]').click();
        await page.waitForTimeout(150);
      }

      // Close button should not be visible
      let closeButton = page.locator('[data-testid="story-close"]');
      await expect(closeButton).not.toBeVisible();

      // Go to last page
      await page.locator('[data-testid="next-page"]').click();
      await page.waitForTimeout(150);

      // Close button should now be visible
      closeButton = page.locator('[data-testid="story-close"]');
      await expect(closeButton).toBeVisible();

      // Click it and verify
      await closeButton.click();
      await page.waitForTimeout(200);

      const pageContent = page.locator('[data-testid="page-content"]');
      await expect(pageContent).not.toBeVisible();
    }
  });
});
