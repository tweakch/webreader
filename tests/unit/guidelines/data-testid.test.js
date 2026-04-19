import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Rule 5: data-testid naming + drift check.
 *
 * See CODING_GUIDELINES.md#5-data-testid-naming--drift-check.
 *
 * Every literal `data-testid` value must match kebab-case
 * (`^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$`).
 *
 * The test also emits a sorted snapshot of all literal testids to
 * `tests/unit/guidelines/__fixtures__/data-testids.txt`. The snapshot is
 * the single source of truth — agents can read it instead of scanning
 * the codebase, and humans can scan the diff in review. Drift fails; run
 * the test with `WEBREADER_SNAPSHOT_TESTIDS=1` to re-snapshot.
 *
 * Dynamic `data-testid={\`foo-${x}\`}` values are intentionally not
 * captured — there is nothing to match against.
 */

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..', '..', '..');

const SCAN_ROOTS = ['components', 'ui', 'src'];
const ROOT_FILES = ['grimm-reader.jsx'];
const EXTS = new Set(['.jsx', '.tsx']);

const LITERAL_RE = /data-testid\s*=\s*(?:"([^"]+)"|'([^']+)')/g;
const KEBAB_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

const config = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'guidelines.config.json'), 'utf8')
);
const allowlist = new Set(
  (config.dataTestidAllowlist || []).map((e) => e.testid)
);

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (EXTS.has(path.extname(entry.name))) acc.push(full);
  }
  return acc;
}

function collectFiles() {
  const files = [];
  for (const root of SCAN_ROOTS) walk(path.join(repoRoot, root), files);
  for (const name of ROOT_FILES) {
    const abs = path.join(repoRoot, name);
    if (fs.existsSync(abs)) files.push(abs);
  }
  return files;
}

function extractLiteralTestids() {
  const set = new Set();
  for (const file of collectFiles()) {
    const text = fs.readFileSync(file, 'utf8');
    let m;
    LITERAL_RE.lastIndex = 0;
    while ((m = LITERAL_RE.exec(text)) !== null) {
      set.add(m[1] ?? m[2]);
    }
  }
  return [...set].sort();
}

const FIXTURE_DIR = path.join(repoRoot, 'tests/unit/guidelines/__fixtures__');
const FIXTURE_PATH = path.join(FIXTURE_DIR, 'data-testids.txt');

describe('guidelines: data-testid convention', () => {
  const found = extractLiteralTestids();

  it('finds testids (sanity)', () => {
    expect(found.length).toBeGreaterThan(0);
  });

  it('every literal testid is kebab-case', () => {
    const bad = found.filter((t) => !allowlist.has(t) && !KEBAB_RE.test(t));
    expect(
      bad,
      `Non-kebab-case testids:\n  ${bad.join('\n  ')}\n` +
      `See CODING_GUIDELINES.md#5-data-testid-naming--drift-check.`
    ).toEqual([]);
  });

  it('the testid snapshot matches the code', () => {
    if (process.env.WEBREADER_SNAPSHOT_TESTIDS === '1') {
      fs.mkdirSync(FIXTURE_DIR, { recursive: true });
      fs.writeFileSync(FIXTURE_PATH, found.join('\n') + '\n');
    }
    const snapshot = fs.existsSync(FIXTURE_PATH)
      ? fs.readFileSync(FIXTURE_PATH, 'utf8').split('\n').filter(Boolean)
      : [];
    expect(
      found,
      `data-testid snapshot is out of date.\n` +
      `Run \`WEBREADER_SNAPSHOT_TESTIDS=1 npx vitest run tests/unit/guidelines/data-testid.test.js\` to update.`
    ).toEqual(snapshot);
  });

  it('every allowlist entry has a reason', () => {
    const bad = (config.dataTestidAllowlist || []).filter(
      (e) => !e.testid || !e.reason || !e.reason.trim()
    );
    expect(bad, 'dataTestidAllowlist entries need testid + reason').toEqual([]);
  });
});
