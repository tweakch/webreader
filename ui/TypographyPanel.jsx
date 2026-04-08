import { cn } from './cn';
import { useTheme } from './ThemeContext';

export const LINE_HEIGHTS  = [1.5, 1.8, 2.2];
export const WORD_SPACINGS = ['normal', '0.06em', '0.15em'];
export const FONT_FAMILIES = [
  { label: 'Serif',      css: 'Georgia, serif' },
  { label: 'Sans',       css: 'system-ui, sans-serif' },
  { label: 'Comic Sans', css: '"Comic Sans MS", "Comic Sans", cursive' },
];

/**
 * Typography settings panel - line height, text width, word spacing, font family.
 * Includes its own themed outer container (border-t, bg, padding).
 * Uses ThemeContext - must be inside ThemeContext.Provider.
 */
export default function TypographyPanel({
  lineHeightIdx,    onLineHeightChange,
  textWidthIdx,     onTextWidthChange,
  wordSpacingIdx,   onWordSpacingChange,
  fontFamilyIdx,    onFontFamilyChange,
  className = '',
}) {
  const { tc } = useTheme();

  const rows = [
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
    {
      label: 'Schriftart',
      options: FONT_FAMILIES.map(({ css }, i) => ({
        i,
        icon: <span style={{ fontFamily: css }} className="text-sm leading-none">Aa</span>,
      })),
      idx: fontFamilyIdx,
      set: onFontFamilyChange,
    },
  ];

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
      {rows.map(({ label, options, idx, set }) => (
        <div key={label} className="flex items-center gap-3 py-1">
          <span className={cn(
            'text-xs w-24 shrink-0',
            tc({ light: 'text-amber-600', dark: 'text-amber-500', hcLight: 'text-gray-500', hcDark: 'text-white/60' })
          )}>
            {label}
          </span>
          <div className="flex gap-1.5">
            {options.map(({ i, icon }) => (
              <button
                key={i}
                onClick={() => set(i)}
                className={cn(
                  'w-10 h-8 flex items-center justify-center rounded-lg transition-colors',
                  idx === i
                    ? tc({ light: 'bg-amber-200 text-amber-900', dark: 'bg-amber-700 text-white', hcLight: 'bg-black text-white', hcDark: 'bg-white text-black' })
                    : tc({ light: 'text-amber-700 hover:bg-amber-100', dark: 'text-amber-400 hover:bg-slate-800', hcLight: 'text-gray-500 hover:bg-gray-100', hcDark: 'text-white/60 hover:bg-white/10' })
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
