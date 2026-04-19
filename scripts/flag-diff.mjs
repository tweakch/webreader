#!/usr/bin/env node
/**
 * Diff the flag/lifecycle state between the PR base and HEAD.
 *
 * Emits JSON on stdout: { changes: [{key, kind, from, to, status}] }
 * where `kind` is "added" | "removed" | "status" | "default".
 *
 * Called from .github/workflows/pr-summary.yml. Uses `git show` to read
 * flags.json at the merge base without a second checkout.
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf-8' }).trim();
}

function loadJsonAtRef(ref, path) {
  try {
    return JSON.parse(execSync(`git show ${ref}:${path}`, { encoding: 'utf-8' }));
  } catch {
    return null;
  }
}

function loadJsonLocal(path) {
  const abs = resolve(path);
  if (!existsSync(abs)) return null;
  try {
    return JSON.parse(readFileSync(abs, 'utf-8'));
  } catch {
    return null;
  }
}

// The registry is a .jsx file and can't be parsed as JSON; flag lifecycle
// (status) is inferred from registryConsistency tests. For the diff we
// focus on what's stable across refs: flags.json entries + their default
// variant. Status changes show up in the registry summary test instead.

const baseRef = process.env.BASE_REF || 'origin/main';
const base = loadJsonAtRef(baseRef, 'flags.json') ?? {};
const head = loadJsonLocal('flags.json') ?? {};

const changes = [];
const baseKeys = new Set(Object.keys(base));
const headKeys = new Set(Object.keys(head));

for (const k of headKeys) {
  if (!baseKeys.has(k)) {
    changes.push({ key: k, kind: 'added', status: head[k]?.defaultVariant });
  }
}
for (const k of baseKeys) {
  if (!headKeys.has(k)) {
    changes.push({ key: k, kind: 'removed', status: base[k]?.defaultVariant });
  }
}
for (const k of headKeys) {
  if (baseKeys.has(k)) {
    const from = base[k]?.defaultVariant;
    const to = head[k]?.defaultVariant;
    if (from !== to) {
      changes.push({ key: k, kind: 'default', from, to });
    }
  }
}

process.stdout.write(JSON.stringify({ changes }, null, 2));
