import { parse } from 'node-html-parser';
import { fetchHtml } from '../core.ts';
import type { SourceAdapter, Story } from '../types.ts';

const BASE_URL = 'https://www.andersenstories.com';
const LIST_URL = `${BASE_URL}/de/andersen_maerchen/list`;
const EXCLUDED = new Set(['list', 'index', 'favorites', 'titles', 'random', 'audio']);

export const andersen: SourceAdapter = {
  id: 'andersen',
  label: 'Andersens Märchen',
  listUrl: LIST_URL,

  async getStoryList(): Promise<Story[]> {
    const html = await fetchHtml(LIST_URL, { referer: `${BASE_URL}/de/andersen_maerchen/index` });
    const root = parse(html);
    const seen = new Set<string>();
    const stories: Story[] = [];

    for (const a of root.querySelectorAll('a')) {
      const href = a.getAttribute('href') ?? '';
      if (!href.includes('/de/andersen_maerchen/')) continue;
      const slug = href.split('/').pop() ?? '';
      if (!slug || EXCLUDED.has(slug) || slug.includes('?') || slug.includes('.') || seen.has(slug)) continue;
      const title = a.text.trim().replace(/\s*Hans Christian Andersen\s*→?\s*$/, '').trim();
      if (!title || title.includes('→')) continue;
      seen.add(slug);
      stories.push({ slug, title, url: `${BASE_URL}/de/andersen_maerchen/${slug}` });
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
        author: 'Hans Christian Andersen',
      },
    };
  },
};
