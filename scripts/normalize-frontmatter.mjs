#!/usr/bin/env node
/**
 * Normalize the YAML frontmatter block of every story content.md.
 *
 * Complements crawlers/normalize.ts: that script normalizes the body
 * (paragraph wrapping, LF endings, whitespace) and recomputes wordCount
 * when it's already a plain integer. This script handles the
 * *structural* drift that normalize.ts leaves alone:
 *
 *   - stringified numeric values (wordCount: "1234" → wordCount: 1234)
 *   - inconsistent key order (canonical: title, source, url, author,
 *     language, crawledAt, wordCount, then anything else alphabetical)
 *   - trailing / leading whitespace in string values
 *   - empty-string fields (dropped)
 *   - language codes uppercased → lowercased
 *   - crawledAt timestamps normalized to ISO-8601 with a trailing Z
 *   - --fix-wordcount: recompute wordCount from the body (not just fix
 *     the type)
 *
 * Safe by default: dry-run prints a per-file diff and nothing writes.
 *
 * Usage:
 *   node scripts/normalize-frontmatter.mjs                 # dry-run
 *   node scripts/normalize-frontmatter.mjs --write         # apply
 *   node scripts/normalize-frontmatter.mjs --source=grimm  # limit
 *   node scripts/normalize-frontmatter.mjs --fix-wordcount # recompute
 *   node scripts/normalize-frontmatter.mjs --quiet         # summary only
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STORIES_DIR = join(ROOT, 'stories');

const CANONICAL_ORDER = [
  'title',
  'source',
  'url',
  'author',
  'language',
  'crawledAt',
  'wordCount',
];

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const flags = {
  write: false,
  fixWordCount: false,
  quiet: false,
  source: null,
};
for (const arg of process.argv.slice(2)) {
  if (arg === '--write') flags.write = true;
  else if (arg === '--fix-wordcount') flags.fixWordCount = true;
  else if (arg === '--quiet') flags.quiet = true;
  else if (arg.startsWith('--source=')) flags.source = arg.slice('--source='.length);
  else if (arg === '--help' || arg === '-h') {
    console.log(readFileSync(new URL(import.meta.url), 'utf-8').slice(0, 1500));
    process.exit(0);
  } else {
    console.error(`Unknown flag: ${arg}`);
    process.exit(2);
  }
}

// ---------------------------------------------------------------------------
// Parsing / serialization
// ---------------------------------------------------------------------------

function findContentFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) findContentFiles(p, out);
    else if (entry === 'content.md') out.push(p);
  }
  return out;
}

function splitFrontmatter(raw) {
  const lf = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!lf.startsWith('---\n')) return { fmRaw: null, body: lf };
  const end = lf.indexOf('\n---\n', 4);
  if (end === -1) return { fmRaw: null, body: lf };
  return { fmRaw: lf.slice(4, end), body: lf.slice(end + 5) };
}

/** Parse the conservative YAML subset our crawlers emit. */
function parseFrontmatter(fmRaw) {
  const out = {};
  const order = [];
  for (const line of fmRaw.split('\n')) {
    if (!line.trim()) continue;
    const m = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, key, rawValue] = m;
    out[key] = parseScalar(rawValue.trim());
    order.push(key);
  }
  return { data: out, originalOrder: order };
}

function parseScalar(trimmed) {
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    // JSON-decode to handle \n, \", etc. that the crawler may emit.
    try { return JSON.parse(trimmed); }
    catch { return trimmed.slice(1, -1); }
  }
  if (/^-?\d+$/.test(trimmed)) return Number(trimmed);
  if (/^-?\d+\.\d+$/.test(trimmed)) return Number(trimmed);
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null' || trimmed === '~') return null;
  return trimmed;
}

function serializeValue(v) {
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (v === null) return 'null';
  return JSON.stringify(String(v));
}

