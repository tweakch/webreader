/**
 * Explicitly disables the app-animation feature flag via localStorage override.
 * This should be called in a beforeEach hook for tests that don't specifically
 * test the app-animation / lock-screen flow.
 */
export async function disableAppAnimation(page) {
  await page.addInitScript(() => {
    const overrides = JSON.parse(localStorage.getItem('wr-feature-overrides') ?? '{}');
    overrides['app-animation'] = false;
    localStorage.setItem('wr-feature-overrides', JSON.stringify(overrides));
  });
}

/**
 * Explicitly enables the app-animation feature flag.
 */
export async function enableAppAnimation(page) {
  await page.addInitScript(() => {
    const overrides = JSON.parse(localStorage.getItem('wr-feature-overrides') ?? '{}');
    overrides['app-animation'] = true;
    localStorage.setItem('wr-feature-overrides', JSON.stringify(overrides));
  });
}
