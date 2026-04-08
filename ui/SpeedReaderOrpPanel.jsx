import { cn } from './cn';
import { useTheme } from './ThemeContext';

// ── helpers ──────────────────────────────────────────────────────────────────

function getOrpIndex(word, config) {
  if (word.length <= 1) return 0;
  switch (config.orp_method) {
    case 'center':      return Math.floor((word.length - 1) / 2);
    case 'fixed_index': return Math.min(config.orp_letter_index, word.length - 1);
    default:            return 1; // second_letter
  }
}

/** Colored swatch that opens the native color picker on click. */
function ColorSwatch({ value, onChange, testId }) {
  return (
    <label className="relative cursor-pointer flex-shrink-0" title={value}>
      <span
        className="block w-6 h-6 rounded border border-black/10"
        style={{ backgroundColor: value }}
      />
      <input
        data-testid={testId}
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
    </label>
  );
}

/** Row of small option buttons (same style as TypographyPanel). */
function BtnRow({ options, active, onSelect, tc }) {
  return (
    <div className="flex gap-1">
      {options.map(({ value, label, testId }) => (
        <button
          key={value}
          data-testid={testId}
          onClick={() => onSelect(value)}
          className={cn(
            'px-2 h-7 text-xs rounded-lg transition-colors',
            active === value
              ? tc({ light: 'bg-amber-200 text-amber-900', dark: 'bg-amber-700 text-white', hcLight: 'bg-black text-white', hcDark: 'bg-white text-black' })
              : tc({ light: 'text-amber-700 hover:bg-amber-100', dark: 'text-amber-400 hover:bg-slate-800', hcLight: 'text-gray-500 hover:bg-gray-100', hcDark: 'text-white/60 hover:bg-white/10' })
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Small toggle switch used inline in rows. */
function InlineToggle({ checked, onChange, testId, tc }) {
  return (
    <button
      data-testid={testId}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors',
        checked
          ? tc({ light: 'bg-amber-500', dark: 'bg-amber-500', hcLight: 'bg-black', hcDark: 'bg-white' })
          : tc({ light: 'bg-amber-200', dark: 'bg-slate-600', hcLight: 'bg-gray-300', hcDark: 'bg-white/30' })
      )}
    >
      <span className={cn(
        'inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform',
        checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
      )} />
    </button>
  );
}

/** Range slider row. */
function SliderRow({ label, value, min, max, step, onChange, testId, tc }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn('text-xs tabular-nums w-8 text-right flex-shrink-0',
        tc({ light: 'text-amber-700', dark: 'text-amber-400', hcLight: 'text-gray-600', hcDark: 'text-white/70' })
      )}>{value}</span>
      <input
        data-testid={testId}
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-amber-500 h-1"
      />
      <span className={cn('text-xs flex-shrink-0',
        tc({ light: 'text-amber-500', dark: 'text-amber-600', hcLight: 'text-gray-400', hcDark: 'text-white/40' })
      )}>{label}</span>
    </div>
  );
}

// ── Section divider ───────────────────────────────────────────────────────────

function SectionLabel({ children, tc }) {
  return (
    <div className={cn('text-xs font-semibold uppercase tracking-wider pt-1 pb-0.5',
      tc({ light: 'text-amber-600', dark: 'text-amber-500', hcLight: 'text-gray-500', hcDark: 'text-white/50' })
    )}>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * ORP configuration panel for the speed reader.
 *
 * Fully controlled - no internal state. All settings live in grimm-reader.jsx
 * (orpConfig / setOrpConfig). Changes arrive via onChange(partialPatch).
 *
 * Props:
 *   config       - current ORP config object
 *   onChange(p)  - called with partial patch; caller merges: prev => ({ ...prev, ...p })
 *   previewWord  - the word currently shown in the RSVP view (live preview)
 */
export default function SpeedReaderOrpPanel({ config, onChange, previewWord }) {
  const { tc } = useTheme();

  const patchBar    = patch => onChange({ horizontal_bar:  { ...config.horizontal_bar,  ...patch } });
  const patchMarker = patch => onChange({ vertical_marker: { ...config.vertical_marker, ...patch } });
  const patchFp     = patch => onChange({ fixation_point:  { ...config.fixation_point,  ...patch } });

  // ── live ORP preview ──────────────────────────────────────────────────────
  const word   = previewWord || 'Märchen';
  const fp     = config.fixation_point;
  const orpIdx = getOrpIndex(word, config);
  const before = word.slice(0, orpIdx);
  const letter = word.slice(orpIdx, orpIdx + 1);
  const after  = word.slice(orpIdx + 1);

  return (
    <div className={cn(
      'w-full flex-shrink-0 border-t px-4 pt-3 pb-4 overflow-y-auto transition-colors',
      tc({
        light:   'bg-white/95 border-amber-200/50',
        dark:    'bg-slate-900/95 border-amber-700/30',
        hcLight: 'bg-white border-black/30',
        hcDark:  'bg-black border-white/40',
      })
    )} style={{ maxHeight: '44vh' }}>

      {/* ── Live preview ───────────────────────────────────────────────────── */}
      <div
        data-testid="orp-preview"
        className={cn(
          'relative w-full rounded-xl mb-3 overflow-hidden',
          tc({ light: 'bg-amber-50', dark: 'bg-slate-800', hcLight: 'bg-gray-100', hcDark: 'bg-white/10' })
        )}
        style={{ height: '56px' }}
      >
        {/* Guide bars */}
        {config.show_horizontal_bars && (
          <>
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              top: `calc(${fp.y}% - ${config.horizontal_bar.thickness + 12}px)`,
              width: Math.min(config.horizontal_bar.length, 260) + 'px',
              height: config.horizontal_bar.thickness + 'px',
              backgroundColor: config.horizontal_bar.color,
              borderRadius: '9999px', pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              top: `calc(${fp.y}% + 12px)`,
              width: Math.min(config.horizontal_bar.length, 260) + 'px',
              height: config.horizontal_bar.thickness + 'px',
              backgroundColor: config.horizontal_bar.color,
              borderRadius: '9999px', pointerEvents: 'none',
            }} />
          </>
        )}
        {/* Vertical marker */}
        {config.show_vertical_marker && (
          <div style={{
            position: 'absolute',
            left: `${fp.x}%`,
            top: `calc(${fp.y}% - ${config.vertical_marker.height / 2}px)`,
            transform: 'translateX(-50%)',
            width: config.vertical_marker.width + 'px',
            height: config.vertical_marker.height + 'px',
            backgroundColor: config.vertical_marker.color,
            borderRadius: '1px', pointerEvents: 'none',
          }} />
        )}
        {/* ORP word */}
        <div
          style={{ fontFamily: "'Roboto Mono', 'Courier New', monospace" }}
        className={cn(
            'absolute inset-0 flex items-center text-2xl font-bold tracking-wide select-none',
            tc({ light: 'text-amber-900', dark: 'text-amber-200', hcLight: 'text-gray-900', hcDark: 'text-white' })
          )}
          style={{ display: 'grid', gridTemplateColumns: `${fp.x}% auto 1fr`, alignItems: 'center' }}
        >
          <span style={{ textAlign: 'right', overflow: 'visible', whiteSpace: 'nowrap' }}>{before}</span>
          <span style={config.highlight_orp ? { color: config.orp_color, fontWeight: config.orp_font_weight } : {}}>
            {letter}
          </span>
          <span style={{ overflow: 'visible', whiteSpace: 'nowrap' }}>{after}</span>
        </div>
      </div>

      {/* ── ORP method ─────────────────────────────────────────────────────── */}
      <SectionLabel tc={tc}>ORP-Methode</SectionLabel>
      <div className="flex items-center gap-2 py-1">
        <BtnRow
          options={[
            { value: 'second_letter', label: '2. Buchstabe', testId: 'orp-method-second-letter' },
            { value: 'center',        label: 'Mitte',        testId: 'orp-method-center' },
            { value: 'fixed_index',   label: 'Fester Index', testId: 'orp-method-fixed-index' },
          ]}
          active={config.orp_method}
          onSelect={v => onChange({ orp_method: v })}
          tc={tc}
        />
        {config.orp_method === 'fixed_index' && (
          <input
            data-testid="orp-letter-index-input"
            type="number"
            min={0} max={9}
            value={config.orp_letter_index}
            onChange={e => onChange({ orp_letter_index: Math.max(0, Math.min(9, parseInt(e.target.value) || 0)) })}
            className={cn(
              'w-12 h-7 text-xs text-center rounded-lg border transition-colors',
              tc({ light: 'bg-white border-amber-200 text-amber-900', dark: 'bg-slate-800 border-amber-700/40 text-amber-200', hcLight: 'bg-white border-gray-400 text-gray-900', hcDark: 'bg-black border-white/40 text-white' })
            )}
          />
        )}
      </div>

      {/* ── Hervorhebung ───────────────────────────────────────────────────── */}
      <SectionLabel tc={tc}>Hervorhebung</SectionLabel>
      <div className="flex items-center gap-3 py-1">
        <InlineToggle
          testId="orp-highlight-toggle"
          checked={config.highlight_orp}
          onChange={v => onChange({ highlight_orp: v })}
          tc={tc}
        />
        <span className={cn('text-xs',
          tc({ light: 'text-amber-600', dark: 'text-amber-500', hcLight: 'text-gray-500', hcDark: 'text-white/50' })
        )}>Farbe</span>
        <ColorSwatch
          testId="orp-color-input"
          value={config.orp_color}
          onChange={v => onChange({ orp_color: v })}
        />
        <BtnRow
          options={[
            { value: '400', label: 'Normal', testId: 'orp-weight-normal' },
            { value: '700', label: 'Fett',   testId: 'orp-weight-bold' },
          ]}
          active={config.orp_font_weight}
          onSelect={v => onChange({ orp_font_weight: v })}
          tc={tc}
        />
      </div>

      {/* ── Führungslinien ─────────────────────────────────────────────────── */}
      <SectionLabel tc={tc}>Führungslinien</SectionLabel>
      <div className="flex items-center gap-3 py-1 flex-wrap">
        <InlineToggle
          testId="orp-bars-toggle"
          checked={config.show_horizontal_bars}
          onChange={v => onChange({ show_horizontal_bars: v })}
          tc={tc}
        />
        <ColorSwatch
          testId="orp-bars-color-input"
          value={config.horizontal_bar.color}
          onChange={v => patchBar({ color: v })}
        />
        <BtnRow
          options={[1, 2, 3].map(n => ({ value: n, label: `${n}px`, testId: `orp-bar-thickness-${n}` }))}
          active={config.horizontal_bar.thickness}
          onSelect={v => patchBar({ thickness: v })}
          tc={tc}
        />
      </div>
      <div className="py-1">
        <SliderRow
          testId="orp-bar-length"
          label="Länge"
          value={config.horizontal_bar.length}
          min={60} max={480} step={10}
          onChange={v => patchBar({ length: v })}
          tc={tc}
        />
      </div>

      {/* ── Vertikale Markierung ────────────────────────────────────────────── */}
      <SectionLabel tc={tc}>Vertikale Markierung</SectionLabel>
      <div className="flex items-center gap-3 py-1 flex-wrap">
        <InlineToggle
          testId="orp-marker-toggle"
          checked={config.show_vertical_marker}
          onChange={v => onChange({ show_vertical_marker: v })}
          tc={tc}
        />
        <ColorSwatch
          testId="orp-marker-color-input"
          value={config.vertical_marker.color}
          onChange={v => patchMarker({ color: v })}
        />
        <BtnRow
          options={[1, 2, 3, 4].map(n => ({ value: n, label: `${n}px`, testId: `orp-marker-width-${n}` }))}
          active={config.vertical_marker.width}
          onSelect={v => patchMarker({ width: v })}
          tc={tc}
        />
      </div>
      <div className="py-1">
        <SliderRow
          testId="orp-marker-height"
          label="Höhe"
          value={config.vertical_marker.height}
          min={8} max={48} step={2}
          onChange={v => patchMarker({ height: v })}
          tc={tc}
        />
      </div>

      {/* ── Fixationspunkt ─────────────────────────────────────────────────── */}
      <SectionLabel tc={tc}>Fixationspunkt</SectionLabel>
      <div className="py-1 space-y-1">
        <SliderRow
          testId="orp-fixation-x"
          label="Horizontal"
          value={config.fixation_point.x}
          min={10} max={90} step={1}
          onChange={v => patchFp({ x: v })}
          tc={tc}
        />
        <SliderRow
          testId="orp-fixation-y"
          label="Vertikal"
          value={config.fixation_point.y}
          min={10} max={90} step={1}
          onChange={v => patchFp({ y: v })}
          tc={tc}
        />
      </div>

    </div>
  );
}
