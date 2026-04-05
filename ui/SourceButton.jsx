import { ChevronRight } from 'lucide-react';
import { cn } from './cn';
import { useTheme } from './ThemeContext';

/**
 * Source list item button.
 * Displays a source name with story count and chevron icon.
 *
 * src  — { id, label, count }
 * onClick — called when clicked
 */
export default function SourceButton({ src, onClick }) {
  const { tc } = useTheme();

  return (
    <button
      data-testid="source-button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all',
        tc({
          light: 'text-amber-900 hover:bg-amber-100',
          dark: 'text-amber-100 hover:bg-slate-800',
          hcLight: 'text-gray-900 hover:bg-gray-100',
          hcDark: 'text-white hover:bg-white/10',
        })
      )}
    >
      <span className="font-serif text-base">{src.label}</span>
      <span className={cn(
        'text-xs tabular-nums',
        tc({
          light: 'text-amber-700',
          dark: 'text-amber-400',
          hcLight: 'text-gray-600',
          hcDark: 'text-white/60',
        })
      )}>
        {src.count}
      </span>
      <ChevronRight size={16} />
    </button>
  );
}
