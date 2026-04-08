import { cn } from './cn';
import { useTheme } from './ThemeContext';

/**
 * Themed on/off toggle switch.
 * Reads { dark } from ThemeContext - wrap with ThemeContext.Provider to theme it.
 */
export default function Toggle({ checked, onChange, label, className = '' }) {
  const { tc } = useTheme();
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
        checked
          ? tc({ light: 'bg-amber-600', dark: 'bg-amber-500' })
          : tc({ light: 'bg-amber-200', dark: 'bg-slate-600' }),
        className
      )}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
      }`} />
    </button>
  );
}
