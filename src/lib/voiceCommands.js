/**
 * Pure voice-command parser for the Voice Control epic.
 *
 * Turns a raw transcript string (from the Web Speech API) into a structured
 * intent `{ type, payload }`. Kept free of React / DOM so it can be unit-tested
 * without mocking anything.
 */

// JavaScript's `\b` only recognises ASCII word chars, so it fails at umlauts
// (a position in front of "ü" is never treated as a word boundary). Replace
// `\b` with explicit Unicode-aware lookarounds so German words parse correctly.
const BS = '(?<![a-z0-9äöüß])'; // word-start boundary
const BE = '(?![a-z0-9äöüß])';  // word-end boundary
const W = (pattern) => new RegExp(`${BS}(?:${pattern})${BE}`);
const WC = (pattern, flags = '') => new RegExp(`${BS}(?:${pattern})${BE}`, flags);

const NUMBER_WORDS = {
  null: 0, zero: 0,
  eins: 1, one: 1, ein: 1, eine: 1, einer: 1,
  zwei: 2, two: 2,
  drei: 3, three: 3,
  vier: 4, four: 4,
  fünf: 5, funf: 5, five: 5,
  sechs: 6, six: 6,
  sieben: 7, seven: 7,
  acht: 8, eight: 8,
  neun: 9, nine: 9,
  zehn: 10, ten: 10,
  elf: 11, eleven: 11,
  zwölf: 12, zwoelf: 12, twelve: 12,
  dreizehn: 13, thirteen: 13,
  vierzehn: 14, fourteen: 14,
  fünfzehn: 15, funfzehn: 15, fifteen: 15,
  sechzehn: 16, sixteen: 16,
  siebzehn: 17, seventeen: 17,
  achtzehn: 18, eighteen: 18,
  neunzehn: 19, nineteen: 19,
  zwanzig: 20, twenty: 20,
};

const RESUME_RE = W('weiter|weiterlesen|continue|resume|last\\s+book|where\\s+was\\s+i');
const NEXT_PAGE_RE = W('nächste\\s+seite|naechste\\s+seite|next\\s+page|nächstes|naechstes|umblättern|umblaettern|blättern|blaettern|next|weiterblättern|weiterblaettern');
const PREV_PAGE_RE = W('vorherige\\s+seite|previous\\s+page|zurück|zurueck|back|vorher|previous');
const GOTO_PAGE_RE = new RegExp(`${BS}(?:seite|page)${BE}\\s+([a-zäöüß0-9]+)`);
const HOME_RE = W('home|library|übersicht|uebersicht|zur\\s+übersicht|zur\\s+uebersicht|bibliothek|startseite');
const FAVORITES_RE = W('favoriten|favorites|lieblinge');
const CLOSE_RE = W('close|schließen|schliessen|zumachen');
const READ_RE = W('vorlesen|read(?:\\s+aloud)?|lies\\s+vor|sprich');
const PAUSE_RE = W('pause|pausiere|anhalten|halt\\s+an');
const STOP_TTS_RE = W('stop|stopp|aufhören|aufhoeren');
const FASTER_RE = W('schneller|faster|speed\\s+up');
const SLOWER_RE = W('langsamer|slower|slow\\s+down');
const SURPRISE_RE = W('surprise(?:\\s+me)?|überrasch(?:e|)(?:\\s+mich)?|ueberrasch(?:e|)(?:\\s+mich)?|zufall|random');
const SHORT_STORY_RE = W('short\\s+(?:story|one)|kurze\\s+geschichte|etwas\\s+kurzes');
const LONG_STORY_RE = W('long\\s+(?:story|one)|lange\\s+geschichte|etwas\\s+langes');
const FIND_RE = new RegExp(`${BS}(?:finde|findet|find|suche|sucht|such|search\\s+for|search|suchen)${BE}\\s+(.+)$`);
const OPEN_RE = new RegExp(`${BS}(?:open|öffne|oeffne|lies|read\\s+me|zeig\\s+mir|show\\s+me|mach\\s+auf)${BE}\\s+(.+)$`);
const STOP_LISTEN_RE = W('stop\\s+listening|nicht\\s+mehr\\s+zuhören|nicht\\s+mehr\\s+zuhoeren|hör\\s+auf\\s+zuzuhören|hoer\\s+auf\\s+zuzuhoeren');

