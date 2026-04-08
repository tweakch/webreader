import { mkdtempSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { describe, expect, it } from 'vitest';
import { runSource } from '../../crawlers/core';
import type { SourceAdapter, Story } from '../../crawlers/types';

describe('crawler frontmatter enrichment', () => {
  it('writes adapter-provided frontmatter fields into content.md', async () => {
    const story: Story = {
      slug: 'test-story',
      title: 'Test Story',
      url: 'https://example.com/story',
    };

    const adapter: SourceAdapter = {
      id: 'test-source',
      label: 'Test Source',
      listUrl: 'https://example.com/list',
      async getStoryList() {
        return [story];
      },
      async crawlStory() {
        return {
          body: '# Test Story\n\nOnce upon a time.',
          frontmatter: {
            author: 'Adapter Author',
            category: 'fairytale',
          },
        };
      },
    };

    const storiesDir = mkdtempSync(join(tmpdir(), 'webreader-crawler-test-'));
    try {
      const result = await runSource(adapter, { storiesDir });
      expect(result.succeeded).toHaveLength(1);
      expect(result.failed).toHaveLength(0);

      const contentPath = join(storiesDir, adapter.id, story.slug, 'content.md');
      const content = readFileSync(contentPath, 'utf-8');

      expect(content).toContain('title: "Test Story"');
      expect(content).toContain('source: "Test Source"');
      expect(content).toContain('url: "https://example.com/story"');
      expect(content).toContain('author: "Adapter Author"');
      expect(content).toContain('category: "fairytale"');
      expect(content).toContain('wordCount:');
      expect(content).toContain('# Test Story');
    } finally {
      rmSync(storiesDir, { recursive: true, force: true });
    }
  });

  it('uses adapter frontmatter values when keys collide (last write wins)', async () => {
    const story: Story = {
      slug: 'override-story',
      title: 'Original Title',
      url: 'https://example.com/original',
    };

    const adapter: SourceAdapter = {
      id: 'override-source',
      label: 'Original Source',
      listUrl: 'https://example.com/list',
      async getStoryList() {
        return [story];
      },
      async crawlStory() {
        return {
          body: '# Body Title\n\nStory body text.',
          frontmatter: {
            title: 'Adapter Title',
            source: 'Adapter Source',
            url: 'https://example.com/adapter',
          },
        };
      },
    };

    const storiesDir = mkdtempSync(join(tmpdir(), 'webreader-crawler-override-test-'));
    try {
      const result = await runSource(adapter, { storiesDir });
      expect(result.succeeded).toHaveLength(1);
      expect(result.failed).toHaveLength(0);

      const contentPath = join(storiesDir, adapter.id, story.slug, 'content.md');
      const content = readFileSync(contentPath, 'utf-8');

      expect(content).toContain('title: "Adapter Title"');
      expect(content).toContain('source: "Adapter Source"');
      expect(content).toContain('url: "https://example.com/adapter"');
      expect(content).not.toContain('title: "Original Title"');
      expect(content).not.toContain('source: "Original Source"');
      expect(content).not.toContain('url: "https://example.com/original"');
    } finally {
      rmSync(storiesDir, { recursive: true, force: true });
    }
  });
});
