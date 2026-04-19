#!/usr/bin/env node
/**
 * Content health dashboard.
 *
 * Walks stories/**\/content.md and reports, per source:
 *   - count
 *   - total words, avg, median, min, max
 *   - stories with suspiciously short bodies (< THRESHOLD words)
 *   - stories with missing/stale frontmatter fields
 *
 * Output is Markdown so the result drops straight into an issue or PR
 * body. Use --json for a machine-readable version.
 *
 * Usage:
 *   node scripts/content-report.mjs
 *   node scripts/content-report.mjs --threshold=100
 *   node scripts/content-report.mjs --json > report.json
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STORIES_DIR = join(ROOT, 'stories');

const flags = { threshold: 50, json: false };
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--threshold=')) flags.threshold = Number(arg.slice(12));
  else if (arg === '--json') flags.json = true;
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

function parseFm(fm) {
  const out = {};
  if (!fm) return out;
  for (const line of fm.split('\n')) {
    const m = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, k, v] = m;
    const t = v.trim();
    if (t.startsWith('"') && t.endsWith('"')) {
      try { out[k] = JSON.parse(t); } catch { out[k] = t.slice(1, -1); }
    } else if (/^-?\d+$/.test(t)) out[k] = Number(t);
    else out[k] = t;
  }
  return out;
}

function countWords(body) {
  return body.split(/\s+/).filter((w) => w.length > 0).length;
}

function median(sorted) {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

const files = walk(STORIES_DIR);
const bySource = new Map();
const shortStories = [];
const missingFields = [];

for (const path of files) {
  const raw = readFileSync(path, 'utf-8');
  const { fm, body } = splitFrontmatter(raw);
  const data = parseFm(fm);
  const words = countWords(body);
  const rel = relative(ROOT, path);
  const source = rel.split('/')[1] ?? 'unknown';

  if (!bySource.has(source)) bySource.set(source, { count: 0, words: [], storiesWithoutUrl: 0, storiesWithoutCrawledAt: 0 });
  const bucket = bySource.get(source);
  bucket.count++;
  bucket.words.push(words);
  if (!data.url) bucket.storiesWithoutUrl++;
  if (!data.crawledAt) bucket.storiesWithoutCrawledAt++;

  if (words < flags.threshold) shortStories.push({ path: rel, words, title: data.title });
  const missing = [];
  if (!data.title) missing.push('title');
  if (!data.source) missing.push('source');
  if (data.wordCount != null && typeof data.wordCount !== 'number') missing.push('wordCount(type)');
  if (missing.length > 0) missingFields.push({ path: rel, missing });
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

if (flags.json) {
  const out = { sources: {}, shortStories, missingFields, threshold: flags.threshold };
  for (const [src, b] of bySource) {
    const sorted = [...b.words].sort((a, z) => a - z);
    const total = sorted.reduce((n, w) => n + w, 0);
    out.sources[src] = {
      count: b.count,
      totalWords: total,
      avgWords: Math.round(total / (b.count || 1)),
      medianWords: median(sorted),
      minWords: sorted[0] ?? 0,
      maxWords: sorted[sorted.length - 1] ?? 0,
      storiesWithoutUrl: b.storiesWithoutUrl,
      storiesWithoutCrawledAt: b.storiesWithoutCrawledAt,
    };
  }
  process.stdout.write(JSON.stringify(out, null, 2));
  process.exit(shortStories.length > 0 || missingFields.length > 0 ? 0 : 0);
}

console.log('# Content health report');
console.log('');
console.log(`_${files.length} content files across ${bySource.size} sources. Short-story threshold: ${flags.threshold} words._`);
console.log('');

console.log('## Per-source statistics');
console.log('');
console.log('| Source | Count | Total words | Avg | Median | Min | Max | No URL | No crawledAt |');
console.log('| --- | --: | --: | --: | --: | --: | --: | --: | --: |');
const sortedSources = [...bySource.keys()].sort();
for (const src of sortedSources) {
  const b = bySource.get(src);
  const sorted = [...b.words].sort((a, z) => a - z);
  const total = sorted.reduce((n, w) => n + w, 0);
  console.log(
    `| ${src} | ${b.count} | ${total.toLocaleString()} | ${Math.round(total / b.count)} | ` +
    `${median(sorted)} | ${sorted[0]} | ${sorted[sorted.length - 1]} | ` +
    `${b.storiesWithoutUrl} | ${b.storiesWithoutCrawledAt} |`
  );
}
console.log('');

console.log(`## Short stories (< ${flags.threshold} words) — likely failed crawls`);
console.log('');
if (shortStories.length === 0) {
  console.log('_None._');
} else {
  console.log('| Path | Words | Title |');
  console.log('| --- | --: | --- |');
  for (const s of shortStories.sort((a, b) => a.words - b.words)) {
    console.log(`| \`${s.path}\` | ${s.words} | ${s.title ?? ''} |`);
  }
}
console.log('');

console.log('## Frontmatter structural issues');
console.log('');
if (missingFields.length === 0) {
  console.log('_None._');
} else {
  console.log('| Path | Missing / malformed |');
  console.log('| --- | --- |');
  for (const m of missingFields) {
    console.log(`| \`${m.path}\` | ${m.missing.join(', ')} |`);
  }
}
console.log('');
