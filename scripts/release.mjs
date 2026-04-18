#!/usr/bin/env node
// Cut a new release: bump package.json, fold [Unreleased] into a dated
// section in CHANGELOG.md, commit, and tag. Push with `git push --follow-tags`.
//
// Usage:  node scripts/release.mjs [patch|minor|major|X.Y.Z]

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const pkgPath = join(root, 'package.json');
const changelogPath = join(root, 'CHANGELOG.md');

const arg = process.argv[2] ?? 'patch';

function bump(version, kind) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!m) throw new Error(`Invalid version in package.json: ${version}`);
  let [maj, min, pat] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (kind === 'major') { maj += 1; min = 0; pat = 0; }
  else if (kind === 'minor') { min += 1; pat = 0; }
  else if (kind === 'patch') { pat += 1; }
  else if (/^\d+\.\d+\.\d+$/.test(kind)) return kind;
  else throw new Error(`Unknown bump: ${kind}`);
  return `${maj}.${min}.${pat}`;
}

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const next = bump(pkg.version, arg);
const today = new Date().toISOString().slice(0, 10);

pkg.version = next;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

let changelog = readFileSync(changelogPath, 'utf8');

// Replace the [Unreleased] header with the new dated section, then add a
// fresh, empty [Unreleased] block above it.
const unreleasedHeader = /## \[Unreleased\]\s*\n/;
if (!unreleasedHeader.test(changelog)) {
  throw new Error('CHANGELOG.md is missing the [Unreleased] section.');
}
changelog = changelog.replace(
  unreleasedHeader,
  `## [Unreleased]\n\n## [${next}] - ${today}\n`,
);

// Refresh the compare links at the bottom.
const repo = 'https://github.com/tweakch/webreader';
const linkBlock =
  `[Unreleased]: ${repo}/compare/v${next}...HEAD\n` +
  `[${next}]: ${repo}/releases/tag/v${next}\n`;
changelog = changelog.replace(/\[Unreleased\]:[^\n]*\n/, linkBlock);

writeFileSync(changelogPath, changelog);

execSync(`git add package.json CHANGELOG.md`, { cwd: root, stdio: 'inherit' });
execSync(`git commit -m "chore(release): v${next}"`, { cwd: root, stdio: 'inherit' });
execSync(`git tag -a v${next} -m "v${next}"`, { cwd: root, stdio: 'inherit' });

console.log(`\nTagged v${next}. Push with:\n  git push --follow-tags\n`);
