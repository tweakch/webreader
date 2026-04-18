import { describe, it, expect } from 'vitest';
import { parseVoiceCommand, findStoryByVoice, normalizeTranscript } from '../../src/lib/voiceCommands';

describe('normalizeTranscript', () => {
  it('lowercases, strips punctuation, collapses whitespace', () => {
    expect(normalizeTranscript('  HELLO,   World! ')).toBe('hello world');
  });
  it('returns empty string for null/undefined', () => {
    expect(normalizeTranscript(null)).toBe('');
    expect(normalizeTranscript(undefined)).toBe('');
  });
});

describe('parseVoiceCommand — voice-resume', () => {
  it.each([
    'weiter',
    'weiterlesen',
    'Continue',
    'resume',
    'Last book',
    'where was I?',
  ])('recognises "%s" as resume', (utter) => {
    expect(parseVoiceCommand(utter)).toEqual({ type: 'resume' });
  });
});

describe('parseVoiceCommand — voice-navigation', () => {
  it.each(['next page', 'nächste seite', 'umblättern', 'weiterblättern'])('next-page: %s', (u) => {
    expect(parseVoiceCommand(u).type).toBe('next-page');
  });

  it.each(['previous page', 'vorherige seite', 'zurück', 'vorher'])('prev-page: %s', (u) => {
    expect(parseVoiceCommand(u).type).toBe('prev-page');
  });

  it('parses numeric page targets', () => {
    expect(parseVoiceCommand('go to page 12')).toEqual({ type: 'goto-page', page: 12 });
    expect(parseVoiceCommand('page 12')).toEqual({ type: 'goto-page', page: 12 });
    expect(parseVoiceCommand('seite drei')).toEqual({ type: 'goto-page', page: 3 });
    expect(parseVoiceCommand('seite sieben')).toEqual({ type: 'goto-page', page: 7 });
  });

  it('routes home/library', () => {
    expect(parseVoiceCommand('home').type).toBe('home');
    expect(parseVoiceCommand('zur übersicht').type).toBe('home');
    expect(parseVoiceCommand('bibliothek').type).toBe('home');
  });

  it('routes favorites', () => {
    expect(parseVoiceCommand('favoriten').type).toBe('favorites');
    expect(parseVoiceCommand('favorites').type).toBe('favorites');
  });

  it('parses open-story with title payload', () => {
    expect(parseVoiceCommand('open rotkäppchen')).toEqual({ type: 'open-story', title: 'rotkäppchen' });
    expect(parseVoiceCommand('lies hänsel und gretel')).toEqual({
      type: 'open-story',
      title: 'hänsel und gretel',
    });
  });
});

describe('parseVoiceCommand — voice-reading-control', () => {
  it.each(['read', 'vorlesen', 'lies vor'])('read: %s', (u) => {
    expect(parseVoiceCommand(u).type).toBe('read');
  });
  it('pause', () => { expect(parseVoiceCommand('pause').type).toBe('pause'); });
  it('stop', () => { expect(parseVoiceCommand('stop').type).toBe('stop'); });
  it('faster', () => { expect(parseVoiceCommand('schneller').type).toBe('faster'); });
  it('slower', () => { expect(parseVoiceCommand('slower').type).toBe('slower'); });
});

describe('parseVoiceCommand — voice-discovery', () => {
  it('surprise me', () => {
    expect(parseVoiceCommand('surprise me').type).toBe('surprise');
    expect(parseVoiceCommand('überrasche mich').type).toBe('surprise');
  });
  it('short/long story', () => {
    expect(parseVoiceCommand('short story').type).toBe('short-story');
    expect(parseVoiceCommand('kurze geschichte').type).toBe('short-story');
    expect(parseVoiceCommand('long story').type).toBe('long-story');
  });
  it('find <query>', () => {
    expect(parseVoiceCommand('find a wolf')).toEqual({ type: 'find', query: 'a wolf' });
    expect(parseVoiceCommand('suche nach einem wolf')).toEqual({ type: 'find', query: 'nach einem wolf' });
  });
});

describe('parseVoiceCommand — voice-hands-free', () => {
  it('stop listening', () => {
    expect(parseVoiceCommand('stop listening').type).toBe('stop-listening');
  });
});

describe('parseVoiceCommand — unknown', () => {
  it('returns unknown with normalized transcript', () => {
    expect(parseVoiceCommand('asdf qwerty')).toEqual({ type: 'unknown', transcript: 'asdf qwerty' });
  });
});

describe('findStoryByVoice', () => {
  const stories = [
    { id: 'grimm/rotkaeppchen', title: 'Rotkäppchen' },
    { id: 'grimm/haensel-und-gretel', title: 'Hänsel und Gretel' },
    { id: 'andersen/the-ugly-duckling', title: 'The Ugly Duckling' },
  ];

  it('matches exact titles', () => {
    const match = findStoryByVoice('rotkäppchen', stories);
    expect(match?.story.id).toBe('grimm/rotkaeppchen');
    expect(match.ambiguous).toBeFalsy();
  });

  it('matches partial/token titles', () => {
    const match = findStoryByVoice('hänsel und gretel', stories);
    expect(match?.story.id).toBe('grimm/haensel-und-gretel');
  });

  it('returns null for empty input', () => {
    expect(findStoryByVoice('', stories)).toBeNull();
    expect(findStoryByVoice('rotkäppchen', [])).toBeNull();
  });

  it('matches english titles', () => {
    const match = findStoryByVoice('ugly duckling', stories);
    expect(match?.story.id).toBe('andersen/the-ugly-duckling');
  });
});
