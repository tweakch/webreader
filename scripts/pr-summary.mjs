#!/usr/bin/env node
/**
 * Build a single Markdown summary for a PR: preview URL, test status,
 * Lighthouse deltas, flag changes. Called by .github/workflows/pr-summary.yml
 * and posted via the sticky-pull-request-comment action (header-matched so
 * the comment is edited in place, not duplicated).
 *
 * Reads:
 *   PREVIEW_URL   Vercel preview URL (may be empty)
 *   E2E_STATUS    "success" | "failure" | "skipped" | ""
 *   E2E_PREVIEW_STATUS "success" | "failure" | "skipped" | ""
 *   LIGHTHOUSE_STATUS  same
 *   FLAG_DIFF     path to flag-diff JSON (optional)
 *   LIGHTHOUSE_RESULTS path to .lighthouseci dir (optional)
 *
 * Writes the composed Markdown to stdout.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const env = process.env;

function statusIcon(s) {
  if (s === 'success') return 'passing';
  if (s === 'failure') return 'failing';
  if (s === 'skipped' || s === '') return 'skipped';
  return s;
}

function section(title, body) {
  return `### ${title}\n\n${body}\n`;
}

function previewSection() {
  const url = env.PREVIEW_URL?.trim();
  if (!url) {
    return section('Preview deployment', '_No Vercel preview URL detected yet._');
  }
  return section(
    'Preview deployment',
    [
      `- **URL:** ${url}`,
      `- **Open a random story:** ${url}/app`,
    ].join('\n')
  );
}

function checksSection() {
  const rows = [
    ['E2E (local dev server)', statusIcon(env.E2E_STATUS)],
    ['E2E (Vercel preview)', statusIcon(env.E2E_PREVIEW_STATUS)],
    ['Lighthouse budgets', statusIcon(env.LIGHTHOUSE_STATUS)],
  ];
  const body = [
    '| Check | Status |',
    '| --- | --- |',
    ...rows.map(([n, s]) => `| ${n} | ${s} |`),
  ].join('\n');
  return section('Checks', body);
}

function lighthouseSection() {
  const dir = env.LIGHTHOUSE_RESULTS;
  if (!dir || !existsSync(dir)) {
    return section('Performance', '_No Lighthouse run recorded._');
  }
  try {
    const files = readdirSync(dir).filter((f) => f.startsWith('lhr-') && f.endsWith('.json'));
    if (files.length === 0) return section('Performance', '_No Lighthouse reports found._');
    const picks = [];
    for (const f of files) {
      const raw = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
      picks.push({
        url: raw.finalDisplayedUrl || raw.finalUrl || raw.requestedUrl,
        lcp: raw.audits?.['largest-contentful-paint']?.numericValue,
        cls: raw.audits?.['cumulative-layout-shift']?.numericValue,
        tbt: raw.audits?.['total-blocking-time']?.numericValue,
        perf: raw.categories?.performance?.score,
      });
    }
    const rows = picks.map((p) => {
      const lcp = p.lcp != null ? `${Math.round(p.lcp)} ms` : '—';
      const cls = p.cls != null ? p.cls.toFixed(3) : '—';
      const tbt = p.tbt != null ? `${Math.round(p.tbt)} ms` : '—';
      const perf = p.perf != null ? `${Math.round(p.perf * 100)}` : '—';
      return `| ${p.url} | ${perf} | ${lcp} | ${cls} | ${tbt} |`;
    });
    const body = [
      '| URL | Perf | LCP | CLS | TBT |',
      '| --- | --- | --- | --- | --- |',
      ...rows,
    ].join('\n');
    return section('Performance', body);
  } catch (err) {
    return section('Performance', `_Failed to read Lighthouse results: ${err.message}_`);
  }
}

function flagsSection() {
  const path = env.FLAG_DIFF;
  if (!path || !existsSync(path)) {
    return section('Flag changes', '_None._');
  }
  try {
    const diff = JSON.parse(readFileSync(path, 'utf-8'));
    const entries = Array.isArray(diff?.changes) ? diff.changes : [];
    if (entries.length === 0) return section('Flag changes', '_None._');
    const rows = entries
      .slice(0, 20)
      .map(({ key, kind, status, from, to }) => {
        if (kind === 'added') return `| \`${key}\` | added | — → ${status ?? '?'} |`;
        if (kind === 'removed') return `| \`${key}\` | removed | ${status ?? '?'} → — |`;
        if (kind === 'status') return `| \`${key}\` | status | ${from} → ${to} |`;
        return `| \`${key}\` | ${kind} | |`;
      });
    const body = [
      '| Flag | Change | Lifecycle |',
      '| --- | --- | --- |',
      ...rows,
    ].join('\n');
    return section('Flag changes', body);
  } catch (err) {
    return section('Flag changes', `_Failed to parse flag diff: ${err.message}_`);
  }
}

const parts = [
  '<!-- webreader:pr-summary -->',
  '## Webreader PR summary',
  '',
  previewSection(),
  checksSection(),
  lighthouseSection(),
  flagsSection(),
  '---',
  '_Updated automatically on every push. Regenerate with the Summary workflow._',
];

process.stdout.write(parts.join('\n') + '\n');
