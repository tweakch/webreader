import { cn } from '../ui/cn';
import { useTheme } from '../ui/ThemeContext';

/**
 * Four subtle edge affordances that advertise the drawer gestures to the
 * reader. Each edge hosts a thin tab (dot-pull shape). When the user drags
 * from that edge, the matching tab brightens in proportion to the gesture
 * progress so they feel the connection between the hint and the drawer.
 *
 * Hidden on large viewports where the static sidebar already makes the
 * navigation affordance obvious, and hidden while any drawer is open.
 */
export default function DrawerIndicators({ anyDrawerOpen, activeEdge, progress = 0 }) {
  const { tc } = useTheme();
  if (anyDrawerOpen) return null;

  const activeLeft   = activeEdge === 'left';
  const activeRight  = activeEdge === 'right';
  const activeTop    = activeEdge === 'top';
  const activeBottom = activeEdge === 'bottom';

  const base = tc({
    light:   'bg-amber-400/30',
    dark:    'bg-amber-500/25',
    hcLight: 'bg-black',
    hcDark:  'bg-white',
  });
  const activeCls = tc({
    light:   'bg-amber-700',
    dark:    'bg-amber-300',
    hcLight: 'bg-black',
    hcDark:  'bg-white',
  });

  const vertStyle = (active) => ({
    opacity: active ? 0.5 + progress * 0.5 : 0.35,
    height: active ? `${48 + progress * 36}px` : '48px',
    transition: active ? 'none' : 'opacity 200ms ease-out, height 200ms ease-out',
  });
  const horizStyle = (active) => ({
    opacity: active ? 0.5 + progress * 0.5 : 0.35,
    width: active ? `${64 + progress * 48}px` : '64px',
    transition: active ? 'none' : 'opacity 200ms ease-out, width 200ms ease-out',
  });

  return (
    <div
      aria-hidden
      data-testid="drawer-indicators"
      className="pointer-events-none fixed inset-0 z-30 lg:hidden"
    >
      <div
        data-testid="drawer-indicator-left"
        data-active={activeLeft || undefined}
        style={vertStyle(activeLeft)}
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full',
          activeLeft ? activeCls : base,
        )}
      />
      <div
        data-testid="drawer-indicator-right"
        data-active={activeRight || undefined}
        style={vertStyle(activeRight)}
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 w-1 rounded-l-full',
          activeRight ? activeCls : base,
        )}
      />
      <div
        data-testid="drawer-indicator-top"
        data-active={activeTop || undefined}
        style={horizStyle(activeTop)}
        className={cn(
          'absolute top-0 left-1/2 -translate-x-1/2 h-1 rounded-b-full',
          activeTop ? activeCls : base,
        )}
      />
      <div
        data-testid="drawer-indicator-bottom"
        data-active={activeBottom || undefined}
        style={horizStyle(activeBottom)}
        className={cn(
          'absolute bottom-0 left-1/2 -translate-x-1/2 h-1 rounded-t-full',
          activeBottom ? activeCls : base,
        )}
      />
    </div>
  );
}
