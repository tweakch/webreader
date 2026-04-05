import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';

/**
 * Bottom navigation bar for page control and story info.
 * Shows prev/next buttons, page counter, and speed reader toggle.
 */
export default function NavBar({
  currentPage,
  totalPages,
  storyTitle,
  onPrev,
  onNext,
  showSpeedReader,
  speedReaderMode,
  onToggleSpeedReader,
  showTypographyPanel,
  typoPanelOpen,
  onToggleTypoPanel,
  srWordCount,
}) {
  const { dark: darkMode, hc: highContrast } = useTheme();

  return (
    <div data-testid="nav-bar" className={`flex-shrink-0 h-12 flex items-center justify-between px-6 backdrop-blur-sm border-t transition-colors ${
      highContrast
        ? (darkMode ? 'bg-black border-white/40 text-white' : 'bg-white border-black/30 text-gray-900')
        : darkMode
        ? 'bg-slate-900/90 border-amber-700/30 text-amber-300'
        : 'bg-white/90 border-amber-200/50 text-amber-800'
    }`}>
      <button
        data-testid="prev-page"
        onClick={onPrev}
        disabled={currentPage === 0 || speedReaderMode}
        className={`p-1 rounded transition-colors disabled:opacity-30 ${
          darkMode ? 'hover:bg-slate-700' : 'hover:bg-amber-100'
        }`}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={onToggleTypoPanel}
        disabled={speedReaderMode || !showTypographyPanel}
        className={`flex flex-col items-center gap-0.5 min-w-0 overflow-hidden px-3 py-1 rounded-lg transition-colors disabled:opacity-30 ${
          typoPanelOpen
            ? darkMode ? 'bg-slate-700' : 'bg-amber-100'
            : darkMode ? 'hover:bg-slate-800' : 'hover:bg-amber-50'
        }`}
      >
        <span className={`text-xs font-serif truncate max-w-full ${
          darkMode ? 'text-amber-500' : 'text-amber-600'
        }`}>
          {storyTitle}
        </span>
        {speedReaderMode ? (
          <span className="text-xs font-medium tabular-nums">
            {srWordCount} Wörter
          </span>
        ) : (
          <span data-testid="page-counter" className="text-xs font-medium tabular-nums">
            {currentPage + 1} / {totalPages}
          </span>
        )}
      </button>

      <div className="flex items-center gap-1">
        {showSpeedReader && (
          <button
            data-testid="speed-reader-toggle"
            onClick={onToggleSpeedReader}
            title={speedReaderMode ? 'Normaler Lesebereich' : 'Schnellleser'}
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
              speedReaderMode
                ? highContrast
                  ? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
                  : darkMode ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-700'
                : highContrast
                  ? (darkMode ? 'text-white/60' : 'text-gray-500')
                  : darkMode ? 'bg-slate-700/60 text-amber-700' : 'bg-amber-50/80 text-amber-400'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="12" x2="15" y2="10" />
              <path d="M5 3.5A9.97 9.97 0 0 1 12 2c2.76 0 5.26 1.12 7.07 2.93" strokeLinecap="round" />
              <path d="M3.5 5A9.97 9.97 0 0 0 2 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <button
          data-testid="next-page"
          onClick={onNext}
          disabled={currentPage >= totalPages - 1 || speedReaderMode}
          className={`p-1 rounded transition-colors disabled:opacity-30 ${
            darkMode ? 'hover:bg-slate-700' : 'hover:bg-amber-100'
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
