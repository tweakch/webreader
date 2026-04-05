import { Heart, Share2, X } from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';

/**
 * Renders the current page content with title, text, and action buttons.
 * Handles paragraph reconstruction from word tokens, attribution, and close/share/favorite actions.
 */
export default function PageContent({
  pages,
  currentPage,
  totalPages,
  selectedStory,
  selectedVariant,
  fontSize,
  lineHeight,
  wordSpacing,
  fontFamily,
  textWidth,
  hPadding,
  showAttribution,
  showFavorites,
  favorites,
  onShare,
  onToggleFavorite,
  onClose,
}) {
  const { dark: darkMode, hc: highContrast } = useTheme();

  if (!pages[currentPage]) return null;

  const page = pages[currentPage];
  const isLastPage = currentPage === totalPages - 1;
  const isFavorite = favorites.has(selectedStory.id);

  return (
    <div
      data-testid="page-content"
      className={`h-full transition-colors duration-300 ${
        highContrast ? (darkMode ? 'bg-black' : 'bg-white') : darkMode ? 'bg-slate-800/50' : 'bg-white/70'
      }`}
      style={{ padding: `2rem ${hPadding}px` }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: textWidth + 'px' }}>
        {page.hasTitle && (
          <>
            <h2 style={{ fontFamily }} className={`text-4xl font-bold mb-2 ${
              highContrast ? (darkMode ? 'text-white' : 'text-gray-900') : darkMode ? 'text-amber-200' : 'text-amber-900'
            }`}>
              {selectedVariant?.adaptionName ?? selectedStory.title}
            </h2>
            <div className={`h-1 w-20 rounded-full mb-8 ${
              highContrast ? (darkMode ? 'bg-white' : 'bg-black') : darkMode ? 'bg-amber-700' : 'bg-amber-300'
            }`} />
          </>
        )}

        <div
          style={{ fontSize: `${fontSize}px`, lineHeight, wordSpacing, fontFamily }}
          className={highContrast ? (darkMode ? 'text-white' : 'text-gray-900') : darkMode ? 'text-amber-50' : 'text-amber-950'}
        >
          {/* Reconstruct paragraphs from word tokens */}
          {(() => {
            const paras = [];
            let currentPara = [];

            page.tokens.forEach((token) => {
              currentPara.push(token.word);
              if (token.isPara) {
                paras.push(currentPara.join(' '));
                currentPara = [];
              }
            });

            // If there are leftover words (happens when page breaks mid-paragraph)
            if (currentPara.length > 0) {
              paras.push(currentPara.join(' '));
            }

            return paras.map((text, idx) => (
              <p key={idx} className="mb-6 first-letter:font-bold">
                {text}
              </p>
            ));
          })()}
        </div>

        {showAttribution && isLastPage && (
          <div className={`mt-8 pt-6 border-t ${
            darkMode ? 'border-amber-700/30' : 'border-amber-300'
          }`}>
            <p className={`text-sm italic ${
              darkMode ? 'text-amber-600' : 'text-amber-700'
            }`}>
              — Jacob und Wilhelm Grimm
            </p>
          </div>
        )}

        {isLastPage && (
          <div className={`mt-8 pt-6 flex items-center justify-center gap-3 ${showAttribution ? '' : `border-t ${darkMode ? 'border-amber-700/30' : 'border-amber-300'}`}`}>
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
        )}
      </div>
    </div>
  );
}
