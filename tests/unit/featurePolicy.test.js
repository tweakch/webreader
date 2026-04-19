import {
  resolveFeatureVisibility,
  resolveFeatureValue,
  resolveFeature,
  resolveAllFeatures,
} from '../../src/lib/featurePolicy';

const REGISTRY = {
  favorites: {
    key: 'favorites',
    kind: 'boolean',
    flag: { defaultVariant: 'on', variants: { on: true, off: false } },
    status: 'released',
    roles: ['guest', 'subscriber', 'tester', 'sales'],
  },
  'speed-reader': {
    key: 'speed-reader',
    kind: 'boolean',
    flag: { defaultVariant: 'off', variants: { on: true, off: false } },
    status: 'beta',
    roles: ['subscriber', 'tester'],
  },
  'error-page-simulator': {
    key: 'error-page-simulator',
    kind: 'boolean',
    flag: { defaultVariant: 'off', variants: { on: true, off: false } },
    status: 'experimental',
    roles: ['tester'],
  },
};

describe('resolveFeatureVisibility', () => {
  it('is always visible for admin', () => {
    const result = resolveFeatureVisibility({
      featureKey: 'error-page-simulator',
      role: 'admin',
      isAdmin: true,
      roleFeatures: null,
      registryDefaultRoles: ['tester'],
    });
    expect(result.visible).toBe(true);
    expect(result.source).toBe('admin');
  });

  it('uses the stored roleFeatures map when provided', () => {
    const result = resolveFeatureVisibility({
      featureKey: 'favorites',
      role: 'guest',
      isAdmin: false,
      roleFeatures: { guest: ['favorites', 'attribution'] },
      registryDefaultRoles: [],
    });
    expect(result.visible).toBe(true);
    expect(result.source).toBe('user-role-map');
  });

  it('excludes features not in the stored roleFeatures map', () => {
    const result = resolveFeatureVisibility({
      featureKey: 'speed-reader',
      role: 'guest',
      isAdmin: false,
      roleFeatures: { guest: ['favorites'] },
      registryDefaultRoles: ['subscriber', 'tester'],
    });
    expect(result.visible).toBe(false);
    expect(result.source).toBe('user-role-map');
  });

  it('falls back to the registry default when no roleFeatures map is stored', () => {
    const result = resolveFeatureVisibility({
      featureKey: 'speed-reader',
      role: 'subscriber',
      isAdmin: false,
      roleFeatures: null,
      registryDefaultRoles: ['subscriber', 'tester'],
    });
    expect(result.visible).toBe(true);
    expect(result.source).toBe('registry-default');
  });

  it('falls back to registry default even when roleFeatures omits the target role entirely', () => {
    const result = resolveFeatureVisibility({
      featureKey: 'favorites',
      role: 'sales',
      isAdmin: false,
      roleFeatures: { guest: [] },
      registryDefaultRoles: ['sales'],
    });
    expect(result.visible).toBe(true);
    expect(result.source).toBe('registry-default');
  });
});

describe('resolveFeatureValue', () => {
  it('returns the raw flag value when no user override is set', () => {
    const result = resolveFeatureValue({
      featureKey: 'favorites',
      rawFlagValue: true,
      userOverrides: {},
    });
    expect(result.value).toBe(true);
    expect(result.source).toBe('raw-flag');
  });

  it('prefers the user override when set', () => {
    const result = resolveFeatureValue({
      featureKey: 'favorites',
      rawFlagValue: true,
      userOverrides: { favorites: false },
    });
    expect(result.value).toBe(false);
    expect(result.source).toBe('user-override');
  });

  it('treats an explicit false override as an override, not fallback', () => {
    const result = resolveFeatureValue({
      featureKey: 'speed-reader',
      rawFlagValue: true,
      userOverrides: { 'speed-reader': false },
    });
    expect(result.value).toBe(false);
    expect(result.source).toBe('user-override');
  });

  it('handles undefined userOverrides', () => {
    const result = resolveFeatureValue({
      featureKey: 'favorites',
      rawFlagValue: false,
      userOverrides: undefined,
    });
    expect(result.value).toBe(false);
    expect(result.source).toBe('raw-flag');
  });
});

