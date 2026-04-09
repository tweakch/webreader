import { cn } from './cn';
import { useTheme } from './ThemeContext';

export const LINE_HEIGHTS  = [1.5, 1.8, 2.2];
export const WORD_SPACINGS = ['normal', '0.06em', '0.15em'];

// Indices 0-2 are the basic fonts (preserved for backward compatibility).
// Indices 3+ are subscriber-only extended fonts, grouped by family.
export const FONT_FAMILIES = [
  // Basic (index 0-2)
  { label: 'Georgia',   css: 'Georgia, serif',                         family: 'serif' },
  { label: 'System',    css: 'system-ui, sans-serif',                  family: 'sans' },
  { label: 'Comic',     css: '"Comic Sans MS", "Comic Sans", cursive', family: 'cursive' },
  // Extended serif (index 3-5)
  { label: 'Merriweather',  css: "'Merriweather', Georgia, serif",        family: 'serif' },
  { label: 'EB Garamond',   css: "'EB Garamond', Georgia, serif",         family: 'serif' },
  { label: 'Playfair',      css: "'Playfair Display', Georgia, serif",    family: 'serif' },
  // Extended sans (index 6-10)
  { label: 'Inter',      css: "'Inter', system-ui, sans-serif",        family: 'sans' },
  { label: 'Roboto',     css: "'Roboto', system-ui, sans-serif",       family: 'sans' },
  { label: 'Open Sans',  css: "'Open Sans', system-ui, sans-serif",    family: 'sans' },
  { label: 'Lato',       css: "'Lato', system-ui, sans-serif",         family: 'sans' },
  { label: 'Poppins',    css: "'Poppins', system-ui, sans-serif",      family: 'sans' },
  // Extended cursive (index 11-12)
  { label: 'Lexend',    css: "'Lexend', sans-serif",                   family: 'cursive' },
  { label: 'Atkinson',  css: "'Atkinson Hyperlegible', sans-serif",    family: 'cursive' },
  // Mono (index 13-15, only shown with subscriber-fonts)
  { label: 'JetBrains',   css: "'JetBrains Mono', monospace",          family: 'mono' },
  { label: 'Source Code', css: "'Source Code Pro', monospace",         family: 'mono' },
  { label: 'IBM Plex',    css: "'IBM Plex Mono', monospace",           family: 'mono' },
];

const FAMILY_GROUPS = [
  { key: 'serif',   label: 'Serif' },
  { key: 'sans',    label: 'Sans' },
  { key: 'cursive', label: 'Kursiv' },
  { key: 'mono',    label: 'Mono' },
];

/**
 * Typography settings panel - line height, text width, word spacing, font family.
 * Includes its own themed outer container (border-t, bg, padding).
 * Uses ThemeContext - must be inside ThemeContext.Provider.
 *
 * @param {boolean} subscriberFonts - when true, show all font families including mono
 */
