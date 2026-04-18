import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronRight, Heart, User, LogOut, Sparkles, X, ListCollapse, ListTree, Keyboard, BookmarkCheck } from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';
import SearchInput from '../ui/SearchInput';
import StoryButton from '../ui/StoryButton';

/**
 * SidebarV2 — experimental A/B variant of the sidebar.
 *
 * Over the original Sidebar:
 *  - Tree view: all sources and directories on one page, expand/collapse in place.
 *  - Sticky top chrome: search and toolbar stay pinned while the tree scrolls.
 *  - Keyboard-first: j/k or ↑/↓ move focus, Enter opens, / focuses search,
 *    Escape clears, [ / ] collapse/expand all sources.
 *  - Clear-search button inside the search field.
 *  - Favorites shelf: a compact pinned row of starred stories at the top.
 *  - Auto-scroll: the active story is scrolled into view when it changes.
 *  - Persistent expansion state in localStorage; opens the source containing
 *    the active story automatically.
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
  const EXPANDED_DIRS_KEY = 'wr-sidebar-v2-expanded-dirs';
  const FAVSHELF_KEY = 'wr-sidebar-v2-favshelf-open';

  const [expandedSources, setExpandedSources] = useState(() => {
    const stored = localStorage.getItem(EXPANDED_KEY);
    if (stored) {
      try { return new Set(JSON.parse(stored)); } catch { /* fall through */ }
    }
    return new Set(activeSource ? [activeSource] : []);
  });
  const [expandedDirs, setExpandedDirs] = useState(() => {
    const stored = localStorage.getItem(EXPANDED_DIRS_KEY);
    if (stored) {
      try { return new Set(JSON.parse(stored)); } catch { /* fall through */ }
    }
    return new Set();
  });
  const [favShelfOpen, setFavShelfOpen] = useState(() => localStorage.getItem(FAVSHELF_KEY) !== '0');
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify([...expandedSources]));
  }, [expandedSources]);

  useEffect(() => {
    localStorage.setItem(EXPANDED_DIRS_KEY, JSON.stringify([...expandedDirs]));
  }, [expandedDirs]);

  useEffect(() => {
    localStorage.setItem(FAVSHELF_KEY, favShelfOpen ? '1' : '0');
  }, [favShelfOpen]);

  // Auto-open the source (and directory) that holds the active story.
  useEffect(() => {
    if (!selectedStory) return;
    if (!expandedSources.has(selectedStory.source)) {
      setExpandedSources((prev) => new Set([...prev, selectedStory.source]));
    }
    if (selectedStory.directory) {
      const dirKey = `${selectedStory.source}::${selectedStory.directory}`;
      if (!expandedDirs.has(dirKey)) {
        setExpandedDirs((prev) => new Set([...prev, dirKey]));
      }
    }
  }, [selectedStory]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const collapseAll = useCallback(() => {
    setExpandedSources(new Set());
    setExpandedDirs(new Set());
  }, []);

  const expandAll = useCallback(() => {
    setExpandedSources(new Set(sources.map((s) => s.id)));
    if (showStoryDirectories) {
      const allDirs = new Set();
      for (const src of sources) {
        for (const dir of directoriesBySource[src.id] ?? []) {
          allDirs.add(`${src.id}::${dir.id}`);
        }
      }
      setExpandedDirs(allDirs);
    }
  }, [sources, directoriesBySource, showStoryDirectories]);

  // Flat list of visible stories — drives j/k navigation.
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
  const searchInputRef = useRef(null);
  const activeStoryRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll the active story into view when it changes.
  useEffect(() => {
    if (!selectedStory || !activeStoryRef.current) return;
    const el = activeStoryRef.current;
    requestAnimationFrame(() => {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }, [selectedStory?.id, expandedSources, expandedDirs]);

  // Global keyboard shortcuts.
  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
    };

    const onKey = (e) => {
      // `/` focuses search from anywhere (unless already typing elsewhere)
      if (e.key === '/' && !isTyping()) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      // Escape clears search if focused
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        e.preventDefault();
        if (searchTerm) onSearchChange('');
        else searchInputRef.current?.blur();
        return;
      }
      // Don't hijack keys while user is typing in a field.
      if (isTyping()) return;

      if (visibleStoriesFlat.length > 0 && (e.key === 'j' || e.key === 'ArrowDown')) {
        e.preventDefault();
        setFocusIdx((i) => Math.min(visibleStoriesFlat.length - 1, i + 1));
      } else if (visibleStoriesFlat.length > 0 && (e.key === 'k' || e.key === 'ArrowUp')) {
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
      } else if (e.key === '[') {
        e.preventDefault();
        collapseAll();
      } else if (e.key === ']') {
        e.preventDefault();
        expandAll();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visibleStoriesFlat, focusIdx, onSelectStory, onMenuToggle, profileOpen, onCloseProfile, searchTerm, onSearchChange, collapseAll, expandAll]);

  // Reset keyboard focus when the visible set changes substantially.
  useEffect(() => { setFocusIdx(-1); }, [searchTerm, favoritesOnly, expandedSources]);

  const storyRowRef = (story) => (selectedStory?.id === story.id ? activeStoryRef : undefined);

  const renderStory = (story, idx, opts = {}) => (
    <div ref={storyRowRef(story)} key={story.id}>
      <StoryButton
        story={story}
        isActive={selectedStory?.id === story.id}
        isCompleted={completedStories.has(story.id)}
        isFavorite={favorites.has(story.id)}
        showSourceBadge={opts.showSourceBadge}
        showWordCount={showWordCount}
        showFavoriteButton={showFavorites}
        inlineBadges={opts.inlineBadges}
        testId="story-button"
        className={focusIdx === idx ? (darkMode ? 'ring-2 ring-amber-400 rounded-lg' : 'ring-2 ring-amber-500 rounded-lg') : ''}
        onClick={() => { onSelectStory(story); onMenuToggle(); if (profileOpen) onCloseProfile(); }}
        onFavoriteClick={(e) => onToggleFavorite(story.id, e)}
      />
    </div>
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

  const iconBtnCls = (active = false) =>
    `p-1.5 rounded-md border transition-colors ${
      active
        ? darkMode ? 'bg-amber-700 border-amber-600 text-white' : 'bg-amber-200 border-amber-300 text-amber-900'
        : darkMode ? 'border-amber-700/50 text-amber-500 hover:text-amber-300 hover:bg-slate-800' : 'border-amber-300 text-amber-500 hover:text-amber-800 hover:bg-amber-50'
    }`;

  const showFavShelf = !searchTerm && !favoritesOnly && showFavorites && favoriteStories.length > 0;

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
      {/* Sticky chrome: badge + search + toolbar. Does not scroll. */}
      <div className={`flex-shrink-0 border-b ${
        darkMode ? 'border-amber-700/30 bg-slate-950/80' : 'border-amber-200/50 bg-white/90'
      } backdrop-blur-sm`}>
        <div className="flex items-center justify-between gap-2 px-4 pt-3">
          <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${
            darkMode ? 'text-violet-400' : 'text-violet-600'
          }`}>
            <Sparkles size={12} />
            <span>Seitenleiste v2 · Beta</span>
          </div>
          <button
            data-testid="sidebar-v2-shortcuts"
            onClick={() => setShowShortcuts((v) => !v)}
            title="Tastaturkürzel"
            className={`p-1 rounded transition-colors ${
              darkMode ? 'text-amber-500 hover:text-amber-300' : 'text-amber-500 hover:text-amber-800'
            }`}
          >
            <Keyboard size={14} />
          </button>
        </div>

        {showShortcuts && (
          <div className={`mx-4 mt-2 rounded-lg text-[11px] p-2 leading-relaxed ${
            darkMode ? 'bg-slate-800 text-amber-300' : 'bg-amber-50 text-amber-800'
          }`}>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
              <kbd className="font-mono">/</kbd><span>Suche fokussieren</span>
              <kbd className="font-mono">j · k · ↑ · ↓</kbd><span>Blättern</span>
              <kbd className="font-mono">Enter</kbd><span>Öffnen</span>
              <kbd className="font-mono">Esc</kbd><span>Suche leeren</span>
              <kbd className="font-mono">[ · ]</kbd><span>Alles auf/zu</span>
            </div>
          </div>
        )}

        <div className="px-4 pt-2 pb-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <SearchInput
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Märchen suchen…  (/)"
              />
              {searchTerm && (
                <button
                  data-testid="sidebar-v2-clear-search"
                  onClick={() => { onSearchChange(''); searchInputRef.current?.focus(); }}
                  title="Suche leeren"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                    darkMode ? 'text-amber-500 hover:text-amber-300 hover:bg-slate-800' : 'text-amber-500 hover:text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {showFavoritesOnlyToggle && showFavorites && (
              <button
                onClick={() => onToggleFavoritesOnly()}
                title={favoritesOnly ? 'Alle anzeigen' : 'Nur Favoriten'}
                className={iconBtnCls(favoritesOnly)}
              >
                <Heart size={16} fill={favoritesOnly ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {/* Toolbar row: collapse/expand all */}
          {!searchTerm && !favoritesOnly && sources.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <button
                data-testid="sidebar-v2-collapse-all"
                onClick={collapseAll}
                title="Alle einklappen ([)"
                className={iconBtnCls()}
              >
                <ListCollapse size={14} />
              </button>
              <button
                data-testid="sidebar-v2-expand-all"
                onClick={expandAll}
                title="Alle ausklappen (])"
                className={iconBtnCls()}
              >
                <ListTree size={14} />
              </button>
              <span className={`ml-auto text-[10px] tabular-nums ${darkMode ? 'text-amber-700' : 'text-amber-500'}`}>
                {expandedSources.size}/{sources.length} offen
              </span>
            </div>
          )}

          {showDeepSearch && searchTerm && (
            <p className={`mt-2 px-1 text-xs ${darkMode ? 'text-amber-600' : 'text-amber-700'}`}>
              Tiefensuche aktiv: Treffer im Inhalt werden nachgeladen.
            </p>
          )}
        </div>
      </div>

      {/* Scrollable content area */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto">
        {/* Word count / reading duration for selected story */}
        {selectedStory && (showWordCount || showReadingDuration) && (
          <div className={`mx-4 mt-3 rounded-xl px-4 py-3 space-y-1.5 ${
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

        {/* Favorites shelf — pinned, collapsible, independent of favoritesOnly mode */}
        {showFavShelf && (
          <div className="px-3 pt-3" data-testid="sidebar-v2-fav-shelf">
            <button
              onClick={() => setFavShelfOpen((v) => !v)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                darkMode ? 'text-amber-500 hover:bg-slate-800' : 'text-amber-600 hover:bg-amber-50'
              }`}
            >
              {favShelfOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <BookmarkCheck size={12} />
              <span>Favoriten</span>
              <span className={`ml-auto tabular-nums normal-case ${darkMode ? 'text-amber-700' : 'text-amber-400'}`}>
                {favoriteStories.length}
              </span>
            </button>
            {favShelfOpen && (
              <div className="mt-1 space-y-1">
                {favoriteStories.slice(0, 6).map((s) => (
                  <div ref={storyRowRef(s)} key={`fav-${s.id}`} className="pl-4">
                    <StoryButton
                      story={s}
                      isActive={selectedStory?.id === s.id}
                      isCompleted={completedStories.has(s.id)}
                      isFavorite
                      alwaysFilled
                      showSourceBadge
                      inlineBadges
                      showFavoriteButton={showFavorites}
                      testId="story-button"
                      onClick={() => { onSelectStory(s); onMenuToggle(); if (profileOpen) onCloseProfile(); }}
                      onFavoriteClick={(e) => onToggleFavorite(s.id, e)}
                    />
                  </div>
                ))}
                {favoriteStories.length > 6 && (
                  <button
                    onClick={() => onToggleFavoritesOnly?.()}
                    className={`w-full text-left px-4 py-1 text-[11px] ${
                      darkMode ? 'text-amber-600 hover:text-amber-400' : 'text-amber-600 hover:text-amber-800'
                    }`}
                  >
                    + {favoriteStories.length - 6} weitere…
                  </button>
                )}
              </div>
            )}
            <div className={`mt-3 mx-1 h-px ${darkMode ? 'bg-amber-800/40' : 'bg-amber-200'}`} />
          </div>
        )}

        {/* Main content */}
        <div className="px-3 pt-3 pb-4 space-y-1">
          {favoritesOnly && showFavorites ? (
            favoriteStories.length === 0 ? (
              <p className={`px-2 py-3 text-sm ${darkMode ? 'text-amber-600' : 'text-amber-700'}`}>Keine Favoriten</p>
            ) : favoriteStories.map((s, i) => renderStory(s, i, { showSourceBadge: true, inlineBadges: true }))
          ) : searchTerm ? (
            filteredStories.length === 0 ? (
              <p className={`px-2 py-3 text-sm ${darkMode ? 'text-amber-600' : 'text-amber-700'}`}>Keine Ergebnisse</p>
            ) : filteredStories.map((s, i) => renderStory(s, i, { showSourceBadge: true, inlineBadges: true }))
          ) : sources.length === 0 ? (
            <p className={`px-2 py-3 text-sm ${darkMode ? 'text-amber-600' : 'text-amber-700'}`}>Keine Quellen verfügbar</p>
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
