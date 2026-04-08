import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Minus, Plus, RotateCcw, Heart, Share2, X, Play, Pause, Settings } from 'lucide-react';
import SpeedReaderOrpPanel from './SpeedReaderOrpPanel';

const SR_FONT = { fontFamily: "'Roboto Mono', 'Courier New', monospace" };

const CTX_OPACITY = [0, 0.35, 0.20, 0.12];
const CTX_SIZE    = ['', 'text-3xl', 'text-2xl', 'text-xl'];
const ctxOpacity  = d => CTX_OPACITY[d] ?? 0.12;
const ctxSizeCls  = d => CTX_SIZE[d]    ?? 'text-xl';

const DEFAULT_ORP_CONFIG = {
  orp_method: 'second_letter',
  orp_letter_index: 1,
  highlight_orp: true,
  orp_color: '#ef4444',
  orp_font_weight: '700',
  show_horizontal_bars: true,
  horizontal_bar: { length: 240, thickness: 2, color: '#64748b' },
  show_vertical_marker: true,
  vertical_marker: { height: 22, width: 3, color: '#ef4444' },
  fixation_point: { x: 50, y: 50 },
};

/**
 * SpeedReaderView — RSVP speed-reader panel.
 *
 * Owns all playback state (word index, play/pause, WPM, preview, ORP config)
 * so that the parent component is not re-rendered on every word tick.
 *
 * Props:
 *   srWords          string[]   — word list for the current story/variant
 *   darkMode         boolean
 *   highContrast     boolean
 *   showSpeedreaderOrp boolean
 */
