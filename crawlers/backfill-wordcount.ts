/**
 * One-off script: stamps `wordCount: N` into the frontmatter of every existing
 * story file that doesn't already have it.
 *
 * Usage:  npx tsx crawlers/backfill-wordcount.ts
 *
 * The word count mirrors what writeStory() now computes: all whitespace-separated
 * tokens in the markdown body (everything after the closing ---\n of the frontmatter).
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORIES_DIR = join(__dirname, '..', 'stories');

function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

let updated = 0;
let skipped = 0;

for (const source of readdirSync(STORIES_DIR, { withFileTypes: true })) {
  if (!source.isDirectory()) continue;

  for (const story of readdirSync(join(STORIES_DIR, source.name), { withFileTypes: true })) {
    if (!story.isDirectory()) continue;

    const filePath = join(STORIES_DIR, source.name, story.name, 'content.md');
    let raw: string;
    try {
      raw = readFileSync(filePath, 'utf-8');
    } catch {
      continue; // adaption subdirs and others without content.md
    }

    // Skip if wordCount is already present
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
    if (!fmMatch) continue;
    if (/^wordCount:\s*\d+$/m.test(fmMatch[1])) {
      skipped++;
      continue;
    }

    // Count words in the body (everything after the closing ---)
    const body = raw.slice(fmMatch[0].length);
    const wordCount = countWords(body);

    // Insert wordCount as the last field before the closing ---
    const updatedRaw = raw.replace(
      /^(---\n[\s\S]*?)\n---\n/,
      `$1\nwordCount: ${wordCount}\n---\n`,
    );

    writeFileSync(filePath, updatedRaw, 'utf-8');
    updated++;
  }
}

console.log(`Done — ${updated} files updated, ${skipped} already had wordCount.`);
