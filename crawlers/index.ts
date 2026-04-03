import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { runSource, writeMasterIndex } from './core.ts';
import type { SourceAdapter } from './types.ts';

// --- Register sources here ---
import { grimm } from './sources/grimm.ts';
import { andersen } from './sources/andersen.ts';

const ALL_SOURCES: SourceAdapter[] = [
  grimm,
  andersen,
];
// ----------------------------

const STORIES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'stories');

async function main() {
  const filter = process.argv[2];

  const sources = filter
    ? ALL_SOURCES.filter(s => s.id === filter)
    : ALL_SOURCES;

  if (filter && sources.length === 0) {
    console.error(`Unknown source "${filter}". Available: ${ALL_SOURCES.map(s => s.id).join(', ')}`);
    process.exit(1);
  }

  const results = [];
  for (const adapter of sources) {
    results.push(await runSource(adapter, { storiesDir: STORIES_DIR }));
  }

  writeMasterIndex(STORIES_DIR, results);

  const total = results.reduce((n, r) => n + r.succeeded.length, 0);
  const failures = results.reduce((n, r) => n + r.failed.length, 0);
  console.log(`\nDone. ${total} stories written${failures ? `, ${failures} failed` : ''}.`);
}

main().catch(err => { console.error(err); process.exit(1); });
