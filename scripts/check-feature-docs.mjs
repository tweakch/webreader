#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const featuresDir = join(repoRoot, 'docs/features');
const personasDir = join(repoRoot, 'docs/personas');
const flagsPath = join(repoRoot, 'flags.json');

const ALLOWED_CATEGORIES = new Set([
  'accessibility', 'advanced-reading', 'analysis', 'appearance', 'audio',
  'commerce', 'creative', 'culture', 'debug', 'discovery', 'education',
  'gamification', 'gen-alpha', 'interactive', 'navigation', 'platform',
  'reader-core', 'reader-stats', 'reader-ui', 'reading-experience',
  'ritual', 'search', 'text-processing', 'typography', 'ui', 'wellness',
]);
const ALLOWED_TYPES = new Set(['app', 'epic', 'strategic']);
const ALLOWED_LIFECYCLES = new Set(['STABLE', 'EXPERIMENT']);
const ALLOWED_STATUSES = new Set(['mvp', 'near-term', 'vision']);

// Flags documented outside docs/features/ — won't be flagged as missing.
const FLAGS_WITHOUT_DOCS = new Set([
  'theme-toggle', 'app-animation', 'ab-testing', 'ab-testing-admin', 'hero-tagline',
]);

function parseFrontmatter(raw, file) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error(`${file}: missing frontmatter`);
  const lines = m[1].split('\n');
  const out = {};
  let key = null;
  let list = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && list) {
      list.push(stripQuotes(listItem[1].trim()));
      continue;
    }
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    key = kv[1];
    const val = kv[2].trim();
    if (val === '') { list = []; out[key] = list; continue; }
    if (val === '[]') { out[key] = []; list = null; continue; }
    if (val === 'null') { out[key] = null; list = null; continue; }
    out[key] = stripQuotes(val);
    list = null;
  }
  return out;
}

function stripQuotes(v) {
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
  return v;
}

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`  [${file}] ${msg}`);
const warn = (file, msg) => warnings.push(`  [${file}] ${msg}`);

const flags = JSON.parse(readFileSync(flagsPath, 'utf8'));

const featureFiles = readdirSync(featuresDir).filter(f => f.endsWith('.md'));
const featureIds = new Set(featureFiles.map(f => f.replace(/\.md$/, '')));

const personaFiles = readdirSync(personasDir).filter(f => f.endsWith('.md'));
const personaIds = new Set(personaFiles.map(f => f.replace(/\.md$/, '')));

const REQUIRED_COMMON = ['id', 'name', 'type', 'category', 'personas', 'related_features', 'parent', 'children'];
const REQUIRED_APP = ['flag_key', 'lifecycle', 'flag_default'];
const REQUIRED_STRATEGIC = ['status'];

const flagsUsedByDocs = new Set();

for (const file of featureFiles) {
  const id = file.replace(/\.md$/, '');
  const raw = readFileSync(join(featuresDir, file), 'utf8');
  let fm;
  try { fm = parseFrontmatter(raw, file); }
  catch (e) { err(file, e.message); continue; }

  for (const k of REQUIRED_COMMON) {
    if (!(k in fm)) err(file, `missing required key: ${k}`);
  }
  if (fm.id !== id) err(file, `id "${fm.id}" does not match filename`);
  if (!ALLOWED_TYPES.has(fm.type)) err(file, `type "${fm.type}" not in {${[...ALLOWED_TYPES].join(',')}}`);
  if (fm.category && !ALLOWED_CATEGORIES.has(fm.category)) {
    err(file, `category "${fm.category}" not in allowlist (update ALLOWED_CATEGORIES in check-feature-docs.mjs if intentional)`);
  }

  if (fm.type === 'app' || fm.type === 'epic') {
    for (const k of REQUIRED_APP) if (!(k in fm)) err(file, `type=${fm.type} requires key: ${k}`);
    if (fm.lifecycle && !ALLOWED_LIFECYCLES.has(fm.lifecycle)) {
      err(file, `lifecycle "${fm.lifecycle}" not in {${[...ALLOWED_LIFECYCLES].join(',')}}`);
    }
    if (fm.flag_key) {
      flagsUsedByDocs.add(fm.flag_key);
      const flag = flags[fm.flag_key];
      if (!flag) err(file, `flag_key "${fm.flag_key}" not found in flags.json`);
      else if (fm.flag_default !== flag.defaultVariant) {
        err(file, `flag_default "${fm.flag_default}" !== flags.json defaultVariant "${flag.defaultVariant}"`);
      }
    }
  } else if (fm.type === 'strategic') {
    for (const k of REQUIRED_STRATEGIC) if (!(k in fm)) err(file, `type=strategic requires key: ${k}`);
    if (fm.status && !ALLOWED_STATUSES.has(fm.status)) {
      err(file, `status "${fm.status}" not in {${[...ALLOWED_STATUSES].join(',')}}`);
    }
    if ('flag_key' in fm) err(file, `type=strategic must not declare flag_key`);
  }

  for (const p of fm.personas ?? []) {
    if (!personaIds.has(p)) err(file, `persona "${p}" not found in docs/personas/`);
  }
  for (const r of fm.related_features ?? []) {
    if (!featureIds.has(r)) err(file, `related_features "${r}" not found in docs/features/`);
  }
  if (fm.parent && !featureIds.has(fm.parent)) {
    err(file, `parent "${fm.parent}" not found in docs/features/`);
  }
  for (const c of fm.children ?? []) {
    if (!featureIds.has(c)) err(file, `children "${c}" not found in docs/features/`);
  }
}

for (const file of personaFiles) {
  const raw = readFileSync(join(personasDir, file), 'utf8');
  let fm;
  try { fm = parseFrontmatter(raw, file); }
  catch (e) { err(file, e.message); continue; }
  for (const f of fm.strategic_features ?? []) {
    if (!featureIds.has(f)) err(file, `strategic_features "${f}" not found in docs/features/`);
  }
  for (const f of fm.app_features ?? []) {
    if (!featureIds.has(f)) err(file, `app_features "${f}" not found in docs/features/`);
  }
  for (const p of fm.related_personas ?? []) {
    if (!personaIds.has(p)) err(file, `related_personas "${p}" not found in docs/personas/`);
  }
}

for (const key of Object.keys(flags)) {
  if (FLAGS_WITHOUT_DOCS.has(key)) continue;
  if (!flagsUsedByDocs.has(key)) {
    warn('flags.json', `flag "${key}" has no feature doc in docs/features/ (add one, or add to FLAGS_WITHOUT_DOCS)`);
  }
}

const label = errors.length ? 'FAIL' : 'OK';
console.log(`[check-feature-docs] ${label} — ${featureFiles.length} features, ${personaFiles.length} personas, ${Object.keys(flags).length} flags`);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings) console.log(w);
}
if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  for (const e of errors) console.log(e);
  process.exit(1);
}
