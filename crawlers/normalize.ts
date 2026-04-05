/**
 * Normalizes all stories/**\/content.md files in-place:
 *   - Collapses soft-wrapped paragraph lines into single lines
 *   - Ensures LF-only line endings throughout
 *   - Updates wordCount in the frontmatter to match the normalized body
 *
 * Usage:
 *   npm run normalize
 *   npm run normalize -- swiss          # limit to one source
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { normalizeBody, normalizeInline } from './core.ts';

const STORIES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'stories');

function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

/** Returns all content.md paths under a directory, recursively. */
function findContentFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findContentFiles(full));
    } else if (entry === 'content.md') {
      results.push(full);
    }
  }
  return results;
}

/**
 * Splits a content.md file into its frontmatter block and body text.
 * The frontmatter is returned as a raw string (including the --- delimiters).
 */
function splitFrontmatter(raw: string): { frontmatter: string; body: string } {
  const lf = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = lf.match(/^(---\n[\s\S]*?\n---\n)/);
  if (!match) return { frontmatter: '', body: lf };
  return { frontmatter: match[1], body: lf.slice(match[1].length) };
}

function updateWordCount(frontmatter: string, wordCount: number): string {
  return frontmatter.replace(/^wordCount: \d+$/m, `wordCount: ${wordCount}`);
}

/**
 * Normalizes inline whitespace in all quoted string fields of the frontmatter.
 * Replaces JSON-encoded strings that contain \r\n or multi-space sequences.
 */
function normalizeStringFields(frontmatter: string): string {
  return frontmatter.replace(/^(\w+): (".*")$/gm, (_, key, quoted) => {
    try {
      const value = JSON.parse(quoted) as string;
      return `${key}: ${JSON.stringify(normalizeInline(value))}`;
    } catch {
      return _;
    }
  });
}

const sourceFilter = process.argv[2] ?? null;

const files = findContentFiles(STORIES_DIR).filter(f =>
  sourceFilter ? f.includes(`stories/${sourceFilter}/`) || f.includes(`stories\\${sourceFilter}\\`) : true,
);

let changed = 0;

for (const filePath of files) {
  const raw = readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = splitFrontmatter(raw);

  const normalizedBody = normalizeBody(body);
  const updatedFrontmatter = normalizeStringFields(updateWordCount(frontmatter, countWords(normalizedBody)));
  const output = updatedFrontmatter + '\n' + normalizedBody;

  // Only write if something actually changed (avoids touching unmodified files)
  const outputLf = output.replace(/\r\n/g, '\n');
  const rawLf = raw.replace(/\r\n/g, '\n');
  if (outputLf === rawLf) continue;

  writeFileSync(filePath, output, { encoding: 'utf-8' });
  changed++;
}

console.log(`Normalized ${changed} of ${files.length} files.`);
