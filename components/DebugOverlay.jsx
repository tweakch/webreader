import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { X, Bug, Tag, Gauge, Ruler, Grid3x3, Flag, Hash, Eye, EyeOff } from 'lucide-react';

/* global __APP_VERSION__, __APP_COMMIT__, __APP_BUILD_TIME__ */
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
const APP_COMMIT = typeof __APP_COMMIT__ !== 'undefined' ? __APP_COMMIT__ : 'dev';
const APP_BUILD_TIME = typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : '';

const STORAGE_KEY = 'wr-debug-subfeatures';

const DEFAULT_SUB_FEATURES = {
  badges: true,
  fps: false,
  viewport: false,
  grid: false,
  flags: false,
  version: true,
};

const SUB_FEATURE_META = [
  { key: 'badges',   label: 'Badges',   Icon: Tag,     testid: 'debug-sub-badges' },
  { key: 'fps',      label: 'FPS',      Icon: Gauge,   testid: 'debug-sub-fps' },
  { key: 'viewport', label: 'Viewport', Icon: Ruler,   testid: 'debug-sub-viewport' },
  { key: 'grid',     label: 'Grid',     Icon: Grid3x3, testid: 'debug-sub-grid' },
  { key: 'flags',    label: 'Flags',    Icon: Flag,    testid: 'debug-sub-flags' },
  { key: 'version',  label: 'Build',    Icon: Hash,    testid: 'debug-sub-version' },
];

function loadSubFeatures() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return { ...DEFAULT_SUB_FEATURES, ...stored };
  } catch {
    return { ...DEFAULT_SUB_FEATURES };
  }
}

