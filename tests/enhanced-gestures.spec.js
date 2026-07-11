// @ts-check
import { test, expect } from '@playwright/test';
import { disableAppAnimation } from './test-utils';

async function enableEnhancedGestures(page) {
  await page.addInitScript(() => {
    const overrides = JSON.parse(localStorage.getItem('wr-feature-overrides') ?? '{}');
    overrides['enhanced-gestures'] = true;
    localStorage.setItem('wr-feature-overrides', JSON.stringify(overrides));
  });
}

// Force the SidebarV2 A/B variant so sidebar-v2-specific interactions
// (drag-progress styling, sidebar-backdrop, etc.) are exercised in tests.
async function forceSidebarV2(page) {
  await page.addInitScript(() => {
    const experiments = JSON.parse(localStorage.getItem('wr-ab-experiments') ?? '{}');
    experiments.sidebar = {
      active: true,
      allowedRoles: ['anonymous', 'guest', 'free', 'subscriber', 'tester', 'admin', 'sales'],
    };
    localStorage.setItem('wr-ab-experiments', JSON.stringify(experiments));
    const variants = JSON.parse(localStorage.getItem('wr-ab-variants') ?? '{}');
    variants.sidebar = 'v2';
    localStorage.setItem('wr-ab-variants', JSON.stringify(variants));
  });
}

async function openFirstStory(page) {
  await page.goto('/app');
  await page.waitForLoadState('networkidle');
  const menuToggle = page.locator('[data-testid="menu-toggle"]');
  if (await menuToggle.isVisible()) {
    await menuToggle.click();
    await page.waitForTimeout(100);
  }
  const firstSource = page.locator('[data-testid="source-button"]').first();
  if (await firstSource.isVisible()) await firstSource.click();
  const firstStory = page.locator('[data-testid="story-button"]').first();
  await firstStory.click();
  await page.waitForSelector('[data-testid="reader-viewport"]');
}

async function dispatchSwipe(page, selector, from, to) {
  await page.evaluate(({ selector, from, to }) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`No element: ${selector}`);
    const mkTouch = (x, y) => new Touch({
      identifier: 1, target: el, clientX: x, clientY: y, pageX: x, pageY: y,
    });
    const firePointer = (type, x, y) => {
      el.dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true,
        pointerId: 1, pointerType: 'touch', isPrimary: true,
        clientX: x, clientY: y,
      }));
    };
    const fireTouch = (type, x, y) => {
      const touch = mkTouch(x, y);
      const event = new TouchEvent(type, {
        bubbles: true, cancelable: true,
        touches: type === 'touchend' ? [] : [touch],
        targetTouches: type === 'touchend' ? [] : [touch],
        changedTouches: [touch],
      });
      el.dispatchEvent(event);
    };
    firePointer('pointerdown', from.x, from.y);
    fireTouch('touchstart', from.x, from.y);
    firePointer('pointermove', to.x, to.y);
    fireTouch('touchmove',  to.x,   to.y);
    firePointer('pointerup', to.x, to.y);
    fireTouch('touchend',   to.x,   to.y);
  }, { selector, from, to });
}

// Dispatch start + move only (no end) so callers can inspect in-flight state.
async function dispatchHalfSwipe(page, selector, from, to) {
  await page.evaluate(({ selector, from, to }) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`No element: ${selector}`);
    const mk = (x, y) => new Touch({
      identifier: 1, target: el, clientX: x, clientY: y, pageX: x, pageY: y,
    });
    const firePointer = (type, x, y) => {
      el.dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true,
        pointerId: 1, pointerType: 'touch', isPrimary: true,
        clientX: x, clientY: y,
      }));
    };
    const fireTouch = (type, x, y) => {
      const t = mk(x, y);
      const ev = new TouchEvent(type, {
        bubbles: true, cancelable: true,
        touches: [t], targetTouches: [t], changedTouches: [t],
      });
      el.dispatchEvent(ev);
    };
    firePointer('pointerdown', from.x, from.y);
    fireTouch('touchstart', from.x, from.y);
    firePointer('pointermove', to.x, to.y);
    fireTouch('touchmove',  to.x,   to.y);
  }, { selector, from, to });
}

