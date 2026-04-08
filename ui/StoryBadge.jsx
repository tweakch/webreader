import { cn } from './cn';
import { useTheme } from './ThemeContext';

/**
 * Themed pill badge for story metadata (source label, word count, ✓).
 * In HC mode the background is semi-transparent so the badge inherits the
 * parent button's text colour - no explicit text class needed.
 *
 * isActive - the parent story row is currently selected
 * dim      - slightly dimmer inactive text (source label vs meta badge)
 */
export default function StoryBadge({ children, isActive = false, dim = false, testId, className = '' }) {
  const { tc } = useTheme();
  return (
    <span
      data-testid={testId}
      className={cn(
        'text-xs px-1.5 py-0.5 rounded',
        isActive
          ? tc({
              light:   'bg-amber-300/60 text-amber-800',
              dark:    'bg-amber-600/60 text-amber-100',
              hcLight: 'bg-white/20',
              hcDark:  'bg-black/20',
            })
          : tc({
              light:   dim ? 'bg-amber-100 text-amber-700' : 'bg-amber-100 text-amber-600',
              dark:    dim ? 'bg-slate-700 text-amber-400' : 'bg-slate-700 text-amber-500',
              hcLight: 'bg-black/10',
              hcDark:  'bg-white/10',
            }),
        className
      )}
    >
      {children}
    </span>
  );
}
