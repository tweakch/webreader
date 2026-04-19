import { useEffect } from 'react';
import { X, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../ui/cn';
import { useTheme } from '../ui/ThemeContext';

/**
 * Shared drawer visuals for enhanced-gestures.
 *
 * Exports `HeaderDrawer`, `FooterDrawer`, and `ReloadIndicator`. The
 * right-side drawer lives in a sibling file (`GestureRightDrawer.jsx`)
 * so each file stays under the per-file line budget.
 */

function useEscClose(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

function DrawerBackdrop({ open, onClose, dragProgress = 0 }) {
  const visible = open || dragProgress > 0;
  if (!visible) return null;
  const opacity = open ? 0.3 : Math.min(0.3, dragProgress * 0.3);
  return (
    <button
      aria-label="Drawer schließen"
      data-testid="gesture-drawer-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-40 bg-black backdrop-blur-[2px]"
      style={{ opacity, transition: dragProgress > 0 && !open ? 'none' : 'opacity 200ms ease-out' }}
    />
  );
}

/**
 * Progress bar + label at the top of the screen during a long swipe-down
 * gesture. Becomes "armed" past the 60% threshold.
 */
export function ReloadIndicator({ progress }) {
  const { tc } = useTheme();
  const armed = progress >= 0.6;
  if (progress <= 0) return null;
  return (
    <div
      data-testid="gesture-reload-indicator"
      className="fixed top-0 inset-x-0 z-[60] pointer-events-none flex flex-col items-center"
    >
      <div
        className={cn(
          'h-1 transition-colors',
          tc({
            light:   armed ? 'bg-amber-700' : 'bg-amber-400',
            dark:    armed ? 'bg-amber-300' : 'bg-amber-600',
            hcLight: armed ? 'bg-black' : 'bg-gray-500',
            hcDark:  armed ? 'bg-white' : 'bg-white/60',
          })
        )}
        style={{ width: `${Math.min(100, progress * 100)}%` }}
      />
      <div
        className={cn(
          'mt-2 px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-md',
          tc({
            light:   'bg-white/95 text-amber-900 border border-amber-200',
            dark:    'bg-slate-900/95 text-amber-200 border border-amber-700/40',
            hcLight: 'bg-white text-black border border-black',
            hcDark:  'bg-black text-white border border-white',
          })
        )}
      >
        <RotateCw size={12} className={armed ? 'animate-spin' : ''} />
        {armed ? 'Loslassen zum Neuladen' : 'Weiter ziehen zum Neuladen'}
      </div>
    </div>
  );
}

/**
 * Top drawer that hosts a quick-settings payload (typography, TTS, …)
 * passed as `children`. Slides in from the top edge.
 */
export function HeaderDrawer({ open, onClose, children, dragProgress = 0 }) {
  const { tc } = useTheme();
  useEscClose(open, onClose);
  const dragging = !open && dragProgress > 0;
  const style = dragging
    ? { transform: `translateY(${(dragProgress - 1) * 100}%)`, transition: 'none' }
    : undefined;
  return (
    <>
      <DrawerBackdrop open={open} onClose={onClose} dragProgress={dragProgress} />
      <div
        data-testid="gesture-header-drawer"
        data-open={open ? 'true' : 'false'}
        aria-hidden={!open && !dragging}
        style={style}
        className={cn(
          'fixed top-0 inset-x-0 z-50 border-b shadow-lg',
          dragging ? '' : 'transition-transform duration-200 ease-out',
          open ? 'translate-y-0' : '-translate-y-full',
          tc({
            light:   'bg-white/95 border-amber-200 text-amber-900',
            dark:    'bg-slate-900/95 border-amber-700/40 text-amber-200',
            hcLight: 'bg-white border-black text-black',
            hcDark:  'bg-black border-white text-white',
          })
        )}
      >
        <div className="max-w-3xl mx-auto px-5 pt-3 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider opacity-70">Schnelleinstellungen</span>
            <button
              onClick={onClose}
              aria-label="Schließen"
              data-testid="gesture-header-drawer-close"
              className="p-1 rounded hover:bg-black/10"
            >
              <X size={16} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

/**
 * Bottom drawer with a page-picker grid. Jumping to a page closes the
 * drawer; prev/next chevrons step without closing.
 */
export function FooterDrawer({ open, onClose, totalPages, currentPage, onGoToPage, storyTitle, dragProgress = 0 }) {
  const { tc } = useTheme();
  useEscClose(open, onClose);
  const dragging = !open && dragProgress > 0;
  const style = dragging
    ? { transform: `translateY(${(1 - dragProgress) * 100}%)`, transition: 'none' }
    : undefined;
  return (
    <>
      <DrawerBackdrop open={open} onClose={onClose} dragProgress={dragProgress} />
      <div
        data-testid="gesture-footer-drawer"
        data-open={open ? 'true' : 'false'}
        aria-hidden={!open && !dragging}
        style={style}
        className={cn(
          'fixed bottom-0 inset-x-0 z-50 border-t shadow-lg',
          dragging ? '' : 'transition-transform duration-200 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
          tc({
            light:   'bg-white/95 border-amber-200 text-amber-900',
            dark:    'bg-slate-900/95 border-amber-700/40 text-amber-200',
            hcLight: 'bg-white border-black text-black',
            hcDark:  'bg-black border-white text-white',
          })
        )}
      >
        <div className="max-w-3xl mx-auto px-5 pt-3 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider opacity-70 truncate">
              Seiten — {storyTitle ?? ''}
            </span>
            <button
              onClick={onClose}
              aria-label="Schließen"
              data-testid="gesture-footer-drawer-close"
              className="p-1 rounded hover:bg-black/10"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-3">
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
          <div
            className="grid gap-1.5 max-h-40 overflow-y-auto"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))' }}
            data-testid="gesture-footer-drawer-grid"
          >
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                data-testid={`gesture-page-${i}`}
                onClick={() => { onGoToPage?.(i); onClose?.(); }}
                className={cn(
                  'h-10 rounded text-sm tabular-nums transition-colors',
                  i === currentPage
                    ? tc({ light: 'bg-amber-700 text-white', dark: 'bg-amber-500 text-slate-950', hcLight: 'bg-black text-white', hcDark: 'bg-white text-black' })
                    : tc({ light: 'bg-amber-100 text-amber-900 hover:bg-amber-200', dark: 'bg-slate-800 text-amber-200 hover:bg-slate-700', hcLight: 'border border-black text-black hover:bg-gray-100', hcDark: 'border border-white text-white hover:bg-white/10' })
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export { default as RightDrawer } from './GestureRightDrawer';
