import { useTheme } from './ThemeContext';

/**
 * Themed pill badge for story metadata (source label, word count, ✓).
 * Colors inherit from parent when hc is active (parent sets the text colour).
 *
 * isActive — the parent story row is currently selected
 * dim      — use slightly dimmer inactive text (source label vs meta badge)
 */
export default function StoryBadge({ children, isActive = false, dim = false, testId, className = '' }) {
  const { dark, hc } = useTheme();
  return (
    <span
      data-testid={testId}
      className={`text-xs px-1.5 py-0.5 rounded ${
        isActive
          ? hc && dark ? 'bg-black/20'
          : hc         ? 'bg-white/20'
          : dark       ? 'bg-amber-600/60 text-amber-100'
          :              'bg-amber-300/60 text-amber-800'
          : hc && dark ? 'bg-white/10'
          : hc         ? 'bg-black/10'
          : dim
          ? dark       ? 'bg-slate-700 text-amber-400' : 'bg-amber-100 text-amber-700'
          : dark       ? 'bg-slate-700 text-amber-500' : 'bg-amber-100 text-amber-600'
      } ${className}`}
    >
      {children}
    </span>
  );
}
