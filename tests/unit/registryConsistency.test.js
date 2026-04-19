import flagsJson from '../../flags.json';
import {
  FEATURE_REGISTRY,
  FEATURES,
  getFlagConfig,
  getDefaultRoleFeatures,
} from '../../src/lib/featureRegistry';
import { AB_EXPERIMENTS, AB_DEFAULT_CONFIG } from '../../src/lib/abExperiments';
import { ROLES } from '../../hooks/useRole';

describe('registry ↔ flags.json consistency', () => {
  it('every registry feature has a matching entry in flags.json', () => {
    for (const entry of FEATURE_REGISTRY) {
      expect(flagsJson[entry.key]).toBeDefined();
    }
  });

  it('every flags.json entry has a matching registry feature', () => {
    const keys = new Set(FEATURE_REGISTRY.map((e) => e.key));
    for (const flagKey of Object.keys(flagsJson)) {
      expect(keys.has(flagKey)).toBe(true);
    }
  });

  it('registry flag shape matches flags.json exactly', () => {
    const derived = getFlagConfig();
    expect(derived).toEqual(flagsJson);
  });
});

describe('registry ↔ FEATURES (toggle UI) consistency', () => {
  it('all FEATURES keys exist in the registry', () => {
    const keys = new Set(FEATURE_REGISTRY.map((e) => e.key));
    for (const f of FEATURES) {
      expect(keys.has(f.key)).toBe(true);
    }
  });
});

describe('registry ↔ role defaults consistency', () => {
  it('default role features only contain registered keys', () => {
    const registeredKeys = new Set(FEATURE_REGISTRY.map((e) => e.key));
    const defaults = getDefaultRoleFeatures();
    for (const role of Object.keys(defaults)) {
      for (const key of defaults[role]) {
        expect(registeredKeys.has(key)).toBe(true);
      }
    }
  });

  it('role defaults only reference the known ROLES set', () => {
    const defaults = getDefaultRoleFeatures();
    for (const role of Object.keys(defaults)) {
      expect(ROLES).toContain(role);
    }
  });
});

describe('A/B experiment consistency', () => {
  it('every AB_DEFAULT_CONFIG key references a defined experiment', () => {
    const expIds = new Set(AB_EXPERIMENTS.map((e) => e.id));
    for (const id of Object.keys(AB_DEFAULT_CONFIG)) {
      expect(expIds.has(id)).toBe(true);
    }
  });

  it('every AB experiment allowedRoles only references known ROLES', () => {
    for (const id of Object.keys(AB_DEFAULT_CONFIG)) {
      for (const role of AB_DEFAULT_CONFIG[id].allowedRoles) {
        expect(ROLES).toContain(role);
      }
    }
  });

  it('every AB experiment defaultVariant exists in its variants list', () => {
    for (const exp of AB_EXPERIMENTS) {
      const variantIds = exp.variants.map((v) => v.id);
      expect(variantIds).toContain(exp.defaultVariant);
    }
  });
});
