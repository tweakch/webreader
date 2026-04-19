import { useState, useEffect } from 'react';
import { useBooleanFlagValue, useStringFlagValue } from '@openfeature/react-sdk';
import { FEATURE_REGISTRY, getRegistryMap } from '../src/lib/featureRegistry';
import { resolveFeature } from '../src/lib/featurePolicy';

const toShowKey = (key) =>
  'show' + key
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const BOOLEAN_ENTRIES = FEATURE_REGISTRY.filter((e) => e.kind === 'boolean');
const VARIANT_ENTRIES = FEATURE_REGISTRY.filter((e) => e.kind === 'variant');
const REGISTRY_MAP = getRegistryMap();

/**
 * Feature flag management hook.
 *
 * Iterates the unified registry to read raw OpenFeature values, applies the
 * pure `resolveFeature` policy (user overrides + release-readiness gate), and
 * exposes each boolean flag as `show<CamelCase>` for ergonomic destructuring.
 *
 * @param {object} [opts]
 * @param {'all'|'released-only'} [opts.releaseMode='all']
 *   When 'released-only', features whose registry status is not 'released' are
 *   forced off for non-privileged roles (admin/tester bypass the gate). Useful
 *   for locking down production builds.
 * @param {string} [opts.role]  Current role, used to evaluate the gate bypass.
 *
 * Adding a new flag? Edit src/lib/featureRegistry.jsx — this hook picks it up
 * automatically and the resolved value is available as `showXxx` (derived
 * from the registry key) plus `_rawFlagValues[key]`.
 */
export function useFeatureFlags({ releaseMode = 'all', role = 'guest' } = {}) {
  const rawBooleans = {};
  for (const entry of BOOLEAN_ENTRIES) {
    rawBooleans[entry.key] = useBooleanFlagValue(
      entry.key,
      entry.flag.variants[entry.flag.defaultVariant] ?? false,
    );
  }
  const rawVariants = {};
  for (const entry of VARIANT_ENTRIES) {
    rawVariants[entry.key] = useStringFlagValue(
      entry.key,
      entry.flag.defaultVariant,
    );
  }

  const [userFeatureOverrides, setUserFeatureOverrides] = useState(() =>
    JSON.parse(localStorage.getItem('wr-feature-overrides') ?? '{}'),
  );

  useEffect(() => {
    localStorage.setItem('wr-feature-overrides', JSON.stringify(userFeatureOverrides));
  }, [userFeatureOverrides]);

  const isAdmin = role === 'admin';
  const resolved = {};
  for (const entry of BOOLEAN_ENTRIES) {
    const { effective } = resolveFeature({
      featureKey: entry.key,
      registry: REGISTRY_MAP,
      role,
      isAdmin,
      // Release-gate scope: we care about the flag *value*, not role-based
      // visibility here. Passing an explicit truthy roleFeatures map keeps the
      // visibility layer out of the hook — useRole owns that separately.
      roleFeatures: { [role]: [entry.key] },
      userOverrides: userFeatureOverrides,
      rawFlagValue: rawBooleans[entry.key],
      releaseMode,
    });
    resolved[toShowKey(entry.key)] = effective;
  }

  const _o = (key, raw) => {
    const override = Object.hasOwn(userFeatureOverrides, key)
      ? userFeatureOverrides[key]
      : raw;
    return override;
  };

  const bigFontsVariant = rawVariants['big-fonts'] ?? 'off';
  const maxFontSize = { off: 28, big: 28, bigger: 34, biggest: 40 }[bigFontsVariant] ?? 28;
  const flagTheme = rawVariants['theme'] ?? 'light';

  return {
    ...resolved,
    _rawFlagValues: rawBooleans,
    userFeatureOverrides,
    setUserFeatureOverrides,
    _o,
    flagTheme,
    bigFontsVariant,
    maxFontSize,
  };
}
