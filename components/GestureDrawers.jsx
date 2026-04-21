import { forwardRef, useEffect } from 'react';
import { X, RotateCw } from 'lucide-react';
import { cn } from '../ui/cn';
import { useTheme } from '../ui/ThemeContext';

/**
 * Generic drawer frames used by `GestureDrawerViewport`.
 *
 * The four edges (top / bottom / left / right) are rendered by a single
 * `EdgeDrawer` component. Thin wrappers `HeaderDrawer` / `FooterDrawer` /
 * `RightDrawer` preserve the existing `data-testid` surface that Playwright
 * relies on.
 *
 * The viewport drives the drawer transform directly during a drag via the
 * forwarded `ref` — this keeps the live-follow animation at 60fps without
 * React re-renders. CSS handles the open/close transition.
 */

function useEscClose(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

export const DrawerBackdrop = forwardRef(function DrawerBackdrop(
  { open, onClose, testId = 'gesture-drawer-backdrop' },
  ref,
) {
  return (
    <button
      ref={ref}
      aria-label="Drawer schließen"
      aria-hidden={!open}
      data-testid={testId}
      data-open={open ? 'true' : 'false'}
      onClick={onClose}
      tabIndex={open ? 0 : -1}
      className="fixed inset-0 z-40 bg-black"
      style={{
        opacity: open ? 0.3 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity var(--motion-md) var(--motion-ease-standard)',
      }}
    />
  );
});

/**
 * Progress bar + label at the top of the screen during a long swipe-down
 * gesture. Becomes "armed" past the 55% threshold.
 */
export function ReloadIndicator({ progress }) {
  const { tc } = useTheme();
  const armed = progress >= 0.55;
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

const EDGE_TO_TESTID = {
  top: 'gesture-header-drawer',
  bottom: 'gesture-footer-drawer',
  right: 'gesture-right-drawer',
  left: 'gesture-left-drawer',
};
const EDGE_TO_CLOSE_TESTID = {
  top: 'gesture-header-drawer-close',
  bottom: 'gesture-footer-drawer-close',
  right: 'gesture-right-drawer-close',
  left: 'gesture-left-drawer-close',
};

const EDGE_CLASSES = {
  top:    'inset-x-0 border-b',
  bottom: 'bottom-0 inset-x-0 border-t',
  right:  'top-0 right-0 bottom-0 border-l flex flex-col',
  left:   'top-0 left-0 bottom-0 border-r flex flex-col',
};

const EDGE_CLOSED_TRANSFORM = {
  top: 'translate3d(0, -100%, 0)',
  bottom: 'translate3d(0, 100%, 0)',
  left: 'translate3d(-100%, 0, 0)',
  right: 'translate3d(100%, 0, 0)',
};

const EDGE_GRIP = {
  top:    'bottom-1.5 left-1/2 -translate-x-1/2 w-10 h-1',
  bottom: 'top-1.5 left-1/2 -translate-x-1/2 w-10 h-1',
  right:  'left-1.5 top-1/2 -translate-y-1/2 w-1 h-10',
  left:   'right-1.5 top-1/2 -translate-y-1/2 w-1 h-10',
};

/**
 * Unified edge drawer. The viewport drives `open`, the title, and may
 * imperatively set `transform` on the forwarded ref during a drag.
 */
export const EdgeDrawer = forwardRef(function EdgeDrawer(
  { edge, open, onClose, title, children, size, chromeless = false, offsetTop },
  ref,
) {
  useEscClose(open, onClose);

  const testId = EDGE_TO_TESTID[edge] ?? `gesture-${edge}-drawer`;
  const closeTestId = EDGE_TO_CLOSE_TESTID[edge] ?? `gesture-${edge}-drawer-close`;
  const isHorizontal = edge === 'left' || edge === 'right';
  const sizeStyle = size
    ? (isHorizontal ? { width: size, maxWidth: '85vw' } : { height: size, maxHeight: '85vh' })
    : (edge === 'right' ? { width: '20rem', maxWidth: '85vw' } : undefined);

  // `offsetTop` docks a top-edge drawer N px below the viewport top so it
  // can read as an extension of a persistent header strip. Ignored for
  // other edges.
  const topStyle = edge === 'top' ? { top: offsetTop ?? 0 } : null;

  // Paper drawer frame: surface + ink + rule come from the active theme's
  // `--paper-*` tokens. The transform is a symmetric slide on all four
  // axes — no bounce, no flourish. Transition duration uses the shared
  // motion-ease-standard so every drawer breathes at the same tempo.
  const baseStyle = {
    ...sizeStyle,
    ...topStyle,
    transform: open ? 'translate3d(0, 0, 0)' : EDGE_CLOSED_TRANSFORM[edge],
    transition: 'transform var(--motion-md) var(--motion-ease-standard)',
    willChange: 'transform',
    backgroundColor: 'var(--paper-surface)',
    color: 'var(--paper-ink)',
    borderColor: 'var(--paper-rule)',
  };

  // Chromeless: the slot owner provides its own header/close UI. The drawer
  // frame still owns transform + positioning + paper surface but no grip,
  // title bar or close button is rendered.
  if (chromeless) {
    return (
      <aside
        ref={ref}
        data-testid={testId}
        data-open={open ? 'true' : 'false'}
        data-edge={edge}
        aria-hidden={!open}
        style={baseStyle}
        className={cn('fixed z-50 flex flex-col', EDGE_CLASSES[edge])}
      >
        {children}
      </aside>
    );
  }

  return (
    <aside
      ref={ref}
      data-testid={testId}
      data-open={open ? 'true' : 'false'}
      data-edge={edge}
      aria-hidden={!open}
      style={baseStyle}
      className={cn('fixed z-50', EDGE_CLASSES[edge])}
    >
      <span
        aria-hidden
        className={cn('absolute rounded-full pointer-events-none', EDGE_GRIP[edge])}
        style={{ backgroundColor: 'var(--paper-ink-muted)', opacity: 0.4 }}
      />
      {isHorizontal ? (
        <>
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderBottomColor: 'var(--paper-rule)' }}
          >
            <span className="text-sm font-medium truncate">{title ?? ''}</span>
            <button
              onClick={onClose}
              aria-label="Schließen"
              data-testid={closeTestId}
              className="p-1 rounded hover:bg-[var(--paper-hover)]"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 text-sm">
            {children}
          </div>
        </>
      ) : (
        <div className="max-w-3xl mx-auto px-5 pt-3 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider opacity-70 truncate">{title ?? ''}</span>
            <button
              onClick={onClose}
              aria-label="Schließen"
              data-testid={closeTestId}
              className="p-1 rounded hover:bg-[var(--paper-hover)]"
            >
              <X size={16} />
            </button>
          </div>
          {children}
        </div>
      )}
    </aside>
  );
});

// Legacy named exports (thin aliases). Keep so external imports don't break.
export const HeaderDrawer = forwardRef(function HeaderDrawer(props, ref) {
  return <EdgeDrawer ref={ref} edge="top" {...props} />;
});
export const FooterDrawer = forwardRef(function FooterDrawer(props, ref) {
  return <EdgeDrawer ref={ref} edge="bottom" {...props} />;
});
export const RightDrawer = forwardRef(function RightDrawer(props, ref) {
  return <EdgeDrawer ref={ref} edge="right" {...props} />;
});
