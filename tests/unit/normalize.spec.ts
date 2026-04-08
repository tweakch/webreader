import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  splitFrontmatter,
  updateWordCount,
  normalizeStringFields,
  normalizeStories,
} from '../../crawlers/normalize.ts';

describe('normalize helpers', () => {
  it('splits frontmatter from body', () => {
    const raw = `---\ntitle: "X"\nwordCount: 1\n---\n\nBody text\n`;
    const parts = splitFrontmatter(raw);
    expect(parts.frontmatter).toContain('title: "X"');
    expect(parts.body).toContain('Body text');
  });

  it('updates wordCount line in frontmatter', () => {
    const fm = `---\nwordCount: 10\n---\n`;
    expect(updateWordCount(fm, 25)).toContain('wordCount: 25');
  });

  it('normalizes quoted string fields whitespace', () => {
    const fm = `---\ntitle: "A  B"\nsource: "X\\nY"\n---\n`;
    const normalized = normalizeStringFields(fm);
    expect(normalized).toContain('title: "A B"');
    expect(normalized).toContain('source: "X Y"');
  });
});

describe('normalizeStories', () => {
  it('rewrites content and wordCount for matching story files', () => {
    const root = mkdtempSync(join(tmpdir(), 'webreader-normalize-test-'));
    try {
      const storiesDir = join(root, 'stories');
      const dir = join(storiesDir, 'swiss', 'zug', 'heiden');
      mkdirSync(dir, { recursive: true });
      const filePath = join(dir, 'content.md');

      writeFileSync(
        filePath,
        `---\ntitle: "Die  Heiden"\nsource: "Sagen\\nAT"\nwordCount: 1\n---\n\nDas\nist ein\nText.\n`,
        'utf-8',
      );

      const result = normalizeStories(storiesDir, 'swiss');
      expect(result.total).toBe(1);
      expect(result.changed).toBe(1);

      const output = readFileSync(filePath, 'utf-8');
      expect(output).toContain('title: "Die Heiden"');
      expect(output).toContain('source: "Sagen AT"');
      expect(output).toContain('wordCount: 4');
      expect(output).toContain('Das ist ein Text.');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
