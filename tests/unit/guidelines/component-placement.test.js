import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Rule 2: One canonical home per component name.
 *
 * See CODING_GUIDELINES.md#2-one-canonical-home-per-component-name.
 *
 * A given .jsx/.tsx file basename may appear in at most one of:
 *   - components/       (feature components owned by grimm-reader)
 *   - ui/               (reusable presentation primitives)
 *   - src/components/   (migration target)
 *
 * Duplicates are banned unless registered in
 * guidelines.config.json#componentPlacementDuplicateAllowlist with a
 * reason. This stops "V2" drift and answers "where does a new component
 * live?".
 */

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..', '..', '..');

const ROOTS = ['components', 'ui', 'src/components'];

function scan(root) {
  const abs = path.join(repoRoot, root);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  const walk = (dir, relDir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.join(relDir, entry.name);
      if (entry.isDirectory()) walk(full, rel);
      else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx')) {
        out.push({ basename: entry.name, rel });
      }
    }
  };
  walk(abs, root);
  return out;
}

const config = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'guidelines.config.json'), 'utf8')
);
const allowlist = new Set(
  (config.componentPlacementDuplicateAllowlist || []).map((e) => e.basename)
);

describe('guidelines: component placement', () => {
  const byBasename = new Map();
  for (const root of ROOTS) {
    for (const { basename, rel } of scan(root)) {
      if (!byBasename.has(basename)) byBasename.set(basename, []);
      byBasename.get(basename).push(rel);
    }
  }

  it('finds at least one component (sanity)', () => {
    expect(byBasename.size).toBeGreaterThan(0);
  });

  it('no component basename appears in more than one root', () => {
    const duplicates = [];
    for (const [basename, paths] of byBasename) {
      if (paths.length > 1 && !allowlist.has(basename)) {
        duplicates.push(`${basename}: ${paths.join(', ')}`);
      }
    }
    expect(
      duplicates,
      `Components duplicated across roots (pick one home):\n  ${duplicates.join('\n  ')}\n` +
      `See CODING_GUIDELINES.md#2-one-canonical-home-per-component-name.`
    ).toEqual([]);
  });

  it('every duplicate allowlist entry has a reason', () => {
    const bad = (config.componentPlacementDuplicateAllowlist || []).filter(
      (e) => !e.basename || !e.reason || !e.reason.trim()
    );
    expect(bad, 'Duplicate allowlist entries need basename + reason').toEqual([]);
  });

  it('every duplicate allowlist entry still has multiple copies (else delete it)', () => {
    const stale = (config.componentPlacementDuplicateAllowlist || [])
      .filter((e) => (byBasename.get(e.basename) || []).length <= 1)
      .map((e) => e.basename);
    expect(
      stale,
      `Allowlist entries no longer duplicated (remove them):\n  ${stale.join('\n  ')}`
    ).toEqual([]);
  });
});
