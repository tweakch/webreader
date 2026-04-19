import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Rule 6: Hook public APIs carry JSDoc.
//
// See CODING_GUIDELINES.md#6-hook-public-apis-carry-jsdoc.
//
// Every `export function` or top-level `export const` (excluding re-exports
// and `export { ... } from` statements) in `hooks/*.js` must be preceded
// by a JSDoc-style block comment. `grimm-reader.jsx` destructures ~30
// values from these hooks; the docblock is the contract.
//
// The rule covers only the `hooks/` directory — primitives under `ui/` and
// feature components under `components/` are self-documenting via props
// signatures in JSX.

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..', '..', '..');

const HOOKS_DIR = path.join(repoRoot, 'hooks');

const config = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'guidelines.config.json'), 'utf8')
);
const allowlist = new Set(
  (config.hookJsdocAllowlist || []).map((e) => `${e.file}:${e.symbol}`)
);

const EXPORT_FN_RE = /^export\s+(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_][A-Za-z0-9_]*)/;
const EXPORT_CONST_RE = /^export\s+const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=/;

function scanFile(relPath) {
  const abs = path.join(repoRoot, relPath);
  const lines = fs.readFileSync(abs, 'utf8').split('\n');
  const violations = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fnMatch = line.match(EXPORT_FN_RE);
    const constMatch = line.match(EXPORT_CONST_RE);
    const symbol = fnMatch?.[1] ?? constMatch?.[1];
    if (!symbol) continue;

    // Walk backwards over blank lines; the immediately preceding non-blank
    // content must be the end of a JSDoc block.
    let j = i - 1;
    while (j >= 0 && lines[j].trim() === '') j--;
    const hasJsdocClose = j >= 0 && lines[j].trim().endsWith('*/');
    const hasJsdocOpen = (() => {
      if (!hasJsdocClose) return false;
      for (let k = j; k >= 0; k--) {
        if (lines[k].trim().startsWith('/**')) return true;
        // If we hit another statement before opening, no docblock.
        if (!lines[k].trim().startsWith('*') && !lines[k].trim().endsWith('*/')) return false;
      }
      return false;
    })();

    if (!hasJsdocOpen) {
      const key = `${relPath}:${symbol}`;
      if (!allowlist.has(key)) {
        violations.push(`${relPath}:${i + 1} export ${symbol} has no JSDoc`);
      }
    }
  }
  return violations;
}

function listHookFiles() {
  if (!fs.existsSync(HOOKS_DIR)) return [];
  return fs
    .readdirSync(HOOKS_DIR)
    .filter((f) => f.endsWith('.js') || f.endsWith('.ts'))
    .map((f) => path.posix.join('hooks', f));
}

describe('guidelines: hook JSDoc', () => {
  const files = listHookFiles();

  it('finds hook files (sanity)', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('every exported symbol in hooks/ has a JSDoc block', () => {
    const violations = files.flatMap(scanFile);
    expect(
      violations,
      `Missing JSDoc on hook exports:\n  ${violations.join('\n  ')}\n` +
      `See CODING_GUIDELINES.md#6-hook-public-apis-carry-jsdoc.`
    ).toEqual([]);
  });

  it('every allowlist entry has a reason and points at a real hook file', () => {
    const hookSet = new Set(files);
    const bad = (config.hookJsdocAllowlist || []).filter(
      (e) => !e.file || !e.symbol || !e.reason || !e.reason.trim() || !hookSet.has(e.file)
    );
    expect(bad, 'hookJsdocAllowlist entries need file + symbol + reason').toEqual([]);
  });
});
