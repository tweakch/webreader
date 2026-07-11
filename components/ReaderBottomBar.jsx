import {
  ChevronLeft,
  ChevronRight,
  ClockFading,
  Play,
  Pause,
  Square,
} from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';

/**
 * Reader bottom navigation bar: prev/next, title + page counter that opens the
 * typography panel, TTS controls, and the speed-reader toggle.
 */

export default function ReaderBottomBar({
  visible = true,
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
  showTextToSpeech,
  ttsSupported,
  ttsPlaying,
  ttsPaused,
  onToggleTts,
  onStopTts,
  simplifiedUi,
}) {
  const { dark: darkMode, hc: highContrast } = useTheme();

  const navHeight = simplifiedUi ? 'h-16' : 'h-12';
  const btnIconSize = simplifiedUi ? 24 : 18;
  const ttsBtnBase = simplifiedUi ? 'w-12 h-12' : 'w-9 h-9';

  return (
    <>
      <div
        data-testid="nav-bar"
        aria-hidden={!visible}
        className={`flex-shrink-0 ${navHeight} flex items-center justify-between px-6 border-t ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: 'var(--paper-surface)',
          color: 'var(--paper-ink)',
          borderTopColor: 'var(--paper-rule)',
          transition: 'opacity var(--motion-sm) var(--motion-ease-standard)',
        }}
      >
          <button
            data-testid="prev-page"
            onClick={onPrev}
            disabled={currentPage === 0 || speedReaderMode}
            className={`${simplifiedUi ? 'p-2.5' : 'p-1'} rounded transition-colors disabled:opacity-30 hover:bg-[var(--paper-hover)]`}
          >
            <ChevronLeft size={simplifiedUi ? 28 : 20} />
          </button>

          <button
            onClick={onToggleTypoPanel}
            disabled={speedReaderMode || !showTypographyPanel}
            className={`flex flex-col items-center gap-0.5 min-w-0 overflow-hidden px-3 py-1 rounded-lg transition-colors disabled:opacity-30 ${
              typoPanelOpen ? 'bg-[var(--paper-accent)]' : 'hover:bg-[var(--paper-hover)]'
            }`}
          >
            <span
              className="text-xs font-serif truncate max-w-full"
              style={{ color: 'var(--paper-ink-muted)' }}
            >
              {storyTitle}
            </span>
            {speedReaderMode ? (
              <span className="text-xs font-medium tabular-nums">{srWordCount} Wörter</span>
            ) : (
              <span data-testid="page-counter" className="text-xs font-medium tabular-nums">
                {currentPage + 1} / {totalPages}
              </span>
            )}
          </button>

          <div className="flex items-center gap-1">
            {showTextToSpeech && ttsSupported && (
              <>
                <button
                  data-testid="tts-toggle"
                  onClick={onToggleTts}
                  disabled={speedReaderMode}
                  title={ttsPlaying && !ttsPaused ? 'Pause' : 'Vorlesen'}
                  className={`flex items-center justify-center ${ttsBtnBase} rounded-xl transition-colors disabled:opacity-30 ${
                    ttsPlaying && !ttsPaused
                      ? highContrast
                        ? darkMode
                          ? 'bg-white text-black'
                          : 'bg-black text-white'
                        : darkMode
                          ? 'bg-amber-500/30 text-amber-300'
                          : 'bg-amber-100 text-amber-700'
                      : highContrast
                        ? darkMode
                          ? 'text-white/60'
                          : 'text-gray-500'
                        : darkMode
                          ? 'bg-slate-700/60 text-amber-700'
                          : 'bg-amber-50/80 text-amber-400'
                  }`}
                >
                  {ttsPlaying && !ttsPaused ? (
                    <Pause size={btnIconSize} />
                  ) : (
                    <Play size={btnIconSize} />
                  )}
                </button>
                {ttsPlaying && (
                  <button
                    data-testid="tts-stop"
                    onClick={onStopTts}
                    title="Vorlesen stoppen"
                    className={`flex items-center justify-center ${ttsBtnBase} rounded-xl transition-colors ${
                      highContrast
                        ? darkMode
                          ? 'text-white/60'
                          : 'text-gray-500'
                        : darkMode
                          ? 'bg-slate-700/60 text-amber-700'
                          : 'bg-amber-50/80 text-amber-400'
                    }`}
                  >
                    <Square size={btnIconSize - 4} />
                  </button>
                )}
              </>
            )}
            {showSpeedReader && (
              <button
                data-testid="speed-reader-toggle"
                onClick={onToggleSpeedReader}
                title={speedReaderMode ? 'Normaler Lesebereich' : 'Schnellleser'}
                className={`flex items-center justify-center ${ttsBtnBase} rounded-xl transition-colors ${
                  speedReaderMode
                    ? highContrast
                      ? darkMode
                        ? 'bg-white text-black'
                        : 'bg-black text-white'
                      : darkMode
                        ? 'bg-amber-500/30 text-amber-300'
                        : 'bg-amber-100 text-amber-700'
                    : highContrast
                      ? darkMode
                        ? 'text-white/60'
                        : 'text-gray-500'
                      : darkMode
                        ? 'bg-slate-700/60 text-amber-700'
                        : 'bg-amber-50/80 text-amber-400'
                }`}
              >
                <ClockFading size={btnIconSize} />
              </button>
            )}
            <button
              data-testid="next-page"
              onClick={onNext}
              disabled={currentPage >= totalPages - 1 || speedReaderMode}
              className={`${simplifiedUi ? 'p-2.5' : 'p-1'} rounded transition-colors disabled:opacity-30 hover:bg-[var(--paper-hover)]`}
            >
              <ChevronRight size={simplifiedUi ? 28 : 20} />
            </button>
          </div>
      </div>
    </>
  );
}
