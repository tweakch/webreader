/**
 * Lightweight frontmatter validator for story `content.md` files.
 *
 * Zero runtime deps — the validator is small and predictable. If we ever
 * want richer schemas (nested types, discriminated unions) switch to zod
 * or valibot; for now every story needs only a handful of known fields.
 *
 * Contract:
 *   title       string, non-empty
 *   source      string, non-empty
 *   url         string, starts with http(s)://
 *   wordCount   number, integer, > 0
 *   crawledAt   ISO-8601 timestamp (optional — older stories may lack it)
 *   language    ISO 639-1 code (optional)
 *   author      string (optional)
 */

export interface FrontmatterIssue {
  field: string;
  message: string;
}

export interface FrontmatterRecord {
  title?: unknown;
  source?: unknown;
  url?: unknown;
  wordCount?: unknown;
  crawledAt?: unknown;
  language?: unknown;
  author?: unknown;
  [k: string]: unknown;
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;
const LANG_RE = /^[a-z]{2}(?:-[A-Za-z0-9]+)?$/;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isHttpUrl(v: unknown): v is string {
  if (typeof v !== 'string') return false;
  return /^https?:\/\/\S+$/.test(v);
}

function isNonNegativeInt(v: unknown): boolean {
  if (typeof v === 'number') return Number.isInteger(v) && v >= 0;
  if (typeof v === 'string' && /^\d+$/.test(v)) return true;
  return false;
}

export function validateFrontmatter(fm: FrontmatterRecord): FrontmatterIssue[] {
  const issues: FrontmatterIssue[] = [];

  // Required: identifying fields. These are what the app actually relies
  // on at render time — title in the reader, source as badge. Everything
  // else is strongly typed when present, but optional.
  if (!isNonEmptyString(fm.title)) issues.push({ field: 'title', message: 'required, non-empty string' });
  if (!isNonEmptyString(fm.source)) issues.push({ field: 'source', message: 'required, non-empty string' });
  if (fm.url != null && !isHttpUrl(fm.url)) {
    issues.push({ field: 'url', message: 'optional, but if present must be http(s) URL' });
  }
  if (fm.wordCount != null && !isNonNegativeInt(fm.wordCount)) {
    issues.push({
      field: 'wordCount',
      message: 'optional, but if present must be a non-negative integer (number or numeric string)',
    });
  }

  if (fm.crawledAt != null && !(typeof fm.crawledAt === 'string' && ISO_RE.test(fm.crawledAt))) {
    issues.push({ field: 'crawledAt', message: 'optional, but if present must be ISO-8601' });
  }
  if (fm.language != null && !(typeof fm.language === 'string' && LANG_RE.test(fm.language))) {
    issues.push({ field: 'language', message: 'optional, but if present must be ISO 639-1 (e.g. "de", "de-CH")' });
  }
  if (fm.author != null && !isNonEmptyString(fm.author)) {
    issues.push({ field: 'author', message: 'optional, but if present must be non-empty string' });
  }

  return issues;
}

/**
 * Parse the YAML-ish frontmatter block emitted by the crawler. The crawler
 * writes a conservative subset: scalar key/value pairs, values quoted when
 * string, unquoted when numeric. We only parse that subset — if we ever
 * start emitting nested structures, swap in a YAML library.
 */
export function parseFrontmatter(content: string): FrontmatterRecord | null {
  if (!content.startsWith('---\n')) return null;
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) return null;
  const block = content.slice(4, end);
  const out: FrontmatterRecord = {};
  for (const line of block.split('\n')) {
    if (!line.trim()) continue;
    const m = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, key, rawValue] = m;
    const trimmed = rawValue.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      out[key] = trimmed.slice(1, -1);
    } else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      out[key] = Number(trimmed);
    } else if (trimmed === 'true' || trimmed === 'false') {
      out[key] = trimmed === 'true';
    } else {
      out[key] = trimmed;
    }
  }
  return out;
}
