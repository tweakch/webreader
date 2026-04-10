import { parse } from 'node-html-parser';
import { fetchHtml } from '../core.ts';
import type { SourceAdapter, Story } from '../types.ts';

const BASE_URL = 'https://www.grimmstories.com';
const LIST_URL = `${BASE_URL}/de/grimm_maerchen/list`;
const EXCLUDED = new Set(['list', 'index', 'favorites', 'titles', 'random', 'audio']);

export const grimm: SourceAdapter = {
  id: 'grimm',
  label: 'Grimms Märchen',
  listUrl: LIST_URL,

  async getStoryList(): Promise<Story[]> {
    const html = await fetchHtml(LIST_URL, { referer: `${BASE_URL}/de/grimm_maerchen/index` });
    const root = parse(html);
    const seen = new Set<string>();
    const stories: Story[] = [];

    for (const a of root.querySelectorAll('a')) {
      const href = a.getAttribute('href') ?? '';
      if (!href.includes('/de/grimm_maerchen/')) continue;
      const slug = href.split('/').pop() ?? '';
      if (!slug || EXCLUDED.has(slug) || slug.includes('?') || slug.includes('.') || seen.has(slug)) continue;
      const rawText = a.text.trim();
      if (!rawText || rawText.includes('→')) continue;
      const title = rawText.replace(/\s*Brüder Grimm\s*$/, '').trim();
      if (!title) continue;
      seen.add(slug);
      stories.push({ slug, title, url: `${BASE_URL}/de/grimm_maerchen/${slug}` });
    }

    return stories;
  },

  async crawlStory(story: Story) {
    const html = await fetchHtml(story.url, { referer: LIST_URL });
    const root = parse(html);

    const title = root.querySelector('div.main h2')?.text.trim() ?? story.title;
    const paragraphs = root.querySelector('#plainText')
      ?.querySelectorAll('div.s')
      .map(d => d.text.trim())
      .filter(Boolean) ?? [];

    return {
      body: `# ${title}\n\n${paragraphs.join('\n\n')}\n`,
      frontmatter: {
        author: 'Brüder Grimm',
      },
    };
  },
};
