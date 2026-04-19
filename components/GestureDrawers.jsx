import { useEffect } from 'react';
import { X, RotateCw } from 'lucide-react';
import { cn } from '../ui/cn';
import { useTheme } from '../ui/ThemeContext';

/**
 * Generic drawer frames used by `GestureDrawerViewport`.
 *
 * Each frame renders the chrome (backdrop, slide-in container, title row,
 * close button) and accepts arbitrary `children`. Pages register the
 * children via `GestureDrawerContext`. The `data-testid` attributes on
 * the frames are preserved so Playwright specs keep working.
 */

function useEscClose(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

export function DrawerBackdrop({ open, onClose, dragProgress = 0, testId = 'gesture-drawer-backdrop' }) {
  const visible = open || dragProgress > 0;
  if (!visible) return null;
  const opacity = open ? 0.3 : Math.min(0.3, dragProgress * 0.3);
  return (
    <button
      aria-label="Drawer schließen"
      data-testid={testId}
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

function DrawerTitleBar({ title, onClose, closeTestId }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs uppercase tracking-wider opacity-70 truncate">{title ?? ''}</span>
      <button
        onClick={onClose}
        aria-label="Schließen"
        data-testid={closeTestId}
        className="p-1 rounded hover:bg-black/10"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function HeaderDrawer({ open, onClose, title, children, dragProgress = 0 }) {
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
          <DrawerTitleBar title={title} onClose={onClose} closeTestId="gesture-header-drawer-close" />
          {children}
        </div>
      </div>
    </>
  );
}

export function FooterDrawer({ open, onClose, title, children, dragProgress = 0 }) {
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
          <DrawerTitleBar title={title} onClose={onClose} closeTestId="gesture-footer-drawer-close" />
          {children}
        </div>
      </div>
    </>
  );
}

export function RightDrawer({ open, onClose, title, children, dragProgress = 0 }) {
  const { tc } = useTheme();
  useEscClose(open, onClose);
  const dragging = !open && dragProgress > 0;
  const style = dragging
    ? { transform: `translateX(${(1 - dragProgress) * 100}%)`, transition: 'none' }
    : undefined;
  return (
    <>
      <DrawerBackdrop open={open} onClose={onClose} dragProgress={dragProgress} testId="gesture-right-drawer-backdrop" />
      <div
        data-testid="gesture-right-drawer"
        data-open={open ? 'true' : 'false'}
        aria-hidden={!open && !dragging}
        style={style}
        className={cn(
          'fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-50 border-l shadow-lg flex flex-col',
          dragging ? '' : 'transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
          tc({
            light:   'bg-white/95 border-amber-200 text-amber-900',
            dark:    'bg-slate-900/95 border-amber-700/40 text-amber-200',
            hcLight: 'bg-white border-black text-black',
            hcDark:  'bg-black border-white text-white',
          })
        )}
      >
        <div className={cn('flex items-center justify-between px-4 py-3 border-b', tc({
          light: 'border-amber-200', dark: 'border-amber-700/40', hcLight: 'border-black', hcDark: 'border-white',
        }))}>
          <span className="text-sm font-medium truncate">{title ?? ''}</span>
          <button
            onClick={onClose}
            aria-label="Schließen"
            data-testid="gesture-right-drawer-close"
            className="p-1 rounded hover:bg-black/10"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 text-sm">
          {children}
        </div>
      </div>
    </>
  );
}
