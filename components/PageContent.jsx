import { useTheme } from '../ui/ThemeContext';
import { getStoryIllustrations } from '../src/lib/storyLibrary';

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
  showIllustrations = false,
}) {
  const { dark: darkMode, hc: highContrast } = useTheme();

  if (!pages[currentPage]) return null;

  const page = pages[currentPage];
  const isLastPage = currentPage === totalPages - 1;
  const isFavorite = favorites.has(selectedStory.id);
  const illustrations = showIllustrations ? getStoryIllustrations(selectedStory.id) : null;
  const ornamentColor = highContrast
    ? (darkMode ? '#ffffff' : '#000000')
    : darkMode ? '#b8a66b' : '#8b6914';

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
            {showIllustrations && selectedStory.coverUrl && (
              <img
                data-testid="story-cover"
                src={selectedStory.coverUrl}
                alt=""
                className="mb-6 w-full rounded-xl object-cover max-h-80"
              />
            )}
            {showIllustrations && !selectedStory.coverUrl && illustrations?.opening && (
              <img
                data-testid="story-opening-illustration"
                src={illustrations.opening}
                alt=""
                className="mb-6 w-full rounded-xl object-cover max-h-80"
              />
            )}
            <h2 style={{ fontFamily }} className={`text-4xl font-bold mb-2 ${
              highContrast ? (darkMode ? 'text-white' : 'text-gray-900') : darkMode ? 'text-amber-200' : 'text-amber-900'
            }`}>
              {selectedVariant?.title ?? selectedStory.title}
            </h2>
            <div className={`h-1 w-20 rounded-full mb-8 ${
              highContrast ? (darkMode ? 'bg-white' : 'bg-black') : darkMode ? 'bg-amber-700' : 'bg-amber-300'
            }`} />
            {showIllustrations && illustrations?.opening && selectedStory.coverUrl && (
              <img
                data-testid="story-opening-illustration"
                src={illustrations.opening}
                alt=""
                className="mb-8 w-full rounded-xl object-cover max-h-64"
              />
            )}
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
            let hadTrailingFullPara = false;

            page.tokens.forEach((token) => {
              currentPara.push(token.word);
              if (token.isPara) {
                paras.push({ text: currentPara.join(' '), isComplete: true });
                currentPara = [];
                hadTrailingFullPara = true;
              } else {
                hadTrailingFullPara = false;
              }
            });

            // If there are leftover words (page breaks mid-paragraph), push as incomplete
            if (currentPara.length > 0) {
              paras.push({ text: currentPara.join(' '), isComplete: false });
            }

            // The first paragraph on a page is a continuation (not a real start)
            // when the previous page ended mid-paragraph.
            const prevPage = currentPage > 0 ? pages[currentPage - 1] : null;
            const prevLastToken = prevPage?.tokens?.[prevPage.tokens.length - 1];
            const firstParaIsContinuation = !!prevLastToken && !prevLastToken.isPara;

            const ornamentUrl = showIllustrations && illustrations?.ornament;

            return paras.map((para, idx) => {
              const isLastOnPage = idx === paras.length - 1;
              const showOrnament = ornamentUrl && para.isComplete && !isLastOnPage;
              const isParagraphStart = idx > 0 || !firstParaIsContinuation;
              return (
                <div key={idx}>
                  <p className={isParagraphStart ? 'mb-6 first-letter:font-bold' : 'mb-6'}>{para.text}</p>
                  {showOrnament && (
                    <div
                      data-testid="paragraph-ornament"
                      aria-hidden="true"
                      className="my-4 flex justify-center"
                      style={{ color: ornamentColor }}
                    >
                      <img
                        src={ornamentUrl}
                        alt=""
                        className="h-6 opacity-70"
                        style={{ maxWidth: '200px' }}
                      />
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>

        {showIllustrations && isLastPage && illustrations?.ending && (
          <div className="mt-8 flex justify-center">
            <img
              data-testid="story-ending-illustration"
              src={illustrations.ending}
              alt=""
              className="w-full rounded-xl object-cover max-h-80"
            />
          </div>
        )}

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

        {isLastPage && (
          <div className="mt-8 flex gap-3 justify-center">
            <button
              data-testid="story-close"
              title="Schließen"
              onClick={onClose}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                darkMode ? 'bg-amber-700 text-amber-100 hover:bg-amber-600' : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
              }`}
            >
              Schließen
            </button>
            <button
              title="Teilen"
              onClick={onShare}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Teilen
            </button>
            {showFavorites && (
              <button
                title={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                onClick={onToggleFavorite}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  darkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isFavorite ? '♥' : '♡'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
