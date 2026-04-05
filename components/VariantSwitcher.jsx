import { cn } from '../ui/cn';
import { useTheme } from '../ui/ThemeContext';

/**
 * Adaption variant switcher — pill row for selecting story variants.
 * Shows "Original" + any adaptions in a horizontal scrolling row.
 * Only rendered when adaption-switcher flag is on and adaptions exist.
 *
 * adaptions — array of variant objects
 * selectedVariant — current selected variant (or null for original)
 * onSelect — called with variant object or null when "Original" is clicked
 */
export default function VariantSwitcher({ adaptions = [], selectedVariant, onSelect }) {
  const { tc } = useTheme();

  if (!adaptions || adaptions.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4">
      {/* Original button */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
          selectedVariant === null
            ? tc({
                light: 'bg-amber-900 text-amber-50',
                dark: 'bg-amber-700 text-amber-100',
                hcLight: 'bg-black text-white',
                hcDark: 'bg-white text-black',
              })
            : tc({
                light: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
                dark: 'bg-slate-700 text-amber-400 hover:bg-slate-600',
                hcLight: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
                hcDark: 'bg-white/10 text-white hover:bg-white/20',
              })
        )}
      >
        Original
      </button>

      {/* Adaption buttons */}
      {adaptions.map(adaption => (
        <button
          key={adaption.adaptionName}
          onClick={() => onSelect(adaption)}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedVariant?.adaptionName === adaption.adaptionName
              ? tc({
                  light: 'bg-amber-900 text-amber-50',
                  dark: 'bg-amber-700 text-amber-100',
                  hcLight: 'bg-black text-white',
                  hcDark: 'bg-white text-black',
                })
              : tc({
                  light: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
                  dark: 'bg-slate-700 text-amber-400 hover:bg-slate-600',
                  hcLight: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
                  hcDark: 'bg-white/10 text-white hover:bg-white/20',
                })
          )}
        >
          {adaption.adaptionName}
        </button>
      ))}
    </div>
  );
}
