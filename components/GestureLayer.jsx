import { useCallback, useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { HeaderDrawer, FooterDrawer, RightDrawer, ReloadIndicator } from './GestureDrawers';
import { useEnhancedGestures } from '../hooks/useEnhancedGestures';
import { cn } from '../ui/cn';
import { useTheme } from '../ui/ThemeContext';

function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('wr-bookmarks') ?? '[]')); }
    catch { return new Set(); }
  });
  useEffect(() => { localStorage.setItem('wr-bookmarks', JSON.stringify([...bookmarks])); }, [bookmarks]);
  const toggle = useCallback((page) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page); else next.add(page);
      return next;
    });
  }, []);
  return [bookmarks, toggle];
}

function HeaderDrawerContent({ onOpenTypography, onClose }) {
  const { tc } = useTheme();
  return (
    <button
      data-testid="gesture-header-open-typography"
      onClick={() => { onClose(); onOpenTypography?.(); }}
      className={cn(
        'w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm transition-colors',
        tc({
          light: 'bg-amber-100 text-amber-900 hover:bg-amber-200',
          dark: 'bg-slate-800 text-amber-200 hover:bg-slate-700',
          hcLight: 'border border-black',
          hcDark: 'border border-white',
        })
      )}
    >
      <SlidersHorizontal size={16} /> Typografie und Vorlesen
    </button>
  );
}

/**
 * Composes `useEnhancedGestures` with the three drawers, the reload
 * indicator, and the stepped sidebar logic (closed → open → expanded).
 * Owns drawer + bookmark state internally; grimm-reader only threads its
 * reader state and the sidebar open/expanded controlled pair.
 */
export default function GestureLayer({
  enabled,
  readerAreaRef,
  pages,
  currentPage,
  totalPages,
  onGoToPage,
  selectedStory,
  pageText,
  menuOpen,
  onMenuOpenChange,
  sidebarExpanded,
  onSidebarExpandedChange,
  onOpenTypography,
}) {
  const [drawers, setDrawers] = useState({ header: false, footer: false, right: false });
  const [rightTab, setRightTab] = useState('toc');
  const [bookmarks, toggleBookmark] = useBookmarks();
  useEffect(() => { if (!menuOpen && sidebarExpanded) onSidebarExpandedChange?.(false); }, [menuOpen, sidebarExpanded, onSidebarExpandedChange]);
  const openOnly = (key) => setDrawers({ header: false, footer: false, right: false, [key]: true });
  const closeAll = useCallback(() => setDrawers({ header: false, footer: false, right: false }), []);
  const closeHeader = () => setDrawers((d) => ({ ...d, header: false }));
  const closeFooter = () => setDrawers((d) => ({ ...d, footer: false }));
  const closeRight  = () => setDrawers((d) => ({ ...d, right: false }));

  const { reloadProgress } = useEnhancedGestures({
    enabled,
    targetRef: readerAreaRef,
    onSwipeDownTop: () => openOnly('header'),
    onSwipeUpBottom: () => openOnly('footer'),
    onSwipeLeftRight: () => openOnly('right'),
    onSwipeRight: () => {
      closeAll();
      if (!menuOpen) onMenuOpenChange?.(true);
      else if (!sidebarExpanded) onSidebarExpandedChange?.(true);
    },
    onSwipeLeft: () => {
      closeAll();
      if (sidebarExpanded) onSidebarExpandedChange?.(false);
      else if (menuOpen) onMenuOpenChange?.(false);
    },
    onReload: () => { window.location.reload(); },
  });

  return (
    <>
      <ReloadIndicator progress={reloadProgress} />
      <HeaderDrawer open={drawers.header} onClose={closeHeader}>
        <HeaderDrawerContent onOpenTypography={onOpenTypography} onClose={closeHeader} />
      </HeaderDrawer>
      <FooterDrawer
        open={drawers.footer} onClose={closeFooter}
        totalPages={totalPages} currentPage={currentPage}
        onGoToPage={onGoToPage} storyTitle={selectedStory?.title}
      />
      <RightDrawer
        open={drawers.right} onClose={closeRight}
        activeTab={rightTab} onTabChange={setRightTab}
        pages={pages} currentPage={currentPage} onGoToPage={onGoToPage}
        bookmarks={bookmarks} onToggleBookmark={toggleBookmark}
        storyTitle={selectedStory?.title} pageText={pageText}
      />
    </>
  );
}
