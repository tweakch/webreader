import React, { useState, useEffect, createContext, useContext } from 'react';
import ErrorPage, { ERROR_TYPES } from '../components/ErrorPage';
import {
  ChevronLeft, ChevronRight, Heart, Menu, Plus, Minus,
  Play, Pause, RotateCcw, X, User, ClockFading,
} from 'lucide-react';
import { FEATURES } from '../features.jsx';
import flagConfig from '../flags.json';
import Toggle from '../ui/Toggle.jsx';
import { ThemeContext } from '../ui/ThemeContext.jsx';
import StoryButton from '../ui/StoryButton.jsx';
import TypographyPanel from '../ui/TypographyPanel.jsx';
import IconButton from '../ui/IconButton.jsx';
import SearchInput from '../ui/SearchInput.jsx';

// ─── Theme helpers (mirrors grimm-reader logic exactly) ───────────────────────

const THEMES_NORMAL = [
  { id: 'light',  label: 'Hell' },
  { id: 'dark',   label: 'Dunkel' },
  // { id: 'system', label: 'System' },
];

const THEMES_HC = [
  { id: 'light-hc', label: 'Hell HC' },
  { id: 'dark-hc',  label: 'Dunkel HC' },
];

/** Returns { dark, hc } booleans for a given themeId */
const tc = (themeId) => {
  const hc   = themeId === 'light-hc' || themeId === 'dark-hc';
  const dark = themeId === 'dark' || themeId === 'dark-hc';
  return { dark, hc };
};

const ThemesCtx = createContext(THEMES_NORMAL);

// ─── Initial flag state ───────────────────────────────────────────────────────

/**
 * Converts flagConfig into a flat state object:
 *   boolean flags  → true / false
 *   string flags   → their defaultVariant string
 */
const buildInitialFlags = () =>
  Object.fromEntries(
    Object.entries(flagConfig).map(([key, cfg]) => [
      key,
      ('on' in cfg.variants && 'off' in cfg.variants)
        ? cfg.defaultVariant === 'on'
        : cfg.defaultVariant,
    ])
  );

// ─── ThemeRow ─────────────────────────────────────────────────────────────────

/**
 * Renders children in all active themes side by side.
 * children receives ({ dark, hc }, themeId) and returns JSX.
 */
function ThemeRow({ children, noPad = false }) {
  const themes = useContext(ThemesCtx);
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${themes.length}, minmax(0, 1fr))` }}>
      {themes.map(({ id, label }) => {
        const { dark, hc } = tc(id);
        return (
          <div key={id} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {/* Frame chrome */}
            <div className="px-3 py-1.5 bg-white border-b border-gray-100 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                hc && dark ? 'bg-white ring-1 ring-zinc-400'
                : hc       ? 'bg-zinc-800 ring-1 ring-zinc-300'
                : dark     ? 'bg-slate-500'
                :            'bg-amber-300'
              }`} />
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">{label}</span>
            </div>
            {/* Themed background */}
            <div className={`${noPad ? '' : 'p-4'} ${
              hc && dark ? 'bg-black' :
              hc         ? 'bg-white' :
              dark       ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950' :
                           'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50'
            }`}>
              <ThemeContext.Provider value={{ dark, hc }}>
                {children({ dark, hc }, id)}
              </ThemeContext.Provider>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Layout primitives ────────────────────────────────────────────────────────

