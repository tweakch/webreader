import { useEffect } from 'react';
import { X, List, Search, Bookmark, Activity } from 'lucide-react';
import { cn } from '../ui/cn';
import { useTheme } from '../ui/ThemeContext';

const RIGHT_TABS = [
  { id: 'toc',      label: 'Inhalt',       Icon: List },
  { id: 'search',   label: 'Analyse',      Icon: Search },
  { id: 'bookmarks',label: 'Lesezeichen',  Icon: Bookmark },
  { id: 'research', label: 'Recherche',    Icon: Activity },
];

function analyzeText(pageText) {
  if (!pageText) return null;
  const words = pageText.trim().split(/\s+/).filter(Boolean);
  const sentences = pageText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgLen = words.length ? (words.reduce((a, w) => a + w.length, 0) / words.length).toFixed(1) : '0';
  return {
    words: words.length,
    sentences: sentences.length,
    avgWordLength: avgLen,
    readingSeconds: Math.round((words.length / 200) * 60),
  };
}

function previewPage(pages, i) {
  const page = pages[i];
  const firstWords = page.tokens.slice(0, 8).map((t) => t.word).join(' ');
  return { index: i, preview: firstWords, hasTitle: page.hasTitle };
}

/**
 * Right-side drawer. Mirrors the sidebar interaction: edge swipe opens,
 * swipe-away closes, backdrop dims the reader, and `dragProgress` (0..1)
 * makes the drawer follow the finger during an in-flight gesture.
 */