function useBadges(enabled) {
  const [badges, setBadges] = useState([]);
  const rafRef = useRef(null);

  const scan = useCallback(() => {
    const elements = document.querySelectorAll('[data-testid]');
    const next = [];
    elements.forEach((el) => {
      if (el.closest('[data-debug-overlay]')) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      next.push({
        testid: el.getAttribute('data-testid'),
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        tagName: el.tagName.toLowerCase(),
        ariaLabel: el.getAttribute('aria-label') ?? '',
        role: el.getAttribute('role') ?? '',
      });
    });
    setBadges(next);
  }, []);

  const schedule = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      scan();
    });
  }, [scan]);

  useEffect(() => {
    if (!enabled) { setBadges([]); return; }
    scan();
    const resizeObs = new ResizeObserver(schedule);
    resizeObs.observe(document.body);
    const mutObs = new MutationObserver(schedule);
    mutObs.observe(document.body, { subtree: true, childList: true, attributes: true });
    window.addEventListener('scroll', schedule, true);
    return () => {
      resizeObs.disconnect();
      mutObs.disconnect();
      window.removeEventListener('scroll', schedule, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, scan, schedule]);

  return badges;
}

function useFps(enabled) {
  const [fps, setFps] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let frames = 0;
    let last = performance.now();
    let raf;
    const tick = (now) => {
      frames += 1;
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);
  return fps;
}

function useViewport(enabled) {
  const [size, setSize] = useState({ w: 0, h: 0, dpr: 1 });
  useEffect(() => {
    if (!enabled) return;
    const read = () => setSize({
      w: window.innerWidth,
      h: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
    });
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, [enabled]);
  return size;
}

/**
 * DebugOverlay - floating control panel with toggleable sub-features for
 * the "tester" role when the `debug-badges` feature flag is active.
 *
 * Sub-features:
 *   - badges:   data-testid badges on every visible testable element
 *   - fps:      live FPS meter driven by requestAnimationFrame
 *   - viewport: current viewport size and devicePixelRatio
 *   - grid:     8 px baseline grid for layout sanity-checks
 *   - flags:    live dump of resolved feature flag values
 *   - version:  package.json version + git commit + build timestamp
 */
export default function DebugOverlay({ flagValues = {} }) {
  const [subFeatures, setSubFeatures] = useState(loadSubFeatures);
  const [panelOpen, setPanelOpen] = useState(false);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subFeatures));
  }, [subFeatures]);

  const toggle = useCallback((key) => {
    setSubFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const badges = useBadges(subFeatures.badges);
  const fps = useFps(subFeatures.fps);
  const viewport = useViewport(subFeatures.viewport);

  const flagRows = useMemo(
    () => Object.entries(flagValues).sort(([a], [b]) => a.localeCompare(b)),
    [flagValues],
  );

  const activeCount = Object.values(subFeatures).filter(Boolean).length;

  return (
    <div
      data-debug-overlay="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9000 }}
    >
      {/* data-testid badges */}
      {subFeatures.badges && badges.map((badge, i) => (
        <button
          key={`${badge.testid}-${i}`}
          data-testid={`debug-badge-${badge.testid}`}
          onClick={() => setModal(badge)}
          title={badge.testid}
          style={{
            position: 'fixed',
            top: badge.top,
            left: badge.left,
            pointerEvents: 'auto',
            cursor: 'pointer',
            padding: '1px 5px',
            background: '#7c3aed',
            color: '#fff',
            fontSize: '10px',
            fontFamily: 'monospace',
            borderRadius: '3px',
            lineHeight: '16px',
            border: 'none',
            whiteSpace: 'nowrap',
            opacity: 0.85,
          }}
        >
          {badge.testid}
        </button>
      ))}

      {/* Grid overlay */}
      {subFeatures.grid && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage:
              'linear-gradient(to right,  rgba(124,58,237,0.18) 1px, transparent 1px),' +
              'linear-gradient(to bottom, rgba(124,58,237,0.18) 1px, transparent 1px)',
            backgroundSize: '8px 8px',
            mixBlendMode: 'multiply',
          }}
        />
      )}

      {/* HUD: FPS + viewport + version pills */}
      <div
        style={{
          position: 'fixed',
          top: 8,
          left: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          fontFamily: 'monospace',
          fontSize: '10px',
          pointerEvents: 'none',
        }}
      >
        {subFeatures.fps && (
          <span data-testid="debug-hud-fps" style={pillStyle}>{fps} fps</span>
        )}
        {subFeatures.viewport && (
          <span data-testid="debug-hud-viewport" style={pillStyle}>
            {viewport.w}×{viewport.h} @{viewport.dpr.toFixed(2)}x
          </span>
        )}
        {subFeatures.version && (
          <span data-testid="debug-hud-version" style={pillStyle}>
            v{APP_VERSION} · {APP_COMMIT}
          </span>
        )}
      </div>

      {/* Flags inspector */}
      {subFeatures.flags && flagRows.length > 0 && (
        <div
          data-testid="debug-hud-flags"
          style={{
            position: 'fixed',
            top: 8,
            right: 8,
            maxWidth: 260,
            maxHeight: '60vh',
            overflowY: 'auto',
            background: 'rgba(30,27,75,0.92)',
            color: '#e0e7ff',
            border: '1px solid rgba(165,180,252,0.25)',
            borderRadius: 8,
            padding: '8px 10px',
            fontFamily: 'monospace',
            fontSize: '10px',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ color: '#a5b4fc', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Flags
          </div>
          {flagRows.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ color: '#c7d2fe' }}>{k}</span>
              <span style={{ color: v ? '#86efac' : '#fca5a5' }}>{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Sub-feature control panel */}
      <div
        data-testid="debug-panel"
        style={{
          position: 'fixed',
          bottom: 12,
          right: 12,
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
        }}
      >
        {panelOpen && (
          <div
            style={{
              background: 'rgba(30,27,75,0.95)',
              color: '#e0e7ff',
              border: '1px solid rgba(165,180,252,0.25)',
              borderRadius: 12,
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              fontFamily: 'monospace',
              fontSize: '11px',
              minWidth: 160,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ padding: '4px 6px 6px', color: '#a5b4fc', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Debug
            </div>
            {SUB_FEATURE_META.map(({ key, label, Icon, testid }) => {
              const on = subFeatures[key];
              return (
                <button
                  key={key}
                  data-testid={testid}
                  onClick={() => toggle(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 8px',
                    background: on ? 'rgba(124,58,237,0.35)' : 'transparent',
                    color: on ? '#e0e7ff' : '#a5b4fc',
                    border: '1px solid ' + (on ? 'rgba(167,139,250,0.5)' : 'transparent'),
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  <Icon size={12} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {on ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
              );
            })}
            {APP_BUILD_TIME && (
              <div style={{ padding: '4px 6px 0', color: '#818cf8', fontSize: '9px' }}>
                built {APP_BUILD_TIME.replace('T', ' ').slice(0, 16)}
              </div>
            )}
          </div>
        )}

        <button
          data-testid="debug-panel-toggle"
          aria-label="Debug panel"
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen((o) => !o)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            background: panelOpen ? '#7c3aed' : 'rgba(124,58,237,0.85)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            position: 'relative',
          }}
        >
          <Bug size={16} />
          <span
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              minWidth: 14,
              height: 14,
              padding: '0 3px',
              borderRadius: 7,
              background: '#1e1b4b',
              color: '#e0e7ff',
              fontSize: 9,
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(165,180,252,0.5)',
            }}
          >
            {activeCount}
          </span>
        </button>
      </div>

      {/* Badge-detail modal */}
      {modal && (
        <div
          data-testid="debug-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9001,
            pointerEvents: 'auto',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
        >
          <div
            style={{
              background: '#1e1b4b',
              color: '#e0e7ff',
              borderRadius: '12px',
              padding: '24px',
              minWidth: '320px',
              maxWidth: '480px',
              fontFamily: 'monospace',
              fontSize: '13px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Technische Informationen
              </span>
              <button
                data-testid="debug-modal-close"
                onClick={() => setModal(null)}
                style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', padding: '2px' }}
              >
                <X size={16} />
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['data-testid', modal.testid],
                  ['Element', `<${modal.tagName}>`],
                  ['Breite × Höhe', `${Math.round(modal.width)} × ${Math.round(modal.height)} px`],
                  ...(modal.ariaLabel ? [['aria-label', modal.ariaLabel]] : []),
                  ...(modal.role ? [['role', modal.role]] : []),
                ].map(([key, val]) => (
                  <tr key={key}>
                    <td style={{ color: '#818cf8', paddingRight: '16px', paddingBottom: '8px', whiteSpace: 'nowrap' }}>
                      {key}
                    </td>
                    <td style={{ color: '#e0e7ff', paddingBottom: '8px', wordBreak: 'break-all' }}>
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const pillStyle = {
  background: 'rgba(30,27,75,0.85)',
  color: '#e0e7ff',
  padding: '2px 6px',
  borderRadius: 4,
  border: '1px solid rgba(165,180,252,0.25)',
  whiteSpace: 'nowrap',
  alignSelf: 'flex-start',
};
