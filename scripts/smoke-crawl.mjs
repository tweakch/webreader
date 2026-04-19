#!/usr/bin/env node
/**
 * Smoke-crawl: HEAD each source's list URL to detect upstream 404s or
 * redirects before they rot `stories/`. Runs fast (one request per source,
 * no parsing), so it's safe to run on every PR.
 *
 * Sources are discovered by reading crawlers/index.ts statically rather
 * than by importing them — the crawlers pull in `node-html-parser` and
 * other runtime deps we don't need here.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourcesDir = join(__dirname, '..', 'crawlers', 'sources');

const UA = 'Mozilla/5.0 (webreader-smoke-crawl; +https://github.com/tweakch/webreader)';
const TIMEOUT_MS = 8000;
const RETRY = 2;

async function headOrGet(url) {
  // Many list pages reject HEAD; fall back to a range-limited GET.
  for (let attempt = 0; attempt <= RETRY; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': UA,
          'Range': 'bytes=0-2047',
          'Accept': 'text/html,*/*',
        },
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (attempt === RETRY) throw err;
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
  throw new Error('unreachable');
}

function extractListUrls() {
  const files = readdirSync(sourcesDir).filter((f) => f.endsWith('.ts'));
  const entries = [];
  for (const f of files) {
    const src = readFileSync(join(sourcesDir, f), 'utf-8');
    const idMatch = src.match(/\bid\s*:\s*['"]([^'"]+)['"]/);
    const urlMatch = src.match(/\blistUrl\s*:\s*['"]([^'"]+)['"]/);
    if (idMatch && urlMatch) {
      entries.push({ id: idMatch[1], file: f, listUrl: urlMatch[1] });
    }
  }
  return entries;
}

async function main() {
  const sources = extractListUrls();
  if (sources.length === 0) {
    console.error('No sources discovered under crawlers/sources/');
    process.exit(1);
  }

  const failures = [];
  for (const s of sources) {
    process.stdout.write(`· ${s.id.padEnd(20)} ${s.listUrl} ... `);
    try {
      const res = await headOrGet(s.listUrl);
      if (res.status >= 200 && res.status < 400) {
        console.log(`ok (${res.status})`);
      } else {
        console.log(`FAIL (${res.status})`);
        failures.push({ ...s, status: res.status });
      }
    } catch (err) {
      console.log(`FAIL (${err.message})`);
      failures.push({ ...s, error: err.message });
    }
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length}/${sources.length} sources unreachable.`);
    console.error('This may indicate upstream changes that will break the next crawl.');
    process.exit(1);
  }
  console.log(`\nAll ${sources.length} sources reachable.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
