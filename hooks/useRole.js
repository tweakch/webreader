import { useState, useEffect } from 'react';
import { FEATURES, getDefaultRoleFeatures } from '../src/lib/featureRegistry';
import { resolveFeatureVisibility } from '../src/lib/featurePolicy';

export const ROLES = ['guest', 'subscriber', 'tester', 'sales', 'admin'];

export const ROLE_LABELS = {
  guest: 'Gast',
  subscriber: 'Abonnent',
  tester: 'Tester',
  sales: 'Vertrieb',
  admin: 'Admin',
};

/**
 * Role management hook.
 * The default role→features mapping is derived from the registry, so adding a
 * feature requires editing one file (src/lib/featureRegistry.jsx) only. Admins
 * can still override the mapping via the profile panel — their overrides
 * persist in localStorage and take precedence over the registry defaults.
 */
export function useRole() {
  const [role, setRoleState] = useState(() =>
    localStorage.getItem('wr-role') ?? 'guest'
  );

  const [roleFeatures, setRoleFeatures] = useState(() => {
    const stored = localStorage.getItem('wr-role-features');
    return stored ? JSON.parse(stored) : getDefaultRoleFeatures();
  });

  const setRole = (newRole) => setRoleState(newRole);

  useEffect(() => {
    localStorage.setItem('wr-role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('wr-role-features', JSON.stringify(roleFeatures));
  }, [roleFeatures]);

  const isAdmin = role === 'admin';

  const visibleFeatureKeys = new Set(
    FEATURES
      .filter((entry) =>
        resolveFeatureVisibility({
          featureKey: entry.key,
          role,
          isAdmin,
          roleFeatures,
          registryDefaultRoles: entry.roles,
        }).visible,
      )
      .map((entry) => entry.key),
  );

  const isFeatureAssignedToRole = (featureKey, targetRole) =>
    (roleFeatures[targetRole] ?? []).includes(featureKey);

  const toggleFeatureForRole = (featureKey, targetRole) => {
    setRoleFeatures((prev) => {
      const list = prev[targetRole] ?? [];
      const has = list.includes(featureKey);
      return {
        ...prev,
        [targetRole]: has
          ? list.filter((k) => k !== featureKey)
          : [...list, featureKey],
      };
    });
  };

  return {
    role,
    setRole,
    isAdmin,
    roleFeatures,
    visibleFeatureKeys,
    isFeatureAssignedToRole,
    toggleFeatureForRole,
  };
}
