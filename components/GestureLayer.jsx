import { useCallback, useEffect, useRef, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { HeaderDrawer, FooterDrawer, RightDrawer, ReloadIndicator } from './GestureDrawers';
import DrawerIndicators from './DrawerIndicators';
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
 * Composes `useEnhancedGestures` with the three gesture drawers and coordinates
 * them with the left sidebar so that only ever one drawer is active. Publishes
 * a live drag offset back to the parent (for the sidebar) and down to the
 * right/header/footer drawers so each one follows the finger during a gesture.
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
  onSidebarDragOffsetChange,
}) {
  const [drawers, setDrawers] = useState({ header: false, footer: false, right: false });
  const [rightTab, setRightTab] = useState('toc');
  const [bookmarks, toggleBookmark] = useBookmarks();
  const [preview, setPreview] = useState(null);

  const anyGestureDrawerOpen = drawers.header || drawers.footer || drawers.right;

  // Mutual exclusion: if the sidebar opens, close any gesture drawer.
  useEffect(() => {
    if (menuOpen && anyGestureDrawerOpen) {
      setDrawers({ header: false, footer: false, right: false });
    }
  }, [menuOpen, anyGestureDrawerOpen]);

  // Cleanup side-effect for expanded sidebar.
  useEffect(() => {
    if (!menuOpen && sidebarExpanded) onSidebarExpandedChange?.(false);
  }, [menuOpen, sidebarExpanded, onSidebarExpandedChange]);

  const openOnly = (key) => {
    if (menuOpen) onMenuOpenChange?.(false);
    setDrawers({ header: false, footer: false, right: false, [key]: true });
  };
  const closeAll = useCallback(() => setDrawers({ header: false, footer: false, right: false }), []);
  const closeHeader = () => setDrawers((d) => ({ ...d, header: false }));
  const closeFooter = () => setDrawers((d) => ({ ...d, footer: false }));
  const closeRight  = () => setDrawers((d) => ({ ...d, right: false }));

  // Push sidebar drag offset up to the parent so SidebarV2 can render it.
  const lastSidebarOffset = useRef(0);
  useEffect(() => {
    const edge = preview?.edge;
    let offset = 0;
    if (edge === 'left') offset = Math.min(1, preview.progress);
    else if (edge === 'left-close') offset = -Math.min(1, preview.progress);
    if (offset !== lastSidebarOffset.current) {
      lastSidebarOffset.current = offset;
      onSidebarDragOffsetChange?.(offset);
    }
  }, [preview, onSidebarDragOffsetChange]);

  // Fire-and-forget clear when gesture ends.
  useEffect(() => {
    if (!preview && lastSidebarOffset.current !== 0) {
      lastSidebarOffset.current = 0;
      onSidebarDragOffsetChange?.(0);
    }
  }, [preview, onSidebarDragOffsetChange]);

  const { reloadProgress } = useEnhancedGestures({
    enabled,
    targetRef: readerAreaRef,
    sidebarOpen: menuOpen,
    onPreview: setPreview,
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

  // Live drag offsets for the three gesture drawers. Values are 0..1 progress.
  const edge = preview?.edge;
  const previewOffsets = {
    right:  edge === 'right'  ? Math.min(1, preview.progress) : 0,
    header: edge === 'top'    ? Math.min(1, preview.progress) : 0,
    footer: edge === 'bottom' ? Math.min(1, preview.progress) : 0,
  };

  return (
    <>
      <ReloadIndicator progress={reloadProgress} />
      <DrawerIndicators
        anyDrawerOpen={menuOpen || anyGestureDrawerOpen}
        activeEdge={edge}
        progress={preview?.progress ?? 0}
      />
      <HeaderDrawer
        open={drawers.header}
        onClose={closeHeader}
        dragProgress={!drawers.header ? previewOffsets.header : 0}
      >
        <HeaderDrawerContent onOpenTypography={onOpenTypography} onClose={closeHeader} />
      </HeaderDrawer>
      <FooterDrawer
        open={drawers.footer} onClose={closeFooter}
        totalPages={totalPages} currentPage={currentPage}
        onGoToPage={onGoToPage} storyTitle={selectedStory?.title}
        dragProgress={!drawers.footer ? previewOffsets.footer : 0}
      />
      <RightDrawer
        open={drawers.right} onClose={closeRight}
        activeTab={rightTab} onTabChange={setRightTab}
        pages={pages} currentPage={currentPage} onGoToPage={onGoToPage}
        bookmarks={bookmarks} onToggleBookmark={toggleBookmark}
        storyTitle={selectedStory?.title} pageText={pageText}
        dragProgress={!drawers.right ? previewOffsets.right : 0}
      />
    </>
  );
}