export default function TypographyPanel({
  lineHeightIdx,    onLineHeightChange,
  textWidthIdx,     onTextWidthChange,
  wordSpacingIdx,   onWordSpacingChange,
  fontFamilyIdx,    onFontFamilyChange,
  subscriberFonts = false,
  className = '',
}) {
  const { tc } = useTheme();

  const baseRows = [
    {
      label: 'Zeilenabstand',
      options: LINE_HEIGHTS.map((_, i) => ({
        i,
        icon: (
          <span className="flex flex-col items-center" style={{ gap: `${i * 2 + 1}px` }}>
            {[0, 1, 2].map(n => <span key={n} className="block h-px w-4 bg-current" />)}
          </span>
        ),
      })),
      idx: lineHeightIdx,
      set: onLineHeightChange,
    },
    {
      label: 'Textbreite',
      options: [4, 6, 8].map((w, i) => ({
        i,
        icon: (
          <span className="flex flex-col gap-px items-center">
            {[0, 1, 2].map(n => (
              <span key={n} className="block h-px bg-current" style={{ width: `${w * 4}px` }} />
            ))}
          </span>
        ),
      })),
      idx: textWidthIdx,
      set: onTextWidthChange,
    },
    {
      label: 'Wortabstand',
      options: ['aa', 'a a', 'a  a'].map((txt, i) => ({
        i,
        icon: <span className="font-serif text-sm leading-none">{txt}</span>,
      })),
      idx: wordSpacingIdx,
      set: onWordSpacingChange,
    },
  ];

  const activeBtnCls = tc({ light: 'bg-amber-200 text-amber-900', dark: 'bg-amber-700 text-white', hcLight: 'bg-black text-white', hcDark: 'bg-white text-black' });
  const inactiveBtnCls = tc({ light: 'text-amber-700 hover:bg-amber-100', dark: 'text-amber-400 hover:bg-slate-800', hcLight: 'text-gray-500 hover:bg-gray-100', hcDark: 'text-white/60 hover:bg-white/10' });
  const labelCls = cn('text-xs w-24 shrink-0', tc({ light: 'text-amber-600', dark: 'text-amber-500', hcLight: 'text-gray-500', hcDark: 'text-white/60' }));

  return (
    <div className={cn(
      'flex-shrink-0 border-t px-5 py-3 transition-colors',
      tc({
        light:   'bg-white/95 border-amber-200/50',
        dark:    'bg-slate-900/95 border-amber-700/30',
        hcLight: 'bg-white border-black/30',
        hcDark:  'bg-black border-white/40',
      }),
      className
    )}>
      {baseRows.map(({ label, options, idx, set }) => (
        <div key={label} className="flex items-center gap-3 py-1">
          <span className={labelCls}>{label}</span>
          <div className="flex gap-1.5">
            {options.map(({ i, icon }) => (
              <button
                key={i}
                onClick={() => set(i)}
                className={cn('w-10 h-8 flex items-center justify-center rounded-lg transition-colors', idx === i ? activeBtnCls : inactiveBtnCls)}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      ))}

      {subscriberFonts ? (
        <div className="flex items-center gap-3 py-1">
          <span className={labelCls}>Schriftart</span>
          <div className="flex gap-1.5">
            {FAMILY_GROUPS.map(({ key }) => {
              const fonts = FONT_FAMILIES.map((f, i) => ({ ...f, i })).filter(f => f.family === key);
              const activeFamily = FONT_FAMILIES[fontFamilyIdx]?.family;
              const isActive = activeFamily === key;
              // Show the currently selected font if this family is active, otherwise first in family
              const displayIdx = isActive ? fontFamilyIdx : fonts[0].i;
              const { css, label: fontLabel } = FONT_FAMILIES[displayIdx];
              function handleClick() {
                if (isActive) {
                  // Cycle to next font within this family
                  const pos = fonts.findIndex(f => f.i === fontFamilyIdx);
                  onFontFamilyChange(fonts[(pos + 1) % fonts.length].i);
                } else {
                  onFontFamilyChange(fonts[0].i);
                }
              }
              return (
                <button
                  key={key}
                  title={fontLabel}
                  onClick={handleClick}
                  className={cn('w-10 h-8 flex items-center justify-center rounded-lg transition-colors', isActive ? activeBtnCls : inactiveBtnCls)}
                >
                  <span style={{ fontFamily: css }} className="text-sm leading-none">Aa</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 py-1">
          <span className={labelCls}>Schriftart</span>
          <div className="flex gap-1.5">
            {FONT_FAMILIES.slice(0, 3).map(({ css }, i) => (
              <button
                key={i}
                onClick={() => onFontFamilyChange(i)}
                className={cn('w-10 h-8 flex items-center justify-center rounded-lg transition-colors', fontFamilyIdx === i ? activeBtnCls : inactiveBtnCls)}
              >
                <span style={{ fontFamily: css }} className="text-sm leading-none">Aa</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