function Section({ id, title, description, flagKeys = [], children }) {
  return (
    <section id={id} className="pb-12 scroll-mt-4">
      <div className="mb-4 pb-3 border-b border-gray-100 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
        {flagKeys.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5 flex-shrink-0">
            {flagKeys.map(k => (
              <code key={k} className="text-[10px] bg-violet-50 text-violet-600 border border-violet-100 px-1.5 py-0.5 rounded font-mono">
                {k}
              </code>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Item({ label, description, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        {label && <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{label}</span>}
        {description && <span className="text-[11px] text-gray-400">{description}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── 1. Colors ────────────────────────────────────────────────────────────────

function ColorsSection() {
  const amber = [
    ['bg-amber-50',  '50'],  ['bg-amber-100', '100'], ['bg-amber-200', '200'],
    ['bg-amber-300', '300'], ['bg-amber-400', '400'], ['bg-amber-500', '500'],
    ['bg-amber-600', '600'], ['bg-amber-700', '700'], ['bg-amber-800', '800'],
    ['bg-amber-900', '900'], ['bg-amber-950', '950'],
  ];
  const slate = [
    ['bg-slate-700', '700'], ['bg-slate-800', '800'],
    ['bg-slate-900', '900'], ['bg-slate-950', '950'],
  ];

  return (
    <Section id="farben" title="Farben" description="Vollständige Farbpalette der App">
      <Item label="Amber - Markenfarbe">
        <div className="flex gap-2 flex-wrap">
          {amber.map(([cls, lbl]) => (
            <div key={lbl} className="flex flex-col items-center gap-1">
              <div className={`${cls} w-9 h-9 rounded-lg border border-black/5 shadow-sm`} />
              <span className="text-[10px] font-mono text-gray-400">{lbl}</span>
            </div>
          ))}
        </div>
      </Item>
      <Item label="Slate - Dunkelmodus">
        <div className="flex gap-2">
          {slate.map(([cls, lbl]) => (
            <div key={lbl} className="flex flex-col items-center gap-1">
              <div className={`${cls} w-9 h-9 rounded-lg shadow-sm`} />
              <span className="text-[10px] font-mono text-gray-400">{lbl}</span>
            </div>
          ))}
        </div>
      </Item>
      <Item label="Hochkontrast">
        <div className="flex gap-2">
          {[['bg-black', 'black', 'border border-gray-300'], ['bg-white', 'white', 'border border-gray-200']].map(([cls, lbl, extra]) => (
            <div key={lbl} className="flex flex-col items-center gap-1">
              <div className={`${cls} ${extra} w-9 h-9 rounded-lg shadow-sm`} />
              <span className="text-[10px] font-mono text-gray-400">{lbl}</span>
            </div>
          ))}
        </div>
      </Item>
    </Section>
  );
}

// ─── 2. Typography ────────────────────────────────────────────────────────────

function TypographySection() {
  return (
    <Section id="typografie" title="Typografie" description="Schriftgrade, Familien und Verwendungszwecke">
      <ThemeRow>
        {({ dark, hc }) => (
          <div className="space-y-4 py-1">
            <div>
              <p className="text-[10px] font-mono text-gray-400 mb-1">text-4xl · font-serif · bold</p>
              <h1 className={`text-4xl font-bold font-serif leading-tight ${
                hc && dark ? 'text-white' : hc ? 'text-gray-900' : dark ? 'text-amber-200' : 'text-amber-900'
              }`}>Hänsel und Gretel</h1>
            </div>
            <div>
              <p className="text-[10px] font-mono text-gray-400 mb-1">text-[18px] · font-serif · leading-relaxed</p>
              <p className={`text-[18px] font-serif leading-relaxed ${
                hc && dark ? 'text-white' : hc ? 'text-gray-900' : dark ? 'text-amber-50' : 'text-amber-950'
              }`}>Es war einmal in einem großen Walde ein armes Holzhackersmädchen, da wohnten ein Mann und seine zwei Kinder.</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-gray-400 mb-1">text-sm · font-medium</p>
              <p className={`text-sm font-medium ${
                hc && dark ? 'text-white' : hc ? 'text-gray-900' : dark ? 'text-amber-200' : 'text-amber-900'
              }`}>Märchenschatz</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-gray-400 mb-1">text-xs · secondary</p>
              <p className={`text-xs ${
                hc && dark ? 'text-white/70' : hc ? 'text-gray-600' : dark ? 'text-amber-400' : 'text-amber-700'
              }`}>2.341 Wörter · ~12 min</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-gray-400 mb-1">text-sm · italic · Quellenangabe</p>
              <p className={`text-sm italic ${
                hc && dark ? 'text-white/70' : hc ? 'text-gray-600' : dark ? 'text-amber-600' : 'text-amber-700'
              }`}>- Jacob und Wilhelm Grimm</p>
            </div>
          </div>
        )}
      </ThemeRow>
    </Section>
  );
}

// ─── 3. Buttons ───────────────────────────────────────────────────────────────

function ButtonsSection({ flags }) {
  const showFontControls  = flags['font-size-controls'];
  const showHighContrast  = flags['high-contrast-theme'];

  return (
    <Section id="schaltflaechen" title="Schaltflächen"
      flagKeys={['font-size-controls', 'high-contrast-theme']}>

      <Item label="Primär - Themen-Toggle" description="zeigt nächste Aktion als Emoji">
        <ThemeRow>
          {({ dark, hc }) => (
            <div className="flex gap-2 flex-wrap">
              {(showHighContrast ? ['light-hc', 'dark-hc'] : ['light', 'dark', 'system']).map(t => {
                const emoji = t === 'light' ? '🌙' : t === 'dark' ? '🖥️' : t === 'system' ? '☀️' : t === 'light-hc' ? '🌙' : '☀️';
                return (
                  <button key={t} className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    hc && dark ? 'bg-white text-black hover:bg-gray-100' :
                    hc         ? 'bg-black text-white hover:bg-gray-900' :
                    dark       ? 'bg-amber-200 text-slate-900 hover:bg-amber-300' :
                                 'bg-amber-900 text-white hover:bg-amber-800'
                  }`}>
                    {emoji}
                  </button>
                );
              })}
            </div>
          )}
        </ThemeRow>
      </Item>

      <Item label="Icon-Buttons - Kopfzeile" description="Schriftgröße + Hamburger">
        <ThemeRow>
          {({ dark, hc }) => (
            <div className="flex items-center gap-1">
              {showFontControls && <>
                <IconButton><Minus size={18} /></IconButton>
                <span className={`text-sm font-medium w-10 text-center ${
                  hc && dark ? 'text-white' : hc ? 'text-gray-900' : dark ? 'text-amber-200' : 'text-amber-900'
                }`}>18</span>
                <IconButton><Plus size={18} /></IconButton>
              </>}
              <IconButton><Menu size={24} /></IconButton>
            </div>
          )}
        </ThemeRow>
      </Item>

      <Item label="Navigations-Buttons" description="Blättern, deaktivierter Zustand">
        <ThemeRow>
          {({ dark, hc }) => (
            <div className="flex gap-2">
              <button disabled className={`p-1 rounded disabled:opacity-30 ${
                hc && dark ? 'text-white' : hc ? 'text-gray-900' : dark ? 'text-amber-300' : 'text-amber-800'
              }`}><ChevronLeft size={20} /></button>
              <button className={`p-1 rounded ${
                hc && dark ? 'text-white hover:bg-white/10' : hc ? 'text-gray-900 hover:bg-gray-100' : dark ? 'text-amber-300 hover:bg-slate-700' : 'text-amber-800 hover:bg-amber-100'
              }`}><ChevronRight size={20} /></button>
            </div>
          )}
        </ThemeRow>
      </Item>

      <Item label="Feature-Schalter" description="Ein / Aus">
        <ThemeRow>
          {({ dark, hc }) => (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <Toggle checked={true} />
                <span className={`text-[10px] ${hc && dark ? 'text-white/50' : hc ? 'text-gray-500' : dark ? 'text-amber-600' : 'text-amber-500'}`}>Ein</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Toggle checked={false} />
                <span className={`text-[10px] ${hc && dark ? 'text-white/50' : hc ? 'text-gray-500' : dark ? 'text-amber-600' : 'text-amber-500'}`}>Aus</span>
              </div>
            </div>
          )}
        </ThemeRow>
      </Item>

      <Item label="Pillen" description="Varianten-Wechsler">
        <ThemeRow>
          {({ dark, hc }) => (
            <div className="flex gap-2 flex-wrap">
              <button className={`px-3 py-1 rounded-full text-xs font-medium ${
                hc && dark ? 'bg-white text-black' : hc ? 'bg-black text-white' : dark ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
              }`}>Original</button>
              <button className={`px-3 py-1 rounded-full text-xs font-medium ${
                hc && dark ? 'text-white hover:bg-white/10' : hc ? 'text-gray-900 hover:bg-gray-100' : dark ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-700 hover:bg-amber-100'
              }`}>Kurzfassung</button>
              <button className={`px-3 py-1 rounded-full text-xs font-medium ${
                hc && dark ? 'text-white hover:bg-white/10' : hc ? 'text-gray-900 hover:bg-gray-100' : dark ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-700 hover:bg-amber-100'
              }`}>Kinderfassung</button>
            </div>
          )}
        </ThemeRow>
      </Item>
    </Section>
  );
}

// ─── 4. Form elements ─────────────────────────────────────────────────────────

function FormSection({ flags }) {
  const showFavOnly = flags['favorites-only-toggle'] && flags['favorites'];

  return (
    <Section id="formular" title="Formularelemente" flagKeys={['favorites-only-toggle', 'favorites']}>
      <Item label="Suchfeld + Favoriten-Filter">
        <ThemeRow>
          {({ dark, hc }) => (
            <div className="flex items-center gap-2">
              <SearchInput placeholder="Märchen suchen..." readOnly />
              {showFavOnly && (
                <button className={`flex-shrink-0 p-2 rounded-lg border ${
                  hc   ? 'border-white/40 text-white' :
                  dark ? 'border-amber-700/50 text-amber-600 hover:bg-slate-800' :
                         'border-amber-300 text-amber-400 hover:bg-amber-50'
                }`}>
                  <Heart size={16} fill="none" />
                </button>
              )}
            </div>
          )}
        </ThemeRow>
      </Item>
    </Section>
  );
}

// ─── 5. Header ────────────────────────────────────────────────────────────────

function HeaderSection({ flags }) {
  const showFontControls = flags['font-size-controls'];
  const showHighContrast = flags['high-contrast-theme'];

  return (
    <Section id="kopfzeile" title="Kopfzeile"
      description="Titelleiste mit Hamburger, Schriftgröße und Themenknopf"
      flagKeys={['font-size-controls', 'high-contrast-theme']}>
      <ThemeRow noPad>
        {({ dark, hc }) => (
          <div className={`h-16 px-4 flex items-center justify-between border-b ${
            hc && dark ? 'border-white/40' : hc ? 'border-black/20' : dark ? 'border-amber-700/30' : 'border-amber-200/50'
          }`}>
            <div className="flex items-center gap-3">
              <IconButton><Menu size={24} /></IconButton>
              <h1 className={`text-2xl font-serif font-bold tracking-wide ${
                hc && dark ? 'text-white' : hc ? 'text-gray-900' : dark ? 'text-amber-200' : 'text-amber-900'
              }`}>Märchenschatz</h1>
            </div>
            <div className="flex items-center gap-2">
              {showFontControls && (
                <>
                  <IconButton><Minus size={18} /></IconButton>
                  <span className={`text-sm font-medium w-10 text-center ${
                    hc && dark ? 'text-white' : hc ? 'text-gray-900' : dark ? 'text-amber-200' : 'text-amber-900'
                  }`}>18</span>
                  <IconButton><Plus size={18} /></IconButton>
                </>
              )}
              <button className={`px-4 py-2 rounded-lg font-medium text-sm ${
                hc && dark ? 'bg-white text-black hover:bg-gray-100' :
                hc         ? 'bg-black text-white hover:bg-gray-900' :
                dark       ? 'bg-amber-200 text-slate-900 hover:bg-amber-300' :
                             'bg-amber-900 text-white hover:bg-amber-800'
              }`}>
                {hc ? (dark ? '☀️' : '🌙') : '🌙'}
              </button>
            </div>
          </div>
        )}
      </ThemeRow>
      {/* Header during reading - with story-specific controls */}
      <Item label="Beim Lesen - Seiten-Kontext">
        <ThemeRow noPad>
          {({ dark, hc }) => (
            <div className={`h-16 px-4 flex items-center justify-between border-b ${
              hc && dark ? 'border-white/40' : hc ? 'border-black/20' : dark ? 'border-amber-700/30' : 'border-amber-200/50'
            }`}>
              <div className="flex items-center gap-3">
                <IconButton><Menu size={24} /></IconButton>
              </div>
              {showFontControls && (
                <div className="flex items-center gap-2">
                  <IconButton><Minus size={18} /></IconButton>
                  <span className={`text-sm font-medium w-10 text-center ${
                    hc && dark ? 'text-white' : hc ? 'text-gray-900' : dark ? 'text-amber-200' : 'text-amber-900'
                  }`}>18</span>
                  <IconButton><Plus size={18} /></IconButton>
                </div>
              )}
              <button className={`px-4 py-2 rounded-lg font-medium text-sm ${
                hc && dark ? 'bg-white text-black' : hc ? 'bg-black text-white' :
                dark ? 'bg-amber-200 text-slate-900' :
                       'bg-amber-900 text-white'
              }`}>🌙</button>
            </div>
          )}
        </ThemeRow>
      </Item>
    </Section>
  );
}

// ─── 6. Nav bar ───────────────────────────────────────────────────────────────

function NavBarSection({ flags }) {
  const showTypo = flags['typography-panel'];

  return (
    <Section id="navigationsleiste" title="Navigationsleiste"
      description="Untere Steuerleiste mit Blättern, Seitenzähler und Typografie"
      flagKeys={['typography-panel']}>

      <Item label="Standard">
        <ThemeRow noPad>
          {({ dark, hc }) => (
            <div className={`h-12 flex items-center justify-between px-6 border-t ${
              hc && dark ? 'bg-black border-white/40 text-white' : hc ? 'bg-white border-black/30 text-gray-900' :
              dark ? 'bg-slate-900/90 border-amber-700/30 text-amber-300' :
                     'bg-white/90 border-amber-200/50 text-amber-800'
            }`}>
              <button disabled className="p-1 rounded opacity-30"><ChevronLeft size={20} /></button>
              <button className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg ${
                hc ? 'hover:bg-white/10' : dark ? 'hover:bg-slate-800' : 'hover:bg-amber-50'
              }`}>
                <span className={`text-xs font-serif truncate max-w-[120px] ${
                  hc && dark ? 'text-white/60' : hc ? 'text-gray-500' : dark ? 'text-amber-500' : 'text-amber-600'
                }`}>Hänsel und Gretel</span>
                <span className="text-xs font-medium tabular-nums">3 / 12</span>
              </button>
              <button className="p-1 rounded"><ChevronRight size={20} /></button>
            </div>
          )}
        </ThemeRow>
      </Item>

      {showTypo && (
        <Item label="Typografie-Panel (ausgeklappt)">
          <ThemeRow noPad>
            {() => (
              <TypographyPanel
                lineHeightIdx={1}   onLineHeightChange={() => {}}
                textWidthIdx={1}    onTextWidthChange={() => {}}
                wordSpacingIdx={0}  onWordSpacingChange={() => {}}
                fontFamilyIdx={0}   onFontFamilyChange={() => {}}
              />
            )}
          </ThemeRow>
        </Item>
      )}
    </Section>
  );
}

// ─── 7. Sidebar ───────────────────────────────────────────────────────────────

function SidebarSection({ flags }) {
  const showFav       = flags['favorites'];
  const showFavOnly   = flags['favorites-only-toggle'];
  const showWordCount = flags['word-count'];
  const showDuration  = flags['reading-duration'];

  const stories = [
    { title: 'Hänsel und Gretel', wc: 2341, active: true,  done: true,  fav: true  },
    { title: 'Rotkäppchen',       wc: 1087, active: false, done: false, fav: false },
    { title: 'Schneewittchen',    wc: 3204, active: false, done: true,  fav: true  },
  ];

  return (
    <Section id="seitenleiste" title="Seitenleiste"
      flagKeys={['favorites', 'favorites-only-toggle', 'word-count', 'reading-duration']}>

      <Item label="Quellen (Ebene 1)">
        <ThemeRow>
          {({ dark, hc }) => (
            <div className="space-y-1">
              {[
                { label: 'Brüder Grimm',      count: 209, active: true  },
                { label: 'Hans C. Andersen',  count: 87,  active: false },
                { label: 'Johann K. Musäus',  count: 14,  active: false },
              ].map(({ label, count, active }) => (
                <button
                  key={label}
                  data-testid="source-button"
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? hc && dark ? 'bg-white text-black' : hc ? 'bg-black text-white' :
                        dark ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
                      : hc   ? 'text-white hover:bg-white/10' :
                        dark ? 'text-amber-100 hover:bg-slate-800' : 'text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded tabular-nums ${
                    active
                      ? hc && dark ? 'bg-black/20' : hc ? 'bg-white/20' :
                        dark ? 'bg-amber-600/60 text-amber-100' : 'bg-amber-300/60 text-amber-800'
                      : hc && dark ? 'bg-white/10' : hc ? 'bg-black/10' :
                        dark ? 'bg-slate-700 text-amber-500' : 'bg-amber-100 text-amber-600'
                  }`}>{count}</span>
                </button>
              ))}
            </div>
          )}
        </ThemeRow>
      </Item>

      <Item label="Märchenliste (Ebene 2)" description="mit optionalen Metadaten-Badges">
        <ThemeRow>
          {() => (
            <div className="space-y-1">
              {stories.map(({ title, wc, active, done, fav }) => (
                <StoryButton
                  key={title}
                  story={{ title, wordCount: wc, sourceLabel: '' }}
                  isActive={active}
                  isCompleted={done}
                  isFavorite={fav}
                  showWordCount={showWordCount}
                  showFavoriteButton={showFav}
                  testId="story-button"
                />
              ))}
            </div>
          )}
        </ThemeRow>
      </Item>

      <Item label="Statistik-Block (Seitenleiste beim Lesen)">
        <ThemeRow>
          {({ dark, hc }) => (
            <div className={`mx-0 rounded-xl px-4 py-3 space-y-1.5 ${
              hc && dark ? 'bg-white/10' : hc ? 'bg-black/5' : dark ? 'bg-slate-800' : 'bg-amber-50'
            }`}>
              {[
                showWordCount  && { label: 'Wörter',   val: '2.341' },
                showDuration   && { label: 'Lesezeit',  val: '~12 min' },
              ].filter(Boolean).map(({ label, val }) => (
                <div key={label} className={`flex items-center justify-between text-sm ${
                  hc && dark ? 'text-white' : hc ? 'text-gray-700' : dark ? 'text-amber-400' : 'text-amber-700'
                }`}>
                  <span>{label}</span>
                  <span className="tabular-nums font-medium">{val}</span>
                </div>
              ))}
              {!showWordCount && !showDuration && (
                <p className={`text-xs italic ${
                  hc && dark ? 'text-white/40' : hc ? 'text-gray-400' : dark ? 'text-amber-700' : 'text-amber-400'
                }`}>word-count und reading-duration ausgeschaltet</p>
              )}
            </div>
          )}
        </ThemeRow>
      </Item>
    </Section>
  );
}

// ─── 8. Reader content ────────────────────────────────────────────────────────

function ReaderSection({ flags }) {
  const showAttribution = flags['attribution'];

  return (
    <Section id="lesebereich" title="Lesebereich"
      description="Seitenanzeige mit Titel, Fließtext und Quellenangabe"
      flagKeys={['attribution', 'big-fonts']}>
      <ThemeRow noPad>
        {({ dark, hc }) => (
          <div className={`p-8 ${
            hc && dark ? 'bg-black' : hc ? 'bg-white' : dark ? 'bg-slate-800/50' : 'bg-white/70'
          }`}>
            <h2 className={`text-3xl font-bold font-serif mb-2 ${
              hc && dark ? 'text-white' : hc ? 'text-gray-900' : dark ? 'text-amber-200' : 'text-amber-900'
            }`}>Hänsel und Gretel</h2>
            <div className={`h-1 w-16 rounded-full mb-7 ${
              hc && dark ? 'bg-white' : hc ? 'bg-black' : dark ? 'bg-amber-700' : 'bg-amber-300'
            }`} />
            <div className={`text-[17px] font-serif leading-relaxed ${
              hc && dark ? 'text-white' : hc ? 'text-gray-900' : dark ? 'text-amber-50' : 'text-amber-950'
            }`}>
              <p className="mb-5">
                Es war einmal in einem großen Walde ein armes Holzhackersmädchen, da wohnten ein Mann und seine Frau und seine zwei Kinder.
              </p>
              <p className="mb-5">
                Die Kinder hießen Hänsel und Gretel. Sie hatten wenig zu beißen und zu brechen, und einmal, als eine große Teuerung ins Land kam, konnte der Mann das tägliche Brot nicht mehr schaffen.
              </p>
            </div>
            {showAttribution && (
              <div className={`mt-6 pt-4 border-t ${
                hc ? 'border-white/40' : dark ? 'border-amber-700/30' : 'border-amber-300'
              }`}>
                <p className={`text-sm italic ${
                  hc && dark ? 'text-white/70' : hc ? 'text-gray-600' : dark ? 'text-amber-600' : 'text-amber-700'
                }`}>- Jacob und Wilhelm Grimm</p>
              </div>
            )}
          </div>
        )}
      </ThemeRow>
    </Section>
  );
}

// ─── 9. Audio player ──────────────────────────────────────────────────────────

function AudioSection({ flags }) {
  return (
    <Section id="audioplayer" title="Audio-Player"
      description="Schmale Abspielleiste über der Navigationsleiste"
      flagKeys={['audio-player']}>
      {flags['audio-player'] ? (
        <ThemeRow noPad>
          {({ dark, hc }) => (
            <div className={`border-t ${
              hc && dark ? 'bg-black border-white/40' : hc ? 'bg-white border-black/20' : dark ? 'bg-slate-900/95 border-amber-700/30' : 'bg-white/95 border-amber-200/50'
            }`}>
              {/* Progress bar */}
              <div className={`h-0.5 ${hc && dark ? 'bg-white/20' : hc ? 'bg-black/10' : dark ? 'bg-slate-700' : 'bg-amber-100'}`}>
                <div className={`h-full ${hc && dark ? 'bg-white' : hc ? 'bg-black' : dark ? 'bg-amber-500' : 'bg-amber-600'}`}
                  style={{ width: '35%' }} />
              </div>
              <div className="flex items-center gap-3 px-5 py-2">
                <button className={`p-1.5 rounded-lg ${
                  hc && dark ? 'text-white hover:bg-white/10' : hc ? 'text-gray-900 hover:bg-gray-100' : dark ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-700 hover:bg-amber-100'
                }`}><RotateCcw size={15} /></button>
                <button className={`p-1.5 rounded-lg ${
                  hc && dark ? 'text-white hover:bg-white/10' : hc ? 'text-gray-900 hover:bg-gray-100' : dark ? 'text-amber-300 hover:bg-slate-800' : 'text-amber-800 hover:bg-amber-100'
                }`}><Play size={17} /></button>
                <span className={`text-xs tabular-nums ml-1 ${
                  hc && dark ? 'text-white/60' : hc ? 'text-gray-500' : dark ? 'text-amber-600' : 'text-amber-500'
                }`}>1:23 / 4:07</span>
              </div>
            </div>
          )}
        </ThemeRow>
      ) : (
        <div className="flex items-center justify-center h-16 rounded-xl border border-dashed border-gray-200">
          <p className="text-xs text-gray-400">
            Flag <code className="font-mono bg-gray-100 px-1 rounded">audio-player</code> einschalten um die Vorschau zu sehen
          </p>
        </div>
      )}
    </Section>
  );
}

// ─── 10. Profile panel ────────────────────────────────────────────────────────

function ProfileSection({ flags }) {
  const showFav        = flags['favorites'];
  const featureForRow  = FEATURES.find(f => f.key === 'word-count');

  return (
    <Section id="profil" title="Profil-Panel"
      description="Statistiken und Feature-Toggles im Nutzerbereich"
      flagKeys={['favorites']}>

      <Item label="Statistik-Karte">
        <ThemeRow noPad>
          {({ dark, hc }) => (
            <div className={`divide-y ${
              hc ? 'divide-white/20' : dark ? 'divide-amber-700/30' : 'divide-amber-200'
            }`}>
              {[
                showFav && { label: 'Favoriten',            value: '7' },
                          { label: 'Gelesen',               value: '23' },
                          { label: 'Verfügbare Märchen',    value: '296' },
              ].filter(Boolean).map(({ label, value }) => (
                <div key={label} className={`flex items-center justify-between px-5 py-3 text-sm ${
                  hc && dark ? 'text-white' : hc ? 'text-gray-900' : dark ? 'text-amber-200' : 'text-amber-900'
                }`}>
                  <span>{label}</span>
                  <span className="font-medium tabular-nums">{value}</span>
                </div>
              ))}
            </div>
          )}
        </ThemeRow>
      </Item>

      {featureForRow && (
        <Item label="Feature-Zeile (Wörteranzahl als Beispiel)">
          <ThemeRow>
            {({ dark, hc }) => (
              <div className={`flex items-start gap-4 ${
                hc && dark ? 'text-white' : hc ? 'text-gray-900' : dark ? 'text-amber-200' : 'text-amber-900'
              }`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  hc && dark ? 'bg-white/10' : hc ? 'bg-black/10' :
                  dark ? 'bg-amber-700/40 text-amber-300' : 'bg-amber-100 text-amber-700'
                }`}>
                  <div className="w-5 h-5"><featureForRow.Icon /></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{featureForRow.label}</p>
                    <Toggle checked={true} />
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${
                    hc && dark ? 'text-white/50' : hc ? 'text-gray-500' : dark ? 'text-amber-600' : 'text-amber-500'
                  }`}>{featureForRow.description}</p>
                </div>
              </div>
            )}
          </ThemeRow>
        </Item>
      )}
    </Section>
  );
}

// ─── 11. Banners ──────────────────────────────────────────────────────────────

function BannerSection() {
  return (
    <Section id="banner" title="Banner" description="Weiterlesen-Hinweis beim App-Start">
      <ThemeRow>
        {({ dark, hc }) => (
          <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            hc && dark ? 'bg-black border-white/40 text-white' : hc ? 'bg-white border-black/30 text-gray-900' :
            dark ? 'bg-amber-900/30 border-amber-700/40 text-amber-200' :
                   'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            <span className="text-xl flex-shrink-0">📖</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Weiterlesen</p>
              <p className={`text-xs truncate mt-0.5 ${
                hc && dark ? 'text-white/60' : hc ? 'text-gray-500' : dark ? 'text-amber-500' : 'text-amber-600'
              }`}>Hänsel und Gretel · Seite 3</p>
            </div>
            <button className={`text-xs px-3 py-1.5 rounded-lg font-medium flex-shrink-0 ${
              hc && dark ? 'bg-white text-black hover:bg-gray-100' : hc ? 'bg-black text-white hover:bg-gray-900' :
              dark ? 'bg-amber-700 text-white hover:bg-amber-600' :
                     'bg-amber-200 text-amber-900 hover:bg-amber-300'
            }`}>Fortsetzen</button>
            <button className={`flex-shrink-0 ${
              hc && dark ? 'text-white/50' : hc ? 'text-gray-500' : dark ? 'text-amber-600' : 'text-amber-400'
            }`}><X size={16} /></button>
          </div>
        )}
      </ThemeRow>
    </Section>
  );
}

// ─── 12. Speed-reader ────────────────────────────────────────────────────────

function SpeedReaderSection({ flags }) {
  const ReadingView = ({ dark, hc, playing }) => (
    <div className={`py-8 px-6 flex flex-col items-center gap-6 ${
      hc && dark ? 'bg-black' : hc ? 'bg-white' : dark ? 'bg-slate-800/50' : 'bg-white/70'
    }`}>
      {/* Progress bar */}
      <div className={`w-full h-0.5 rounded-full ${
        hc && dark ? 'bg-white/20' : hc ? 'bg-black/10' : dark ? 'bg-slate-700' : 'bg-amber-100'
      }`}>
        <div className={`h-full rounded-full ${
          hc && dark ? 'bg-white' : hc ? 'bg-black' : dark ? 'bg-amber-500' : 'bg-amber-600'
        }`} style={{ width: '42%' }} />
      </div>
      {/* Word */}
      <span className={`text-5xl font-serif font-bold tracking-wide ${playing ? '' : 'opacity-40'} ${
        hc && dark ? 'text-white' : hc ? 'text-gray-900' : dark ? 'text-amber-200' : 'text-amber-900'
      }`}>
        Wald
      </span>
      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Back sentence */}
        <button className={`p-2 rounded-lg ${
          hc && dark ? 'text-white/60' : hc ? 'text-gray-500' : dark ? 'text-amber-600' : 'text-amber-400'
        }`}>
          <RotateCcw size={16} />
        </button>
        {/* Play / Pause */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
          hc && dark ? 'bg-white text-black' : hc ? 'bg-black text-white' :
          dark ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-700'
        }`}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </div>
        {/* WpM control */}
        <div className="flex items-center gap-1.5">
          <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${
            hc && dark ? 'text-white/60' : hc ? 'text-gray-500' : dark ? 'bg-slate-700/60 text-amber-600' : 'bg-amber-50 text-amber-500'
          }`}><Minus size={11} /></div>
          <span className={`text-xs font-mono font-bold tabular-nums text-center ${
            hc && dark ? 'text-white' : hc ? 'text-gray-900' : dark ? 'text-amber-300' : 'text-amber-800'
          }`} style={{ minWidth: '3.8rem' }}>400 WpM</span>
          <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${
            hc && dark ? 'text-white/60' : hc ? 'text-gray-500' : dark ? 'bg-slate-700/60 text-amber-600' : 'bg-amber-50 text-amber-500'
          }`}><Plus size={11} /></div>
        </div>
      </div>
    </div>
  );

  return (
    <Section id="schnellleser" title="Schnellleser"
      description="RSVP-Leseansicht mit Einzelwort-Anzeige und Geschwindigkeitssteuerung"
      flagKeys={['speed-reader']}>
      {flags['speed-reader'] ? (
        <>
          <Item label="Modus-Knopf" description="In der Navigationsleiste - aktiv / inaktiv">
            <ThemeRow>
              {({ dark, hc }) => (
                <div className="flex items-center gap-5">
                  {[false, true].map(active => (
                    <div key={String(active)} className="flex flex-col items-center gap-1.5">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${
                        active
                          ? hc && dark ? 'bg-white text-black' : hc ? 'bg-black text-white' :
                            dark ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-700'
                          : hc   ? 'text-white/40' :
                            dark ? 'bg-slate-700/60 text-amber-700' : 'bg-amber-50/80 text-amber-400'
                      }`}>
                        <ClockFading size={18} />
                      </div>
                      <span className={`text-[10px] ${hc && dark ? 'text-white/50' : hc ? 'text-gray-500' : dark ? 'text-amber-600' : 'text-amber-500'}`}>
                        {active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ThemeRow>
          </Item>

          <Item label="Lese-Ansicht" description="Abspielend">
            <ThemeRow noPad>
              {({ dark, hc }) => <ReadingView dark={dark} hc={hc} playing={true} />}
            </ThemeRow>
          </Item>

          <Item label="Lese-Ansicht" description="Pausiert">
            <ThemeRow noPad>
              {({ dark, hc }) => <ReadingView dark={dark} hc={hc} playing={false} />}
            </ThemeRow>
          </Item>
        </>
      ) : (
        <div className="flex items-center justify-center h-16 rounded-xl border border-dashed border-gray-200">
          <p className="text-xs text-gray-400">
            Flag <code className="font-mono bg-gray-100 px-1 rounded">speed-reader</code> einschalten um die Vorschau zu sehen
          </p>
        </div>
      )}
    </Section>
  );
}

// ─── 12. Error pages ─────────────────────────────────────────────────────────

/**
 * Local error boundary used only for the throw-and-catch simulation inside the
 * design system. Resets via key so you can re-trigger without a page reload.
 */
class LocalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { caught: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { caught: true, error };
  }
  render() {
    if (this.state.caught) {
      return (
        <div className="h-[550px] rounded-xl overflow-hidden border border-amber-200">
          <ErrorPage type="unexpected" error={this.state.error} />
        </div>
      );
    }
    return this.props.children;
  }
}

function ThrowOnMount() {
  throw new Error('Simulated 500 error thrown from ErrorPagesSection demo');
}

function ErrorPagesSection() {
  // Key increments to remount the LocalErrorBoundary, resetting its caught state
  const [throwKey, setThrowKey] = useState(0);
  const [throwing, setThrowing] = useState(false);

  function triggerThrow() {
    setThrowing(false);
    // Flush to clear any previous throw, then set on next tick
    setTimeout(() => { setThrowing(true); }, 0);
  }

  return (
    <Section id="fehlerseiten" title="Fehlerseiten"
      description="Alle registrierten Fehlertypen aus ERROR_TYPES — erweiterbar durch neue Einträge im Registry-Objekt in ErrorPage.jsx">

      {/* Static previews for each registered error type */}
      {Object.entries(ERROR_TYPES).map(([type, config]) => (
        <Item key={type} label={`${config.code} – ${config.title}`} description={`type="${type}"`}>
          <div className="h-[550px] rounded-xl overflow-hidden border border-gray-200">
            <ErrorPage type={type} />
          </div>
        </Item>
      ))}

      {/* Live throw simulation */}
      <Item label="500 – Live throw" description="Wirft eine echte Exception, die von einer lokalen ErrorBoundary abgefangen wird">
        {throwing ? (
          <LocalErrorBoundary key={throwKey}>
            <ThrowOnMount />
          </LocalErrorBoundary>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 gap-3 rounded-xl border border-dashed border-gray-200">
            <p className="text-xs text-gray-400">Noch keine Exception ausgelöst</p>
            <button
              onClick={() => { setThrowKey(k => k + 1); triggerThrow(); }}
              className="text-xs font-medium px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors"
            >
              Exception auslösen →
            </button>
          </div>
        )}
        {throwing && (
          <button
            onClick={() => { setThrowing(false); setThrowKey(k => k + 1); }}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ↺ Zurücksetzen
          </button>
        )}
      </Item>
    </Section>
  );
}

// ─── Left navigation ──────────────────────────────────────────────────────────

const NAV_GROUPS = [
  { label: 'Tokens',   items: [{ id: 'farben', label: 'Farben' }, { id: 'typografie', label: 'Typografie' }] },
  { label: 'Elemente', items: [{ id: 'schaltflaechen', label: 'Schaltflächen' }, { id: 'formular', label: 'Formularelemente' }] },
  { label: 'Layout',   items: [{ id: 'kopfzeile', label: 'Kopfzeile' }, { id: 'navigationsleiste', label: 'Navigationsleiste' }, { id: 'seitenleiste', label: 'Seitenleiste' }] },
  { label: 'Inhalte',  items: [{ id: 'lesebereich', label: 'Lesebereich' }, { id: 'audioplayer', label: 'Audio-Player' }, { id: 'schnellleser', label: 'Schnellleser' }, { id: 'profil', label: 'Profil-Panel' }, { id: 'banner', label: 'Banner' }, { id: 'fehlerseiten', label: 'Fehlerseiten' }] },
];

function LeftNav({ active }) {
  return (
    <nav className="flex-1 overflow-y-auto py-3">
      {NAV_GROUPS.map(({ label, items }) => (
        <div key={label} className="mb-3">
          <p className="px-4 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          {items.map(({ id, label }) => (
            <a key={id} href={`#${id}`}
              className={`flex items-center px-4 py-1.5 text-sm transition-colors rounded-none ${
                active === id
                  ? 'text-violet-600 bg-violet-50 font-medium border-r-2 border-violet-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >{label}</a>
          ))}
        </div>
      ))}
    </nav>
  );
}

// ─── Right flag panel ─────────────────────────────────────────────────────────

function FlagPanel({ flags, onFlag }) {
  // Separate boolean feature flags (have on/off in flagConfig) from string flags
  const boolFeatures = FEATURES.filter(f => {
    const cfg = flagConfig[f.key];
    return cfg && 'on' in cfg.variants && 'off' in cfg.variants;
  });

  const plannedFeatures = FEATURES.filter(f => !flagConfig[f.key]);

  const bigFontsVariants = Object.keys(flagConfig['big-fonts']?.variants ?? {});

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Boolean feature flags */}
      <div className="divide-y divide-gray-50">
        {boolFeatures.map(({ key, label, Icon }) => (
          <label key={key} className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer select-none">
            <div className="flex-shrink-0 w-4 h-4 text-gray-400">
              <Icon />
            </div>
            <span className="flex-1 text-xs text-gray-700 min-w-0 leading-tight">{label}</span>
            <button
              role="switch"
              aria-checked={flags[key]}
              onClick={() => onFlag(key, !flags[key])}
              className={`flex-shrink-0 relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                flags[key] ? 'bg-violet-500' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${
                flags[key] ? 'translate-x-3.5' : 'translate-x-0.5'
              }`} />
            </button>
          </label>
        ))}
      </div>

      {/* big-fonts selector */}
      <div className="px-3 py-3 border-t border-gray-100">
        <p className="text-[10px] font-mono text-gray-400 mb-1.5">big-fonts</p>
        <div className="grid grid-cols-4 gap-1">
          {bigFontsVariants.map(v => (
            <button
              key={v}
              onClick={() => onFlag('big-fonts', v)}
              className={`py-1 rounded text-[10px] text-center font-mono transition-colors ${
                flags['big-fonts'] === v
                  ? 'bg-violet-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >{v}</button>
          ))}
        </div>
      </div>

      {/* Planned features */}
      {plannedFeatures.length > 0 && (
        <div className="px-3 py-3 border-t border-gray-100">
          <p className="text-[10px] font-mono text-gray-400 mb-1.5">Geplant (noch kein Flag)</p>
          <div className="space-y-1.5">
            {plannedFeatures.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2 opacity-40">
                <span className="flex-1 text-[11px] text-gray-500 leading-tight">{label}</span>
                <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1 rounded">Geplant</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const ALL_IDS = NAV_GROUPS.flatMap(g => g.items.map(i => i.id));

export default function DesignSystem() {
  const [flags, setFlags]         = useState(buildInitialFlags);
  const [activeSection, setActive] = useState('farben');

  const setFlag = (key, value) => setFlags(f => ({ ...f, [key]: value }));
  const resetAll = () => setFlags(buildInitialFlags());

  const activeThemes = flags['high-contrast-theme'] ? THEMES_HC : THEMES_NORMAL;

  // Highlight active nav item based on scroll position
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.find(e => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-5% 0px -85% 0px' }
    );
    ALL_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <ThemesCtx.Provider value={activeThemes}>
    <div className="flex h-screen overflow-hidden bg-gray-50" style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Left sidebar ── */}
      <div className="w-48 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-900 tracking-tight">Märchenschatz</p>
          <p className="text-[10px] text-gray-400 mt-0.5 font-mono uppercase tracking-wider">Design System</p>
        </div>
        <LeftNav active={activeSection} />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {flags['high-contrast-theme'] && (
            <div className="mb-6 px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs flex items-center gap-2">
              <span className="font-mono text-zinc-400">high-contrast-theme</span>
              <span className="text-zinc-500">·</span>
              <span>Hochkontrastmodus aktiv - Themenkreis zeigt Hell-HC ↔ Dunkel-HC</span>
            </div>
          )}
          <ColorsSection />
          <TypographySection />
          <ButtonsSection flags={flags} />
          <FormSection flags={flags} />
          <HeaderSection flags={flags} />
          <NavBarSection flags={flags} />
          <SidebarSection flags={flags} />
          <ReaderSection flags={flags} />
          <AudioSection flags={flags} />
          <SpeedReaderSection flags={flags} />
          <ProfileSection flags={flags} />
          <BannerSection />
          <ErrorPagesSection />
        </div>
      </div>

      {/* ── Right flag panel ── */}
      <div className="w-52 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col">
        <div className="px-3 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-800">Feature Flags</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Live anpassen</p>
          </div>
          <button
            onClick={resetAll}
            className="text-[10px] text-gray-400 hover:text-violet-600 transition-colors font-medium"
          >
            Reset
          </button>
        </div>
        <FlagPanel flags={flags} onFlag={setFlag} />
      </div>
    </div>
    </ThemesCtx.Provider>
  );
}
