import { useState, useEffect } from 'react';
import { FEATURES } from '../features';

export const ROLES = ['guest', 'subscriber', 'tester', 'sales', 'admin'];

export const ROLE_LABELS = {
  guest: 'Gast',
  subscriber: 'Abonnent',
  tester: 'Tester',
  sales: 'Vertrieb',
  admin: 'Admin',
};

function defaultRoleFeatures() {
  return {
    guest: [
      'favorites',
      'high-contrast-theme',
      'audio-player',
      'attribution',
      'typography-panel',
      'tap-middle-toggle',
      'tap-zones',
      'eink-flash',
      'pinch-font-size',
      'font-size-controls',
      'favorites-only-toggle',
    ],
    subscriber: [
      'favorites',
      'favorites-only-toggle',
      'word-count',
      'reading-duration',
      'font-size-controls',
      'pinch-font-size',
      'eink-flash',
      'tap-zones',
      'tap-middle-toggle',
      'adaption-switcher',
      'typography-panel',
      'attribution',
      'audio-player',
      'word-blacklist',
      'deep-search',
      'story-directories',
      'high-contrast-theme',
      'speed-reader',
      'speedreader-orp',
      'subscriber-fonts',
      'ab-testing',
    ],
    tester: [
      'favorites',
      'favorites-only-toggle',
      'word-count',
      'reading-duration',
      'font-size-controls',
      'pinch-font-size',
      'eink-flash',
      'tap-zones',
      'tap-middle-toggle',
      'adaption-switcher',
      'typography-panel',
      'attribution',
      'audio-player',
      'read-along',
      'illustrations',
      'child-profile',
      'story-quiz',
      'text-to-speech',
      'word-blacklist',
      'deep-search',
      'story-directories',
      'simplified-ui',
      'high-contrast-theme',
      'speed-reader',
      'debug-badges',
      'speedreader-orp',
      'subscriber-fonts',
      'error-page-simulator',
      'ab-testing',
    ],
    sales: [
      'favorites',
      'favorites-only-toggle',
      'word-count',
      'reading-duration',
      'font-size-controls',
      'pinch-font-size',
      'eink-flash',
      'tap-zones',
      'tap-middle-toggle',
      'adaption-switcher',
      'typography-panel',
      'attribution',
      'audio-player',
      'story-directories',
      'high-contrast-theme',
      'subscriber-fonts',
      'tier-badge',
      'paywall',
      'upgrade-cta',
      'trial-banner',
      'pricing-page',
      'promo-code',
      'referral-program',
      'sales-mode',
      'conversion-analytics',
      'billing-portal-stub',
      'ab-testing',
    ],
  };
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
