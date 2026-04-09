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
              {selectedVariant?.title ?? selectedStory.title}
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
              - Jacob und Wilhelm Grimm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