export function normalizeTranscript(raw) {
  return (raw || '')
    .toLowerCase()
    .replace(/[.?!,;:]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePageToken(token) {
  if (!token) return null;
  const trimmed = token.trim();
  const direct = Number.parseInt(trimmed, 10);
  if (Number.isFinite(direct) && direct > 0) return direct;
  if (Object.hasOwn(NUMBER_WORDS, trimmed)) {
    const n = NUMBER_WORDS[trimmed];
    return n > 0 ? n : null;
  }
  return null;
}

export function parseVoiceCommand(raw) {
  const text = normalizeTranscript(raw);
  if (!text) return { type: 'unknown', transcript: '' };

  if (STOP_LISTEN_RE.test(text)) return { type: 'stop-listening' };

  if (RESUME_RE.test(text) && !NEXT_PAGE_RE.test(text) && !PREV_PAGE_RE.test(text)) {
    return { type: 'resume' };
  }

  if (PAUSE_RE.test(text)) return { type: 'pause' };
  if (STOP_TTS_RE.test(text)) return { type: 'stop' };
  if (FASTER_RE.test(text)) return { type: 'faster' };
  if (SLOWER_RE.test(text)) return { type: 'slower' };

  if (NEXT_PAGE_RE.test(text)) return { type: 'next-page' };
  if (PREV_PAGE_RE.test(text)) return { type: 'prev-page' };

  const goto = text.match(GOTO_PAGE_RE);
  if (goto) {
    const page = parsePageToken(goto[1]);
    if (page) return { type: 'goto-page', page };
  }

  if (HOME_RE.test(text)) return { type: 'home' };
  if (FAVORITES_RE.test(text)) return { type: 'favorites' };
  if (CLOSE_RE.test(text)) return { type: 'close' };

  if (SURPRISE_RE.test(text)) return { type: 'surprise' };
  if (SHORT_STORY_RE.test(text)) return { type: 'short-story' };
  if (LONG_STORY_RE.test(text)) return { type: 'long-story' };

  const find = text.match(FIND_RE);
  if (find) return { type: 'find', query: find[1].trim() };

  if (READ_RE.test(text)) return { type: 'read' };

  const open = text.match(OPEN_RE);
  if (open) return { type: 'open-story', title: open[1].trim() };

  return { type: 'unknown', transcript: text };
}

/**
 * Fuzzy-match a spoken title against a story list. Returns the best match if
 * its score is above a threshold, otherwise null. Handles typical ASR errors
 * (missing umlauts, dropped/extra words).
 *
 * @param {string} spoken
 * @param {Array<{id: string, title: string}>} stories
 * @returns {{ story: any, score: number, ambiguous: boolean }|null}
 */
export function findStoryByVoice(spoken, stories) {
  if (!spoken || !Array.isArray(stories) || stories.length === 0) return null;
  const needle = normalizeTranscript(spoken);
  if (!needle) return null;
  const needleTokens = new Set(needle.split(' ').filter(Boolean));

  const scored = stories.map((story) => {
    const hay = normalizeTranscript(story.title);
    if (!hay) return { story, score: 0 };
    let score = 0;
    if (hay === needle) score += 100;
    if (hay.includes(needle)) score += 50;
    if (needle.includes(hay)) score += 40;
    const hayTokens = hay.split(' ').filter(Boolean);
    for (const tok of hayTokens) {
      if (needleTokens.has(tok)) score += 10;
    }
    return { story, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  const runnerUp = scored[1];
  if (!best || best.score < 10) return null;

  const ambiguous = !!(runnerUp && best.score - runnerUp.score < 10 && runnerUp.score >= 10);
  return { story: best.story, score: best.score, ambiguous };
}
