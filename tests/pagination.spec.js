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
 * Adjust the font-size control to `target` (valid: 14–28, step 2).
 * The default on load is 18.
 */
async function setFontSize(page, target) {
  const currentText = await page.locator('[data-testid="page-counter"]')
    .evaluate(() => {
      // Font size is shown in a separate span in the header, not the counter.
      // Read it from the DOM instead.
      return null;
    });
  void currentText;

  // Read the current value from the header span (sibling of the +/- buttons)
  const fontSpan = page.locator('header span.tabular-nums, header span.w-12');
  let current = parseInt(await fontSpan.textContent(), 10);

  while (current !== target) {
    if (current < target) {
      await page.locator('[data-testid="font-increase"]').click();
      current += 2;
    } else {
      await page.locator('[data-testid="font-decrease"]').click();
      current -= 2;
    }
    // Wait for pages to rebuild after each font change
    await page.waitForFunction(
      (expected) => {
        const span = document.querySelector('header span');
        return span && parseInt(span.textContent, 10) === expected;
      },
      current,
    );
  }
  // Give useLayoutEffect one frame to rebuild pages
  await page.waitForTimeout(50);
}

/**
 * Core assertion: no paragraph on the current page may extend below
 * the top edge of the nav bar.
 */
async function assertNoParagraphBehindNavBar(page) {
  const navBox = await page.locator('[data-testid="nav-bar"]').boundingBox();
  expect(navBox, 'nav-bar must be visible').not.toBeNull();

  const paragraphs = await page.locator('[data-testid="page-content"] p').all();
  expect(paragraphs.length, 'at least one paragraph must be rendered').toBeGreaterThan(0);

  for (const para of paragraphs) {
    const box = await para.boundingBox();
    if (!box) continue; // hidden / zero-size paragraphs are fine
    const paraBottom = box.y + box.height;
    expect(
      paraBottom,
      `paragraph bottom (${paraBottom.toFixed(1)}) must not exceed nav-bar top (${navBox.y.toFixed(1)})`,
    ).toBeLessThanOrEqual(navBox.y + 2); // +2 px tolerance for sub-pixel rounding
  }
}

/**
 * Assert no paragraph extends above the reading viewport top edge
 * (i.e. behind the header).
 */
async function assertNoParagraphBehindHeader(page) {
  const viewportBox = await page.locator('[data-testid="reader-viewport"]').boundingBox();
  expect(viewportBox, 'reader-viewport must be visible').not.toBeNull();

  const paragraphs = await page.locator('[data-testid="page-content"] p').all();
  for (const para of paragraphs) {
    const box = await para.boundingBox();
    if (!box) continue;
    expect(
      box.y,
      `paragraph top (${box.y.toFixed(1)}) must not be above viewport top (${viewportBox.y.toFixed(1)})`,
    ).toBeGreaterThanOrEqual(viewportBox.y - 2);
  }
}

/**
 * Assert that the dead space between the last paragraph and the nav bar
 * is no more than one line of text (fontSize * lineHeight).
 * Only checked on non-last pages — the final page of a story can legitimately
 * end early.
 */
async function assertDeadSpaceWithinOneLine(page, isLastPage) {
  if (isLastPage) return;

  const navBox = await page.locator('[data-testid="nav-bar"]').boundingBox();
  expect(navBox).not.toBeNull();

  // Get the font size from the header span
  const fontSizeText = await page.locator('header span.w-12').textContent();
  const fontSize = parseInt(fontSizeText, 10) || 18;
  const lineHeight = fontSize * 1.8;

  const paragraphs = page.locator('[data-testid="page-content"] p');
  const count = await paragraphs.count();
  if (count === 0) return;

  const lastParaBox = await paragraphs.nth(count - 1).boundingBox();
  if (!lastParaBox) return;

  // Subtract structural spacing (bottom padding of the reading area + last paragraph's
  // margin-bottom) so we only measure the actual unused content space, not CSS chrome.
  const bottomPadding = await page.locator('[data-testid="page-content"]').evaluate(el =>
    parseFloat(window.getComputedStyle(el).paddingBottom)
  );
  const lastParaMargin = await paragraphs.nth(count - 1).evaluate(el =>
    parseFloat(window.getComputedStyle(el).marginBottom)
  );

  const deadSpace = navBox.y - (lastParaBox.y + lastParaBox.height);
  const contentDeadSpace = deadSpace - bottomPadding - lastParaMargin;
  expect(
    contentDeadSpace,
    `dead space below last paragraph (${contentDeadSpace.toFixed(1)}px content + ${bottomPadding}px padding + ${lastParaMargin}px margin) exceeds one line height (${lineHeight.toFixed(1)}px at fontSize ${fontSize})`,
  ).toBeLessThanOrEqual(lineHeight + 4); // +4px tolerance for subpixel rounding
}

