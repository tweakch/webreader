import { parse } from 'node-html-parser';
import { fetchHtml } from '../core.ts';
import type { SourceAdapter, Story } from '../types.ts';

const BASE = 'https://www.maerchenstiftung.ch';
const SITEMAP = `${BASE}/sitemap.xml`;

function extractIdAndSlug(url: string): { id: string; slug: string } {
  const parts = url.split('/').filter(Boolean);
  const idx = parts.indexOf('maerchendatenbank');
  const id = parts[idx + 1];
  const slug = parts[idx + 2] ?? id;
  return { id, slug };
}

export const maerchenstiftung: SourceAdapter = {
  id: 'maerchenstiftung',
  label: 'Schweizer Märchen (Märchenstiftung)',
  listUrl: SITEMAP,

  async getStoryList(): Promise<Story[]> {
    const xml = await fetchHtml(SITEMAP);
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
      .map(m => m[1])
      .filter(u => u.includes('/maerchendatenbank/'));

    const seen = new Set<string>();
    const stories: Story[] = [];

    for (const url of urls) {
      const cleanUrl = decodeURIComponent(url);
      const { id, slug } = extractIdAndSlug(cleanUrl);
      if (!id || seen.has(id)) continue;

      seen.add(id);
      stories.push({
        slug: `${id}-${slug}`,
        title: slug.replace(/-/g, ' ').trim(), // improved default
        url: cleanUrl,
      });
    }
    return stories;
  },

  async crawlStory(story: Story) {
    const html = await fetchHtml(story.url, { referer: BASE });
    const root = parse(html);

    const title = root.querySelector('h1')?.text.trim() ?? story.title;
    const originFields = root
      .querySelectorAll('.MutaborFairytaleDatabaseOrigin')
      .map(node => node.text.trim());
    const canton = originFields
      .find(value => value.startsWith('Kanton:'))
      ?.replace(/^Kanton:\s*/, '') ?? '';
    const region = originFields
      .find(value => value.startsWith('Region:'))
      ?.replace(/^Region:\s*/, '')
      ?? root
        .querySelector('.MutaborFairytaleDatabaseRegion')
        ?.text
        .trim()
        .replace(/^Region:\s*/, '')
      ?? '';

    const container = root.querySelector('#fairyTaleDatabaseContent')
      ?? root.querySelector('.MutaborFairytaleDatabaseContent')
      ?? root.querySelector('.beFieldDataTypecKEditorText')
      ?? root.querySelector('.content, main, article, #content, .story-content')
      ?? root.querySelector('body');

    if (!container) throw new Error('No content container found');

    // Primary: paragraphs
    let paragraphs = container
      .querySelectorAll('p')
      .map(p => p.text.trim())
      .filter(p => p.length > 20);

    // Fallback: clean text blocks
    if (paragraphs.length < 3) {
      paragraphs = container.text
        .split(/\n\s*\n/)
        .map(t => t.trim())
        .filter(t => t.length > 80);
    }

    if (paragraphs.length === 0) {
      throw new Error('No content extracted');
    }

    const storyId = story.slug.split('-')[0] ?? '';
    const frontmatter = {
      ...(storyId ? { storyId } : {}),
      ...(canton ? { canton } : {}),
      ...(region ? { region } : {}),
    };

    return {
      body: `# ${title}\n\n${paragraphs.join('\n\n')}\n`,
      frontmatter: Object.keys(frontmatter).length > 0 ? frontmatter : undefined,
    };
  },
};