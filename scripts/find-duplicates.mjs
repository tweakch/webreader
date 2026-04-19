#!/usr/bin/env node
/**
 * Find duplicate / near-duplicate stories across sources.
 *
 * Three passes:
 *   1. Exact slug collision across sources (same slug under two
 *      different source directories — most common re-import mistake).
 *   2. Title collision (normalized: lowercase, strip punctuation).
 *      A Grimm "Aschenputtel" and a Swiss "Aschenputtel" may both
 *      exist legitimately, but the report surfaces them so you can
 *      decide if they should be linked as adaptions.
 *   3. First-paragraph fingerprint collision. Uses the first ~200
 *      characters of the first body paragraph as a hash key. Catches
 *      content re-imports even when titles differ.
 *
 * Output: Markdown report with one section per pass.
 *
 * Usage:
 *   node scripts/find-duplicates.mjs
 *   node scripts/find-duplicates.mjs --json
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STORIES_DIR = join(ROOT, 'stories');

const flags = { json: false };
for (const arg of process.argv.slice(2)) {
  if (arg === '--json') flags.json = true;
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (entry === 'content.md') out.push(p);
  }
  return out;
}

function splitFrontmatter(raw) {
  const lf = raw.replace(/\r\n/g, '\n');
  if (!lf.startsWith('---\n')) return { fm: null, body: lf };
  const end = lf.indexOf('\n---\n', 4);
  if (end === -1) return { fm: null, body: lf };
  return { fm: lf.slice(4, end), body: lf.slice(end + 5) };
}

function parseTitle(fm) {
  if (!fm) return '';
  const m = fm.match(/^title:\s*(.*)$/m);
  if (!m) return '';
  const v = m[1].trim();
  if (v.startsWith('"') && v.endsWith('"')) {
    try { return JSON.parse(v); } catch { return v.slice(1, -1); }
  }
  return v;
}

function normalizeTitle(s) {
  return s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
}

function fingerprint(body) {
  const firstPara = body.split(/\n\s*\n/).find((p) => p.trim().length > 0) ?? '';
  const norm = firstPara.trim().slice(0, 200).toLowerCase().replace(/\s+/g, ' ');
  return createHash('sha1').update(norm).digest('hex').slice(0, 12);
}

/**
 * Extract the story's canonical slug from its path, ignoring the
 * `/adaptions/<variant>/` suffix when present so e.g.
 *   stories/andersen/das_feuerzeug/adaptions/schweizerdeutsch/content.md
 * resolves to slug=das_feuerzeug, not slug=schweizerdeutsch.
 */
function extractSlug(parts) {
  // parts = [source, ...middle, slugDir, 'content.md']  2-level, or
  //         [source, directory, slugDir, 'content.md']  3-level, or
  //         [..., slugDir, 'adaptions', <variant>, 'content.md']
  const withoutFile = parts.slice(0, -1);
  const idx = withoutFile.indexOf('adaptions');
  if (idx > 0) return withoutFile[idx - 1];
  return withoutFile[withoutFile.length - 1];
}

function extractAdaptionVariant(parts) {
  const withoutFile = parts.slice(0, -1);
  const idx = withoutFile.indexOf('adaptions');
  if (idx > 0 && idx < withoutFile.length - 1) return withoutFile[idx + 1];
  return null;
}

const files = walk(STORIES_DIR);
const entries = [];
for (const path of files) {
  const rel = relative(STORIES_DIR, path);
  const parts = rel.split('/');
  const source = parts[0];
  const slug = extractSlug(parts);
  const variant = extractAdaptionVariant(parts);
  const raw = readFileSync(path, 'utf-8');
  const { fm, body } = splitFrontmatter(raw);
  const title = parseTitle(fm);
  const fp = fingerprint(body);
  entries.push({ path: relative(ROOT, path), source, slug, variant, title, titleNorm: normalizeTitle(title), fp });
}

function groupBy(arr, fn) {
  const m = new Map();
  for (const x of arr) {
    const k = fn(x);
    if (!k) continue;
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(x);
  }
  return [...m.entries()].filter(([, v]) => v.length > 1);
}

// Only report slug duplicates across different sources; within a source,
// stories/source/slug is already unique by filesystem.
const slugDupes = groupBy(entries, (e) => e.slug)
  .filter(([, group]) => new Set(group.map((g) => g.source)).size > 1);

// Title collisions are only interesting when they cross a source+slug
// boundary. Original + its own adaption share a title by design; we don't
// want that in the report.
const titleDupes = groupBy(entries, (e) => e.titleNorm)
  .filter(([, group]) => {
    const pairs = new Set(group.map((g) => `${g.source}/${g.slug}`));
    return pairs.size > 1;
  });

// Fingerprint collisions: ignore the empty-body hash (failed crawls all
// collide there) and same source+slug groups (original/adaption legit
// when the adaption accidentally copied the original).
const EMPTY_FP = createHash('sha1').update('').digest('hex').slice(0, 12);
const fpDupes = groupBy(entries, (e) => e.fp)
  .filter(([fp]) => fp !== EMPTY_FP);

// ---------------------------------------------------------------------------

if (flags.json) {
  process.stdout.write(JSON.stringify({ slugDupes, titleDupes, fpDupes }, null, 2));
  process.exit(0);
}

console.log('# Duplicate / near-duplicate story report');
console.log('');

console.log('## Exact slug collisions across sources');
console.log('');
if (slugDupes.length === 0) console.log('_None._');
else for (const [slug, group] of slugDupes) {
  console.log(`- **\`${slug}\`** in ${group.length} sources:`);
  for (const g of group) console.log(`  - \`${g.path}\` — "${g.title}"`);
}
console.log('');

console.log('## Title collisions (normalized)');
console.log('');
if (titleDupes.length === 0) console.log('_None._');
else for (const [t, group] of titleDupes) {
  console.log(`- **"${group[0].title}"** (norm: \`${t}\`) — ${group.length} copies:`);
  for (const g of group) console.log(`  - \`${g.path}\` [${g.source}]`);
}
console.log('');

console.log('## First-paragraph fingerprint collisions');
console.log('');
if (fpDupes.length === 0) console.log('_None._');
else for (const [fp, group] of fpDupes) {
  console.log(`- fingerprint \`${fp}\` — ${group.length} copies:`);
  for (const g of group) console.log(`  - \`${g.path}\` — "${g.title}" [${g.source}]`);
}
console.log('');
