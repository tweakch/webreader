/**
 * Creates a "Schweizer Fassung" adaption for every 2-level story that contains ß.
 * Swiss Standard German replaces ß with ss and ẞ with SS throughout.
 *
 * Usage:  npx tsx crawlers/create-swiss-adaptions.ts
 *         npx tsx crawlers/create-swiss-adaptions.ts --dry-run
 *
 * Idempotent: skips stories whose adaption already exists.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORIES_DIR = join(__dirname, '..', 'stories');
const ADAPTION_SLUG = 'schweizerdeutsch';
const ADAPTION_NAME = 'Schweizer Fassung';
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE   = process.argv.includes('--force');

if (DRY_RUN) console.log('--- DRY RUN (no files written) ---\n');
if (FORCE)   console.log('--- FORCE mode (existing adaptions will be overwritten) ---\n');

function applySwissSpelling(text: string): string {
  return text
    .replace(/ẞ/g, 'SS')
    .replace(/ß/g, 'ss');
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Parse the frontmatter block and body from a raw content.md string.
 * Returns null if the file has no valid frontmatter.
 */
function parseContent(raw: string): { frontmatter: string; body: string } | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  return { frontmatter: match[1], body: match[2] };
}

let created = 0;
let skipped = 0;
let noSzCount = 0;

for (const sourceEntry of readdirSync(STORIES_DIR, { withFileTypes: true })) {
  if (!sourceEntry.isDirectory()) continue;
  const sourceDir = join(STORIES_DIR, sourceEntry.name);

  for (const storyEntry of readdirSync(sourceDir, { withFileTypes: true })) {
    if (!storyEntry.isDirectory()) continue;
    const storyDir = join(sourceDir, storyEntry.name);
    const contentPath = join(storyDir, 'content.md');

    // 2-level stories have content.md directly in the story dir.
    // 3-level sources (e.g. sagen) have canton subdirs instead - skip them.
    let raw: string;
    try {
      raw = readFileSync(contentPath, 'utf-8');
    } catch {
      continue;
    }

    // Skip if the story contains no ß at all
    if (!raw.includes('ß') && !raw.includes('ẞ')) {
      noSzCount++;
      continue;
    }

    const adaptionDir = join(storyDir, 'adaptions', ADAPTION_SLUG);
    const adaptionPath = join(adaptionDir, 'content.md');

    // Skip if already generated, unless --force
    if (existsSync(adaptionPath) && !FORCE) {
      skipped++;
      continue;
    }

    const parsed = parseContent(raw);
    if (!parsed) {
      console.warn(`  WARN: no frontmatter in ${contentPath}, skipping`);
      continue;
    }

    const swissBody = applySwissSpelling(parsed.body);
    const wordCount = countWords(swissBody);

    // Build adaption frontmatter: copy title/source/url, add adaption field
    const titleMatch   = parsed.frontmatter.match(/^title:\s*"(.+)"$/m);
    const sourceMatch  = parsed.frontmatter.match(/^source:\s*(.+)$/m);
    const urlMatch     = parsed.frontmatter.match(/^url:\s*(.+)$/m);

    const title  = JSON.stringify(applySwissSpelling(titleMatch ? titleMatch[1] : ''));
    const source = sourceMatch ? sourceMatch[1] : '""';
    const url    = urlMatch    ? urlMatch[1]    : '""';

    const adaptionFrontmatter = [
      `title: ${title}`,
      `source: ${source}`,
      `url: ${url}`,
      `adaption: ${JSON.stringify(ADAPTION_NAME)}`,
      `crawledAt: ${JSON.stringify(new Date().toISOString())}`,
      `wordCount: ${wordCount}`,
    ].join('\n');

    const output = `---\n${adaptionFrontmatter}\n---\n${swissBody}`;

    console.log(`  + ${sourceEntry.name}/${storyEntry.name}`);
    if (!DRY_RUN) {
      mkdirSync(adaptionDir, { recursive: true });
      writeFileSync(adaptionPath, output, 'utf-8');
    }
    created++;
  }
}

console.log(
  `\nDone — ${created} adaption${created !== 1 ? 's' : ''} ${DRY_RUN ? 'would be ' : ''}created,` +
  ` ${skipped} already existed, ${noSzCount} stories had no ß.`,
);