export default function RightDrawer({
  open,
  onClose,
  activeTab,
  onTabChange,
  pages,
  currentPage,
  onGoToPage,
  bookmarks,
  onToggleBookmark,
  storyTitle,
  pageText,
  dragProgress = 0,
}) {
  const { tc } = useTheme();
  const tab = activeTab ?? 'toc';
  const paraStarts = pages ? pages.map((_, i) => previewPage(pages, i)) : [];
  const analysisStats = analyzeText(pageText);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const dragging = !open && dragProgress > 0;
  const style = dragging
    ? { transform: `translateX(${(1 - dragProgress) * 100}%)`, transition: 'none' }
    : undefined;

  const backdropVisible = open || dragging;
  const backdropOpacity = open ? 0.3 : Math.min(0.3, dragProgress * 0.3);

  return (
    <>
      {backdropVisible && (
        <button
          aria-label="Drawer schließen"
          data-testid="gesture-right-drawer-backdrop"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black backdrop-blur-[2px]"
          style={{ opacity: backdropOpacity, transition: dragging ? 'none' : 'opacity 200ms ease-out' }}
        />
      )}
      <div
        data-testid="gesture-right-drawer"
        data-open={open ? 'true' : 'false'}
        aria-hidden={!open && !dragging}
        style={style}
        className={cn(
          'fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-50 border-l shadow-lg flex flex-col',
          dragging ? '' : 'transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
          tc({
            light:   'bg-white/95 border-amber-200 text-amber-900',
            dark:    'bg-slate-900/95 border-amber-700/40 text-amber-200',
            hcLight: 'bg-white border-black text-black',
            hcDark:  'bg-black border-white text-white',
          })
        )}
      >
      <div className={cn('flex items-center justify-between px-4 py-3 border-b', tc({
        light: 'border-amber-200', dark: 'border-amber-700/40', hcLight: 'border-black', hcDark: 'border-white',
      }))}>
        <span className="text-sm font-medium truncate">{storyTitle ?? 'Lesemodul'}</span>
        <button
          onClick={onClose}
          aria-label="Schließen"
          data-testid="gesture-right-drawer-close"
          className="p-1 rounded hover:bg-black/10"
        >
          <X size={16} />
        </button>
      </div>

      <div className={cn('flex border-b', tc({
        light: 'border-amber-200', dark: 'border-amber-700/40', hcLight: 'border-black', hcDark: 'border-white',
      }))}>
        {RIGHT_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            data-testid={`gesture-right-tab-${id}`}
            onClick={() => onTabChange?.(id)}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 px-2 py-2 text-xs transition-colors',
              tab === id
                ? tc({ light: 'bg-amber-100 text-amber-900', dark: 'bg-slate-800 text-amber-200', hcLight: 'bg-black text-white', hcDark: 'bg-white text-black' })
                : 'opacity-70 hover:opacity-100'
            )}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 text-sm">
        {tab === 'toc' && (
          <ul className="space-y-1" data-testid="gesture-right-toc">
            {paraStarts.length === 0 && <li className="opacity-60">Kein Inhalt geladen.</li>}
            {paraStarts.map(({ index, preview, hasTitle }) => (
              <li key={index}>
                <button
                  onClick={() => { onGoToPage?.(index); onClose?.(); }}
                  className={cn(
                    'w-full text-left px-2 py-1.5 rounded transition-colors',
                    index === currentPage
                      ? tc({ light: 'bg-amber-200 text-amber-900', dark: 'bg-amber-900/40 text-amber-100', hcLight: 'bg-black text-white', hcDark: 'bg-white text-black' })
                      : 'hover:bg-black/5'
                  )}
                >
                  <span className="text-xs opacity-60 mr-2 tabular-nums">{index + 1}.</span>
                  {hasTitle ? <strong>{preview}</strong> : preview}
                  {preview && '…'}
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === 'search' && (
          <div className="space-y-3" data-testid="gesture-right-analysis">
            <div className="text-xs uppercase tracking-wider opacity-70">Aktuelle Seite</div>
            {analysisStats ? (
              <dl className="space-y-1">
                <div className="flex justify-between"><dt>Wörter</dt><dd className="tabular-nums">{analysisStats.words}</dd></div>
                <div className="flex justify-between"><dt>Sätze</dt><dd className="tabular-nums">{analysisStats.sentences}</dd></div>
                <div className="flex justify-between"><dt>Ø Wortlänge</dt><dd className="tabular-nums">{analysisStats.avgWordLength}</dd></div>
                <div className="flex justify-between"><dt>Lesedauer</dt><dd className="tabular-nums">~{analysisStats.readingSeconds}s</dd></div>
              </dl>
            ) : <p className="opacity-60">Keine Seite geladen.</p>}
          </div>
        )}

        {tab === 'bookmarks' && (
          <div data-testid="gesture-right-bookmarks">
            <button
              onClick={() => onToggleBookmark?.(currentPage)}
              className={cn(
                'w-full text-left px-3 py-2 rounded mb-3 text-sm transition-colors',
                bookmarks?.has(currentPage)
                  ? tc({ light: 'bg-amber-200', dark: 'bg-amber-900/40', hcLight: 'bg-black text-white', hcDark: 'bg-white text-black' })
                  : tc({ light: 'bg-amber-100 hover:bg-amber-200', dark: 'bg-slate-800 hover:bg-slate-700', hcLight: 'border border-black', hcDark: 'border border-white' })
              )}
            >
              {bookmarks?.has(currentPage) ? 'Lesezeichen entfernen' : `Seite ${currentPage + 1} merken`}
            </button>
            <ul className="space-y-1">
              {(!bookmarks || bookmarks.size === 0) && <li className="opacity-60">Noch keine Lesezeichen.</li>}
              {bookmarks && [...bookmarks].sort((a, b) => a - b).map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <button
                    onClick={() => { onGoToPage?.(p); onClose?.(); }}
                    className="flex-1 text-left px-2 py-1.5 rounded hover:bg-black/5"
                  >
                    Seite {p + 1}
                  </button>
                  <button
                    onClick={() => onToggleBookmark?.(p)}
                    aria-label="Lesezeichen entfernen"
                    className="p-1 rounded hover:bg-black/10 opacity-60 hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'research' && (
          <div data-testid="gesture-right-research" className="space-y-2">
            <p className="text-xs opacity-70">Recherche-Kurzbefehle für die aktuelle Geschichte:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Wikipedia',        url: `https://de.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(storyTitle ?? '')}` },
                { label: 'Duden',            url: `https://www.duden.de/suchen/dudenonline/${encodeURIComponent(storyTitle ?? '')}` },
                { label: 'Google Books',     url: `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(storyTitle ?? '')}` },
                { label: 'Projekt Gutenberg', url: `https://www.projekt-gutenberg.org/autoren/namen.html` },
              ].map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    'text-center px-2 py-2 rounded text-xs transition-colors',
                    tc({ light: 'bg-amber-100 hover:bg-amber-200', dark: 'bg-slate-800 hover:bg-slate-700', hcLight: 'border border-black hover:bg-gray-100', hcDark: 'border border-white hover:bg-white/10' })
                  )}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
