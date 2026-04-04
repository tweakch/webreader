import { cn } from './cn';
import { useTheme } from './ThemeContext';

/**
 * Themed icon button — standard amber palette + hover bg.
 * Covers the common header/toolbar case. For non-standard colors (audio,
 * nav arrows, favorites) pass overrides via className.
 */
export default function IconButton({ children, className = '', ...props }) {
  const { tc } = useTheme();
  return (
    <button
      className={cn(
        'p-2 rounded-lg transition-colors',
        tc({
          light:   'text-amber-900 hover:bg-amber-100',
          dark:    'text-amber-200 hover:bg-slate-800',
          hcLight: 'text-gray-900 hover:bg-gray-100',
          hcDark:  'text-white hover:bg-white/10',
        }),
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
