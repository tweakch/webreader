import { useState, useEffect, useCallback } from 'react';
import { AB_EXPERIMENTS, AB_DEFAULT_CONFIG, getExperiment } from '../src/lib/abExperiments';

const CONFIG_KEY = 'wr-ab-experiments';
const VARIANTS_KEY = 'wr-ab-variants';

/**
 * A/B testing hook.
 *
 * Two persisted stores:
 *   - wr-ab-experiments: admin-controlled config per experiment
 *       { [expId]: { active: boolean, allowedRoles: string[] } }
 *   - wr-ab-variants: user-selected variant per experiment
 *       { [expId]: variantId }
 *
 * Returns resolved variants (user choice when allowed, otherwise defaultVariant)
 * plus admin and user mutators.
 */
export function useABTesting({ role, isAdmin }) {
  const [config, setConfig] = useState(() => {
    const stored = localStorage.getItem(CONFIG_KEY);
    return stored ? JSON.parse(stored) : AB_DEFAULT_CONFIG;
  });

  const [userVariants, setUserVariants] = useState(() => {
    const stored = localStorage.getItem(VARIANTS_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(VARIANTS_KEY, JSON.stringify(userVariants));
  }, [userVariants]);

  const getExperimentConfig = useCallback(
    (id) => config[id] ?? { active: false, allowedRoles: [] },
    [config],
  );

  const hasAccess = useCallback(
    (id) => {
      const cfg = getExperimentConfig(id);
      if (!cfg.active) return false;
      if (isAdmin) return true;
      return cfg.allowedRoles.includes(role);
    },
    [getExperimentConfig, role, isAdmin],
  );

  const getVariant = useCallback(
    (id) => {
      const exp = getExperiment(id);
      if (!exp) return null;
      if (!hasAccess(id)) return exp.defaultVariant;
      const picked = userVariants[id];
      const isValid = picked && exp.variants.some((v) => v.id === picked);
      return isValid ? picked : exp.defaultVariant;
    },
    [userVariants, hasAccess],
  );

  // Admin mutators
  const setExperimentActive = useCallback((id, active) => {
    setConfig((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { allowedRoles: [] }), active },
    }));
  }, []);

  const toggleRoleAccess = useCallback((id, targetRole) => {
    setConfig((prev) => {
      const cur = prev[id] ?? { active: false, allowedRoles: [] };
      const has = cur.allowedRoles.includes(targetRole);
      return {
        ...prev,
        [id]: {
          ...cur,
          allowedRoles: has
            ? cur.allowedRoles.filter((r) => r !== targetRole)
            : [...cur.allowedRoles, targetRole],
        },
      };
    });
  }, []);

  const revokeExperiment = useCallback((id) => {
    setConfig((prev) => ({
      ...prev,
      [id]: { active: false, allowedRoles: [] },
    }));
  }, []);

  // User mutator
  const selectVariant = useCallback((id, variantId) => {
    setUserVariants((prev) => ({ ...prev, [id]: variantId }));
  }, []);

  const accessibleExperiments = AB_EXPERIMENTS.filter((e) => hasAccess(e.id));

  return {
    experiments: AB_EXPERIMENTS,
    config,
    userVariants,
    accessibleExperiments,
    getExperimentConfig,
    getVariant,
    hasAccess,
    setExperimentActive,
    toggleRoleAccess,
    revokeExperiment,
    selectVariant,
  };
}
