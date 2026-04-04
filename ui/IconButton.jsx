import { useTheme } from './ThemeContext';

/**
 * Themed icon button — standard amber palette + hover bg.
 * Covers the common header/toolbar case. For non-standard colors (audio,
 * nav arrows, favorites) pass overrides via className.
 *
 * Wraps with ThemeContext.Provider to theme it.
 */
export default function IconButton({ children, className = '', ...props }) {
  const { dark, hc } = useTheme();
  return (
    <button
      className={`p-2 rounded-lg transition-colors ${
        hc && dark ? 'text-white hover:bg-white/10' :
        hc         ? 'text-gray-900 hover:bg-gray-100' :
        dark       ? 'text-amber-200 hover:bg-slate-800' :
                     'text-amber-900 hover:bg-amber-100'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
