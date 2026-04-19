// Configurable suggestion feeds — search-term landscape sourced from
// docs/features/suggestion-feeds.md. The matcher operates on the slug+title
// surface (frontmatter is sparse today); body-text and tag matching land in
// v2 once the enrichment pass is in place.

const COLLECTION_SOURCES = {
  klassiker: 'grimm-klassiker',
  tiere: 'grimm-tiere',
  top5: 'grimm-top5',
};

const SWISS_DIALECT_SOURCES = new Set(['hohler', 'swiss', 'idiotikon']);

const KNOWN_DARK_SLUGS = new Set([
  'blaubart',
  'der_gevatter_tod',
  'die_boten_des_todes',
  'von_dem_tode_des_huenchens',
  'der_tod_und_der_gansehirt',
]);

// Calendar windows are inclusive on both ends. Months are 1-indexed.
const SEASONAL_WINDOWS = {
  winterWeihnachten: { from: [11, 15], to: [1, 6] },
  silvester: { from: [12, 28], to: [1, 2] },
  fruehlingOstern: { from: [3, 1], to: [4, 30] },
  mai: { from: [5, 1], to: [5, 31] },
  sommerLicht: { from: [6, 1], to: [8, 31] },
  ernte: { from: [8, 1], to: [9, 30] },
  herbstNebel: { from: [10, 1], to: [10, 31] },
  martinstag: { from: [11, 5], to: [11, 15] },
  allerheiligen: { from: [10, 28], to: [11, 5] },
  nationalfeiertagCh: { from: [7, 29], to: [8, 4] },
  valentin: { from: [2, 10], to: [2, 16] },
};

