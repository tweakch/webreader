import { useTheme } from '../ui/ThemeContext';

/**
 * E-ink flash overlay - absolute-positioned div that flashes white on page turn.
 * Only rendered when eink-flash flag is on.
 *
 * isFlashing - whether currently in flash state
 */
export default function EInkFlashOverlay({ isFlashing }) {
  const { dark, hc } = useTheme();

  const bgColor = hc ? (dark ? 'bg-black' : 'bg-white') : (dark ? 'bg-slate-800' : 'bg-white');

  return (
    <div
      className={`absolute inset-0 z-20 pointer-events-none ${bgColor}`}
      style={{
        opacity: isFlashing ? 1 : 0,
        transition: isFlashing ? 'none' : 'opacity 0.05s',
      }}
    />
  );
}
