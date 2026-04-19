import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { parseFrontmatter, validateFrontmatter } from '../../crawlers/frontmatter-schema';

function walk(dir: string, depth: number, maxDepth: number, out: string[]) {
  if (depth > maxDepth) return;
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const p = join(dir, entry);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) {
      walk(p, depth + 1, maxDepth, out);
    } else if (entry === 'content.md') {
      out.push(p);
    }
  }
}

const STORIES_DIR = join(__dirname, '..', '..', 'stories');

describe('story frontmatter schema', () => {
  const contentFiles: string[] = [];
  walk(STORIES_DIR, 0, 4, contentFiles);

  it('finds story content files', () => {
    expect(contentFiles.length).toBeGreaterThan(0);
  });

  it('every story has valid frontmatter', () => {
    const failures: string[] = [];
    for (const file of contentFiles) {
      const body = readFileSync(file, 'utf-8');
      const fm = parseFrontmatter(body);
      if (!fm) {
        failures.push(`${file}: missing frontmatter block`);
        continue;
      }
      const issues = validateFrontmatter(fm);
      if (issues.length > 0) {
        failures.push(`${file}:\n  ${issues.map((i) => `${i.field}: ${i.message}`).join('\n  ')}`);
      }
    }
    if (failures.length > 0) {
      throw new Error(
        `${failures.length}/${contentFiles.length} story files have invalid frontmatter:\n\n${failures.join('\n\n')}`
      );
    }
  });
});
