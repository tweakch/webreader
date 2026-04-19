import { FEATURE_REGISTRY, RELEASE_STATUSES } from '../../src/lib/featureRegistry';

/**
 * Flag lifecycle check.
 *
 * Merge = code is in main.
 * Release = a flag moves up the ladder (experimental → beta → released).
 *
 * These tests enforce the shape of that ladder. They're deliberately
 * strict about *consistency* and loose about *thresholds* — a hard cap on
 * the number of experimental flags would create an unhelpful blocker, so
 * we surface a warning via a soft-fail comment instead (the registry
 * consistency test already guarantees keys are unique / registered).
 */

describe('flag lifecycle', () => {
  it('every flag declares a recognized lifecycle status', () => {
    const bad = FEATURE_REGISTRY
      .filter((e) => !RELEASE_STATUSES.includes(e.status))
      .map((e) => `${e.key} -> ${e.status ?? '(missing)'}`);
    expect(
      bad,
      `Flags with invalid status (allowed: ${RELEASE_STATUSES.join(', ')}):\n  ${bad.join('\n  ')}`
    ).toEqual([]);
  });

  it('every flag has a non-empty label and description', () => {
    const bad = FEATURE_REGISTRY
      .filter((e) => typeof e.label !== 'string' || e.label.trim().length === 0 ||
                     typeof e.description !== 'string' || e.description.trim().length === 0)
      .map((e) => e.key);
    expect(bad, `Flags missing label/description:\n  ${bad.join('\n  ')}`).toEqual([]);
  });

  it('flag keys follow kebab-case', () => {
    const bad = FEATURE_REGISTRY
      .map((e) => e.key)
      .filter((k) => !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(k));
    expect(bad, `Non-kebab-case flag keys:\n  ${bad.join('\n  ')}`).toEqual([]);
  });

  it('flag keys are unique', () => {
    const seen = new Set();
    const dupes = [];
    for (const e of FEATURE_REGISTRY) {
      if (seen.has(e.key)) dupes.push(e.key);
      else seen.add(e.key);
    }
    expect(dupes, `Duplicate flag keys:\n  ${dupes.join('\n  ')}`).toEqual([]);
  });

  it('roles field, when present, is an array', () => {
    // Empty roles is intentional (admin-only features); the invariant is
    // only that the field is a well-formed array when declared.
    const bad = FEATURE_REGISTRY
      .filter((e) => e.roles !== undefined && !Array.isArray(e.roles))
      .map((e) => e.key);
    expect(bad, `Flags with non-array roles:\n  ${bad.join('\n  ')}`).toEqual([]);
  });

  it('experimental flag budget is reasonable (<= 40% of total)', () => {
    const total = FEATURE_REGISTRY.length;
    const experimental = FEATURE_REGISTRY.filter((e) => e.status === 'experimental').length;
    const ratio = total === 0 ? 0 : experimental / total;
    expect(
      ratio,
      `Experimental ratio ${(ratio * 100).toFixed(1)}% (${experimental}/${total}) exceeds 40%. ` +
      `Graduate some to beta/released or deprecate them — too much experimental surface erodes product focus.`
    ).toBeLessThanOrEqual(0.4);
  });

  it('lifecycle summary (informational)', () => {
    const counts = RELEASE_STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
    for (const e of FEATURE_REGISTRY) {
      if (counts[e.status] != null) counts[e.status]++;
    }
    // Visible as test output in the diff/log; not a failure condition.
    console.log('flag lifecycle summary:', counts, `(total=${FEATURE_REGISTRY.length})`);
    expect(FEATURE_REGISTRY.length).toBeGreaterThan(0);
  });
});
