import { useState } from 'react';
import { RotateCcw, Home, BookOpen, X } from 'lucide-react';

/**
 * Registry of all error page types.
 * Add a new entry here to support additional error states.
 */
export const ERROR_TYPES = {
  'unexpected': {
    code: '500',
    image: '/500.jpg',
    title: 'Das war nicht geplant…',
    subtitle: 'Ein unverhofftes Missgeschick',
    message: 'Wie der Wolf, der sich in Großmutters Bett irrte — hier ist etwas Unerwartetes geschehen. Ein Neuladen der Seite behebt das Rätsel oft von selbst.',
  },
  'not-found': {
    code: '404',
    image: null,
    title: 'Diese Seite gibt es nicht',
    subtitle: null,
    message: 'Der Pfad, dem du gefolgt bist, endet im Wald der leeren Seiten. Kehre heim oder öffne den Leseplatz — dort wartet das Abenteuer.',
  },
};

/**
 * Reusable full-page error component styled as a fairy-tale book page.
 * Fills its container — wrap in `fixed inset-0` (ErrorBoundary) or a sized div (design system).
 *
 * @param {'unexpected'|'not-found'|string} type  - error type key from ERROR_TYPES
 * @param {Error|null}  error    - the caught error object (shows collapsible tech details)
 * @param {React.ReactNode} actions - optional override for the action buttons row
 */
export default function ErrorPage({ type = 'unexpected', error = null, actions = null }) {
  const [showDetails, setShowDetails] = useState(false);
  const config = ERROR_TYPES[type] ?? ERROR_TYPES['unexpected'];
  const hasImage = Boolean(config.image);

  // Page background matches the illustration's warm beige sky for seamless blending
  const pageBg = hasImage ? '#faf9f7' : '#f0e4c4';
  const inkColor = hasImage ? '#1e0e04' : '#2a1400';
  const inkMid   = hasImage ? '#3a2010' : '#4a2810';
  const inkLight = hasImage ? '#5a3828' : '#8a5830';

  return (
    <div
      className="relative flex flex-col min-h-full w-full overflow-hidden"
      style={{ backgroundColor: pageBg, fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      {/* ── Full-bleed background illustration ───────────── */}
      {hasImage && (
        <img
          src={config.image}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'contain', objectPosition: 'center' }}
        />
      )}

      {/* ── Text section (upper portion, overlaid) ───────── */}
      <div
        className="relative z-10 flex flex-col items-center px-8 pt-8 pb-5 flex-shrink-0"
        style={{
          flex: hasImage ? '0 0 44%' : '1',
          justifyContent: hasImage ? 'flex-end' : 'center',
          minHeight: hasImage ? '44%' : undefined,
        }}
      >
        {/* Code + ornamental rule */}
        <div className="flex flex-col items-center mb-4">
          <span
            className="tracking-[0.3em] uppercase mb-2"
            style={{ fontSize: '10px', color: inkLight, opacity: 0.65 }}
          >
            {config.code}
          </span>
          <div className="flex items-center gap-3">
            <div style={{ width: '44px', height: '1px', backgroundColor: inkLight, opacity: 0.4 }} />
            <span style={{ color: inkLight, opacity: 0.55, fontSize: '14px' }}>✦</span>
            <div style={{ width: '44px', height: '1px', backgroundColor: inkLight, opacity: 0.4 }} />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-2xl font-bold text-center leading-snug mb-2"
          style={{ color: inkColor }}
        >
          {config.title}
        </h1>

        {config.subtitle && (
          <p
            className="italic text-sm text-center mb-3"
            style={{ color: inkMid, opacity: 0.75 }}
          >
            — {config.subtitle} —
          </p>
        )}

        {/* Closing ornament for no-image variant */}
        {!hasImage && (
          <div className="mt-7 flex items-center gap-3" style={{ opacity: 0.2 }}>
            <div style={{ width: '36px', height: '1px', backgroundColor: inkLight }} />
            <span style={{ color: inkLight, fontSize: '11px' }}>· · ·</span>
            <div style={{ width: '36px', height: '1px', backgroundColor: inkLight }} />
          </div>
        )}
      </div>

      {/* ── Actions (bottom) ─────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-2 px-8 pb-8 mt-auto flex-shrink-0" style={{ maxWidth: '240px', alignSelf: 'center' }}>
        {actions ?? (
          <DefaultActions
            type={type}
            inkColor={inkColor}
            inkLight={inkLight}
            hasImage={hasImage}
            error={error}
            showDetails={showDetails}
            onToggleDetails={() => setShowDetails(d => !d)}
          />
        )}
      </div>

      {/* 404 decorative corner mark */}
      {!hasImage && (
        <div
          className="absolute bottom-5 right-6 select-none pointer-events-none"
          style={{ fontFamily: 'Georgia, serif', color: '#8a6040', opacity: 0.15, fontSize: '88px', fontWeight: 'bold', lineHeight: 1 }}
        >
          ?
        </div>
      )}
    </div>
  );
}