export const FEEDS = [
  // 1. SEASONAL
  {
    id: 'winter-weihnachten',
    label: 'Winterzauber & Weihnachten',
    axis: 'seasonal',
    window: SEASONAL_WINDOWS.winterWeihnachten,
    terms: ['schnee', 'eis', 'frost', 'weihn', 'christ', 'tann', 'stern', 'engel', 'nikol', 'advent', 'krippe'],
  },
  {
    id: 'silvester-neujahr',
    label: 'Silvester & Neujahr',
    axis: 'seasonal',
    window: SEASONAL_WINDOWS.silvester,
    terms: ['neujahr', 'silvester', 'wunsch', 'glueck'],
  },
  {
    id: 'fruehling-ostern',
    label: 'Frühling & Ostern',
    axis: 'seasonal',
    window: SEASONAL_WINDOWS.fruehlingOstern,
    terms: ['oster', 'lamm', 'hase', 'ei', 'frueh', 'bluet', 'knosp', 'gaensebluemchen'],
  },
  {
    id: 'mai-pfingsten',
    label: 'Mai & Pfingsten',
    axis: 'seasonal',
    window: SEASONAL_WINDOWS.mai,
    terms: ['mai', 'wiese', 'blume', 'pfingst', 'taube'],
  },
  {
    id: 'sommer-licht',
    label: 'Sommer & Licht',
    axis: 'seasonal',
    window: SEASONAL_WINDOWS.sommerLicht,
    terms: ['sommer', 'sonne', 'wald', 'see', 'meer', 'quell'],
  },
  {
    id: 'erntezeit',
    label: 'Erntezeit',
    axis: 'seasonal',
    window: SEASONAL_WINDOWS.ernte,
    terms: ['ernte', 'korn', 'muehl', 'mueller', 'brot', 'garbe'],
  },
  {
    id: 'herbst-nebel',
    label: 'Herbst & Nebel',
    axis: 'seasonal',
    window: SEASONAL_WINDOWS.herbstNebel,
    terms: ['herbst', 'nebel', 'blatt', 'kuerbis'],
  },
  {
    id: 'martinstag',
    label: 'Martinstag',
    axis: 'seasonal',
    window: SEASONAL_WINDOWS.martinstag,
    terms: ['martin', 'latern', 'gans', 'bettler', 'mantel'],
  },
  {
    id: 'allerheiligen-tod',
    label: 'Allerheiligen — Geschichten vom Tod',
    axis: 'seasonal',
    window: SEASONAL_WINDOWS.allerheiligen,
    terms: ['tod', 'gevatter', 'bote', 'grab', 'geist', 'gespenst'],
  },
  {
    id: 'nationalfeiertag-ch',
    label: '1. August — Schweizer Sagen',
    axis: 'seasonal',
    window: SEASONAL_WINDOWS.nationalfeiertagCh,
    sourceFilter: (s) => s === 'swiss',
    terms: ['tell', 'eidg', 'bund'],
  },
  {
    id: 'valentinstag',
    label: 'Valentinstag — Liebe & Treue',
    axis: 'seasonal',
    window: SEASONAL_WINDOWS.valentin,
    terms: ['lieb', 'treu', 'braut', 'hochzeit', 'frosch', 'rapunzel'],
  },

  // 2. REGIONAL — landscape across all sources
  {
    id: 'landschaft-berge',
    label: 'Berge & Gipfel',
    axis: 'regional',
    terms: ['berg', 'alp', 'gipfel', 'gletsch', 'pass', 'fels', 'drachenloch'],
  },
  {
    id: 'landschaft-wasser',
    label: 'Seen, Bäche & Quellen',
    axis: 'regional',
    terms: ['see', 'bach', 'fluss', 'quell', 'meer', 'brunnen', 'aar'],
  },
  {
    id: 'landschaft-wald',
    label: 'Wald & Lichtung',
    axis: 'regional',
    terms: ['wald', 'forst', 'tann', 'lichtung', 'holz'],
  },
  {
    id: 'landschaft-burg',
    label: 'Burgen, Schlösser & Klöster',
    axis: 'regional',
    terms: ['burg', 'schloss', 'turm', 'kapell', 'kloster', 'kirch'],
  },
  {
    id: 'dialekt-schweiz',
    label: 'Schweizer Dialekt & Sagen',
    axis: 'regional',
    sourceFilter: (s) => SWISS_DIALECT_SOURCES.has(s),
  },

  // 3. MORAL / TUGEND
  { id: 'tugend-fleiss', label: 'Fleiß belohnt', axis: 'moral',
    terms: ['fleiss', 'arbeit', 'frau holle', 'sterntal', 'aschen', 'brave'] },
  { id: 'tugend-mut', label: 'Mut & Tapferkeit', axis: 'moral',
    terms: ['tapfer', 'furcht', 'mutig', 'kuehn', 'held', 'nichts fuerchtet'] },
  { id: 'tugend-demut', label: 'Demut & Bescheidenheit', axis: 'moral',
    terms: ['demut', 'bescheid', 'armut', 'arm', 'bettler'] },
  { id: 'tugend-treue', label: 'Treue & Freundschaft', axis: 'moral',
    terms: ['treu', 'freund', 'bruder', 'kamerad', 'reisekamerad'] },
  { id: 'tugend-mitleid', label: 'Mitleid & Barmherzigkeit', axis: 'moral',
    terms: ['mitleid', 'barm', 'helf', 'teil', 'sterntal'] },
  { id: 'tugend-klugheit', label: 'List & Klugheit', axis: 'moral',
    terms: ['klug', 'list', 'schlau', 'raetsel', 'kluges grethel'] },
  { id: 'warnung-habgier', label: 'Habgier bestraft', axis: 'moral',
    terms: ['gier', 'geiz', 'gold', 'goldene gans', 'fischer'] },
  { id: 'warnung-hochmut', label: 'Hochmut kommt vor dem Fall', axis: 'moral',
    terms: ['stolz', 'hochmut', 'eitel', 'drosselbart', 'spiegel'] },
  { id: 'warnung-luege', label: 'Lüge & Verrat', axis: 'moral',
    terms: ['luege', 'betrug', 'verrat', 'falsche braut'] },
  { id: 'motiv-erloesung', label: 'Erlösung', axis: 'moral',
    terms: ['erloesung', 'verwunsch', 'verzaubert', 'frosch', 'dornroes', 'schwan'] },

  // 4. MOTIF (preference) — characters, animals, objects, settings, patterns
  { id: 'chars-koenigshaus', label: 'Königshaus', axis: 'motif',
    terms: ['koenig', 'koenigin', 'prinz', 'prinzess'] },
  { id: 'chars-handwerk', label: 'Handwerker', axis: 'motif',
    terms: ['schneider', 'schuster', 'mueller', 'schmied', 'tischler'] },
  { id: 'chars-bauer-hirte', label: 'Bauern & Hirten', axis: 'motif',
    terms: ['bauer', 'hirte', 'magd', 'knecht', 'buerle'] },
  { id: 'chars-uebernatuerlich', label: 'Hexen, Riesen & Drachen', axis: 'motif',
    terms: ['hexe', 'zauber', 'fee', 'riese', 'zwerg', 'drache', 'kobold', 'unhold', 'teufel', 'engel', 'geist'] },
  { id: 'chars-familie', label: 'Familiengeschichten', axis: 'motif',
    terms: ['mutter', 'vater', 'bruder', 'schwester', 'waise', 'stiefmutter', 'juengst', 'sieben'] },

  { id: 'tiere-wolf-fuchs', label: 'Wolf & Fuchs', axis: 'motif',
    terms: ['wolf', 'fuchs'] },
  { id: 'tiere-vogel', label: 'Vögel', axis: 'motif',
    terms: ['vogel', 'gans', 'huhn', 'sperling', 'eule', 'nachtigall', 'zaunkoenig', 'taube', 'rohrdommel'] },
  { id: 'tiere-haustier', label: 'Haustiere', axis: 'motif',
    terms: ['katze', 'hund', 'pferd', 'esel', 'ziege', 'schaf', 'geiss'] },
  { id: 'tiere-wild', label: 'Wildtiere', axis: 'motif',
    terms: ['baer', 'hase', 'igel', 'loewe', 'hirsch', 'reh'] },
  { id: 'tiere-klein', label: 'Kleine Tiere', axis: 'motif',
    terms: ['frosch', 'maus', 'biene', 'fisch', 'scholle', 'schlange'] },

  { id: 'obj-magisch', label: 'Magische Gegenstände', axis: 'motif',
    terms: ['ring', 'spiegel', 'spinn', 'apfel', 'goldener', 'silber', 'mantel', 'kappe', 'horn', 'harfe', 'lebenswasser'] },
  { id: 'obj-kleidung', label: 'Kleidung & Schuhe', axis: 'motif',
    terms: ['schuh', 'kleid', 'hut', 'pantoffel'] },

  { id: 'setting-schloss', label: 'Schloss & Turm', axis: 'motif',
    terms: ['schloss', 'burg', 'turm', 'palast'] },
  { id: 'setting-wald-huette', label: 'Hütten im Wald', axis: 'motif',
    terms: ['waldhaus', 'huette', 'hexenhaus'] },
  { id: 'setting-jenseits', label: 'Himmel & Hölle', axis: 'motif',
    terms: ['himmel', 'hoelle', 'paradies'] },

  { id: 'pattern-aufgabe', label: 'Prüfungen & Rätsel', axis: 'motif',
    terms: ['aufgabe', 'pruefung', 'wette', 'raetsel'] },
  { id: 'pattern-wunsch', label: 'Drei Wünsche', axis: 'motif',
    terms: ['wunsch', 'drei wuensche'] },
  { id: 'pattern-fluch', label: 'Fluch & Verwünschung', axis: 'motif',
    terms: ['fluch', 'verwunsch', 'verzaubert', 'bann'] },

  // 5. MOOD (per docs/features/mood-recommendations.md)
  { id: 'mood-anxious', label: 'Beruhigend', axis: 'mood',
    terms: ['aschen', 'dornroes', 'sterntal', 'frau holle'] },
  { id: 'mood-sad', label: 'Hoffnungsvoll & wandelnd', axis: 'mood',
    terms: ['haessl', 'entlein', 'frosch', 'sterntal', 'aschen'] },
  { id: 'mood-angry', label: 'Trickster & Genugtuung', axis: 'mood',
    terms: ['rumpel', 'tapfere schneider', 'kluges grethel', 'bremer'] },
  { id: 'mood-curious', label: 'Abenteuer & Entdeckung', axis: 'mood',
    terms: ['reisekamerad', 'abenteuer', 'nichts fuerchtet'] },
  { id: 'mood-thrill', label: 'Düstere Stoffe', axis: 'mood',
    custom: (s) => KNOWN_DARK_SLUGS.has(storySlug(s)),
    terms: ['blaubart', 'hexe', 'teufel', 'tod', 'geist', 'gespenst'] },

  // 6. READING-CONTEXT
  { id: 'dauer-3min', label: '3-Minuten-Geschichten', axis: 'context',
    custom: (s) => typeof s.wordCount === 'number' && s.wordCount > 0 && s.wordCount < 500 },
  { id: 'dauer-mittag', label: 'Mittagspause (5-15 Min)', axis: 'context',
    custom: (s) => typeof s.wordCount === 'number' && s.wordCount >= 500 && s.wordCount < 2000 },
  { id: 'dauer-wochenend', label: 'Lange Geschichten', axis: 'context',
    custom: (s) => typeof s.wordCount === 'number' && s.wordCount >= 2000 },
  { id: 'bedtime-kurz', label: 'Gute-Nacht-Geschichten', axis: 'context',
    custom: (s) =>
      typeof s.wordCount === 'number' && s.wordCount < 800 &&
      typeof s.ageMax === 'number' && s.ageMax <= 8 },
  { id: 'alter-3-6', label: 'Für die Kleinsten (3-6)', axis: 'context',
    custom: (s) => ageBandOverlaps(s, 3, 6) },
  { id: 'alter-6-9', label: 'Schulkinder (6-9)', axis: 'context',
    custom: (s) => ageBandOverlaps(s, 6, 9) },
  { id: 'alter-9-12', label: 'Tweens (9-12)', axis: 'context',
    custom: (s) => ageBandOverlaps(s, 9, 12) },
  { id: 'kanon-grimm', label: 'Grimm-Klassiker', axis: 'context',
    sourceFilter: (s) => s === COLLECTION_SOURCES.klassiker },
  { id: 'tier-collection', label: 'Tiermärchen', axis: 'context',
    sourceFilter: (s) => s === COLLECTION_SOURCES.tiere },
  { id: 'quickstart', label: 'Quickstart — Top 5', axis: 'context',
    sourceFilter: (s) => s === COLLECTION_SOURCES.top5 },
];

