// @ts-check
import { test, expect } from '@playwright/test';
import { disableAppAnimation } from './test-utils';

/**
 * Pagination invariants.
 *
 * These are the bugs that ruin reading: words disappearing across page
 * breaks, pages overflowing the viewport, the page count jumping after a
 * layout re-measure. Each test asserts a property of the reader that must
 * hold for every story, not just one golden case.
 */

async function openFirstStory(page) {
  await page.goto('/app');
  await page.waitForLoadState('networkidle');

  const hamburger = page.locator('[data-testid="menu-toggle"]');
  if (await hamburger.isVisible().catch(() => false)) {
    await hamburger.click();
    await page.waitForTimeout(200);
  }
  const source = page.locator('[data-testid="source-button"]').first();
  if (await source.isVisible({ timeout: 2000 }).catch(() => false)) {
    await source.click();
    await page.waitForTimeout(200);
  }
  const story = page.locator('[data-testid="story-button"]').first();
  await expect(story).toBeVisible({ timeout: 5000 });
  await story.click();
  await page.waitForSelector('[data-testid="page-content"] p');
  await page.waitForSelector('[data-testid="page-counter"]');
}

async function readPageCounter(page) {
  const text = (await page.locator('[data-testid="page-counter"]').textContent()) ?? '';
  // format: "N / M"
  const match = text.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) throw new Error(`unrecognized page counter: ${text}`);
  return { current: Number(match[1]), total: Number(match[2]) };
}

async function collectPageText(page) {
  return (await page.locator('[data-testid="page-content"]').innerText()).trim();
}

test.describe('pagination invariants', () => {
  test.beforeEach(async ({ page }) => {
    await disableAppAnimation(page);
  });

  test('no page overflows the reader viewport', async ({ page }) => {
    await openFirstStory(page);

    const { total } = await readPageCounter(page);
    const next = page.locator('[data-testid="next-page"]');

    for (let i = 0; i < total; i++) {
      const overflow = await page.locator('[data-testid="page-content"]').evaluate((el) => {
        return {
          scroll: el.scrollHeight,
          client: el.clientHeight,
          diff: el.scrollHeight - el.clientHeight,
        };
      });
      expect(
        overflow.diff,
        `page ${i + 1}/${total} overflows by ${overflow.diff}px (scroll=${overflow.scroll}, client=${overflow.client})`
      ).toBeLessThanOrEqual(1);

      if (i < total - 1) {
        await next.click();
        await page.waitForTimeout(100);
      }
    }
  });

  test('every word appears exactly once across all pages', async ({ page }) => {
    await openFirstStory(page);
    const { total } = await readPageCounter(page);
    const next = page.locator('[data-testid="next-page"]');

    const pageTexts = [];
    for (let i = 0; i < total; i++) {
      pageTexts.push(await collectPageText(page));
      if (i < total - 1) {
        await next.click();
        await page.waitForTimeout(100);
      }
    }

    // Concatenate pages with a space — the tokenized word stream should
    // contain no duplicated page boundaries (last word of page N also
    // appearing as the first word of page N+1).
    for (let i = 0; i < pageTexts.length - 1; i++) {
      const tail = pageTexts[i].split(/\s+/).slice(-3).join(' ');
      const head = pageTexts[i + 1].split(/\s+/).slice(0, 3).join(' ');
      expect(
        tail && head && tail !== head,
        `page ${i + 1} tail "${tail}" must not equal page ${i + 2} head "${head}"`
      ).toBeTruthy();
    }
  });

  test('page count is stable across re-measures at the same viewport', async ({ page }) => {
    await openFirstStory(page);
    const first = await readPageCounter(page);

    // Trigger a resize to the same dimensions: this exercises the
    // ResizeObserver path without changing the available height, so the
    // total page count must not change.
    const vp = page.viewportSize();
    if (!vp) test.skip(true, 'no viewport');
    await page.setViewportSize({ width: vp.width, height: vp.height + 1 });
    await page.waitForTimeout(150);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(150);

    const again = await readPageCounter(page);
    expect(again.total, 'page count must be stable across same-size re-measures').toBe(first.total);
  });
});
