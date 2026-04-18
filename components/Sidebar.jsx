import { ChevronLeft, ChevronRight, Heart, User, LogOut } from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';
import SearchInput from '../ui/SearchInput';
import StoryButton from '../ui/StoryButton';
import SourceButton from '../ui/SourceButton';

/**
 * Sidebar navigation - two-level source/story list with search and profile.
 * Shows either source list, drilled story list, or search results.
 */
export default function Sidebar({
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
  activeDirectory,
  onSelectDirectory,
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
  simplifiedUi = false,
}) {
  const { dark: darkMode } = useTheme();

  return (
    <aside className={`fixed lg:static top-16 bottom-0 left-0 w-80 lg:w-72 z-30 transform transition-transform duration-300 flex flex-col ${
      menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    } ${
      darkMode
        ? 'bg-slate-950/95 border-amber-700/30'
        : 'bg-white/95 border-amber-200/50'
    } border-r backdrop-blur-sm`}>
      <div className="flex-1 min-h-0 overflow-y-auto">

        {/* Search - always visible */}
        <div className="p-4">
          <div className="flex items-center gap-2">
            <SearchInput
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Märchen suchen..."
            />
            {showFavoritesOnlyToggle && showFavorites && (
              <button
                onClick={() => onToggleFavoritesOnly()}
                title={favoritesOnly ? 'Alle anzeigen' : 'Nur Favoriten'}
                className={`flex-shrink-0 p-2 rounded-lg border transition-colors ${
                  favoritesOnly
                    ? darkMode
                      ? 'bg-amber-700 border-amber-600 text-white'
                      : 'bg-amber-200 border-amber-300 text-amber-900'
                    : darkMode
                      ? 'border-amber-700/50 text-amber-600 hover:text-amber-400 hover:bg-slate-800'
                      : 'border-amber-300 text-amber-400 hover:text-amber-700 hover:bg-amber-50'
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
        </div>

        {/* Word count/reading duration stats */}
        {selectedStory && (showWordCount || showReadingDuration) && (
          <div className={`mx-4 mb-2 rounded-xl px-4 py-3 space-y-1.5 ${
            darkMode ? 'bg-slate-800' : 'bg-amber-50'
          }`}>
            {showWordCount && (
              <div className={`flex items-center justify-between text-sm ${
                darkMode ? 'text-amber-400' : 'text-amber-700'
              }`}>
                <span>Wörter</span>
                <span className="tabular-nums font-medium">{storyWordCount.toLocaleString('de')}</span>
              </div>
            )}
            {showReadingDuration && (
              <div className={`flex items-center justify-between text-sm ${
                darkMode ? 'text-amber-400' : 'text-amber-700'
              }`}>
                <span>Lesezeit</span>
                <span className="tabular-nums font-medium">~{readingMinutes} min</span>
              </div>
            )}
          </div>
        )}

        {/* Story list - conditional views */}
        {favoritesOnly && showFavorites ? (
          /* Favorites-only view */
          <div className="px-3 pb-4 space-y-1">
            {favoriteStories.length === 0 ? (
              <p className={`px-2 py-3 text-sm ${darkMode ? 'text-amber-600' : 'text-amber-700'}`}>
                Keine Favoriten
              </p>
            ) : favoriteStories.map(story => (
              <StoryButton
                key={story.id}
                story={story}
                isActive={selectedStory?.id === story.id}
                isCompleted={completedStories.has(story.id)}
                isFavorite={true}
                showSourceBadge
                showFavoriteButton
                alwaysFilled
                testId="story-button"
                onClick={() => { onSelectStory(story); onMenuToggle(); }}
                onFavoriteClick={(e) => onToggleFavorite(story.id, e)}
                simplifiedUi={simplifiedUi}
              />
            ))}
          </div>
        ) : searchTerm ? (
          /* Search results - global, with source badge */
          <div className="px-3 pb-4 space-y-1">
            {filteredStories.length === 0 && (
              <p className={`px-2 py-3 text-sm ${darkMode ? 'text-amber-600' : 'text-amber-700'}`}>
                Keine Ergebnisse
              </p>
            )}
            {filteredStories.map(story => (
              <StoryButton
                key={story.id}
                story={story}
                isActive={selectedStory?.id === story.id}
                isCompleted={completedStories.has(story.id)}
                isFavorite={favorites.has(story.id)}
                showSourceBadge
                showWordCount={showWordCount}
                showFavoriteButton={showFavorites}
                inlineBadges
                onClick={() => { onSelectStory(story); onMenuToggle(); }}
                onFavoriteClick={(e) => onToggleFavorite(story.id, e)}
                simplifiedUi={simplifiedUi}
              />
            ))}
          </div>
        ) : activeSource && showStoryDirectories && activeDirectory ? (
          /* Drilled into a directory - back to directory list + story list */
          <>
            <div className="px-3 pb-2">
              <button
                data-testid="back-to-directories"
                onClick={() => onSelectDirectory(null)}
                className={`flex items-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode
                    ? 'text-amber-400 hover:bg-slate-800'
                    : 'text-amber-700 hover:bg-amber-100'
                }`}
              >
                <ChevronLeft size={16} />
                <span className="min-w-0 truncate">{activeDirectory}</span>
                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${
                  darkMode ? 'bg-slate-700 text-amber-500' : 'bg-amber-100 text-amber-600'
                }`}>
                  {(storiesBySource[activeSource] ?? []).filter(s => s.directory === activeDirectory).length}
                </span>
              </button>
            </div>
            <div className={`mx-3 mb-3 h-px ${darkMode ? 'bg-amber-800/40' : 'bg-amber-200'}`} />
            <div className="px-3 pb-4 space-y-1">
              {(storiesBySource[activeSource] ?? [])
                .filter(s => s.directory === activeDirectory)
                .map(story => (
                  <StoryButton
                    key={story.id}
                    story={story}
                    isActive={selectedStory?.id === story.id}
                    isCompleted={completedStories.has(story.id)}
                    isFavorite={favorites.has(story.id)}
                    showWordCount={showWordCount}
                    showFavoriteButton={showFavorites}
                    testId="story-button"
                    onClick={() => { onSelectStory(story); onMenuToggle(); }}
                    onFavoriteClick={(e) => onToggleFavorite(story.id, e)}
                    simplifiedUi={simplifiedUi}
                  />
                ))}
            </div>
          </>
        ) : activeSource && showStoryDirectories && directoriesBySource[activeSource]?.length ? (
          /* Drilled into a source with directories - show directory list */
          <>
            <div className="px-3 pb-2">
              <button
                data-testid="back-to-sources"
                onClick={() => onSelectSource(null)}
                className={`flex items-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode
                    ? 'text-amber-400 hover:bg-slate-800'
                    : 'text-amber-700 hover:bg-amber-100'
                }`}
              >
                <ChevronLeft size={16} />
                <span className="min-w-0 truncate">{sources.find(s => s.id === activeSource)?.label}</span>
                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${
                  darkMode ? 'bg-slate-700 text-amber-500' : 'bg-amber-100 text-amber-600'
                }`}>
                  {storiesBySource[activeSource]?.length}
                </span>
              </button>
            </div>
            <div className={`mx-3 mb-3 h-px ${darkMode ? 'bg-amber-800/40' : 'bg-amber-200'}`} />
            <div className="px-3 pb-4 space-y-2">
              {(directoriesBySource[activeSource] ?? []).map(dir => (
                <button
                  key={dir.id}
                  data-testid="directory-button"
                  onClick={() => onSelectDirectory(dir.id)}
                  className={`w-full flex items-center justify-between ${simplifiedUi ? 'px-4 py-4' : 'px-3 py-2.5'} rounded-lg transition-all ${
                    darkMode
                      ? 'text-amber-100 hover:bg-slate-800'
                      : 'text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  <span className={`font-serif ${simplifiedUi ? 'text-lg' : 'text-base'}`}>{dir.label}</span>
                  <span className={`text-xs tabular-nums mr-1 ${
                    darkMode ? 'text-amber-400' : 'text-amber-700'
                  }`}>
                    {dir.count}
                  </span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </>
        ) : activeSource ? (
          /* Drilled into a source - back button + story list */
          <>
            <div className="px-3 pb-2">
              <button
                data-testid="back-to-sources"
                onClick={() => onSelectSource(null)}
                className={`flex items-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode
                    ? 'text-amber-400 hover:bg-slate-800'
                    : 'text-amber-700 hover:bg-amber-100'
                }`}
              >
                <ChevronLeft size={16} />
                <span className="min-w-0 truncate">{sources.find(s => s.id === activeSource)?.label}</span>
                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${
                  darkMode ? 'bg-slate-700 text-amber-500' : 'bg-amber-100 text-amber-600'
                }`}>
                  {storiesBySource[activeSource]?.length}
                </span>
              </button>
            </div>
            <div className={`mx-3 mb-3 h-px ${darkMode ? 'bg-amber-800/40' : 'bg-amber-200'}`} />
            <div className="px-3 pb-4 space-y-1">
              {(storiesBySource[activeSource] ?? []).map(story => (
                <StoryButton
                  key={story.id}
                  story={story}
                  isActive={selectedStory?.id === story.id}
                  isCompleted={completedStories.has(story.id)}
                  isFavorite={favorites.has(story.id)}
                  showWordCount={showWordCount}
                  showFavoriteButton={showFavorites}
                  testId="story-button"
                  onClick={() => { onSelectStory(story); onMenuToggle(); }}
                  onFavoriteClick={(e) => onToggleFavorite(story.id, e)}
                  simplifiedUi={simplifiedUi}
                />
              ))}
            </div>
          </>
        ) : (
          /* Source list */
          <div className="px-3 pb-4 space-y-2">
            {sources.map(src => (
              <SourceButton key={src.id} src={src} onClick={() => onSelectSource(src.id)} simplifiedUi={simplifiedUi} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions - always visible at sidebar bottom */}
      <div className={`flex-shrink-0 border-t ${
        darkMode ? 'border-amber-700/30' : 'border-amber-200/50'
      }`}>
        <button
          onClick={() => { onOpenProfile(); onMenuToggle(); }}
          className={`w-full flex items-center gap-3 ${simplifiedUi ? 'px-5 py-5' : 'px-4 py-3.5'} transition-colors ${
            profileOpen
              ? darkMode ? 'bg-amber-700/20 text-amber-200' : 'bg-amber-100 text-amber-900'
              : darkMode ? 'text-amber-400 hover:bg-slate-800 hover:text-amber-200' : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
          }`}
        >
          <div className={`flex-shrink-0 ${simplifiedUi ? 'w-10 h-10' : 'w-8 h-8'} rounded-full flex items-center justify-center ${
            darkMode ? 'bg-slate-700' : 'bg-amber-100'
          }`}>
            <User size={simplifiedUi ? 20 : 16} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className={`font-medium truncate ${simplifiedUi ? 'text-base' : 'text-sm'}`}>Mein Profil</p>
          </div>
          <ChevronRight size={simplifiedUi ? 18 : 14} className="flex-shrink-0 opacity-50" />
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
