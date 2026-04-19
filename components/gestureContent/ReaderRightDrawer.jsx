import { useMemo, useState } from 'react';
import { cn } from '../../ui/cn';
import { X, Bookmark, BookmarkPlus } from 'lucide-react';
import { useTheme } from '../../ui/ThemeContext';
import { GestureDrawerContent, useGestureDrawers } from '../GestureDrawerContext';
import useBookmarks from '../../hooks/useBookmarks';

function previewPage(pages, i) {
  const page = pages[i];
  const firstWords = page.tokens.slice(0, 8).map((t) => t.word).join(' ');
  return { index: i, preview: firstWords, hasTitle: page.hasTitle };
}

function Toc({ pages, currentPage, onGoToPage, closeDrawer }) {
  const { tc } = useTheme();
  const items = pages ? pages.map((_, i) => previewPage(pages, i)) : [];
  return (
    <ul className="space-y-1" data-testid="gesture-right-toc">
      {items.length === 0 && <li className="opacity-60">Kein Inhalt geladen.</li>}
      {items.map(({ index, preview, hasTitle }) => (
        <li key={index}>
          <button
            onClick={() => { onGoToPage?.(index); closeDrawer(); }}
            className={cn(
              'w-full text-left px-2 py-1.5 rounded transition-colors',
              index === currentPage
                ? tc({ light: 'bg-amber-200 text-amber-900', dark: 'bg-amber-900/40 text-amber-100', hcLight: 'bg-black text-white', hcDark: 'bg-white text-black' })
                : 'hover:bg-black/5',
            )}
          >
            <span className="text-xs opacity-60 mr-2 tabular-nums">{index + 1}.</span>
            {hasTitle ? <strong>{preview}</strong> : preview}
            {preview && '…'}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Bookmarks({ bookmarks, currentPage, onToggleBookmark, onGoToPage, closeDrawer }) {
  const { tc } = useTheme();
  const isBookmarked = bookmarks?.has(currentPage);
  return (
    <div data-testid="gesture-right-bookmarks">
      <button
        onClick={() => onToggleBookmark?.(currentPage)}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-3 py-2 rounded mb-3 text-sm transition-colors',
          isBookmarked
            ? tc({ light: 'bg-amber-200', dark: 'bg-amber-900/40', hcLight: 'bg-black text-white', hcDark: 'bg-white text-black' })
            : tc({ light: 'bg-amber-100 hover:bg-amber-200', dark: 'bg-slate-800 hover:bg-slate-700', hcLight: 'border border-black', hcDark: 'border border-white' }),
        )}
      >
        {isBookmarked ? <Bookmark size={14} /> : <BookmarkPlus size={14} />}
        {isBookmarked ? 'Lesezeichen entfernen' : `Seite ${currentPage + 1} merken`}
      </button>
      <ul className="space-y-1">
        {(!bookmarks || bookmarks.size === 0) && <li className="opacity-60">Noch keine Lesezeichen.</li>}
        {bookmarks && [...bookmarks].sort((a, b) => a - b).map((p) => (
          <li key={p} className="flex items-center gap-2">
            <button
              onClick={() => { onGoToPage?.(p); closeDrawer(); }}
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
  );
}

function RightBody({ pages, currentPage, onGoToPage, closeDrawer, bookmarks, toggleBookmark }) {
  const { tc } = useTheme();
  const [tab, setTab] = useState('toc');
  return (
    <div>
      <div
        className={cn(
          'flex gap-1 mb-3 sticky top-0 pb-2',
          tc({ light: 'bg-white/95', dark: 'bg-slate-900/95', hcLight: 'bg-white', hcDark: 'bg-black' }),
        )}
      >
        {[
          { id: 'toc', label: 'Inhalt' },
          { id: 'bookmarks', label: 'Lesezeichen' },
        ].map(({ id, label }) => (
          <button
            key={id}
            data-testid={`gesture-right-tab-${id}`}
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 px-3 py-2 rounded text-xs transition-colors',
              tab === id
                ? tc({ light: 'bg-amber-200 text-amber-900', dark: 'bg-slate-700 text-amber-200', hcLight: 'bg-black text-white', hcDark: 'bg-white text-black' })
                : tc({ light: 'bg-amber-50 hover:bg-amber-100', dark: 'bg-slate-800 hover:bg-slate-700', hcLight: 'border border-black', hcDark: 'border border-white' }),
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'toc' && (
        <Toc pages={pages} currentPage={currentPage} onGoToPage={onGoToPage} closeDrawer={closeDrawer} />
      )}
      {tab === 'bookmarks' && (
        <Bookmarks
          bookmarks={bookmarks}
          currentPage={currentPage}
          onToggleBookmark={toggleBookmark}
          onGoToPage={onGoToPage}
          closeDrawer={closeDrawer}
        />
      )}
    </div>
  );
}

/**
 * Reader-context right drawer: TOC + bookmarks.
 * Uses a simple two-tab layout instead of the old four-tab panel so the
 * drawer stays focused on in-story navigation.
 */
export default function ReaderRightDrawer({ pages, currentPage, onGoToPage, storyTitle }) {
  const { closeDrawer } = useGestureDrawers();
  const [bookmarks, toggleBookmark] = useBookmarks();
  const node = useMemo(
    () => (
      <RightBody
        pages={pages}
        currentPage={currentPage}
        onGoToPage={onGoToPage}
        closeDrawer={closeDrawer}
        bookmarks={bookmarks}
        toggleBookmark={toggleBookmark}
      />
    ),
    [pages, currentPage, onGoToPage, closeDrawer, bookmarks, toggleBookmark],
  );
  return (
    <GestureDrawerContent edge="right" title={storyTitle ?? 'Lesemodul'}>
      {node}
    </GestureDrawerContent>
  );
}