function serializeFrontmatter(data) {
  const keys = orderKeys(Object.keys(data));
  const lines = keys.map((k) => `${k}: ${serializeValue(data[k])}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

function orderKeys(keys) {
  const set = new Set(keys);
  const canonical = CANONICAL_ORDER.filter((k) => set.has(k));
  const rest = keys.filter((k) => !CANONICAL_ORDER.includes(k)).sort();
  return [...canonical, ...rest];
}

// ---------------------------------------------------------------------------
// Coercion
// ---------------------------------------------------------------------------

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;

function coerceWordCount(v) {
  if (typeof v === 'number' && Number.isInteger(v) && v >= 0) return { value: v, changed: false };
  if (typeof v === 'string' && /^\d+$/.test(v)) return { value: Number(v), changed: true };
  return { value: v, changed: false };
}

function coerceCrawledAt(v) {
  if (typeof v !== 'string') return { value: v, changed: false };
  const trimmed = v.trim();
  if (ISO_RE.test(trimmed)) return { value: trimmed, changed: trimmed !== v };
  // Try to parse anything Date() understands and re-emit canonically.
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) return { value: d.toISOString(), changed: true };
  return { value: v, changed: false };
}

function coerceLanguage(v) {
  if (typeof v !== 'string') return { value: v, changed: false };
  const trimmed = v.trim();
  const lower = trimmed.toLowerCase();
  if (lower === v) return { value: v, changed: false };
  return { value: lower, changed: true };
}

function trimStrings(data) {
  const out = { ...data };
  const notes = [];
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'string') {
      const t = v.trim();
      if (t === '') { delete out[k]; notes.push(`drop empty "${k}"`); continue; }
      if (t !== v) { out[k] = t; notes.push(`trim "${k}"`); }
    }
  }
  return { data: out, notes };
}

function countWords(body) {
  return body.split(/\s+/).filter((w) => w.length > 0).length;
}

// ---------------------------------------------------------------------------
// Per-file normalization
// ---------------------------------------------------------------------------

function normalizeFile(path, body, data) {
  const notes = [];
  let { data: d, notes: trimNotes } = trimStrings(data);
  notes.push(...trimNotes);

  if ('wordCount' in d) {
    const { value, changed } = coerceWordCount(d.wordCount);
    if (changed) { notes.push(`coerce wordCount "${d.wordCount}" → ${value}`); d.wordCount = value; }
  }
  if (flags.fixWordCount) {
    const actual = countWords(body);
    if (d.wordCount !== actual) {
      notes.push(`wordCount ${d.wordCount ?? '(unset)'} → ${actual} (from body)`);
      d.wordCount = actual;
    }
  }
  if ('crawledAt' in d) {
    const { value, changed } = coerceCrawledAt(d.crawledAt);
    if (changed) { notes.push(`normalize crawledAt → ${value}`); d.crawledAt = value; }
  }
  if ('language' in d) {
    const { value, changed } = coerceLanguage(d.language);
    if (changed) { notes.push(`lowercase language → ${value}`); d.language = value; }
  }

  return { data: d, notes };
}

function diffKeyOrder(oldOrder, newOrder) {
  if (oldOrder.length !== newOrder.length) return true;
  return oldOrder.some((k, i) => k !== newOrder[i]);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const allFiles = findContentFiles(STORIES_DIR);
const files = flags.source
  ? allFiles.filter((f) => relative(STORIES_DIR, f).split('/')[0] === flags.source)
  : allFiles;

if (files.length === 0) {
  console.error(`No content.md files matched${flags.source ? ` for source "${flags.source}"` : ''}.`);
  process.exit(1);
}

let changedCount = 0;
let totalNotes = 0;

for (const path of files) {
  const raw = readFileSync(path, 'utf-8');
  const { fmRaw, body } = splitFrontmatter(raw);
  if (fmRaw == null) {
    if (!flags.quiet) console.warn(`! ${relative(ROOT, path)}: no frontmatter block — skipping`);
    continue;
  }

  const parsed = parseFrontmatter(fmRaw);
  const { data: newData, notes } = normalizeFile(path, body, parsed.data);

  const newFm = serializeFrontmatter(newData);
  const output = newFm + body;

  const orderChanged = diffKeyOrder(parsed.originalOrder, orderKeys(Object.keys(newData)));
  if (orderChanged) notes.push('reorder keys');

  if (output === raw) continue;

  changedCount++;
  totalNotes += notes.length;

  if (!flags.quiet) {
    console.log(`~ ${relative(ROOT, path)}`);
    for (const n of notes) console.log(`    - ${n}`);
  }

  if (flags.write) {
    writeFileSync(path, output, 'utf-8');
  }
}

const action = flags.write ? 'changed' : 'would change';
console.log(
  `\n${action} ${changedCount} of ${files.length} files ` +
  `(${totalNotes} notes)${flags.write ? '' : ' — re-run with --write to apply.'}`
);
