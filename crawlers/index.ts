import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { runSource, writeMasterIndex } from './core.ts';
import type { SourceAdapter } from './types.ts';

// --- Register sources here ---
import { grimm } from './sources/grimm.ts';
import { andersen } from './sources/andersen.ts';
import { swiss } from './sources/sagen.ts';
import { maerchenstiftung } from './sources/maerchenstiftung.ts';

const ALL_SOURCES: SourceAdapter[] = [
  grimm,
  andersen,
  swiss,
  maerchenstiftung,
];
// ----------------------------

const STORIES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'stories');

function parseArgs(args: string[]): { filter?: string; limit?: number } {
  let filter: string | undefined;
  let limit: number | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--limit') {
      const value = Number(args[i + 1]);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error('Invalid --limit value. Use a positive integer.');
      }
      limit = Math.floor(value);
      i++;
      continue;
    }

    if (/^\d+$/.test(arg) && typeof filter !== 'string' && typeof limit !== 'number') {
      // Allow shorthand: `npm run crawl -- 10`
      limit = Number(arg);
      continue;
    }

    if (typeof filter !== 'string') {
      filter = arg;
      continue;
    }

    throw new Error(`Unknown argument "${arg}".`);
  }

  return { filter, limit };
}

async function main() {
  const { filter, limit } = parseArgs(process.argv.slice(2));

  const sources = filter
    ? ALL_SOURCES.filter(s => s.id === filter)
    : ALL_SOURCES;

  if (filter && sources.length === 0) {
    console.error(`Unknown source "${filter}". Available: ${ALL_SOURCES.map(s => s.id).join(', ')}`);
    process.exit(1);
  }

  const results = [];
  for (const adapter of sources) {
    results.push(await runSource(adapter, { storiesDir: STORIES_DIR, limit }));
  }

  writeMasterIndex(STORIES_DIR, results);

  const total = results.reduce((n, r) => n + r.succeeded.length, 0);
  const failures = results.reduce((n, r) => n + r.failed.length, 0);
  console.log(`\nDone. ${total} stories written${failures ? `, ${failures} failed` : ''}.`);
}

main().catch(err => { console.error(err); process.exit(1); });
