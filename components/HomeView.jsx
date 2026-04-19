import { useCallback } from 'react';
import { Heart } from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';
import SuggestionFeeds from './SuggestionFeeds';
import HomeFooterDrawer from './gestureContent/HomeFooterDrawer';

/**
 * Home view - resume banner, suggestion feeds and favorites grid.
 * Shown when no story is selected.
 */
export default function HomeView({
  resumeSession,
  onResume,
  onDismissResume,
  favoriteStories,
  completedStories,
  showFavorites,
  showWordCount,
  showSuggestionFeeds,
  storyIndex,
  onSelectStory,
  onToggleFavorite,
  showEnhancedGestures,
  onFocusSearch,
  onToggleFavoritesOnly,
  favoritesOnly,
  recentStories,
}) {
  const { dark } = useTheme();
  const handleResumeLastStory = useCallback(() => {
    if (!resumeSession) return;
    onResume(resumeSession.story, resumeSession.page);
  }, [resumeSession, onResume]);

  return (
    <div className="w-full h-full overflow-y-auto">
      {showEnhancedGestures && (
        <HomeFooterDrawer
          onFocusSearch={onFocusSearch}
          onToggleFavoritesOnly={onToggleFavoritesOnly}
          favoritesOnly={favoritesOnly}
          onResumeLastStory={handleResumeLastStory}
          resumeAvailable={!!resumeSession}
          recentStories={recentStories}
          onSelectStory={onSelectStory}
        />
      )}
      {/* Resume Banner */}
      {resumeSession && (
        <div
          data-testid="resume-banner"
          className={`mx-4 mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
            dark
              ? 'bg-amber-900/30 border-amber-700/40 text-amber-200'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <span className="text-xl">📖</span>
          <button
            data-testid="resume-confirm"
            onClick={() => onResume(resumeSession.story, resumeSession.page)}
            className="flex-1 min-w-0 text-left"
          >
            <p className="text-sm font-medium truncate">Weiterlesen</p>
            <p className={`text-xs truncate ${dark ? 'text-amber-400' : 'text-amber-600'}`}>
              {resumeSession.story.title}, Seite {resumeSession.page + 1}
            </p>
          </button>
          <button
            data-testid="resume-dismiss"
            onClick={() => onDismissResume()}
            className={`flex-shrink-0 p-1 rounded transition-colors ${
              dark ? 'hover:bg-amber-800/50 text-amber-400' : 'hover:bg-amber-200 text-amber-600'
            }`}
            aria-label="Schließen"
          >
            ×
          </button>
        </div>
      )}

      {/* Suggestion Feeds */}
      {showSuggestionFeeds && (
        <SuggestionFeeds
          storyIndex={storyIndex}
          onSelectStory={onSelectStory}
          showWordCount={showWordCount}
        />
      )}

      {/* Favorites Grid or Empty State */}
      {showFavorites && favoriteStories.length > 0 ? (
        <div className="p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Heart size={20} fill="currentColor" className={dark ? 'text-amber-400' : 'text-amber-600'} />
            <h2 className={`text-xl font-serif font-bold ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
              Favoriten
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteStories.map(story => (
              <div
                key={story.id}
                className={`group relative rounded-xl border p-4 transition-colors cursor-pointer ${
                  dark
                    ? 'bg-slate-800/60 border-amber-700/20 hover:bg-slate-800'
                    : 'bg-white/80 border-amber-200/60 hover:bg-white'
                }`}
                onClick={() => onSelectStory(story)}
              >
                <p className={`font-serif text-base font-medium leading-snug mb-2 pr-6 ${
                  dark ? 'text-amber-100' : 'text-amber-950'
                }`}>
                  {story.title}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    dark ? 'bg-slate-700 text-amber-400' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {story.sourceLabel}
                  </span>
                  {showWordCount && story.wordCount != null && (
                    <span className={`text-xs tabular-nums ${dark ? 'text-amber-600' : 'text-amber-500'}`}>
                      {story.wordCount.toLocaleString('de')} W
                    </span>
                  )}
                  {completedStories.has(story.id) && (
                    <span data-testid="completed-indicator" className={`text-xs px-1.5 py-0.5 rounded ${
                      dark ? 'bg-slate-700 text-amber-500' : 'bg-amber-100 text-amber-600'
                    }`}>✓</span>
                  )}
                </div>
                <button
                  onClick={(e) => onToggleFavorite(story.id, e)}
                  className={`absolute top-3 right-3 p-1 rounded transition-colors ${
                    dark ? 'text-amber-400 hover:bg-slate-700' : 'text-amber-500 hover:bg-amber-100'
                  }`}
                >
                  <Heart size={14} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : showSuggestionFeeds ? null : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">📚</div>
          <p className={`text-2xl font-serif font-bold mb-2 ${
            dark ? 'text-amber-200' : 'text-amber-900'
          }`}>
            Wähle ein Märchen
          </p>
          <p className={`${dark ? 'text-amber-600' : 'text-amber-700'}`}>
            Klicke auf einen Titel in der Seitenleiste
          </p>
        </div>
      )}
    </div>
  );
}
