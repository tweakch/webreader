import { ChevronRight } from 'lucide-react';
import { cn } from './cn';
import { useTheme } from './ThemeContext';

/**
 * Source list item button.
 * Displays a source name with story count and chevron icon.
 *
 * src  - { id, label, count }
 * onClick - called when clicked
 */
export default function SourceButton({ src, onClick, simplifiedUi = false }) {
  const { tc } = useTheme();

  return (
    <button
      data-testid="source-button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between rounded-lg transition-all',
        simplifiedUi ? 'px-4 py-4' : 'px-3 py-2.5',
        tc({
          light: 'text-amber-900 hover:bg-amber-100',
          dark: 'text-amber-100 hover:bg-slate-800',
          hcLight: 'text-gray-900 hover:bg-gray-100',
          hcDark: 'text-white hover:bg-white/10',
        })
      )}
    >
      <span className={`font-serif ${simplifiedUi ? 'text-lg' : 'text-base'} truncate min-w-0 flex-1 text-left pr-3`}>{src.label}</span>
      <span className="flex-shrink-0 flex items-center gap-2">
        <span className={cn(
          'tabular-nums',
          simplifiedUi ? 'text-sm' : 'text-xs',
          tc({
            light: 'text-amber-700',
            dark: 'text-amber-400',
            hcLight: 'text-gray-600',
            hcDark: 'text-white/60',
          })
        )}>
          {src.count}
        </span>
        <ChevronRight size={simplifiedUi ? 20 : 16} />
      </span>
    </button>
  );
}
