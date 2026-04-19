import {
  FEATURE_REGISTRY,
  FEATURES,
  getRegistryMap,
  getFlagConfig,
  getDefaultRoleFeatures,
  getFeaturesByStatus,
  RELEASE_STATUSES,
  TOGGLEABLE_KINDS,
} from '../../src/lib/featureRegistry';

describe('FEATURE_REGISTRY shape', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(FEATURE_REGISTRY)).toBe(true);
    expect(FEATURE_REGISTRY.length).toBeGreaterThan(0);
  });

  it('each entry has the required fields', () => {
    for (const entry of FEATURE_REGISTRY) {
      expect(entry).toHaveProperty('key');
      expect(typeof entry.key).toBe('string');
      expect(entry.key.length).toBeGreaterThan(0);

      expect(entry).toHaveProperty('kind');
      expect(['boolean', 'variant']).toContain(entry.kind);

      expect(entry).toHaveProperty('label');
      expect(typeof entry.label).toBe('string');

      expect(entry).toHaveProperty('description');
      expect(typeof entry.description).toBe('string');

      expect(entry).toHaveProperty('flag');
      expect(entry.flag).toHaveProperty('defaultVariant');
      expect(entry.flag).toHaveProperty('variants');
      expect(typeof entry.flag.variants).toBe('object');

      expect(entry).toHaveProperty('status');
      expect(RELEASE_STATUSES).toContain(entry.status);

      expect(entry).toHaveProperty('roles');
      expect(Array.isArray(entry.roles)).toBe(true);
    }
  });

  it('each defaultVariant appears in its own variants map', () => {
    for (const entry of FEATURE_REGISTRY) {
      expect(Object.keys(entry.flag.variants)).toContain(
        entry.flag.defaultVariant,
      );
    }
  });

  it('keys are unique', () => {
    const keys = FEATURE_REGISTRY.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('roles reference the known role set only', () => {
    const KNOWN = new Set(['guest', 'subscriber', 'tester', 'sales', 'admin']);
    for (const entry of FEATURE_REGISTRY) {
      for (const role of entry.roles) {
        expect(KNOWN.has(role)).toBe(true);
      }
    }
  });
});

describe('FEATURES (toggleable-only projection)', () => {
  it('includes only toggleable kinds', () => {
    for (const f of FEATURES) {
      expect(TOGGLEABLE_KINDS).toContain(f.kind);
    }
  });

  it('every FEATURES entry exists in the full registry', () => {
    const keys = new Set(FEATURE_REGISTRY.map((e) => e.key));
    for (const f of FEATURES) {
      expect(keys.has(f.key)).toBe(true);
    }
  });
});

describe('getRegistryMap', () => {
  it('returns a key-indexed map', () => {
    const map = getRegistryMap();
    for (const entry of FEATURE_REGISTRY) {
      expect(map[entry.key]).toBe(entry);
    }
  });
});

describe('getFlagConfig', () => {
  it('returns a flag config in the flags.json shape', () => {
    const cfg = getFlagConfig();
    for (const entry of FEATURE_REGISTRY) {
      expect(cfg[entry.key]).toEqual(entry.flag);
    }
  });
});

describe('getDefaultRoleFeatures', () => {
  it('groups feature keys by role', () => {
    const roleFeatures = getDefaultRoleFeatures();
    for (const entry of FEATURE_REGISTRY) {
      for (const role of entry.roles) {
        expect(roleFeatures[role]).toContain(entry.key);
      }
    }
  });

  it('omits features whose registry role list is empty for a given role', () => {
    const roleFeatures = getDefaultRoleFeatures();
    for (const entry of FEATURE_REGISTRY) {
      for (const role of ['guest', 'subscriber', 'tester', 'sales']) {
        if (!entry.roles.includes(role)) {
          expect(roleFeatures[role] ?? []).not.toContain(entry.key);
        }
      }
    }
  });
});

describe('getFeaturesByStatus', () => {
  it('returns only the features matching a given status', () => {
    for (const status of RELEASE_STATUSES) {
      const keys = getFeaturesByStatus(status);
      const expected = FEATURE_REGISTRY.filter((e) => e.status === status).map(
        (e) => e.key,
      );
      expect(keys.sort()).toEqual(expected.sort());
    }
  });
});
