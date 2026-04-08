import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { CrawledStory, FrontmatterValue, SourceAdapter, Story } from './types.ts';

// ---------------------------------------------------------------------------
// Browser impersonation
// ---------------------------------------------------------------------------

const USER_AGENTS = [
  // Chrome 124 Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  // Chrome 124 Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  // Firefox 125 Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  // Firefox 125 Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:125.0) Gecko/20100101 Firefox/125.0',
  // Edge 124 Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  // Safari 17 Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
];

// Keep one UA per crawl run - a real user doesn't change browsers mid-session
const SESSION_UA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

export interface FetchOptions {
  referer?: string;
  acceptLanguage?: string;
}

function buildHeaders(options: FetchOptions = {}): Record<string, string> {
  const isSafari = SESSION_UA.includes('Safari') && !SESSION_UA.includes('Chrome');
  const isFirefox = SESSION_UA.includes('Firefox');

  const headers: Record<string, string> = {
    'User-Agent': SESSION_UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': options.acceptLanguage ?? 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'DNT': '1',
  };

  if (options.referer) {
    headers['Referer'] = options.referer;
  }

  // Sec-Fetch-* headers are sent by Chromium-family and Firefox but not Safari
  if (!isSafari) {
    headers['Sec-Fetch-Dest'] = 'document';
    headers['Sec-Fetch-Mode'] = 'navigate';
    headers['Sec-Fetch-Site'] = options.referer ? 'same-origin' : 'none';
    headers['Sec-Fetch-User'] = '?1';
  }

  // Firefox adds this header
  if (isFirefox) {
    headers['TE'] = 'trailers';
  }

  return headers;
}

export async function fetchHtml(url: string, options: FetchOptions = {}): Promise<string> {
  const res = await fetch(url, {
    headers: buildHeaders(options),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.text();
}

// ---------------------------------------------------------------------------
// Human-like delay
// ---------------------------------------------------------------------------

// Returns a random integer between min and max (inclusive)
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Normal inter-request delay: 800–2500 ms
// Every ~20 requests take a longer "reading" break (5–12 s)
function nextDelay(requestIndex: number): number {
  const isReadingBreak = requestIndex > 0 && requestIndex % randInt(15, 25) === 0;
  return isReadingBreak ? randInt(5000, 12000) : randInt(800, 2500);
}

// ---------------------------------------------------------------------------
// Body normalisation
// ---------------------------------------------------------------------------

/**
 * Collapses soft-wrapped lines within paragraphs into a single line and
 * ensures the result uses LF-only line endings.
 *
 * HTML sources often store paragraph text with mid-paragraph line breaks and
 * leading whitespace (e.g. the source HTML is indented). This function joins
 * those continuation lines into a single line per paragraph, leaving blank-
 * line-separated blocks (headings, paragraphs) intact.
 */
export function normalizeBody(text: string): string {
  // Normalise all line endings to LF
  const lf = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split on one or more blank lines, collapse soft wraps within each block
  const blocks = lf.split(/\n{2,}/);
  const normalized = blocks
    .map(block =>
      block
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join(' '),
    )
    .filter(block => block.length > 0);

  return normalized.join('\n\n') + '\n';
}

// ---------------------------------------------------------------------------
// File writing
// ---------------------------------------------------------------------------

/** Collapse any whitespace sequence (including \r\n) into a single space and trim. */
export function normalizeInline(text: string): string {
  return text.replace(/[\r\n\t ]+/g, ' ').trim();
}

function buildFrontmatter(fields: Record<string, FrontmatterValue>): string {
  const lines = Object.entries(fields).map(([k, v]) =>
    typeof v === 'number' ? `${k}: ${v}` : `${k}: ${JSON.stringify(normalizeInline(v))}`
  );
  return `---\n${lines.join('\n')}\n---\n`;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

export function writeStory(
  storiesDir: string,
  sourceId: string,
  story: Story,
  sourceLabel: string,
  body: string,
  extraFrontmatter: Record<string, FrontmatterValue> = {},
): void {
  const normalizedBody = normalizeBody(body);
  const frontmatterFields: Record<string, FrontmatterValue> = {
    title: story.title,
    source: sourceLabel,
    url: story.url,
    crawledAt: new Date().toISOString(),
    wordCount: countWords(normalizedBody),
    ...extraFrontmatter,
  };
  const frontmatter = buildFrontmatter(frontmatterFields);
  const dir = join(storiesDir, sourceId, story.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'content.md'), frontmatter + '\n' + normalizedBody, 'utf-8');
}

function toCrawledStory(crawled: string | CrawledStory): CrawledStory {
  if (typeof crawled === 'string') {
    return { body: crawled };
  }
  return crawled;
}

function writeSourceIndex(storiesDir: string, adapter: SourceAdapter, stories: Story[]): void {
  const lines = [
    `# ${adapter.label}`,
    '',
    `Source: ${adapter.listUrl}`,
    '',
    ...stories.map(s => `- [${s.title}](./${s.slug}/content.md)`),
    '',
  ];
  mkdirSync(join(storiesDir, adapter.id), { recursive: true });
  writeFileSync(join(storiesDir, adapter.id, 'README.md'), lines.join('\n'), 'utf-8');
}

// ---------------------------------------------------------------------------
// Run loop
// ---------------------------------------------------------------------------

export interface RunOptions {
  storiesDir: string;
  limit?: number;
}

export interface RunResult {
  adapter: SourceAdapter;
  succeeded: Story[];
  failed: Array<{ story: Story; error: unknown }>;
}

export async function runSource(adapter: SourceAdapter, options: RunOptions): Promise<RunResult> {
  const succeeded: Story[] = [];
  const failed: Array<{ story: Story; error: unknown }> = [];

  console.log(`\n[${adapter.id}] Fetching story list from ${adapter.listUrl} ...`);
  const allStories = await adapter.getStoryList();
  const stories = typeof options.limit === 'number'
    ? allStories.slice(0, options.limit)
    : allStories;
  console.log(
    `[${adapter.id}] Found ${allStories.length} stories, crawling ${stories.length}  (UA: ${SESSION_UA.slice(0, 60)}...)\n`,
  );

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    const prefix = `[${String(i + 1).padStart(3)}/${stories.length}]`;
    process.stdout.write(`${prefix} ${story.slug} ... `);

    try {
      const crawled = toCrawledStory(await adapter.crawlStory(story));
      writeStory(options.storiesDir, adapter.id, story, adapter.label, crawled.body, crawled.frontmatter);
      succeeded.push(story);
      console.log('ok');
    } catch (e) {
      failed.push({ story, error: e });
      console.log(`FAILED: ${e}`);
    }

    if (i < stories.length - 1) {
      const delay = nextDelay(i + 1);
      if (delay > 4000) process.stdout.write(`  (reading break ${(delay / 1000).toFixed(1)}s)\n`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  writeSourceIndex(options.storiesDir, adapter, succeeded);
  return { adapter, succeeded, failed };
}

export function writeMasterIndex(storiesDir: string, results: RunResult[]): void {
  const lines = ['# Story Library', ''];
  for (const { adapter, succeeded, failed } of results) {
    lines.push(`## [${adapter.label}](./${adapter.id}/README.md)`);
    lines.push('');
    lines.push(`- Source: ${adapter.listUrl}`);
    lines.push(`- Stories: ${succeeded.length} ok, ${failed.length} failed`);
    lines.push('');
  }
  writeFileSync(join(storiesDir, 'README.md'), lines.join('\n'), 'utf-8');
}
