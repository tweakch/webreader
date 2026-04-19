#!/usr/bin/env node
/**
 * Find cruft under stories/:
 *   - directories that contain only a README or a hidden file (no content.md)
 *   - empty directories
 *   - .DS_Store, *.bak, *~, node_modules, .cache, etc.
 *   - adaption sub-directories without their own content.md
 *
 * Exits 0 even when issues are found so it can be composed into a report
 * pipeline. Use --fail-on-cruft for CI gating.
 *
 * Usage:
 *   node scripts/orphan-check.mjs
 *   node scripts/orphan-check.mjs --fail-on-cruft
 */

import { readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STORIES_DIR = join(ROOT, 'stories');

const flags = { failOnCruft: false };
for (const arg of process.argv.slice(2)) {
  if (arg === '--fail-on-cruft') flags.failOnCruft = true;
}

const CRUFT_FILES = [/^\.DS_Store$/, /\.bak$/, /~$/, /^\.#/, /^#.+#$/, /^Thumbs\.db$/];
const ALLOWED_NON_DIR_AT_ROOT = new Set(['README.md', 'index.json']);
// Companion files that legitimately live next to content.md:
//   - audio.{mp3,ogg,wav}   — source for the audio-player feature flag
//   - cover.{jpg,png,webp}  — potential future thumbnail
const COMPANION_RE = /^(audio|cover)\.(mp3|ogg|wav|jpg|jpeg|png|webp)$/i;

const issues = { emptyDirs: [], cruftFiles: [], dirsWithoutContent: [], strayFiles: [] };

function isCruft(name) {
  return CRUFT_FILES.some((re) => re.test(name));
}

function scan(dir, depth) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  if (entries.length === 0) {
    issues.emptyDirs.push(relative(ROOT, dir));
    return;
  }

  let hasContent = false;
  const subdirs = [];

  for (const name of entries) {
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; }

    if (st.isDirectory()) {
      subdirs.push(p);
      continue;
    }

    if (isCruft(name)) {
      issues.cruftFiles.push(relative(ROOT, p));
      continue;
    }
    if (name === 'content.md') {
      hasContent = true;
      continue;
    }
    // Known legitimate non-content files:
    //   - README.md anywhere
    //   - index.json at the stories/ root
    //   - adaptions/ sub-readmes
    if (name === 'README.md') continue;
    if (depth === 0 && ALLOWED_NON_DIR_AT_ROOT.has(name)) continue;
    if (name === 'index.json') continue;
    if (COMPANION_RE.test(name)) continue;

    issues.strayFiles.push(relative(ROOT, p));
  }

  // At depth >= 2 (e.g. stories/source/slug/), a directory is expected
  // to contain a content.md. Adaption sub-dirs live one level below
  // that and are walked recursively.
  if (depth >= 2 && !hasContent && subdirs.length === 0) {
    issues.dirsWithoutContent.push(relative(ROOT, dir));
  }

  for (const sd of subdirs) scan(sd, depth + 1);
}

scan(STORIES_DIR, 0);

const total =
  issues.emptyDirs.length +
  issues.cruftFiles.length +
  issues.dirsWithoutContent.length +
  issues.strayFiles.length;

console.log('# Orphan / cruft report for stories/');
console.log('');

function section(title, items) {
  console.log(`## ${title} (${items.length})`);
  console.log('');
  if (items.length === 0) console.log('_None._');
  else for (const p of items.sort()) console.log(`- \`${p}\``);
  console.log('');
}

section('Empty directories', issues.emptyDirs);
section('Cruft files (editor/OS artifacts)', issues.cruftFiles);
section('Leaf directories without content.md', issues.dirsWithoutContent);
section('Stray files alongside stories', issues.strayFiles);

console.log(`\n${total} issues found.`);

if (flags.failOnCruft && total > 0) process.exit(1);
