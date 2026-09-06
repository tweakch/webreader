/** Characters of a paragraph used for the optional anchor start-hash. */
export const PARAGRAPH_START_CHARS = 48;

/**
 * Stable FNV-1a 32-bit hex of UTF-8 bytes. Used as `storyVersion` and as the
 * optional paragraph-start `anchor.hash` so a pack can pin to exact text
 * without depending on page layout. Shared with Inhalt (#70).
 */
export function hashStoryContent(text) {
  const bytes = new TextEncoder().encode(String(text ?? ''));
  let hash = 2166136261;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/** Hash of the leading `PARAGRAPH_START_CHARS` of a paragraph (trimmed). */
export function hashParagraphStart(paragraph) {
  return hashStoryContent(
    String(paragraph ?? '')
      .trim()
      .slice(0, PARAGRAPH_START_CHARS)
  );
}

/** Same split the pager uses (`useReader` → `content.split('\n\n')`). */
export function splitStoryParagraphs(content) {
  return String(content ?? '').split('\n\n');
}
