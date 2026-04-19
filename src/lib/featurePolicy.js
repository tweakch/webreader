/**
 * Pure feature-resolution policy.
 *
 * These functions take plain data (no React, no localStorage, no OpenFeature)
 * and return the resolved state of a feature for a given (role × raw flag ×
 * user-override × release-mode) combination. All React hooks delegate to these
 * helpers so the policy is snapshot-testable in isolation.
 */

/**
 * Roles that can see beta/experimental features even in `released-only`
 * release mode. Kept here (not in the registry) because this is a deployment
 * policy, not per-feature metadata.
 */
export const RELEASE_GATE_BYPASS_ROLES = new Set(['admin', 'tester']);

export function resolveFeatureVisibility({
  featureKey,
  role,
  isAdmin,
  roleFeatures,
  registryDefaultRoles,
}) {
  if (isAdmin) return { visible: true, source: 'admin' };
  if (roleFeatures && Object.hasOwn(roleFeatures, role)) {
    return {
      visible: roleFeatures[role].includes(featureKey),
      source: 'user-role-map',
    };
  }
  return {
    visible: (registryDefaultRoles ?? []).includes(role),
    source: 'registry-default',
  };
}

export function resolveFeatureValue({
  featureKey,
  rawFlagValue,
  userOverrides,
}) {
  if (userOverrides && Object.hasOwn(userOverrides, featureKey)) {
    return { value: userOverrides[featureKey], source: 'user-override' };
  }
  return { value: rawFlagValue, source: 'raw-flag' };
}

export function resolveFeature({
  featureKey,
  registry,
  role,
  isAdmin,
  roleFeatures,
  userOverrides,
  rawFlagValue,
  releaseMode = 'all',
}) {
  const entry = registry[featureKey];
  if (!entry) {
    return {
      visible: false,
      value: false,
      effective: false,
      status: null,
      source: 'unknown',
      valueSource: 'unknown',
    };
  }

  const { visible, source: visSource } = resolveFeatureVisibility({
    featureKey,
    role,
    isAdmin,
    roleFeatures,
    registryDefaultRoles: entry.roles,
  });

  const { value, source: valSource } = resolveFeatureValue({
    featureKey,
    rawFlagValue,
    userOverrides,
  });

  let effectiveVisible = visible;
  let source = visSource;
  if (
    releaseMode === 'released-only' &&
    entry.status !== 'released' &&
    !RELEASE_GATE_BYPASS_ROLES.has(role)
  ) {
    effectiveVisible = false;
    source = 'release-gate';
  }

  return {
    visible: effectiveVisible,
    value,
    effective: effectiveVisible && Boolean(value),
    status: entry.status,
    source,
    valueSource: valSource,
  };
}

export function resolveAllFeatures({
  registry,
  role,
  isAdmin,
  roleFeatures,
  userOverrides,
  rawFlagValues,
  releaseMode = 'all',
}) {
  const result = {};
  for (const key of Object.keys(registry)) {
    result[key] = resolveFeature({
      featureKey: key,
      registry,
      role,
      isAdmin,
      roleFeatures,
      userOverrides,
      rawFlagValue: rawFlagValues?.[key] ?? false,
      releaseMode,
    });
  }
  return result;
}