function foldGerman(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
}

function ageBandOverlaps(story, min, max) {
  const sMin = typeof story.ageMin === 'number' ? story.ageMin : null;
  const sMax = typeof story.ageMax === 'number' ? story.ageMax : null;
  if (sMin == null && sMax == null) return false;
  const lo = sMin ?? sMax;
  const hi = sMax ?? sMin;
  return lo <= max && hi >= min;
}

function storySlug(story) {
  if (story.slug) return story.slug;
  // id is `${source}/${slug}` or `${source}/${directory}/${slug}`
  if (typeof story.id === 'string') {
    const parts = story.id.split('/');
    return parts[parts.length - 1] || '';
  }
  return '';
}

function storyHaystack(story) {
  const slug = storySlug(story);
  return foldGerman(`${slug} ${story.title || ''}`.replace(/[_-]+/g, ' '));
}

function scoreTerms(story, terms) {
  if (!terms || terms.length === 0) return 0;
  const hay = storyHaystack(story);
  let hits = 0;
  for (const term of terms) {
    if (hay.includes(foldGerman(term))) hits += 1;
  }
  return hits;
}

export function matchStory(story, feed) {
  if (feed.sourceFilter && !feed.sourceFilter(story.source)) return 0;
  if (feed.custom && feed.custom(story)) return 1;
  const score = scoreTerms(story, feed.terms);
  if (score > 0) return score;
  // sourceFilter alone (no terms, no custom) is a pass-through filter
  if (feed.sourceFilter && !feed.terms && !feed.custom) return 1;
  return 0;
}

