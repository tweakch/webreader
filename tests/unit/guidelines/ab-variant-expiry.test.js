import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AB_EXPERIMENTS } from '../../../src/lib/abExperiments';

/**
 * Rule 3: A/B variants have an expiry date.
 *
 * See CODING_GUIDELINES.md#3-ab-variants-have-an-expiry-date.
 *
 * Each AB_EXPERIMENTS entry must declare:
 *   - startedAt:  ISO date (YYYY-MM-DD) the experiment first went live
 *   - expiresBy:  ISO date the experiment must be decided by
 *
 * Once expiresBy is in the past, this test fails. The cure is to promote
 * the winner, delete loser variant components, and remove the experiment
 * from the registry. Extending the experiment requires bumping expiresBy
 * with a written note in the commit.
 */

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..', '..', '..');

const config = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'guidelines.config.json'), 'utf8')
);
const allowlist = new Set(
  (config.abVariantExpiryAllowlist || []).map((e) => e.id)
);

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(s) {
  if (typeof s !== 'string' || !ISO_DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
}

describe('guidelines: A/B variant expiry', () => {
  it('every experiment has a valid startedAt ISO date', () => {
    const bad = AB_EXPERIMENTS.filter((e) => !isValidIsoDate(e.startedAt)).map(
      (e) => `${e.id} -> ${e.startedAt ?? '(missing)'}`
    );
    expect(bad, `Experiments missing/malformed startedAt:\n  ${bad.join('\n  ')}`).toEqual([]);
  });

  it('every experiment has a valid expiresBy ISO date', () => {
    const bad = AB_EXPERIMENTS.filter((e) => !isValidIsoDate(e.expiresBy)).map(
      (e) => `${e.id} -> ${e.expiresBy ?? '(missing)'}`
    );
    expect(bad, `Experiments missing/malformed expiresBy:\n  ${bad.join('\n  ')}`).toEqual([]);
  });

  it('every experiment expires after it started', () => {
    const bad = AB_EXPERIMENTS
      .filter((e) => isValidIsoDate(e.startedAt) && isValidIsoDate(e.expiresBy))
      .filter((e) => new Date(e.expiresBy) <= new Date(e.startedAt))
      .map((e) => `${e.id}: started ${e.startedAt}, expires ${e.expiresBy}`);
    expect(bad, `Experiments with expiresBy <= startedAt:\n  ${bad.join('\n  ')}`).toEqual([]);
  });

  it('no experiment has passed its expiresBy date', () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const overdue = AB_EXPERIMENTS
      .filter((e) => !allowlist.has(e.id))
      .filter((e) => isValidIsoDate(e.expiresBy) && new Date(e.expiresBy) < today)
      .map((e) => `${e.id}: expired ${e.expiresBy}`);
    expect(
      overdue,
      `Overdue A/B experiments — promote winner or extend with a reason:\n  ${overdue.join('\n  ')}\n` +
      `See CODING_GUIDELINES.md#3-ab-variants-have-an-expiry-date.`
    ).toEqual([]);
  });

  it('every allowlist entry has a reason and still refers to a live experiment', () => {
    const expIds = new Set(AB_EXPERIMENTS.map((e) => e.id));
    const bad = (config.abVariantExpiryAllowlist || []).filter(
      (e) => !e.id || !e.reason || !e.reason.trim() || !expIds.has(e.id)
    );
    expect(bad, 'Malformed or stale abVariantExpiryAllowlist entries').toEqual([]);
  });
});
