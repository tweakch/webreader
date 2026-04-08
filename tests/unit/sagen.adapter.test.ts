import type { Story } from '../../crawlers/types';

vi.mock('../../crawlers/core.ts', () => ({
  fetchHtml: vi.fn(),
}));

import { fetchHtml } from '../../crawlers/core.ts';
import { swiss } from '../../crawlers/sources/sagen.ts';

const INDEX_HTML = `
<html><body>
  <a href="aargau/sagen_aargau.html">Aargau</a>
  <a href="zug/sagen_zug.html">Zug</a>
</body></html>
`;

const AARGAU_HTML = `
<html><body>
  <a href="sagen_aargau.html">Index</a>
  <a href="kuengold.html">Küngold</a>
  <a href="vorwort.html">Vorwort</a>
</body></html>
`;

const ZUG_HTML = `
<html><body>
  <a href="sagen_zug.html">Index</a>
  <a href="heiden.html">Die Heiden</a>
</body></html>
`;

const STORY_HTML = `
<html><body>
  <h1 class="main_title">Die Heiden</h1>
  <div id="main_div">
    <p>Kurzer Text</p>
    <p>Dies ist ein laengerer Absatz mit relevanten Inhalt, der gespeichert wird.</p>
    <p>Quelle: Irgendwo</p>
  </div>
</body></html>
`;

describe('swiss sagen adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds story list from canton pages and skips index files', async () => {
    const fetchMock = vi.mocked(fetchHtml);
    fetchMock
      .mockResolvedValueOnce(INDEX_HTML)
      .mockResolvedValueOnce(AARGAU_HTML)
      .mockResolvedValueOnce(ZUG_HTML);

    const stories = await swiss.getStoryList();
    expect(stories).toEqual([
      {
        slug: 'aargau/kuengold',
        title: 'Küngold',
        url: 'https://www.sagen.at/texte/sagen/schweiz/aargau/kuengold.html',
      },
      {
        slug: 'zug/heiden',
        title: 'Die Heiden',
        url: 'https://www.sagen.at/texte/sagen/schweiz/zug/heiden.html',
      },
    ]);
  });

  it('crawls story and sets region from slug canton', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(STORY_HTML);
    const story: Story = {
      slug: 'zug/heiden',
      title: 'Die Heiden',
      url: 'https://www.sagen.at/texte/sagen/schweiz/zug/heiden.html',
    };

    const crawled = await swiss.crawlStory(story);
    if (typeof crawled === 'string') {
      throw new Error('Expected structured crawl result');
    }

    expect(crawled.body).toContain('# Die Heiden');
    expect(crawled.body).toContain('Dies ist ein laengerer Absatz');
    expect(crawled.body).not.toContain('Quelle:');
    expect(crawled.frontmatter).toMatchObject({ region: 'zug' });
  });
});