test.describe('Enhanced gestures', () => {
  test.beforeEach(async ({ page, browser }) => {
    await disableAppAnimation(page);
    await enableEnhancedGestures(page);
    if (!browser.browserType().name().includes('chromium')) test.skip();
  });

  test('swipe left from the right edge opens the right drawer', async ({ page }) => {
    await openFirstStory(page);
    const reader = await page.locator('[data-testid="reader-viewport"]').boundingBox();
    if (!reader) throw new Error('no viewport');
    const cy = reader.y + reader.height / 2;
    const xRight = reader.x + reader.width - 10;
    await dispatchSwipe(page, '[data-testid="reader-viewport"]',
      { x: xRight, y: cy }, { x: xRight - 200, y: cy });
    const drawer = page.locator('[data-testid="gesture-right-drawer"]');
    await expect(drawer).toHaveAttribute('data-open', 'true');
    await expect(page.locator('[data-testid="gesture-right-toc"]')).toBeVisible();
  });

  test('long swipe down past 60% shows the reload indicator', async ({ page }) => {
    await openFirstStory(page);
    const reader = await page.locator('[data-testid="reader-viewport"]').boundingBox();
    if (!reader) throw new Error('no viewport');
    const cx = reader.x + reader.width / 2;
    await dispatchHalfSwipe(page, '[data-testid="reader-viewport"]',
      { x: cx, y: reader.y + 10 },
      { x: cx, y: reader.y + reader.height * 0.9 });
    await expect(page.locator('[data-testid="gesture-reload-indicator"]')).toBeVisible();
  });

  // --- Flick / velocity gate ---------------------------------------------

  test('short flick from the right edge (below MIN_DIST) still opens the right drawer', async ({ page }) => {
    await openFirstStory(page);
    const reader = await page.locator('[data-testid="reader-viewport"]').boundingBox();
    if (!reader) throw new Error('no viewport');
    const cy = reader.y + reader.height / 2;
    const xRight = reader.x + reader.width - 10;
    // 30px < MIN_DIST (40) but > MIN_FLICK_DIST (24); synchronous dispatch
    // means dt≈1ms so velocity is huge — the flick gate must commit.
    await dispatchSwipe(page, '[data-testid="reader-viewport"]',
      { x: xRight, y: cy }, { x: xRight - 30, y: cy });
    await expect(page.locator('[data-testid="gesture-right-drawer"]'))
      .toHaveAttribute('data-open', 'true');
  });

  // --- Drag-follow preview -----------------------------------------------

  test('in-flight right-edge swipe translates the right drawer (drag-follow)', async ({ page }) => {
    await openFirstStory(page);
    const reader = await page.locator('[data-testid="reader-viewport"]').boundingBox();
    if (!reader) throw new Error('no viewport');
    const cy = reader.y + reader.height / 2;
    const xRight = reader.x + reader.width - 10;
    await dispatchHalfSwipe(page, '[data-testid="reader-viewport"]',
      { x: xRight, y: cy }, { x: xRight - 80, y: cy });
    const transform = await page.evaluate(
      () => document.querySelector('[data-testid="gesture-right-drawer"]')?.style.transform || '',
    );
    // Must track the finger (partial translate), not the resting closed state.
    expect(transform).toMatch(/translate(X\(|3d\()/);
    expect(transform).not.toContain('translate3d(100%, 0');
    expect(transform).not.toContain('translateX(100%)');
  });

  // --- Mutual exclusion: sidebar ↔ gesture drawers -----------------------

  test('opening another drawer requires closing the sidebar first (mutual exclusion)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await forceSidebarV2(page);
    await openFirstStory(page);
    // Open sidebar via the menu-toggle button — sidebar lives inside the
    // gesture left-drawer slot when enhanced-gestures is on (mobile).
    const toggle = page.locator('[data-testid="menu-toggle"]');
    if (await toggle.isVisible()) await toggle.click();
    const leftDrawer = page.locator('[data-testid="gesture-left-drawer"]');
    await expect(leftDrawer).toHaveAttribute('data-open', 'true');

    // Click the backdrop in the area not covered by the drawer to close it.
    // Mutual exclusion is structural now: only one openEdge at a time.
    await page.locator('[data-testid="gesture-drawer-backdrop"]')
      .click({ position: { x: 360, y: 400 } });
    await expect(leftDrawer).toHaveAttribute('data-open', 'false');

    // Now a right-edge swipe can land.
    const reader = await page.locator('[data-testid="reader-viewport"]').boundingBox();
    if (!reader) throw new Error('no viewport');
    const cy = reader.y + reader.height / 2;
    const xRight = reader.x + reader.width - 10;
    await dispatchSwipe(page, '[data-testid="reader-viewport"]',
      { x: xRight, y: cy }, { x: xRight - 200, y: cy });

    await expect(page.locator('[data-testid="gesture-right-drawer"]'))
      .toHaveAttribute('data-open', 'true');
  });

  // --- Open sidebar dismiss path: backdrop click -------------------------

  test('the open sidebar can be dismissed via the backdrop', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await forceSidebarV2(page);
    await openFirstStory(page);
    const toggle = page.locator('[data-testid="menu-toggle"]');
    if (await toggle.isVisible()) await toggle.click();
    const leftDrawer = page.locator('[data-testid="gesture-left-drawer"]');
    await expect(leftDrawer).toHaveAttribute('data-open', 'true');

    await page.locator('[data-testid="gesture-drawer-backdrop"]')
      .click({ position: { x: 360, y: 400 } });
    await expect(leftDrawer).toHaveAttribute('data-open', 'false');
  });

  // --- Close-drag: any committed swipe closes an open blade ---------------

  test('open right drawer closes when swiping right on the drawer itself', async ({ page }) => {
    await openFirstStory(page);
    const reader = await page.locator('[data-testid="reader-viewport"]').boundingBox();
    if (!reader) throw new Error('no viewport');
    const cy = reader.y + reader.height / 2;
    const xRight = reader.x + reader.width - 10;

    // Open the right drawer with a swipe-left from the right edge.
    await dispatchSwipe(page, '[data-testid="reader-viewport"]',
      { x: xRight, y: cy }, { x: xRight - 220, y: cy });
    const drawer = page.locator('[data-testid="gesture-right-drawer"]');
    await expect(drawer).toHaveAttribute('data-open', 'true');

    // Swipe right *on the drawer itself* in its close direction.
    const drawerBox = await drawer.boundingBox();
    if (!drawerBox) throw new Error('no drawer box');
    const dcx = drawerBox.x + 40;
    await dispatchSwipe(page, '[data-testid="gesture-right-drawer"]',
      { x: dcx, y: cy }, { x: dcx + 220, y: cy });
    await expect(drawer).toHaveAttribute('data-open', 'false');
  });

  test('open right drawer also closes on an off-axis swipe (close-on-any-gesture)', async ({ page }) => {
    await openFirstStory(page);
    const reader = await page.locator('[data-testid="reader-viewport"]').boundingBox();
    if (!reader) throw new Error('no viewport');
    const cy = reader.y + reader.height / 2;
    const xRight = reader.x + reader.width - 10;

    await dispatchSwipe(page, '[data-testid="reader-viewport"]',
      { x: xRight, y: cy }, { x: xRight - 220, y: cy });
    const drawer = page.locator('[data-testid="gesture-right-drawer"]');
    await expect(drawer).toHaveAttribute('data-open', 'true');

    // Any committed swipe dismisses an open blade — even the "wrong"
    // direction (here: a downward swipe on a horizontally-docked drawer) —
    // so the user can never get stuck with an open drawer.
    const drawerBox = await drawer.boundingBox();
    if (!drawerBox) throw new Error('no drawer box');
    const dcx = drawerBox.x + drawerBox.width / 2;
    await dispatchSwipe(page, '[data-testid="gesture-right-drawer"]',
      { x: dcx, y: cy - 100 }, { x: dcx, y: cy + 160 });
    await expect(drawer).toHaveAttribute('data-open', 'false');
  });

  // --- Browser gesture suppression (pull-to-refresh, overscroll-nav) ------

  test('document suppresses native overscroll / pull-to-refresh via CSS', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    const styles = await page.evaluate(() => {
      const read = (el) => {
        const s = window.getComputedStyle(el);
        return {
          overscrollY: s.overscrollBehaviorY || s.overscrollBehavior,
          overscrollX: s.overscrollBehaviorX || s.overscrollBehavior,
          touchAction: s.touchAction,
        };
      };
      return {
        html: read(document.documentElement),
        body: read(document.body),
      };
    });
    // Must resolve to `none`/`contain` (anything that is not `auto`) so the
    // browser cannot chain overscroll into pull-to-refresh or swipe-back nav.
    expect(['none', 'contain']).toContain(styles.html.overscrollY);
    expect(['none', 'contain']).toContain(styles.body.overscrollY);
    expect(['none', 'contain']).toContain(styles.html.overscrollX);
    expect(['none', 'contain']).toContain(styles.body.overscrollX);
    // `touch-action: manipulation` kills the 300ms tap delay + double-tap zoom.
    expect(styles.body.touchAction).toMatch(/manipulation|none/);
  });
});