describe('resolveFeature', () => {
  const baseInput = {
    registry: REGISTRY,
    roleFeatures: null,
    userOverrides: {},
    releaseMode: 'all',
  };

  it('returns unknown when the feature is not registered', () => {
    const result = resolveFeature({
      ...baseInput,
      featureKey: 'no-such-feature',
      role: 'guest',
      isAdmin: false,
      rawFlagValue: true,
    });
    expect(result).toEqual({
      visible: false,
      value: false,
      effective: false,
      status: null,
      source: 'unknown',
      valueSource: 'unknown',
    });
  });

  it('returns effective=true only when visible AND value are both true', () => {
    const result = resolveFeature({
      ...baseInput,
      featureKey: 'favorites',
      role: 'guest',
      isAdmin: false,
      rawFlagValue: true,
    });
    expect(result.visible).toBe(true);
    expect(result.value).toBe(true);
    expect(result.effective).toBe(true);
    expect(result.status).toBe('released');
  });

  it('returns effective=false when visible but value is off', () => {
    const result = resolveFeature({
      ...baseInput,
      featureKey: 'speed-reader',
      role: 'subscriber',
      isAdmin: false,
      rawFlagValue: false,
    });
    expect(result.visible).toBe(true);
    expect(result.value).toBe(false);
    expect(result.effective).toBe(false);
  });

  it('returns effective=false when value is true but role has no access', () => {
    const result = resolveFeature({
      ...baseInput,
      featureKey: 'speed-reader',
      role: 'guest',
      isAdmin: false,
      rawFlagValue: true,
    });
    expect(result.visible).toBe(false);
    expect(result.value).toBe(true);
    expect(result.effective).toBe(false);
  });

  it('admin bypasses role-access gate', () => {
    const result = resolveFeature({
      ...baseInput,
      featureKey: 'error-page-simulator',
      role: 'admin',
      isAdmin: true,
      rawFlagValue: true,
    });
    expect(result.visible).toBe(true);
    expect(result.effective).toBe(true);
  });

  it('released-only mode hides non-released features for guest/subscriber/sales', () => {
    for (const role of ['guest', 'subscriber', 'sales']) {
      const result = resolveFeature({
        ...baseInput,
        releaseMode: 'released-only',
        featureKey: 'speed-reader',
        role,
        isAdmin: false,
        rawFlagValue: true,
      });
      expect(result.visible).toBe(false);
      expect(result.source).toBe('release-gate');
      expect(result.effective).toBe(false);
    }
  });

  it('released-only mode still allows tester to see beta features', () => {
    const result = resolveFeature({
      ...baseInput,
      releaseMode: 'released-only',
      featureKey: 'speed-reader',
      role: 'tester',
      isAdmin: false,
      rawFlagValue: true,
    });
    expect(result.visible).toBe(true);
  });

  it('released-only mode still allows admin to see experimental features', () => {
    const result = resolveFeature({
      ...baseInput,
      releaseMode: 'released-only',
      featureKey: 'error-page-simulator',
      role: 'admin',
      isAdmin: true,
      rawFlagValue: true,
    });
    expect(result.visible).toBe(true);
  });

  it('released-only mode has no effect on released features', () => {
    const result = resolveFeature({
      ...baseInput,
      releaseMode: 'released-only',
      featureKey: 'favorites',
      role: 'guest',
      isAdmin: false,
      rawFlagValue: true,
    });
    expect(result.visible).toBe(true);
    expect(result.effective).toBe(true);
  });

  it('user override of the feature value still wins over raw flag', () => {
    const result = resolveFeature({
      ...baseInput,
      featureKey: 'favorites',
      role: 'guest',
      isAdmin: false,
      rawFlagValue: true,
      userOverrides: { favorites: false },
    });
    expect(result.value).toBe(false);
    expect(result.valueSource).toBe('user-override');
    expect(result.effective).toBe(false);
  });
});

describe('resolveAllFeatures', () => {
  it('returns a key-indexed map of resolved features', () => {
    const map = resolveAllFeatures({
      registry: REGISTRY,
      role: 'subscriber',
      isAdmin: false,
      roleFeatures: null,
      userOverrides: {},
      rawFlagValues: {
        favorites: true,
        'speed-reader': false,
        'error-page-simulator': true,
      },
      releaseMode: 'all',
    });
    expect(Object.keys(map).sort()).toEqual(
      ['error-page-simulator', 'favorites', 'speed-reader'].sort(),
    );
    expect(map.favorites.effective).toBe(true);
    expect(map['speed-reader'].visible).toBe(true);
    expect(map['speed-reader'].value).toBe(false);
    expect(map['error-page-simulator'].visible).toBe(false);
  });
});
