import type { Story } from '../../crawlers/types';

vi.mock('../../crawlers/core.ts', () => ({
  fetchHtml: vi.fn(),
}));

import { fetchHtml } from '../../crawlers/core.ts';
import { grimm } from '../../crawlers/sources/grimm.ts';

const LIST_HTML = `
<html><body>
  <a href="/de/grimm_maerchen/rapunzel">Rapunzel Brüder Grimm →</a>
  <a href="/de/grimm_maerchen/rumpelstilzchen">Rumpelstilzchen</a>
  <a href="/de/grimm_maerchen/list">List</a>
  <a href="/de/grimm_maerchen/rapunzel">Rapunzel Brüder Grimm →</a>
</body></html>
`;

const STORY_HTML = `
<html><body>
  <div class="main"><h2>Rapunzel</h2></div>
  <div id="plainText">
    <div class="s">Es war einmal.</div>
    <div class="s">Eine Frau hatte Sehnsucht.</div>
  </div>
</body></html>
`;

describe('grimm adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('extracts a deduplicated story list and skips excluded slugs', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(LIST_HTML);
    const stories = await grimm.getStoryList();
    expect(stories).toEqual([
      {
        slug: 'rumpelstilzchen',
        title: 'Rumpelstilzchen',
        url: 'https://www.grimmstories.com/de/grimm_maerchen/rumpelstilzchen',
      },
    ]);
  });

  it('crawls story content and adds author frontmatter', async () => {
    vi.mocked(fetchHtml).mockResolvedValue(STORY_HTML);
    const story: Story = {
      slug: 'rapunzel',
      title: 'Rapunzel',
      url: 'https://www.grimmstories.com/de/grimm_maerchen/rapunzel',
    };

    const crawled = await grimm.crawlStory(story);
    if (typeof crawled === 'string') {
      throw new Error('Expected structured crawl result');
    }

    expect(crawled.body).toContain('# Rapunzel');
    expect(crawled.body).toContain('Es war einmal.');
    expect(crawled.frontmatter).toMatchObject({ author: 'Brüder Grimm' });
  });
});
