import { renderHook, act } from '@testing-library/react';
import { usePersistence } from '../../hooks/usePersistence';
import { STORY } from './helpers';

const STORY_2 = { ...STORY, id: 'grimm/rapunzel', title: 'Rapunzel' };

const ADAPTION = { adaptionName: 'Kurzfassung', content: 'Kurztext.' };
const ADAPTIONS_BY_PARENT = { [STORY.id]: [ADAPTION] };

function renderPersistence(props = {}) {
  return renderHook(() => usePersistence({
    stories: [STORY, STORY_2],
    adaptionsByParent: ADAPTIONS_BY_PARENT,
    selectedStory: null,
    activeSource: null,
    ...props,
  }));
}

describe('usePersistence', () => {
  describe('initialisation', () => {
    it('starts with empty completed stories', () => {
      const { result } = renderPersistence();
      expect(result.current.completedStories.size).toBe(0);
    });

    it('restores completed stories from localStorage', () => {
      localStorage.setItem('wr-completed', JSON.stringify([STORY.id]));
      const { result } = renderPersistence();
      expect(result.current.completedStories.has(STORY.id)).toBe(true);
    });

    it('starts with empty blacklist', () => {
      const { result } = renderPersistence();
      expect(result.current.blacklist.size).toBe(0);
    });

    it('restores blacklist from localStorage', () => {
      localStorage.setItem('wr-blacklist', JSON.stringify(['hexe']));
      const { result } = renderPersistence();
      expect(result.current.blacklist.has('hexe')).toBe(true);
    });

    it('starts with empty favorites', () => {
      const { result } = renderPersistence();
      expect(result.current.favorites.size).toBe(0);
    });
  });

  describe('markCompleted', () => {
    it('adds a story id to completedStories', () => {
      const { result } = renderPersistence();
      act(() => result.current.markCompleted(STORY.id));
      expect(result.current.completedStories.has(STORY.id)).toBe(true);
    });

    it('is idempotent - calling twice does not duplicate', () => {
      const { result } = renderPersistence();
      act(() => result.current.markCompleted(STORY.id));
      act(() => result.current.markCompleted(STORY.id));
      expect(result.current.completedStories.size).toBe(1);
    });

    it('persists to localStorage', () => {
      const { result } = renderPersistence();
      act(() => result.current.markCompleted(STORY.id));
      const stored = JSON.parse(localStorage.getItem('wr-completed'));
      expect(stored).toContain(STORY.id);
    });
  });

  describe('favorites', () => {
    it('toggleFavorite adds a story', () => {
      const { result } = renderPersistence();
      act(() => result.current.toggleFavorite(STORY.id));
      expect(result.current.favorites.has(STORY.id)).toBe(true);
    });

    it('toggleFavorite removes a story that is already a favorite', () => {
      const { result } = renderPersistence();
      act(() => result.current.toggleFavorite(STORY.id));
      act(() => result.current.toggleFavorite(STORY.id));
      expect(result.current.favorites.has(STORY.id)).toBe(false);
    });

    it('toggleFavoriteById works without an event argument', () => {
      const { result } = renderPersistence();
      act(() => result.current.toggleFavoriteById(STORY.id));
      expect(result.current.favorites.has(STORY.id)).toBe(true);
    });

    it('persists favorites to localStorage', () => {
      const { result } = renderPersistence();
      act(() => result.current.toggleFavorite(STORY.id));
      const stored = JSON.parse(localStorage.getItem('wr-favorites'));
      expect(stored).toContain(STORY.id);
    });
  });

  describe('blacklist', () => {
    it('addBlacklistWord adds a trimmed word', () => {
      const { result } = renderPersistence();
      act(() => result.current.setBlacklistInput('  hexe  '));
      act(() => result.current.addBlacklistWord());
      expect(result.current.blacklist.has('hexe')).toBe(true);
    });

    it('addBlacklistWord does nothing when input is blank', () => {
      const { result } = renderPersistence();
      act(() => result.current.setBlacklistInput('   '));
      act(() => result.current.addBlacklistWord());
      expect(result.current.blacklist.size).toBe(0);
    });

    it('addBlacklistWord clears the input field', () => {
      const { result } = renderPersistence();
      act(() => result.current.setBlacklistInput('hexe'));
      act(() => result.current.addBlacklistWord());
      expect(result.current.blacklistInput).toBe('');
    });

    it('removeBlacklistWord removes an existing word', () => {
      const { result } = renderPersistence();
      act(() => result.current.setBlacklistInput('hexe'));
      act(() => result.current.addBlacklistWord());
      act(() => result.current.removeBlacklistWord('hexe'));
      expect(result.current.blacklist.has('hexe')).toBe(false);
    });
  });

  describe('variant selection', () => {
    it('selectedVariant starts as null', () => {
      const { result } = renderPersistence({ selectedStory: STORY });
      expect(result.current.selectedVariant).toBeNull();
    });

    it('selectVariant sets the variant and persists the preference', () => {
      const { result } = renderPersistence({ selectedStory: STORY });
      act(() => result.current.selectVariant(ADAPTION));
      expect(result.current.selectedVariant).toBe(ADAPTION);
      const stored = JSON.parse(localStorage.getItem('wr-variant-prefs'));
      expect(stored[STORY.id]).toBe('Kurzfassung');
    });

    it('selectVariant(null) clears the variant and removes the preference', () => {
      const { result } = renderPersistence({ selectedStory: STORY });
      act(() => result.current.selectVariant(ADAPTION));
      act(() => result.current.selectVariant(null));
      expect(result.current.selectedVariant).toBeNull();
      const stored = JSON.parse(localStorage.getItem('wr-variant-prefs'));
      expect(stored[STORY.id]).toBeUndefined();
    });
  });

  describe('resume session', () => {
    it('offers a resume session when wr-last-story is set in localStorage', () => {
      localStorage.setItem('wr-last-story', STORY.id);
      localStorage.setItem('wr-last-page', '3');
      const { result } = renderPersistence();
      expect(result.current.resumeSession).not.toBeNull();
      expect(result.current.resumeSession.story).toEqual(STORY);
      expect(result.current.resumeSession.page).toBe(3);
    });

    it('does not offer a resume session for an unknown story id', () => {
      localStorage.setItem('wr-last-story', 'grimm/unknown');
      localStorage.setItem('wr-last-page', '1');
      const { result } = renderPersistence();
      expect(result.current.resumeSession).toBeNull();
    });
  });
});
