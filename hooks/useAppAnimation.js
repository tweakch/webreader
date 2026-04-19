import { useEffect, useState } from 'react';

/**
 * Resolves the user's app-animation variant and the active theme class used to
 * scope animation CSS variables.
 *
 * Sits above the React theme context (AppAnimationWrapper wraps the lazy
 * reader), so the hook reads from the same localStorage keys that
 * grimm-reader writes to and listens for cross-document changes.
 *
 *  variant:  'seal' | 'fade' | 'sparkle' | 'ink'          (persisted: wr-app-animation-variant)
 *  theme:    'light' | 'dark' | 'light-hc' | 'dark-hc'    (derived from wr-theme + system)
 *
 *  Returns class names ready to concatenate onto the wrapper:
 *    variantClass: `app-anim-<variant>`
 *    themeClass:   `app-theme-<theme>`
 */

export const APP_ANIMATION_VARIANTS = /** @type {const} */ (['seal', 'fade', 'sparkle', 'ink']);
const DEFAULT_VARIANT = 'seal';

function readVariant() {
  const raw = localStorage.getItem('wr-app-animation-variant');
  return APP_ANIMATION_VARIANTS.includes(raw) ? raw : DEFAULT_VARIANT;
}

function readThemeSetting() {
  return localStorage.getItem('wr-theme') ?? 'light';
}

function resolveTheme(setting, systemDark) {
  if (setting === 'system') return systemDark ? 'dark' : 'light';
  if (setting === 'light' || setting === 'dark' ||
      setting === 'light-hc' || setting === 'dark-hc') return setting;
  return 'light';
}

/**
 * App-shell animation + resolved-theme state, persisted to localStorage and
 * synchronised across tabs via the `storage` event and in-tab custom events.
 *
 * @returns {{
 *   variant: 'seal'|'fade'|'sparkle'|'ink',
 *   setVariant: (next: string) => void,
 *   theme: 'light'|'dark'|'light-hc'|'dark-hc',
 *   variantClass: string,
 *   themeClass: string,
 * }}
 */
export function useAppAnimation() {
  const [variant, setVariantState] = useState(readVariant);
  const [themeSetting, setThemeSetting] = useState(readThemeSetting);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Cross-tab + in-tab localStorage sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'wr-app-animation-variant') setVariantState(readVariant());
      if (e.key === 'wr-theme') setThemeSetting(readThemeSetting());
    };
    const onCustom = () => {
      setVariantState(readVariant());
      setThemeSetting(readThemeSetting());
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('wr:animation-variant-change', onCustom);
    window.addEventListener('wr:theme-change', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('wr:animation-variant-change', onCustom);
      window.removeEventListener('wr:theme-change', onCustom);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setVariant = (next) => {
    if (!APP_ANIMATION_VARIANTS.includes(next)) return;
    localStorage.setItem('wr-app-animation-variant', next);
    setVariantState(next);
    window.dispatchEvent(new Event('wr:animation-variant-change'));
  };

  const theme = resolveTheme(themeSetting, systemDark);

  return {
    variant,
    setVariant,
    theme,
    variantClass: `app-anim-${variant}`,
    themeClass: `app-theme-${theme}`,
  };
}
