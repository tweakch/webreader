import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, Play, Pause, Square, Share2, Heart } from 'lucide-react';
import { cn } from '../../ui/cn';
import { useTheme } from '../../ui/ThemeContext';
import { GestureDrawerContent, useGestureDrawers } from '../GestureDrawerContext';

function ActionButton({ onClick, disabled, label, children }) {
  const { tc } = useTheme();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'flex-1 flex flex-col items-center gap-1 py-2 rounded text-xs transition-colors disabled:opacity-30',
        tc({
          light:   'bg-amber-100 text-amber-900 hover:bg-amber-200',
          dark:    'bg-slate-800 text-amber-200 hover:bg-slate-700',
          hcLight: 'border border-black',
          hcDark:  'border border-white',
        }),
      )}
    >
      {children}
    </button>
  );
}

function FooterBody(props) {
  const {
    totalPages, currentPage, onGoToPage,
    fontSize, maxFontSize, onFontSizeChange, showFontSizeControls,
    ttsSupported, ttsPlaying, ttsPaused, onToggleTts, onStopTts, showTextToSpeech,
    onShare, onToggleFavorite, isFavorite, showFavorites,
    closeDrawer,
  } = props;
  const { tc } = useTheme();

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {showTextToSpeech && ttsSupported && (
          <>
            <ActionButton onClick={onToggleTts} label={ttsPlaying && !ttsPaused ? 'Pause' : 'Vorlesen'}>
              {ttsPlaying && !ttsPaused ? <Pause size={18} /> : <Play size={18} />}
              <span>{ttsPlaying && !ttsPaused ? 'Pause' : 'Vorlesen'}</span>
            </ActionButton>
            {ttsPlaying && (
              <ActionButton onClick={onStopTts} label="Stopp">
                <Square size={18} />
                <span>Stopp</span>
              </ActionButton>
            )}
          </>
        )}
        {onShare && (
          <ActionButton onClick={() => { onShare(); closeDrawer(); }} label="Teilen">
            <Share2 size={18} />
            <span>Teilen</span>
          </ActionButton>
        )}
        {showFavorites && onToggleFavorite && (
          <ActionButton onClick={onToggleFavorite} label={isFavorite ? 'Favorit entfernen' : 'Als Favorit markieren'}>
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            <span>Favorit</span>
          </ActionButton>
        )}
      </div>

      {showFontSizeControls && (
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => onFontSizeChange?.(Math.max(14, fontSize - 2))}
            className={cn('p-2 rounded', tc({
              light: 'hover:bg-amber-100', dark: 'hover:bg-slate-800', hcLight: 'hover:bg-gray-100', hcDark: 'hover:bg-white/10',
            }))}
            aria-label="Kleinere Schrift"
          >
            <Minus size={16} />
          </button>
          <span className="text-sm tabular-nums min-w-[2.5rem] text-center">{fontSize}</span>
          <button
            onClick={() => onFontSizeChange?.(Math.min(maxFontSize, fontSize + 2))}
            className={cn('p-2 rounded', tc({
              light: 'hover:bg-amber-100', dark: 'hover:bg-slate-800', hcLight: 'hover:bg-gray-100', hcDark: 'hover:bg-white/10',
            }))}
            aria-label="Größere Schrift"
          >
            <Plus size={16} />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => onGoToPage?.(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="p-2 rounded hover:bg-black/10 disabled:opacity-30"
            aria-label="Vorherige Seite"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-sm tabular-nums">{currentPage + 1} / {totalPages}</div>
          <button
            onClick={() => onGoToPage?.(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            className="p-2 rounded hover:bg-black/10 disabled:opacity-30"
            aria-label="Nächste Seite"
          >
            <ChevronRight size={18} />
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
            onClick={() => { onGoToPage?.(i); closeDrawer(); }}
            className={cn(
              'h-10 rounded text-sm tabular-nums transition-colors',
              i === currentPage
                ? tc({ light: 'bg-amber-700 text-white', dark: 'bg-amber-500 text-slate-950', hcLight: 'bg-black text-white', hcDark: 'bg-white text-black' })
                : tc({ light: 'bg-amber-100 text-amber-900 hover:bg-amber-200', dark: 'bg-slate-800 text-amber-200 hover:bg-slate-700', hcLight: 'border border-black text-black hover:bg-gray-100', hcDark: 'border border-white text-white hover:bg-white/10' }),
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReaderFooterDrawer({
  totalPages, currentPage, onGoToPage, storyTitle,
  fontSize, maxFontSize, onFontSizeChange, showFontSizeControls,
  ttsSupported, ttsPlaying, ttsPaused, onToggleTts, onStopTts, showTextToSpeech,
  onShare, onToggleFavorite, isFavorite, showFavorites,
}) {
  const { closeDrawer } = useGestureDrawers();
  const node = useMemo(
    () => (
      <FooterBody
        totalPages={totalPages}
        currentPage={currentPage}
        onGoToPage={onGoToPage}
        fontSize={fontSize}
        maxFontSize={maxFontSize}
        onFontSizeChange={onFontSizeChange}
        showFontSizeControls={showFontSizeControls}
        ttsSupported={ttsSupported}
        ttsPlaying={ttsPlaying}
        ttsPaused={ttsPaused}
        onToggleTts={onToggleTts}
        onStopTts={onStopTts}
        showTextToSpeech={showTextToSpeech}
        onShare={onShare}
        onToggleFavorite={onToggleFavorite}
        isFavorite={isFavorite}
        showFavorites={showFavorites}
        closeDrawer={closeDrawer}
      />
    ),
    [
      totalPages, currentPage, onGoToPage, fontSize, maxFontSize, onFontSizeChange, showFontSizeControls,
      ttsSupported, ttsPlaying, ttsPaused, onToggleTts, onStopTts, showTextToSpeech,
      onShare, onToggleFavorite, isFavorite, showFavorites, closeDrawer,
    ],
  );
  return (
    <GestureDrawerContent edge="footer" title={`Seiten — ${storyTitle ?? ''}`}>
      {node}
    </GestureDrawerContent>
  );
}
