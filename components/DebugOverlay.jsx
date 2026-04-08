import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * DebugOverlay — scans the DOM for elements with data-testid and renders
 * a floating badge on each one. Clicking a badge opens a modal with technical
 * information about the element.
 *
 * Intended for the "tester" role when the debug-badges feature is active.
 */
export default function DebugOverlay() {
  const [badges, setBadges] = useState([]);
  const [modal, setModal] = useState(null);
  const rafRef = useRef(null);

  const scanElements = useCallback(() => {
    const elements = document.querySelectorAll('[data-testid]');
    const next = [];
    elements.forEach((el) => {
      // Skip the overlay's own elements to avoid infinite badge-on-badge
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

  // Throttle updates via rAF
  const scheduleScan = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      scanElements();
    });
  }, [scanElements]);

  useEffect(() => {
    scanElements();
    const resizeObs = new ResizeObserver(scheduleScan);
    resizeObs.observe(document.body);
    const mutObs = new MutationObserver(scheduleScan);
    mutObs.observe(document.body, { subtree: true, childList: true, attributes: true });
    window.addEventListener('scroll', scheduleScan, true);
    return () => {
      resizeObs.disconnect();
      mutObs.disconnect();
      window.removeEventListener('scroll', scheduleScan, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scanElements, scheduleScan]);

  return (
    <div data-debug-overlay="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9000 }}>
      {badges.map((badge, i) => (
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
