import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Rule 1: File-size budget.
 *
 * See CODING_GUIDELINES.md#1-file-size-budget. No source file may grow
 * past the configured limit (default 400 lines) unless registered in
 * guidelines.config.json#fileSizeAllowlist with a target and reason.
 *
 * Allowlist shape:
 *   { file: "relative/path.jsx", limit: <int>, reason: "<non-empty>" }
 *
 * TDD expectation: adding a line to a god file, or creating a new file
 * over the limit, turns this test red. The fix is to split the file —
 * not to raise the allowlist limit without a written reason.
 */

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..', '..', '..');

const SCAN_ROOTS = ['components', 'ui', 'hooks', 'src'];
const ROOT_GLOBS = ['grimm-reader.jsx', 'features.jsx', 'main.jsx'];
const EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs']);

function walk(dir, acc = []) {
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
  for (const root of SCAN_ROOTS) {
    const abs = path.join(repoRoot, root);
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) walk(abs, files);
  }
  for (const name of ROOT_GLOBS) {
    const abs = path.join(repoRoot, name);
    if (fs.existsSync(abs)) files.push(abs);
  }
  return files.map((f) => path.relative(repoRoot, f));
}

function readLineCount(relPath) {
  const content = fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
  return content.split('\n').length;
}

const config = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'guidelines.config.json'), 'utf8')
);
const allowlistByFile = new Map(
  (config.fileSizeAllowlist || []).map((entry) => [entry.file, entry])
);
const defaultLimit = config.fileSizeLimit ?? 400;

describe('guidelines: file-size budget', () => {
  const files = collectFiles();

  it('scans at least one file (sanity)', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('every source file is within its budget', () => {
    const violations = [];
    for (const rel of files) {
      const lines = readLineCount(rel);
      const allow = allowlistByFile.get(rel);
      const limit = allow ? allow.limit : defaultLimit;
      if (lines > limit) {
        violations.push(`${rel}: ${lines} > ${limit}${allow ? ' (allowlisted)' : ''}`);
      }
    }
    expect(
      violations,
      `Files exceeding their line budget:\n  ${violations.join('\n  ')}\n` +
      `Default limit is ${defaultLimit}. See CODING_GUIDELINES.md#1-file-size-budget.`
    ).toEqual([]);
  });

  it('every allowlist entry has a reason and a numeric limit', () => {
    const bad = (config.fileSizeAllowlist || []).filter(
      (e) => !e.file || typeof e.limit !== 'number' || !e.reason || !e.reason.trim()
    );
    expect(
      bad,
      `Malformed fileSizeAllowlist entries (need file, limit, reason):\n  ${JSON.stringify(bad, null, 2)}`
    ).toEqual([]);
  });

  it('every allowlist entry points at a file that still exists', () => {
    const missing = (config.fileSizeAllowlist || [])
      .filter((e) => !fs.existsSync(path.join(repoRoot, e.file)))
      .map((e) => e.file);
    expect(
      missing,
      `Allowlist entries reference missing files (remove them):\n  ${missing.join('\n  ')}`
    ).toEqual([]);
  });

  it('every allowlist entry is actually needed (file is actually over the default limit)', () => {
    const unnecessary = [];
    for (const entry of config.fileSizeAllowlist || []) {
      const abs = path.join(repoRoot, entry.file);
      if (!fs.existsSync(abs)) continue;
      const lines = readLineCount(entry.file);
      if (lines <= defaultLimit) {
        unnecessary.push(`${entry.file}: ${lines} lines, no allowlist needed`);
      }
    }
    expect(
      unnecessary,
      `Allowlist entries that can be removed (file is already under the default limit):\n  ${unnecessary.join('\n  ')}`
    ).toEqual([]);
  });
});