const SpeedReaderView = ({ srWords, darkMode, highContrast, showSpeedreaderOrp, story, isFavorite, onToggleFavorite, onClose, showFavorites, onShare }) => {
  const [srPlaying,      setSrPlaying]      = useState(false);
  const [srWordIdx,      setSrWordIdx]      = useState(0);
  const [srWpm,          setSrWpm]          = useState(() => parseInt(localStorage.getItem('wr-sr-wpm')     ?? '200'));
  const [srPreviewWords, setSrPreviewWords] = useState(() => parseInt(localStorage.getItem('wr-sr-preview') ?? '0'));
  const [orpConfig,      setOrpConfig]      = useState(() => {
    try { return { ...DEFAULT_ORP_CONFIG, ...JSON.parse(localStorage.getItem('wr-sr-orp-config') ?? '{}') }; }
    catch { return DEFAULT_ORP_CONFIG; }
  });
  const [orpPanelOpen, setOrpPanelOpen] = useState(false);
  const [finished, setFinished] = useState(false);

  // Refs that the scheduler reads — always current, no stale closures
  const srWordIdxRef = useRef(srWordIdx);
  const srWpmRef     = useRef(srWpm);
  const srWordsRef   = useRef(srWords);
  const timerRef     = useRef(null);

  // Keep refs in sync with state/props
  useEffect(() => { srWpmRef.current   = srWpm;   }, [srWpm]);
  useEffect(() => { srWordsRef.current = srWords; }, [srWords]);

  // Persist settings
  useEffect(() => { localStorage.setItem('wr-sr-wpm',       srWpm); },          [srWpm]);
  useEffect(() => { localStorage.setItem('wr-sr-preview',   srPreviewWords); }, [srPreviewWords]);
  useEffect(() => { localStorage.setItem('wr-sr-orp-config', JSON.stringify(orpConfig)); }, [orpConfig]);

  // Close ORP panel when the ORP flag is turned off
  useEffect(() => {
    if (!showSpeedreaderOrp) setOrpPanelOpen(false);
  }, [showSpeedreaderOrp]);

  // Wall-clock anchored scheduler — drift-free at any WPM.
  //
  // Each tick receives the time it was *supposed* to fire (scheduledTime).
  // The next delay is computed as (scheduledTime + interval) - now, so late
  // ticks are automatically compensated and drift cannot accumulate.
  //
  // The next timer is always scheduled BEFORE setSrWordIdx so the timer chain
  // is never blocked by React rendering.
  const scheduleNext = useCallback((scheduledTime) => {
    clearTimeout(timerRef.current);
    const words = srWordsRef.current;
    const idx   = srWordIdxRef.current;
    if (idx >= words.length - 1) { setSrPlaying(false); setFinished(true); return; }

    const word          = words[idx] ?? '';
    const isSentenceEnd = /[.!?]["»]?$/.test(word);
    const interval      = Math.round(60000 / srWpmRef.current) * (isSentenceEnd ? 2 : 1);
    const nextTime      = scheduledTime + interval;
    const delay         = Math.max(0, nextTime - performance.now());

    timerRef.current = setTimeout(() => {
      const next = srWordIdxRef.current + 1;
      if (next >= srWordsRef.current.length) {
        setSrPlaying(false);
        setFinished(true);
        return;
      }
      // Advance the ref and re-arm the timer BEFORE touching React state
      srWordIdxRef.current = next;
      scheduleNext(nextTime);
      setSrWordIdx(next);
    }, delay);
  }, []); // no deps — reads everything from refs

  // Start/stop the scheduler when play state changes
  useEffect(() => {
    if (srPlaying) {
      scheduleNext(performance.now());
    } else {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [srPlaying, scheduleNext]);

  const getOrpIndex = useCallback((word) => {
    if (word.length <= 1) return 0;
    switch (orpConfig.orp_method) {
      case 'center':      return Math.floor((word.length - 1) / 2);
      case 'fixed_index': return Math.min(orpConfig.orp_letter_index, word.length - 1);
      default:            return 1;
    }
  }, [orpConfig.orp_method, orpConfig.orp_letter_index]);

  const srBackSentence = useCallback(() => {
    setSrWordIdx(i => {
      if (i === 0) return 0;
      let pos = i - 1;
      while (pos > 0 && !/[.!?]["»]?$/.test(srWords[pos - 1])) pos--;
      return pos;
    });
    setSrPlaying(false);
  }, [srWords]);

  // Keep srWordIdxRef in sync when index changes externally (back-sentence, etc.)
  useEffect(() => { srWordIdxRef.current = srWordIdx; }, [srWordIdx]);

  // ── derived display values ───────────────────────────────────────────────────

  const wordColorCls = highContrast
    ? (darkMode ? 'text-white' : 'text-gray-900')
    : darkMode ? 'text-amber-200' : 'text-amber-900';

  const word = srWords[srWordIdx] ?? '';

  const previewBefore = [];
  for (let d = srPreviewWords; d >= 1; d--) {
    const i = srWordIdx - d;
    if (i >= 0) previewBefore.push({ word: srWords[i], dist: d });
  }
  const previewAfter = [];
  for (let d = 1; d <= srPreviewWords; d++) {
    const i = srWordIdx + d;
    if (i < srWords.length) previewAfter.push({ word: srWords[i], dist: d });
  }

  // ── ORP word renderer ────────────────────────────────────────────────────────

  const fp = orpConfig.fixation_point;

  const renderOrpRow = (w, dist, isCurrent) => {
    const i = getOrpIndex(w);
    const sizeCls = isCurrent ? 'text-5xl' : ctxSizeCls(dist);
    return (
      <div
        key={`${isCurrent ? 'cur' : dist > 0 ? 'a' : 'b'}${dist}`}
        className={`w-full font-normal tracking-wide ${sizeCls} ${wordColorCls}`}
        style={{
          ...SR_FONT,
          display: 'grid',
          gridTemplateColumns: `${fp.x}% auto 1fr`,
          alignItems: 'center',
          opacity: isCurrent ? (srPlaying ? 1 : 0.4) : ctxOpacity(dist),
          pointerEvents: 'none',
        }}
      >
        <span style={{ textAlign: 'right', overflow: 'visible', whiteSpace: 'nowrap' }}>{w.slice(0, i)}</span>
        <span style={isCurrent && orpConfig.highlight_orp ? { color: orpConfig.orp_color, fontWeight: orpConfig.orp_font_weight } : {}}>
          {w.slice(i, i + 1)}
        </span>
        <span style={{ overflow: 'visible', whiteSpace: 'nowrap' }}>{w.slice(i + 1)}</span>
      </div>
    );
  };

  // ── render ───────────────────────────────────────────────────────────────────

  const bgCls = highContrast
    ? (darkMode ? 'bg-black' : 'bg-white')
    : darkMode ? 'bg-slate-800/50' : 'bg-white/70';

  const btnSm = `flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
    highContrast
      ? (darkMode ? 'text-white/60' : 'text-gray-500')
      : darkMode ? 'bg-slate-700/60 text-amber-600 hover:bg-slate-600' : 'bg-amber-50 text-amber-500 hover:bg-amber-100'
  }`;

  const labelCls = `text-xs font-mono font-bold tabular-nums text-center ${
    highContrast ? (darkMode ? 'text-white' : 'text-gray-900') : darkMode ? 'text-amber-300' : 'text-amber-800'
  }`;

  return (
    <div className={`h-full flex flex-col items-center justify-center gap-6 py-8 px-6 transition-colors duration-300 ${bgCls}`}>

      {/* Progress bar */}
      <div className={`w-full h-0.5 rounded-full ${
        highContrast ? (darkMode ? 'bg-white/20' : 'bg-black/10') : darkMode ? 'bg-slate-700' : 'bg-amber-100'
      }`}>
        <div
          className={`h-full rounded-full ${
            highContrast ? (darkMode ? 'bg-white' : 'bg-black') : darkMode ? 'bg-amber-500' : 'bg-amber-600'
          }`}
          style={{
            transform: `scaleX(${srWordIdx / Math.max(1, srWords.length - 1)})`,
            transformOrigin: 'left',
            willChange: 'transform',
          }}
        />
      </div>

      {/* End-of-story CTA */}
      {finished ? (
        <div className="flex flex-col items-center gap-5 text-center">
          <div className={`text-4xl font-serif font-bold ${wordColorCls}`}>{story?.title}</div>
          <p className={`text-sm opacity-50 ${wordColorCls}`}>Ende</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={onShare}
              title="Teilen"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                highContrast
                  ? (darkMode ? 'border border-white/40 text-white hover:bg-white/10' : 'border border-black/30 text-gray-900 hover:bg-black/5')
                  : darkMode ? 'bg-slate-700/60 text-amber-300 hover:bg-slate-700' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <Share2 size={15} />
              Teilen
            </button>
            {showFavorites && (
              <button
                onClick={onToggleFavorite}
                title={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isFavorite
                    ? highContrast
                      ? (darkMode ? 'border border-white text-white' : 'border border-black text-gray-900')
                      : darkMode ? 'bg-amber-700/40 text-amber-300' : 'bg-amber-200 text-amber-900'
                    : highContrast
                      ? (darkMode ? 'border border-white/40 text-white hover:bg-white/10' : 'border border-black/30 text-gray-900 hover:bg-black/5')
                      : darkMode ? 'bg-slate-700/60 text-amber-600 hover:bg-slate-700' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
                Favorit
              </button>
            )}
            <button
              onClick={onClose}
              title="Zur Übersicht"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                highContrast
                  ? (darkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900')
                  : darkMode ? 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30' : 'bg-amber-900/10 text-amber-900 hover:bg-amber-900/20'
              }`}
            >
              <X size={15} />
              Schließen
            </button>
          </div>
        </div>
      ) : null}

      {/* Word display */}
      {!finished && (showSpeedreaderOrp ? (
        <div
          data-testid="speed-reader-word"
          onClick={() => setSrPlaying(v => !v)}
          className="flex flex-col items-stretch w-full gap-0.5 cursor-pointer select-none"
        >
          {previewBefore.map(({ word: pw, dist }) => renderOrpRow(pw, dist, false))}

          {/* Current word — wrapped for guide bars */}
          <div className="relative w-full" style={{ height: '80px' }}>
            {orpConfig.show_horizontal_bars && (
              <>
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: `calc(${fp.y}% - ${orpConfig.horizontal_bar.thickness + 16}px)`, width: orpConfig.horizontal_bar.length + 'px', height: orpConfig.horizontal_bar.thickness + 'px', backgroundColor: orpConfig.horizontal_bar.color, borderRadius: '9999px', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: `calc(${fp.y}% + 16px)`, width: orpConfig.horizontal_bar.length + 'px', height: orpConfig.horizontal_bar.thickness + 'px', backgroundColor: orpConfig.horizontal_bar.color, borderRadius: '9999px', pointerEvents: 'none' }} />
              </>
            )}
            {orpConfig.show_vertical_marker && (
              <div style={{ position: 'absolute', left: `${fp.x}%`, top: `calc(${fp.y}% - ${orpConfig.vertical_marker.height / 2}px)`, transform: 'translateX(-50%)', width: orpConfig.vertical_marker.width + 'px', height: orpConfig.vertical_marker.height + 'px', backgroundColor: orpConfig.vertical_marker.color, borderRadius: '1px', pointerEvents: 'none' }} />
            )}
            {(() => {
              const oi = getOrpIndex(word);
              return (
                <div
                  className={`absolute inset-0 flex items-center text-5xl font-normal tracking-wide ${wordColorCls}`}
                  style={{ ...SR_FONT, display: 'grid', gridTemplateColumns: `${fp.x}% auto 1fr`, alignItems: 'center', opacity: srPlaying ? 1 : 0.4 }}
                >
                  <span style={{ textAlign: 'right', overflow: 'visible', whiteSpace: 'nowrap' }}>{word.slice(0, oi)}</span>
                  <span style={orpConfig.highlight_orp ? { color: orpConfig.orp_color, fontWeight: orpConfig.orp_font_weight } : {}}>
                    {word.slice(oi, oi + 1)}
                  </span>
                  <span style={{ overflow: 'visible', whiteSpace: 'nowrap' }}>{word.slice(oi + 1)}</span>
                </div>
              );
            })()}
          </div>

          {previewAfter.map(({ word: pw, dist }) => renderOrpRow(pw, dist, false))}
        </div>
      ) : (
        /* Classic layout — flex pivot */
        (() => {
          const before   = word.length > 1 ? word[0] : '';
          const pivot    = word.length > 1 ? word[1] : word;
          const after    = word.length > 2 ? word.slice(2) : '';
          const pivotCls = highContrast ? wordColorCls : darkMode ? 'text-amber-400' : 'text-amber-600';
          const mainCls  = `text-5xl font-bold tracking-wide ${wordColorCls} transition-opacity duration-150 ${srPlaying ? '' : 'opacity-40'}`;
          return (
            <div
              data-testid="speed-reader-word"
              onClick={() => setSrPlaying(v => !v)}
              className="flex flex-col items-center gap-0.5 w-full cursor-pointer select-none"
            >
              {previewBefore.map(({ word: pw, dist }) => (
                <div key={`b${dist}`} className={`font-bold tracking-wide ${ctxSizeCls(dist)} ${wordColorCls}`}
                  style={{ ...SR_FONT, opacity: ctxOpacity(dist) }}>
                  {pw}
                </div>
              ))}
              <div className={`flex items-center w-full ${mainCls}`} style={SR_FONT}>
                <div className="flex-1 flex justify-end">{before}</div>
                <span className={pivotCls}>{pivot}</span>
                <div className="flex-1 flex justify-start">{after}</div>
              </div>
              {previewAfter.map(({ word: pw, dist }) => (
                <div key={`a${dist}`} className={`font-bold tracking-wide ${ctxSizeCls(dist)} ${wordColorCls}`}
                  style={{ ...SR_FONT, opacity: ctxOpacity(dist) }}>
                  {pw}
                </div>
              ))}
            </div>
          );
        })()
      ))}

      {/* ORP settings panel */}
      {showSpeedreaderOrp && orpPanelOpen && (
        <SpeedReaderOrpPanel
          config={orpConfig}
          onChange={patch => setOrpConfig(prev => ({ ...prev, ...patch }))}
          previewWord={word}
        />
      )}

      {/* Controls row */}
      <div className="flex items-center gap-4">
        {/* Back sentence */}
        <button
          data-testid="speed-reader-back"
          onClick={srBackSentence}
          title="Zum Satzanfang"
          className={`p-2 rounded-lg transition-colors ${
            highContrast ? (darkMode ? 'text-white/60 hover:bg-white/10' : 'text-gray-500 hover:bg-black/5') : darkMode ? 'text-amber-600 hover:bg-slate-700' : 'text-amber-400 hover:bg-amber-50'
          }`}
        >
          <RotateCcw size={16} />
        </button>

        {/* Play / Pause */}
        <button
          data-testid="speed-reader-play"
          onClick={() => setSrPlaying(v => !v)}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
            highContrast
              ? (darkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900')
              : darkMode ? 'bg-amber-500/30 text-amber-300 hover:bg-amber-500/40' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          {srPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>

        {/* WpM controls */}
        <div className="flex items-center gap-1.5">
          <button data-testid="speed-reader-wpm-decrease" onClick={() => setSrWpm(w => Math.max(10, w - 10))} className={btnSm}>
            <Minus size={11} />
          </button>
          <span className={labelCls} style={{ minWidth: '3.8rem' }}>{srWpm} WpM</span>
          <button data-testid="speed-reader-wpm-increase" onClick={() => setSrWpm(w => Math.min(1000, w + 10))} className={btnSm}>
            <Plus size={11} />
          </button>
        </div>

        {/* Preview words controls */}
        <div className="flex items-center gap-1.5">
          <button data-testid="speed-reader-preview-decrease" onClick={() => setSrPreviewWords(w => Math.max(0, w - 1))} disabled={srPreviewWords === 0} className={`${btnSm} disabled:opacity-30`}>
            <Minus size={11} />
          </button>
          <span className={labelCls} style={{ minWidth: '2rem' }}>
            {srPreviewWords === 0 ? '—' : `±${srPreviewWords}`}
          </span>
          <button data-testid="speed-reader-preview-increase" onClick={() => setSrPreviewWords(w => Math.min(3, w + 1))} disabled={srPreviewWords >= 3} className={`${btnSm} disabled:opacity-30`}>
            <Plus size={11} />
          </button>
        </div>

        {/* ORP settings toggle */}
        {showSpeedreaderOrp && (
          <button
            data-testid="orp-panel-toggle"
            onClick={() => setOrpPanelOpen(v => !v)}
            title="ORP-Einstellungen"
            className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
              orpPanelOpen
                ? highContrast ? (darkMode ? 'bg-white text-black' : 'bg-black text-white') : darkMode ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-700'
                : highContrast ? (darkMode ? 'text-white/60' : 'text-gray-500') : darkMode ? 'bg-slate-700/60 text-amber-600 hover:bg-slate-600' : 'bg-amber-50 text-amber-500 hover:bg-amber-100'
            }`}
          >
            <Settings size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SpeedReaderView;