function DefaultActions({ type, inkColor, inkLight, hasImage, error, showDetails, onToggleDetails }) {
  const primaryStyle = {
    fontFamily: 'Georgia, serif',
    fontSize: '13px',
    backgroundColor: hasImage ? 'rgba(30, 14, 4, 0.72)' : 'rgba(42, 20, 0, 0.72)',
    color: hasImage ? '#f2dfc0' : '#f5ead0',
    border: `1px solid ${hasImage ? 'rgba(30,14,4,0.35)' : 'rgba(90,48,8,0.35)'}`,
    borderRadius: '3px',
    padding: '7px 20px',
  };

  const secondaryStyle = {
    fontFamily: 'Georgia, serif',
    fontSize: '13px',
    backgroundColor: 'transparent',
    color: inkLight,
    border: `1px solid ${hasImage ? 'rgba(90,56,40,0.4)' : 'rgba(90,56,8,0.35)'}`,
    borderRadius: '3px',
    padding: '7px 20px',
    opacity: 0.8,
  };

  if (type === 'unexpected') {
    return (
      <>
        <div className="flex gap-2 w-full">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 flex items-center justify-center gap-2 transition-opacity hover:opacity-80 whitespace-nowrap"
            style={primaryStyle}
          >
            <RotateCcw size={13} />
            Neu laden
          </button>
          <button
            onClick={onToggleDetails}
            className="flex-shrink-0 flex items-center justify-center gap-1.5 transition-opacity hover:opacity-80 whitespace-nowrap"
            style={{ ...secondaryStyle, padding: '7px 12px' }}
          >
            Details
          </button>
        </div>

        {/* Modal */}
        {showDetails && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onToggleDetails}
          >
            <div
              className="relative w-full max-w-lg rounded-lg shadow-2xl overflow-hidden"
              style={{ backgroundColor: '#faf9f7', fontFamily: 'Georgia, serif' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(90,56,40,0.15)' }}>
                <h2 className="text-sm font-bold" style={{ color: inkColor }}>Technische Details</h2>
                <button onClick={onToggleDetails} className="transition-opacity hover:opacity-60" style={{ color: inkColor }}>
                  <X size={16} />
                </button>
              </div>
              <div className="p-5">
                <pre
                  className="text-xs font-mono overflow-auto max-h-64 leading-relaxed whitespace-pre-wrap"
                  style={{ color: inkColor }}
                >
                  {error ? error.stack ?? error.toString() : 'Keine weiteren Details verfügbar.'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (type === 'not-found') {
    return (
      <div className="flex gap-2 w-full">
        <a
          href="/"
          className="flex-1 flex items-center justify-center gap-1.5 transition-opacity hover:opacity-80"
          style={primaryStyle}
        >
          <Home size={13} />
          Startseite
        </a>
        <a
          href="/app"
          className="flex-1 flex items-center justify-center gap-1.5 transition-opacity hover:opacity-80"
          style={secondaryStyle}
        >
          <BookOpen size={13} />
          Leser
        </a>
      </div>
    );
  }

  return null;
}
