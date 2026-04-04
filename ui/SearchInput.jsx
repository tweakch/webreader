import { Search } from 'lucide-react';
import { useTheme } from './ThemeContext';

/**
 * Themed search input with leading search icon.
 * Wrap with ThemeContext.Provider to theme it.
 */
export default function SearchInput({ value, onChange, placeholder, className = '', ...props }) {
  const { dark, hc } = useTheme();
  return (
    <div className={`relative flex-1 ${
      hc && dark ? 'text-white' :
      hc         ? 'text-gray-900' :
      dark       ? 'text-amber-200' :
                   'text-amber-900'
    } ${className}`}>
      <Search size={18} className="absolute left-3 top-2.5" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm transition-colors ${
          hc && dark ? 'bg-black border-white/40 text-white placeholder-white/30' :
          hc         ? 'bg-white border-black/30 text-gray-900 placeholder-gray-400' :
          dark       ? 'bg-slate-800 border-amber-700/50 text-amber-200 placeholder-amber-600' :
                       'bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-600'
        } focus:outline-none focus:ring-2 focus:ring-amber-500`}
        {...props}
      />
    </div>
  );
}
