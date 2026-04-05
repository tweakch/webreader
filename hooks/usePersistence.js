import { useState, useRef, useEffect } from 'react';

/**
 * Persistence hook for favorites, completed stories, variants, blacklist, and resume session.
 * Manages localStorage sync and related effects.
 *
 * @param {Object} deps - { stories, adaptionsByParent, selectedStory, activeSource, currentPage, totalPages }
 */
export function usePersistence({
  stories = [],
  adaptionsByParent = {},
  selectedStory = null,
  activeSource = null,
  currentPage = 0,
  totalPages = 1,
} = {}) {
  // Completed stories
  const [completedStories, setCompletedStories] = useState(() =>
    new Set(JSON.parse(localStorage.getItem('wr-completed') ?? '[]'))
  );

  // Resume session
  const [resumeSession, setResumeSession] = useState(null);
  const pendingResumePageRef = useRef(null);
  const initialResumeApplied = useRef(false);

  // Variant preferences
  const [variantPrefs, setVariantPrefs] = useState(() =>
    JSON.parse(localStorage.getItem('wr-variant-prefs') ?? '{}')
  );
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Word blacklist
  const [blacklist, setBlacklist] = useState(() =>
    new Set(JSON.parse(localStorage.getItem('wr-blacklist') ?? '[]'))
  );
  const [blacklistInput, setBlacklistInput] = useState('');

  // Favorites
  const [favorites, setFavorites] = useState(() =>
    new Set(JSON.parse(localStorage.getItem('wr-favorites') ?? '[]'))
  );

  // Favorites-only toggle
  const [favoritesOnly, setFavoritesOnly] = useState(() =>
    localStorage.getItem('wr-favorites-only') === 'true'
  );

  // Persist states to localStorage
  useEffect(() => {
    localStorage.setItem('wr-completed', JSON.stringify([...completedStories]));
  }, [completedStories]);

  useEffect(() => {
    localStorage.setItem('wr-variant-prefs', JSON.stringify(variantPrefs));
  }, [variantPrefs]);

  useEffect(() => {
    localStorage.setItem('wr-blacklist', JSON.stringify([...blacklist]));
  }, [blacklist]);

  useEffect(() => {
    localStorage.setItem('wr-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('wr-favorites-only', favoritesOnly);
  }, [favoritesOnly]);

  useEffect(() => {
    localStorage.setItem('wr-last-source', activeSource ?? '');
  }, [activeSource]);

  // Bootstrap resume session from localStorage (one-shot on mount)
  useEffect(() => {
    if (initialResumeApplied.current || stories.length === 0) return;
    initialResumeApplied.current = true;

    const lastStoryId = localStorage.getItem('wr-last-story');
    const lastPageStr = localStorage.getItem('wr-last-page');
    if (!lastStoryId || !lastPageStr) return;

    const story = stories.find(s => s.id === lastStoryId);
    if (!story) return;

    const lastPage = parseInt(lastPageStr, 10);
    setResumeSession({ story, page: lastPage });
  }, [stories]);

  // Clear resume session when story is selected
  useEffect(() => {
    if (selectedStory) setResumeSession(null);
  }, [selectedStory]);

  // Mark story as completed when reaching last page
  useEffect(() => {
    if (!selectedStory || totalPages <= 1 || currentPage !== totalPages - 1) return;
    setCompletedStories(prev => {
      if (prev.has(selectedStory.id)) return prev;
      const next = new Set(prev);
      next.add(selectedStory.id);
      return next;
    });
  }, [selectedStory, currentPage, totalPages]);

  // Persist last viewed story/page
  useEffect(() => {
    if (!selectedStory) return;
    localStorage.setItem('wr-last-story', selectedStory.id);
    localStorage.setItem('wr-last-page', currentPage);
  }, [selectedStory, currentPage]);

  // Reset variant when a new story is selected; restore persisted preference if available
  useEffect(() => {
    if (!selectedStory) { setSelectedVariant(null); return; }
    const prefName = variantPrefs[selectedStory.id] ?? null;
    if (!prefName) { setSelectedVariant(null); return; }
    const adaptions = adaptionsByParent[selectedStory.id] ?? [];
    setSelectedVariant(adaptions.find(a => a.adaptionName === prefName) ?? null);
  }, [selectedStory]); // variantPrefs intentionally omitted — only re-run on story change

  // Handlers
  const selectVariant = (variant) => {
    if (!selectedStory) return;
    setSelectedVariant(variant);
    if (variant) {
      setVariantPrefs(prev => ({ ...prev, [selectedStory.id]: variant.adaptionName }));
    } else {
      setVariantPrefs(prev => {
        const next = { ...prev };
        delete next[selectedStory.id];
        return next;
      });
    }
  };

  const toggleFavorite = (storyId, e) => {
    e?.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(storyId)) {
        next.delete(storyId);
      } else {
        next.add(storyId);
      }
      return next;
    });
  };

  const toggleFavoriteById = (storyId) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(storyId)) {
        next.delete(storyId);
      } else {
        next.add(storyId);
      }
      return next;
    });
  };

  const addBlacklistWord = () => {
    const trimmed = blacklistInput.trim();
    if (!trimmed) return;
    setBlacklist(prev => new Set(prev).add(trimmed));
    setBlacklistInput('');
  };

  const removeBlacklistWord = (word) => {
    setBlacklist(prev => {
      const next = new Set(prev);
      next.delete(word);
      return next;
    });
  };

  return {
    completedStories,
    resumeSession,
    setResumeSession,
    variantPrefs,
    setVariantPrefs,
    selectedVariant,
    setSelectedVariant,
    blacklist,
    blacklistInput,
    setBlacklistInput,
    favorites,
    setFavorites,
    favoritesOnly,
    setFavoritesOnly,
    selectVariant,
    toggleFavorite,
    toggleFavoriteById,
    addBlacklistWord,
    removeBlacklistWord,
    pendingResumePageRef,
  };
}