/**
 * Walk through all pages of the currently-open story and run assertions
 * on each one.
 */
async function assertAllPages(page) {
  // Wait for pages to be ready
  await page.waitForSelector('[data-testid="page-counter"]');

  const counterText = await page.locator('[data-testid="page-counter"]').textContent();
  const total = parseInt(counterText.split('/')[1].trim(), 10);
  expect(total).toBeGreaterThan(0);

  for (let i = 0; i < total; i++) {
    // Confirm we're on the right page
    await expect(page.locator('[data-testid="page-counter"]')).toContainText(
      `${i + 1} / ${total}`,
    );

    await assertNoParagraphBehindNavBar(page);
    await assertNoParagraphBehindHeader(page);
    await assertDeadSpaceWithinOneLine(page, i === total - 1);

    if (i < total - 1) {
      await page.locator('[data-testid="next-page"]').click();
      // Wait for the new page to render (flash + state update)
      await page.waitForTimeout(200);
    }
  }
}

// ─── Viewport × Font-size matrix ────────────────────────────────────────────

const VIEWPORTS = [
  { width: 390, height: 844, label: 'mobile (390×844)' },
  { width: 768, height: 1024, label: 'tablet (768×1024)' },
  { width: 1440, height: 900, label: 'desktop (1440×900)' },
];

const FONT_SIZES = [14, 18, 28];

// ─── Tests ──────────────────────────────────────────────────────────────────

for (const vp of VIEWPORTS) {
  test.describe(`viewport: ${vp.label}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('paragraphs are visible at default font size', async ({ page }) => {
      await page.goto('/app');
      await openFirstStory(page);
      await assertAllPages(page);
    });

    for (const fs of FONT_SIZES) {
      test(`paragraphs are visible at font size ${fs}px`, async ({ page }) => {
        await page.goto('/app');
        await openFirstStory(page);
        await setFontSize(page, fs);
        await assertAllPages(page);
      });
    }
  });
}

// ─── Edge cases ─────────────────────────────────────────────────────────────

test.describe('edge cases', () => {
  test('switching stories resets to page 1', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/app');
    await openFirstStory(page);

    // Navigate forward a couple of pages
    const counterText = await page.locator('[data-testid="page-counter"]').textContent();
    const total = parseInt(counterText.split('/')[1].trim(), 10);
    if (total > 2) {
      await page.locator('[data-testid="next-page"]').click();
      await page.waitForTimeout(200);
      await page.locator('[data-testid="next-page"]').click();
      await page.waitForTimeout(200);
    }

    // Open sidebar and pick second story
    const hamburger = page.locator('[data-testid="menu-toggle"]');
    if (await hamburger.isVisible()) await hamburger.click();
    const second = page.locator('[data-testid="story-button"]').nth(1);
    if (await second.count() > 0) {
      await second.click();
      await page.waitForSelector('[data-testid="page-content"] p');
    }

    await expect(page.locator('[data-testid="page-counter"]')).toContainText('1 /');
  });

  test('increasing font size does not push text behind nav bar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/app');
    await openFirstStory(page);

    // Max out the font size
    await setFontSize(page, 28);
    await assertNoParagraphBehindNavBar(page);
  });

  test('decreasing font size does not push text behind nav bar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/app');
    await openFirstStory(page);

    // Min font size — more text fits per page
    await setFontSize(page, 14);
    await assertAllPages(page);
  });

  test('prev/next page buttons are disabled at boundaries', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/app');
    await openFirstStory(page);

    // First page: prev must be disabled
    await expect(page.locator('[data-testid="prev-page"]')).toBeDisabled();

    // Navigate to last page
    const counterText = await page.locator('[data-testid="page-counter"]').textContent();
    const total = parseInt(counterText.split('/')[1].trim(), 10);
    for (let i = 1; i < total; i++) {
      await page.locator('[data-testid="next-page"]').click();
      await page.waitForTimeout(150);
    }

    // Last page: next must be disabled
    await expect(page.locator('[data-testid="next-page"]')).toBeDisabled();
  });
});
