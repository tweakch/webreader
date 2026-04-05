import { parse } from 'node-html-parser';
import { fetchHtml } from '../core.ts';
import type { SourceAdapter, Story } from '../types.ts';

const BASE_URL = 'https://www.sagen.at';
const SWISS_BASE = `${BASE_URL}/texte/sagen/schweiz`;
const LIST_URL = `${SWISS_BASE}/sagen_schweiz.htm`;

// Canton index filenames to skip when listing stories inside a canton page
const SKIP_FILENAMES = new Set(['vorwort.html', 'vorwort.htm']);

export const swiss: SourceAdapter = {
  id: 'swiss',
  label: 'Schweizer Sagen',
  listUrl: LIST_URL,

  async getStoryList(): Promise<Story[]> {
    const html = await fetchHtml(LIST_URL);
    const root = parse(html);
    const stories: Story[] = [];
    const seen = new Set<string>();

    // Collect canton sub-index links (e.g. "allgemein/sagen_allgemein.html")
    const cantonLinks: { href: string; canton: string }[] = [];
    for (const a of root.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href') ?? '';
      // Canton links are relative, contain one slash, and end with .htm/.html
      if (!/^[^/]+\/[^/]+\.html?$/.test(href)) continue;
      const canton = href.split('/')[0];
      cantonLinks.push({ href, canton });
    }

    // For each canton page, collect the individual story links
    for (const { href: cantonHref, canton } of cantonLinks) {
      const cantonUrl = `${SWISS_BASE}/${cantonHref}`;
      const cantonBase = `${SWISS_BASE}/${canton}/`;
      let cantonHtml: string;
      try {
        cantonHtml = await fetchHtml(cantonUrl, { referer: LIST_URL });
      } catch {
        console.warn(`[swiss] Failed to fetch canton page: ${cantonUrl}`);
        continue;
      }
      const cantonRoot = parse(cantonHtml);
      // The canton index filename itself (e.g. "sagen_allgemein.html")
      const cantonIndexFile = cantonHref.split('/')[1];

      for (const a of cantonRoot.querySelectorAll('a[href]')) {
        const storyHref = a.getAttribute('href') ?? '';
        // Story links are simple filenames: no slash, no protocol, ends with .htm/.html
        if (!/^[^/]+\.html?$/.test(storyHref)) continue;
        if (storyHref === cantonIndexFile) continue;
        if (SKIP_FILENAMES.has(storyHref)) continue;

        const title = a.text.trim();
        if (!title || title.length < 3) continue;

        const slug = `${canton}/${storyHref.replace(/\.(html|htm)$/, '')}`;
        if (seen.has(slug)) continue;
        seen.add(slug);

        stories.push({ slug, title, url: `${cantonBase}${storyHref}` });
      }
    }

    return stories;
  },

  async crawlStory(story: Story): Promise<string> {
    const html = await fetchHtml(story.url, { referer: LIST_URL });
    const root = parse(html);

    const title = root.querySelector('h1.main_title')?.text.trim()
               ?? story.title;

    const paragraphs = root.querySelectorAll('#main_div p')
      .map(p => p.text.trim())
      .filter(text => text.length > 15
        && !text.includes('Quelle:')
        && !text.includes('korrekturgelesen'));

    return `# ${title}\n\n${paragraphs.join('\n\n')}\n`;
  },
};
