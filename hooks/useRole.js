import { useState, useEffect } from 'react';
import { FEATURES } from '../features';

export const ROLES = ['guest', 'subscriber', 'tester', 'admin'];

export const ROLE_LABELS = {
  guest: 'Gast',
  subscriber: 'Abonnent',
  tester: 'Tester',
  admin: 'Admin',
};

function defaultRoleFeatures() {
  return { guest: [], subscriber: [], tester: [] };
}

/**
 * Role management hook.
 * Manages the current user role and which features are assigned to each role.
 * Admins see all features including unreleased ones and can assign features to roles.
 */
export function useRole() {
  const [role, setRoleState] = useState(() =>
    localStorage.getItem('wr-role') ?? 'guest'
  );

  const [roleFeatures, setRoleFeatures] = useState(() => {
    const stored = localStorage.getItem('wr-role-features');
    return stored ? JSON.parse(stored) : defaultRoleFeatures();
  });

  const setRole = (newRole) => setRoleState(newRole);

  useEffect(() => {
    localStorage.setItem('wr-role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('wr-role-features', JSON.stringify(roleFeatures));
  }, [roleFeatures]);

  const isAdmin = role === 'admin';

  // Admin sees all features; others see only features assigned to their role.
  const visibleFeatureKeys = new Set(
    isAdmin ? FEATURES.map((f) => f.key) : (roleFeatures[role] ?? [])
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
