import { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ClockFading,
  Play,
  Pause,
  Square,
  Minus,
  Plus,
  Share2,
  Heart,
} from 'lucide-react';
import { cn } from '../ui/cn';
import { useTheme } from '../ui/ThemeContext';
import { GestureDrawerContent, useGestureDrawers } from './GestureDrawerContext';

/**
 * Unified reader bottom surface.
 *
 * Renders the persistent navigation bar (prev/next, title + page counter that
 * opens the typography panel, TTS, speed reader) and — when enhanced gestures
 * are enabled — also registers the swipe-up drawer content that extends it
 * with complementary controls (page grid, font size, share, favorite).
 *
 * Controls already shown in the persistent bar are intentionally not repeated
 * in the drawer.
 */

function DrawerActionButton({ onClick, disabled, label, children }) {
  const { tc } = useTheme();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'flex-1 flex flex-col items-center gap-1 py-2 rounded text-xs transition-colors disabled:opacity-30',
        tc({
          light: 'bg-amber-100 text-amber-900 hover:bg-amber-200',
          dark: 'bg-slate-800 text-amber-200 hover:bg-slate-700',
          hcLight: 'border border-black',
          hcDark: 'border border-white',
        })
      )}
    >
      {children}
    </button>
  );
}

function DrawerBody({
  totalPages,
  currentPage,
  onGoToPage,
  fontSize,
  maxFontSize,
  onFontSizeChange,
  showFontSizeControls,
  onShare,
  onToggleFavorite,
  isFavorite,
  showFavorites,
  closeDrawer,
}) {
  const { tc } = useTheme();

  const hasActions = onShare || (showFavorites && onToggleFavorite);

  return (
    <div>
      {hasActions && (
        <div className="flex gap-2 mb-3">
          {onShare && (
            <DrawerActionButton
              onClick={() => {
                onShare();
                closeDrawer();
              }}
              label="Teilen"
            >
              <Share2 size={18} />
              <span>Teilen</span>
            </DrawerActionButton>
          )}
          {showFavorites && onToggleFavorite && (
            <DrawerActionButton
              onClick={onToggleFavorite}
              label={isFavorite ? 'Favorit entfernen' : 'Als Favorit markieren'}
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              <span>Favorit</span>
            </DrawerActionButton>
          )}
        </div>
      )}

      {showFontSizeControls && (
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => onFontSizeChange?.(Math.max(14, fontSize - 2))}
            className={cn(
              'p-2 rounded',
              tc({
                light: 'hover:bg-amber-100',
                dark: 'hover:bg-slate-800',
                hcLight: 'hover:bg-gray-100',
                hcDark: 'hover:bg-white/10',
              })
            )}
            aria-label="Kleinere Schrift"
          >
            <Minus size={16} />
          </button>
          <span className="text-sm tabular-nums min-w-[2.5rem] text-center">{fontSize}</span>
          <button
            onClick={() => onFontSizeChange?.(Math.min(maxFontSize, fontSize + 2))}
            className={cn(
              'p-2 rounded',
              tc({
                light: 'hover:bg-amber-100',
                dark: 'hover:bg-slate-800',
                hcLight: 'hover:bg-gray-100',
                hcDark: 'hover:bg-white/10',
              })
            )}
            aria-label="Größere Schrift"
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      <div
        className="grid gap-1.5 max-h-40 overflow-y-auto"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))' }}
        data-testid="gesture-footer-drawer-grid"
      >
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            data-testid={`gesture-page-${i}`}
            onClick={() => {
              onGoToPage?.(i);
              closeDrawer();
            }}
            className={cn(
              'h-10 rounded text-sm tabular-nums transition-colors',
              i === currentPage
                ? tc({
                    light: 'bg-amber-700 text-white',
                    dark: 'bg-amber-500 text-slate-950',
                    hcLight: 'bg-black text-white',
                    hcDark: 'bg-white text-black',
                  })
                : tc({
                    light: 'bg-amber-100 text-amber-900 hover:bg-amber-200',
                    dark: 'bg-slate-800 text-amber-200 hover:bg-slate-700',
                    hcLight: 'border border-black text-black hover:bg-gray-100',
                    hcDark: 'border border-white text-white hover:bg-white/10',
                  })
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function DrawerRegistration({
  totalPages,
  currentPage,
  onGoToPage,
  storyTitle,
  fontSize,
  maxFontSize,
  onFontSizeChange,
  showFontSizeControls,
  onShare,
  onToggleFavorite,
  isFavorite,
  showFavorites,
}) {
  const { closeDrawer } = useGestureDrawers();
  const node = useMemo(
    () => (
      <DrawerBody
        totalPages={totalPages}
        currentPage={currentPage}
        onGoToPage={onGoToPage}
        fontSize={fontSize}
        maxFontSize={maxFontSize}
        onFontSizeChange={onFontSizeChange}
        showFontSizeControls={showFontSizeControls}
        onShare={onShare}
        onToggleFavorite={onToggleFavorite}
        isFavorite={isFavorite}
        showFavorites={showFavorites}
        closeDrawer={closeDrawer}
      />
    ),
    [
      totalPages,
      currentPage,
      onGoToPage,
      fontSize,
      maxFontSize,
      onFontSizeChange,
      showFontSizeControls,
      onShare,
      onToggleFavorite,
      isFavorite,
      showFavorites,
      closeDrawer,
    ]
  );
  return (
    <GestureDrawerContent edge="footer" title={`Seiten — ${storyTitle ?? ''}`}>
      {node}
    </GestureDrawerContent>
  );
}

export default function ReaderBottomBar({
  visible = true,
  currentPage,
  totalPages,
  storyTitle,
  onPrev,
  onNext,
  onGoToPage,
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
  showEnhancedGestures,
  fontSize,
  maxFontSize,
  onFontSizeChange,
  showFontSizeControls,
  onShare,
  onToggleFavorite,
  isFavorite,
  showFavorites,
}) {
  const { dark: darkMode, hc: highContrast } = useTheme();

  const navHeight = simplifiedUi ? 'h-16' : 'h-12';
  const btnIconSize = simplifiedUi ? 24 : 18;
  const ttsBtnBase = simplifiedUi ? 'w-12 h-12' : 'w-9 h-9';

  // Drawer extends the bar with complementary content; only when enhanced
  // gestures are on and the speed reader isn't taking over the viewport.
  const registerDrawer = showEnhancedGestures && !speedReaderMode;

  return (
    <>
      {registerDrawer && (
        <DrawerRegistration
          totalPages={totalPages}
          currentPage={currentPage}
          onGoToPage={onGoToPage}
          storyTitle={storyTitle}
          fontSize={fontSize}
          maxFontSize={maxFontSize}
          onFontSizeChange={onFontSizeChange}
          showFontSizeControls={showFontSizeControls}
          onShare={onShare}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite}
          showFavorites={showFavorites}
        />
      )}

      {visible && (
        <div
          data-testid="nav-bar"
          className={`flex-shrink-0 ${navHeight} flex items-center justify-between px-6 backdrop-blur-sm border-t transition-colors ${
            highContrast
              ? darkMode
                ? 'bg-black border-white/40 text-white'
                : 'bg-white border-black/30 text-gray-900'
              : darkMode
                ? 'bg-slate-900/90 border-amber-700/30 text-amber-300'
                : 'bg-white/90 border-amber-200/50 text-amber-800'
          }`}
        >
          <button
            data-testid="prev-page"
            onClick={onPrev}
            disabled={currentPage === 0 || speedReaderMode}
            className={`${simplifiedUi ? 'p-2.5' : 'p-1'} rounded transition-colors disabled:opacity-30 ${
              darkMode ? 'hover:bg-slate-700' : 'hover:bg-amber-100'
            }`}
          >
            <ChevronLeft size={simplifiedUi ? 28 : 20} />
          </button>

          <button
            onClick={onToggleTypoPanel}
            disabled={speedReaderMode || !showTypographyPanel}
            className={`flex flex-col items-center gap-0.5 min-w-0 overflow-hidden px-3 py-1 rounded-lg transition-colors disabled:opacity-30 ${
              typoPanelOpen
                ? darkMode
                  ? 'bg-slate-700'
                  : 'bg-amber-100'
                : darkMode
                  ? 'hover:bg-slate-800'
                  : 'hover:bg-amber-50'
            }`}
          >
            <span
              className={`text-xs font-serif truncate max-w-full ${
                darkMode ? 'text-amber-500' : 'text-amber-600'
              }`}
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
              className={`${simplifiedUi ? 'p-2.5' : 'p-1'} rounded transition-colors disabled:opacity-30 ${
                darkMode ? 'hover:bg-slate-700' : 'hover:bg-amber-100'
              }`}
            >
              <ChevronRight size={simplifiedUi ? 28 : 20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
