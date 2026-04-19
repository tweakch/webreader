import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FEATURE_REGISTRY } from '../../../src/lib/featureRegistry';

/**
 * Rule 4: Released flags declare a retirement date.
 *
 * See CODING_GUIDELINES.md#4-released-flags-declare-a-retirement-date.
 *
 * Every FEATURE_REGISTRY entry with status 'released' must carry a
 * `retireBy` ISO date. The flag (not the feature) must be removed by
 * that date — collapse the `if (flag)` branches, drop the entry, and
 * ship. Past dates fail this test.
 *
 * Beta/experimental flags are exempt: by definition they are still
 * earning the right to exist.
 */

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..', '..', '..');

const config = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'guidelines.config.json'), 'utf8')
);
const allowlist = new Set(
  (config.flagRetirementAllowlist || []).map((e) => e.key)
);

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(s) {
  if (typeof s !== 'string' || !ISO_DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
}

describe('guidelines: released-flag retirement', () => {
  const released = FEATURE_REGISTRY.filter((e) => e.status === 'released');

  it('sanity: the registry has released flags', () => {
    expect(released.length).toBeGreaterThan(0);
  });

  it('every released flag declares a valid retireBy ISO date', () => {
    const bad = released
      .filter((e) => !allowlist.has(e.key))
      .filter((e) => !isValidIsoDate(e.retireBy))
      .map((e) => `${e.key} -> ${e.retireBy ?? '(missing)'}`);
    expect(
      bad,
      `Released flags missing/malformed retireBy:\n  ${bad.join('\n  ')}\n` +
      `See CODING_GUIDELINES.md#4-released-flags-declare-a-retirement-date.`
    ).toEqual([]);
  });

  it('no released flag has passed its retireBy date', () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const overdue = released
      .filter((e) => !allowlist.has(e.key))
      .filter((e) => isValidIsoDate(e.retireBy) && new Date(e.retireBy) < today)
      .map((e) => `${e.key}: retireBy ${e.retireBy}`);
    expect(
      overdue,
      `Released flags past their retirement date (remove flag + collapse branches):\n  ${overdue.join('\n  ')}`
    ).toEqual([]);
  });

  it('every allowlist entry has a reason and references a real released flag', () => {
    const releasedKeys = new Set(released.map((e) => e.key));
    const bad = (config.flagRetirementAllowlist || []).filter(
      (e) => !e.key || !e.reason || !e.reason.trim() || !releasedKeys.has(e.key)
    );
    expect(bad, 'Malformed or stale flagRetirementAllowlist entries').toEqual([]);
  });
});
