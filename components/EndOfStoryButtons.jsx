import { Heart, Share2, X } from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';

/**
 * End-of-story action buttons (Share, Favorite, Close).
 * Rendered as an absolutely-positioned overlay above tap zones so clicks aren't intercepted.
 */
export default function EndOfStoryButtons({
  isVisible,
  selectedStory,
  isFavorite,
  showFavorites,
  highContrast,
  darkMode,
  showAttribution,
  onShare,
  onToggleFavorite,
  onClose,
}) {
  if (!isVisible) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none flex justify-center">
      <div className={`flex items-center justify-center gap-3 p-6 pointer-events-auto ${
        showAttribution ? 'border-none' : `border-t ${highContrast ? (darkMode ? 'border-white/40' : 'border-black/30') : darkMode ? 'border-amber-700/30' : 'border-amber-300'}`
      }`}>
        <button
          onClick={onShare}
          title="Teilen"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            highContrast
              ? (darkMode ? 'border border-white/40 text-white hover:bg-white/10' : 'border border-black/30 text-gray-900 hover:bg-black/5')
              : darkMode ? 'bg-slate-700/60 text-amber-300 hover:bg-slate-700' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          <Share2 size={15} />
          Teilen
        </button>
        {showFavorites && (
          <button
            onClick={onToggleFavorite}
            title={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isFavorite
                ? highContrast
                  ? (darkMode ? 'border border-white text-white' : 'border border-black text-gray-900')
                  : darkMode ? 'bg-amber-700/40 text-amber-300' : 'bg-amber-200 text-amber-900'
                : highContrast
                  ? (darkMode ? 'border border-white/40 text-white hover:bg-white/10' : 'border border-black/30 text-gray-900 hover:bg-black/5')
                  : darkMode ? 'bg-slate-700/60 text-amber-600 hover:bg-slate-700' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
            Favorit
          </button>
        )}
        <button
          onClick={onClose}
          title="Zur Übersicht"
          data-testid="story-close"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            highContrast
              ? (darkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900')
              : darkMode ? 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30' : 'bg-amber-900/10 text-amber-900 hover:bg-amber-900/20'
          }`}
        >
          <X size={15} />
          Schließen
        </button>
      </div>
    </div>
  );
}
