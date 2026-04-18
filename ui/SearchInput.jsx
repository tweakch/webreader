import { forwardRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from './cn';
import { useTheme } from './ThemeContext';

/**
 * Themed search input with leading search icon.
 * className is applied to the wrapper div (which owns flex-1 and text colour).
 * Forwarded refs point at the underlying <input>.
 */
const SearchInput = forwardRef(function SearchInput(
  { value, onChange, placeholder, className = '', ...props },
  ref,
) {
  const { tc } = useTheme();
  return (
    <div className={cn(
      'relative flex-1',
      tc({
        light:   'text-amber-900',
        dark:    'text-amber-200',
        hcLight: 'text-gray-900',
        hcDark:  'text-white',
      }),
      className
    )}>
      <Search size={18} className="absolute left-3 top-2.5" />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          'w-full pl-10 pr-4 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500',
          tc({
            light:   'bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-600',
            dark:    'bg-slate-800 border-amber-700/50 text-amber-200 placeholder-amber-600',
            hcLight: 'bg-white border-black/30 text-gray-900 placeholder-gray-400',
            hcDark:  'bg-black border-white/40 text-white placeholder-white/30',
          })
        )}
        {...props}
      />
    </div>
  );
});

export default SearchInput;
