import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, ChevronRight, Heart, User, LogOut, Sparkles } from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';
import SearchInput from '../ui/SearchInput';
import StoryButton from '../ui/StoryButton';

/**
 * SidebarV2 — experimental A/B variant of the sidebar.
 *
 * Improvements over the original:
 *  - Tree view: all sources (and directories) on one page, expand/collapse in place.
 *    No back-buttons, no drill-down navigation; users can see multiple sources at once.
 *  - Keyboard navigation: j/k or arrow keys to move between visible stories, Enter to open.
 *  - Persistent expansion state (remembers which sources are open).
 *  - Compact "variant" badge so users know they are in the A/B test.
 *  - Same favourites / search / deep-search behaviour.
 */
export default function SidebarV2({
  menuOpen,
  onMenuToggle,
  searchTerm,
  onSearchChange,
  showDeepSearch,
  favoritesOnly,
  onToggleFavoritesOnly,
  showFavoritesOnlyToggle,
  showFavorites,
  selectedStory,
  activeSource,
  onSelectSource,
  showStoryDirectories,
  directoriesBySource,
  onSelectStory,
  completedStories,
  favorites,
  onToggleFavorite,
  showWordCount,
  showReadingDuration,
  storyWordCount,
  readingMinutes,
  favoriteStories,
  filteredStories,
  sources,
  storiesBySource,
  onOpenProfile,
  profileOpen,
  onCloseProfile,
  onCloseApp,
}) {
  const { dark: darkMode } = useTheme();

  const EXPANDED_KEY = 'wr-sidebar-v2-expanded';
  const [expandedSources, setExpandedSources] = useState(() => {
    const stored = localStorage.getItem(EXPANDED_KEY);
    if (stored) {
      try { return new Set(JSON.parse(stored)); } catch { /* fall through */ }
    }
    return new Set(activeSource ? [activeSource] : []);
  });
  const [expandedDirs, setExpandedDirs] = useState(new Set());

  useEffect(() => {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify([...expandedSources]));
  }, [expandedSources]);

  useEffect(() => {
    if (activeSource && !expandedSources.has(activeSource)) {
      setExpandedSources((prev) => new Set([...prev, activeSource]));
    }
  }, [activeSource]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSource = (id) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    onSelectSource(id);
  };

  const toggleDir = (key) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Build the flat list of visible stories for keyboard navigation.
  const visibleStoriesFlat = useMemo(() => {
    if (searchTerm) return filteredStories;
    if (favoritesOnly && showFavorites) return favoriteStories;
    const out = [];
    for (const src of sources) {
      if (!expandedSources.has(src.id)) continue;
      const srcStories = storiesBySource[src.id] ?? [];
      const dirs = showStoryDirectories ? (directoriesBySource[src.id] ?? []) : [];
      if (dirs.length === 0) {
        out.push(...srcStories);
      } else {
        for (const dir of dirs) {
          const dirKey = `${src.id}::${dir.id}`;
          if (!expandedDirs.has(dirKey)) continue;
          out.push(...srcStories.filter((s) => s.directory === dir.id));
        }
      }
    }
    return out;
  }, [sources, storiesBySource, directoriesBySource, expandedSources, expandedDirs, searchTerm, filteredStories, favoritesOnly, showFavorites, favoriteStories, showStoryDirectories]);

  const [focusIdx, setFocusIdx] = useState(-1);
  const asideRef = useRef(null);

  useEffect(() => {
    if (!menuOpen && window.matchMedia('(max-width: 1024px)').matches) return undefined;

    const onKey = (e) => {
      if (!asideRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
      if (visibleStoriesFlat.length === 0) return;

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusIdx((i) => Math.min(visibleStoriesFlat.length - 1, i + 1));
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter' && focusIdx >= 0) {
        e.preventDefault();
        const story = visibleStoriesFlat[focusIdx];
        if (story) {
          onSelectStory(story);
          onMenuToggle();
          if (profileOpen) onCloseProfile();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visibleStoriesFlat, focusIdx, onSelectStory, onMenuToggle, profileOpen, onCloseProfile, menuOpen]);

  // Reset keyboard focus when the visible set changes substantially.
  useEffect(() => { setFocusIdx(-1); }, [searchTerm, favoritesOnly, expandedSources]);

  const renderStory = (story, idx) => (
    <StoryButton
      key={story.id}
      story={story}
      isActive={selectedStory?.id === story.id}
      isCompleted={completedStories.has(story.id)}
      isFavorite={favorites.has(story.id)}
      showWordCount={showWordCount}
      showFavoriteButton={showFavorites}
      testId="story-button"
      className={focusIdx === idx ? (darkMode ? 'ring-2 ring-amber-400 rounded-lg' : 'ring-2 ring-amber-500 rounded-lg') : ''}
      onClick={() => { onSelectStory(story); onMenuToggle(); if (profileOpen) onCloseProfile(); }}
      onFavoriteClick={(e) => onToggleFavorite(story.id, e)}
    />
  );

  const sourceHeader = (src, isOpen) => (
    <button
      key={`src-${src.id}`}
      data-testid="source-button"
      onClick={() => toggleSource(src.id)}
      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all ${
        darkMode ? 'text-amber-100 hover:bg-slate-800' : 'text-amber-900 hover:bg-amber-100'
      }`}
    >
      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      <span className="font-serif text-base truncate flex-1 text-left">{src.label}</span>
      <span className={`text-xs tabular-nums ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
        {src.count}
      </span>
    </button>
  );

  const dirHeader = (src, dir, isOpen) => {
    const key = `${src.id}::${dir.id}`;
    return (
      <button
        key={`dir-${key}`}
        data-testid="directory-button"
        onClick={() => toggleDir(key)}
        className={`w-full flex items-center gap-2 pl-6 pr-3 py-2 rounded-lg transition-all text-sm ${
          darkMode ? 'text-amber-200 hover:bg-slate-800' : 'text-amber-800 hover:bg-amber-50'
        }`}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="font-serif truncate flex-1 text-left">{dir.label}</span>
        <span className={`text-xs tabular-nums ${darkMode ? 'text-amber-500' : 'text-amber-600'}`}>
          {dir.count}
        </span>
      </button>
    );
  };

  return (
    <aside
      ref={asideRef}
      data-testid="sidebar-v2"
      className={`fixed lg:static top-16 bottom-0 left-0 w-80 lg:w-72 z-30 transform transition-transform duration-300 flex flex-col ${
        menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${
        darkMode
          ? 'bg-slate-950/95 border-amber-700/30'
          : 'bg-white/95 border-amber-200/50'
      } border-r backdrop-blur-sm`}
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Variant badge */}
        <div className={`flex items-center gap-1.5 px-4 pt-3 text-[11px] font-semibold uppercase tracking-wider ${
          darkMode ? 'text-violet-400' : 'text-violet-600'
        }`}>
          <Sparkles size={12} />
          <span>Seitenleiste v2 · Beta</span>
        </div>

        {/* Search */}
        <div className="px-4 pt-2 pb-3">
          <div className="flex items-center gap-2">
            <SearchInput
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Märchen suchen…"
            />
            {showFavoritesOnlyToggle && showFavorites && (
              <button
                onClick={() => onToggleFavoritesOnly()}
                title={favoritesOnly ? 'Alle anzeigen' : 'Nur Favoriten'}
                className={`flex-shrink-0 p-2 rounded-lg border transition-colors ${
                  favoritesOnly
                    ? darkMode ? 'bg-amber-700 border-amber-600 text-white' : 'bg-amber-200 border-amber-300 text-amber-900'
                    : darkMode ? 'border-amber-700/50 text-amber-600 hover:text-amber-400 hover:bg-slate-800' : 'border-amber-300 text-amber-400 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Heart size={16} fill={favoritesOnly ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
          {showDeepSearch && (
            <p className={`mt-2 px-1 text-xs ${darkMode ? 'text-amber-600' : 'text-amber-700'}`}>
              Tiefensuche aktiv: Treffer im Inhalt werden nachgeladen.
            </p>
          )}
          <p className={`mt-2 px-1 text-[11px] ${darkMode ? 'text-amber-700' : 'text-amber-500'}`}>
            Tastatur: j/k blättern, Enter öffnet.
          </p>
        </div>

        {/* Word count / reading duration */}
        {selectedStory && (showWordCount || showReadingDuration) && (
          <div className={`mx-4 mb-2 rounded-xl px-4 py-3 space-y-1.5 ${
            darkMode ? 'bg-slate-800' : 'bg-amber-50'
          }`}>
            {showWordCount && (
              <div className={`flex items-center justify-between text-sm ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                <span>Wörter</span>
                <span className="tabular-nums font-medium">{storyWordCount.toLocaleString('de')}</span>
              </div>
            )}
            {showReadingDuration && (
              <div className={`flex items-center justify-between text-sm ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                <span>Lesezeit</span>
                <span className="tabular-nums font-medium">~{readingMinutes} min</span>
              </div>
            )}
          </div>
        )}

        {/* Content area */}
        <div className="px-3 pb-4 space-y-1">
          {favoritesOnly && showFavorites ? (
            favoriteStories.length === 0 ? (
              <p className={`px-2 py-3 text-sm ${darkMode ? 'text-amber-600' : 'text-amber-700'}`}>Keine Favoriten</p>
            ) : favoriteStories.map((s, i) => renderStory(s, i))
          ) : searchTerm ? (
            filteredStories.length === 0 ? (
              <p className={`px-2 py-3 text-sm ${darkMode ? 'text-amber-600' : 'text-amber-700'}`}>Keine Ergebnisse</p>
            ) : filteredStories.map((s, i) => (
              <StoryButton
                key={s.id}
                story={s}
                isActive={selectedStory?.id === s.id}
                isCompleted={completedStories.has(s.id)}
                isFavorite={favorites.has(s.id)}
                showSourceBadge
                showWordCount={showWordCount}
                showFavoriteButton={showFavorites}
                inlineBadges
                className={focusIdx === i ? (darkMode ? 'ring-2 ring-amber-400 rounded-lg' : 'ring-2 ring-amber-500 rounded-lg') : ''}
                onClick={() => { onSelectStory(s); onMenuToggle(); if (profileOpen) onCloseProfile(); }}
                onFavoriteClick={(e) => onToggleFavorite(s.id, e)}
              />
            ))
          ) : (
            (() => {
              let idxCursor = 0;
              return sources.map((src) => {
                const isOpen = expandedSources.has(src.id);
                const srcStories = storiesBySource[src.id] ?? [];
                const dirs = showStoryDirectories ? (directoriesBySource[src.id] ?? []) : [];
                const rows = [sourceHeader(src, isOpen)];
                if (isOpen) {
                  if (dirs.length === 0) {
                    for (const story of srcStories) {
                      rows.push(
                        <div key={`s-${story.id}`} className="pl-4">
                          {renderStory(story, idxCursor)}
                        </div>
                      );
                      idxCursor++;
                    }
                  } else {
                    for (const dir of dirs) {
                      const dirKey = `${src.id}::${dir.id}`;
                      const dirOpen = expandedDirs.has(dirKey);
                      rows.push(dirHeader(src, dir, dirOpen));
                      if (dirOpen) {
                        for (const story of srcStories.filter((s) => s.directory === dir.id)) {
                          rows.push(
                            <div key={`s-${story.id}`} className="pl-8">
                              {renderStory(story, idxCursor)}
                            </div>
                          );
                          idxCursor++;
                        }
                      }
                    }
                  }
                }
                return rows;
              });
            })()
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className={`flex-shrink-0 border-t ${darkMode ? 'border-amber-700/30' : 'border-amber-200/50'}`}>
        <button
          onClick={() => { onOpenProfile(); onMenuToggle(); }}
          className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors ${
            profileOpen
              ? darkMode ? 'bg-amber-700/20 text-amber-200' : 'bg-amber-100 text-amber-900'
              : darkMode ? 'text-amber-400 hover:bg-slate-800 hover:text-amber-200' : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
          }`}
        >
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-slate-700' : 'bg-amber-100'}`}>
            <User size={16} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate">Mein Profil</p>
          </div>
          <ChevronRight size={14} className="flex-shrink-0 opacity-50" />
        </button>
        <button
          data-testid="close-app-button"
          onClick={onCloseApp}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 border-t transition-colors ${
            darkMode
              ? 'border-amber-700/30 text-amber-500 hover:bg-slate-800 hover:text-amber-300'
              : 'border-amber-200/50 text-amber-700 hover:bg-amber-50 hover:text-amber-900'
          }`}
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">App schließen</span>
        </button>
      </div>
    </aside>
  );
}
