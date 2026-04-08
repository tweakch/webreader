import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Story } from '../../crawlers/types';

vi.mock('../../crawlers/core.ts', () => ({
  fetchHtml: vi.fn(),
}));

import { fetchHtml } from '../../crawlers/core.ts';
import { maerchenstiftung } from '../../crawlers/sources/maerchenstiftung.ts';

const SAMPLE_HTML = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Spukende Katze | Märchenstiftung</title>
</head>
<body>
  <div id="blockEditor">
    <div class="beField beFieldDataTypecKEditorText">
      <div id="fairyTaleDatabaseContainer">
        <div id="fairyTaleDatabaseWrapper">
          <div id="mutaborFairyTale">
            <div class="MutaborFairytaleDatabaseTitle"><h1>Spukende Katze</h1></div>
            <div class="MutaborFairytaleDatabaseCountry">Land: Schweiz</div>
            <div class="MutaborFairytaleDatabaseOrigin">Kanton: Aargau</div>
            <div class="MutaborFairytaleDatabaseOrigin">Region: Wettingen</div>
            <div class="MutaborFairytaleDatabaseType">Kategorie: Sage</div>
            <div class="MutaborFairytaleDatabaseContent">
              <p>Mitten zwischen dem Kloster Wettingen und dem eine Viertelstunde davon gelegenen gleichnamigen Dorf standen zwei grosse steinerne Pfosten hergebaut mit einem Gitterthore.</p>
              <p>E. L. Rochholz, Schweizer Sagen aus dem Aargau, Band 2, Aarau 1856</p>
              <p>Eingelesen von der Mutabor Märchenstiftung auf www.maerchenstiftung.ch</p>
              <p>&nbsp;</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

const SAMPLE_SITEMAP_XML = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.maerchenstiftung.ch/maerchendatenbank/6097/spukende-katze</loc>
  </url>
  <url>
    <loc>https://www.maerchenstiftung.ch/maerchendatenbank/6098/der-goldene-schluessel</loc>
  </url>
  <url>
    <loc>https://www.maerchenstiftung.ch/maerchendatenbank/6097/spukende-katze</loc>
  </url>
  <url>
    <loc>https://www.maerchenstiftung.ch/impressum</loc>
  </url>
  <url>
    <loc>https://www.maerchenstiftung.ch/maerchendatenbank/7000/m%C3%A4rchen-mit-umlaut</loc>
  </url>
</urlset>
`;

describe('maerchenstiftung adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('extracts canton and region into frontmatter from the provided page HTML', async () => {
    const fetchHtmlMock = vi.mocked(fetchHtml);
    fetchHtmlMock.mockResolvedValue(SAMPLE_HTML);

    const story: Story = {
      slug: '6097-spukende-katze',
      title: 'spukende katze',
      url: 'https://www.maerchenstiftung.ch/maerchendatenbank/6097/spukende-katze',
    };

    const crawled = await maerchenstiftung.crawlStory(story);
    expect(typeof crawled).toBe('object');
    if (typeof crawled === 'string') {
      throw new Error('Expected structured crawl result with frontmatter');
    }

    expect(crawled.frontmatter).toMatchObject({
      storyId: '6097',
      canton: 'Aargau',
      region: 'Wettingen',
    });

    expect(crawled.body).toContain('# Spukende Katze');
    expect(crawled.body).toContain('Mitten zwischen dem Kloster Wettingen');
    expect(crawled.body).not.toContain('**Kanton:**');
    expect(crawled.body).not.toContain('**Region:**');
  });

  it('builds a unique story list from sitemap entries', async () => {
    const fetchHtmlMock = vi.mocked(fetchHtml);
    fetchHtmlMock.mockResolvedValue(SAMPLE_SITEMAP_XML);

    const stories = await maerchenstiftung.getStoryList();

    expect(stories).toHaveLength(3);
    expect(stories).toEqual([
      {
        slug: '6097-spukende-katze',
        title: 'spukende katze',
        url: 'https://www.maerchenstiftung.ch/maerchendatenbank/6097/spukende-katze',
      },
      {
        slug: '6098-der-goldene-schluessel',
        title: 'der goldene schluessel',
        url: 'https://www.maerchenstiftung.ch/maerchendatenbank/6098/der-goldene-schluessel',
      },
      {
        slug: '7000-märchen-mit-umlaut',
        title: 'märchen mit umlaut',
        url: 'https://www.maerchenstiftung.ch/maerchendatenbank/7000/märchen-mit-umlaut',
      },
    ]);
  });
});
