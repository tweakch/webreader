import { useMemo } from 'react';
import { Search, Heart, Star, Clock } from 'lucide-react';
import { cn } from '../../ui/cn';
import { useTheme } from '../../ui/ThemeContext';
import { GestureDrawerContent, useGestureDrawers } from '../GestureDrawerContext';

/**
 * Home-page context menu. A small drawer of shortcut actions so the user
 * doesn't have to dig through the sidebar from the home view.
 */
function HomeBody({
  onFocusSearch,
  onToggleFavoritesOnly,
  favoritesOnly,
  onResumeLastStory,
  resumeAvailable,
  recentStories,
  onSelectStory,
  closeDrawer,
}) {
  const { tc } = useTheme();
  const btn = cn(
    'flex flex-col items-center gap-1 p-3 rounded-lg text-xs transition-colors',
    tc({
      light:   'bg-amber-100 text-amber-900 hover:bg-amber-200',
      dark:    'bg-slate-800 text-amber-200 hover:bg-slate-700',
      hcLight: 'border border-black',
      hcDark:  'border border-white',
    })
  );
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <button
          data-testid="gesture-home-focus-search"
          onClick={() => { closeDrawer(); onFocusSearch?.(); }}
          className={btn}
        >
          <Search size={18} />
          <span>Suchen</span>
        </button>
        <button
          data-testid="gesture-home-toggle-favorites"
          onClick={() => { onToggleFavoritesOnly?.(); closeDrawer(); }}
          className={cn(
            btn,
            favoritesOnly && tc({
              light:   'bg-amber-300',
              dark:    'bg-amber-900/50',
              hcLight: 'bg-black text-white',
              hcDark:  'bg-white text-black',
            }),
          )}
        >
          <Heart size={18} fill={favoritesOnly ? 'currentColor' : 'none'} />
          <span>Favoriten</span>
        </button>
        <button
          data-testid="gesture-home-resume"
          onClick={() => { closeDrawer(); onResumeLastStory?.(); }}
          disabled={!resumeAvailable}
          className={cn(btn, 'disabled:opacity-30')}
        >
          <Star size={18} />
          <span>Weiterlesen</span>
        </button>
      </div>
      {recentStories && recentStories.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-wider opacity-70 mb-1.5 flex items-center gap-1.5">
            <Clock size={12} /> Zuletzt gelesen
          </div>
          <ul className="space-y-1" data-testid="gesture-home-recent">
            {recentStories.slice(0, 5).map((story) => (
              <li key={story.id}>
                <button
                  onClick={() => { onSelectStory?.(story); closeDrawer(); }}
                  className={cn(
                    'w-full text-left px-2 py-1.5 rounded transition-colors',
                    tc({
                      light: 'hover:bg-amber-100',
                      dark: 'hover:bg-slate-800',
                      hcLight: 'hover:bg-gray-100',
                      hcDark: 'hover:bg-white/10',
                    }),
                  )}
                >
                  {story.title}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function HomeFooterDrawer({
  onFocusSearch,
  onToggleFavoritesOnly,
  favoritesOnly,
  onResumeLastStory,
  resumeAvailable,
  recentStories,
  onSelectStory,
}) {
  const { closeDrawer } = useGestureDrawers();
  const node = useMemo(
    () => (
      <HomeBody
        onFocusSearch={onFocusSearch}
        onToggleFavoritesOnly={onToggleFavoritesOnly}
        favoritesOnly={favoritesOnly}
        onResumeLastStory={onResumeLastStory}
        resumeAvailable={resumeAvailable}
        recentStories={recentStories}
        onSelectStory={onSelectStory}
        closeDrawer={closeDrawer}
      />
    ),
    [onFocusSearch, onToggleFavoritesOnly, favoritesOnly, onResumeLastStory, resumeAvailable, recentStories, onSelectStory, closeDrawer],
  );
  return (
    <GestureDrawerContent edge="footer" title="Schnellaktionen">
      {node}
    </GestureDrawerContent>
  );
}