function inWindow({ from, to }, date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const cmp = (a, b) => a[0] * 100 + a[1] - (b[0] * 100 + b[1]);
  const today = [m, d];
  if (cmp(from, to) <= 0) {
    return cmp(today, from) >= 0 && cmp(today, to) <= 0;
  }
  // wrap-around (e.g. Nov 15 → Jan 6)
  return cmp(today, from) >= 0 || cmp(today, to) <= 0;
}

export function isFeedActive(feed, date = new Date()) {
  if (!feed.window) return true;
  return inWindow(feed.window, date);
}

export function getActiveFeeds(date = new Date()) {
  return FEEDS.filter((f) => isFeedActive(f, date));
}

// Stable per-day shuffle so the same date returns the same order.
function dateSeed(date) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tieBreakStable(stories, seed) {
  const rng = mulberry32(seed);
  return stories
    .map((s) => ({ s, k: rng() }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.s);
}

export function buildFeed(feed, storyIndex, { limit = 12, date = new Date() } = {}) {
  const scored = [];
  for (const story of storyIndex) {
    const score = matchStory(story, feed);
    if (score > 0) scored.push({ story, score });
  }
  // Sort by score desc, then stable-shuffle ties by date seed.
  const seed = dateSeed(date) ^ hashString(feed.id);
  const buckets = new Map();
  for (const e of scored) {
    if (!buckets.has(e.score)) buckets.set(e.score, []);
    buckets.get(e.score).push(e.story);
  }
  const ordered = [...buckets.keys()]
    .sort((a, b) => b - a)
    .flatMap((s) => tieBreakStable(buckets.get(s), seed + s));
  return {
    id: feed.id,
    label: feed.label,
    axis: feed.axis,
    stories: ordered.slice(0, limit),
    total: ordered.length,
  };
}

function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function buildDailyFeeds(storyIndex, {
  date = new Date(),
  limitPerFeed = 12,
  enabledFeedIds = null,
} = {}) {
  const active = getActiveFeeds(date).filter(
    (f) => !enabledFeedIds || enabledFeedIds.includes(f.id),
  );
  return active
    .map((feed) => buildFeed(feed, storyIndex, { limit: limitPerFeed, date }))
    .filter((row) => row.stories.length > 0);
}
