import { cn } from './cn';
import { useTheme } from './ThemeContext';

/**
 * Themed segmented control for picking one of N variants.
 * Mirrors the rounded-2xl bordered look of the role selector in ProfilePanel.
 *
 *   options: Array<{ value: string, label: string, testId?: string }>
 *   value:   currently selected value
 *   onChange(value) → void
 */
export default function VariantPicker({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}) {
  const { dark, hc, tc } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'flex rounded-2xl border overflow-hidden',
        tc({
          light:   'border-amber-200',
          dark:    'border-amber-700/30',
          hcLight: 'border-black',
          hcDark:  'border-white',
        }),
        className
      )}
    >
      {options.map(({ value: v, label, testId }) => {
        const selected = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            data-testid={testId}
            onClick={() => onChange(v)}
            className={cn(
              'flex-1 py-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
              selected
                ? hc
                  ? dark ? 'bg-white text-black' : 'bg-black text-white'
                  : dark ? 'bg-amber-700/50 text-amber-100' : 'bg-amber-100 text-amber-900'
                : hc
                  ? dark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
                  : dark ? 'text-amber-600 hover:text-amber-400' : 'text-amber-500 hover:text-amber-800'
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
