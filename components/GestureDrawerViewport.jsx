import { useCallback, useEffect, useRef, useState } from 'react';
import { HeaderDrawer, FooterDrawer, RightDrawer, ReloadIndicator } from './GestureDrawers';
import DrawerIndicators from './DrawerIndicators';
import { useEnhancedGestures } from '../hooks/useEnhancedGestures';
import { useGestureDrawers } from './GestureDrawerContext';

/**
 * GestureDrawerViewport
 *
 * The single gesture+drawer host for the app. It:
 *   - Attaches window-level touch listeners via `useEnhancedGestures`.
 *   - Coordinates mutual exclusion between the four edges and the sidebar.
 *   - Renders the three gesture drawer frames (header, footer, right) with
 *     whatever payload the current page registered via `GestureDrawerContext`.
 *
 * Semantics (mobile):
 *   - swipe from top                 → open header drawer (typography + profile)
 *   - long swipe down (past 60%)     → reload
 *   - swipe from bottom              → open footer drawer (page-aware context menu)
 *   - swipe from right               → open right drawer (reader tools)
 *   - swipe from left                → open sidebar / expand
 *   - swipe left (sidebar open)      → close sidebar
 *
 * Pages register content for a drawer by wrapping themselves or by using
 * `<GestureDrawerContent edge="…">` / `useGestureDrawerSlot`. A drawer whose
 * slot is empty will not be opened by a swipe (the gesture is a no-op).
 */
export default function GestureDrawerViewport({
  enabled,
  readerAreaRef,
  menuOpen,
  onMenuOpenChange,
  sidebarExpanded,
  onSidebarExpandedChange,
  onSidebarDragOffsetChange,
}) {
  const { slots, openEdge, openDrawer, closeDrawer } = useGestureDrawers();
  const [preview, setPreview] = useState(null);

  const anyGestureDrawerOpen = openEdge !== null;
  const slotsRef = useRef(slots);
  useEffect(() => { slotsRef.current = slots; }, [slots]);

  // Mutual exclusion: if the sidebar opens, close any gesture drawer.
  useEffect(() => {
    if (menuOpen && anyGestureDrawerOpen) closeDrawer();
  }, [menuOpen, anyGestureDrawerOpen, closeDrawer]);

  // Collapse any expanded sidebar state when the menu closes.
  useEffect(() => {
    if (!menuOpen && sidebarExpanded) onSidebarExpandedChange?.(false);
  }, [menuOpen, sidebarExpanded, onSidebarExpandedChange]);

  const openOnly = useCallback((edge) => {
    if (menuOpen) onMenuOpenChange?.(false);
    if (slotsRef.current[edge]) openDrawer(edge);
  }, [menuOpen, onMenuOpenChange, openDrawer]);

  // Publish sidebar drag offset (for the sidebar component to slide with the finger).
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

  const { reloadProgress } = useEnhancedGestures({
    enabled,
    targetRef: readerAreaRef,
    sidebarOpen: menuOpen,
    onPreview: setPreview,
    onSwipeDownTop: () => openOnly('header'),
    onSwipeUpBottom: () => openOnly('footer'),
    onSwipeLeftRight: () => openOnly('right'),
    onSwipeRight: () => {
      closeDrawer();
      if (!menuOpen) onMenuOpenChange?.(true);
      else if (!sidebarExpanded) onSidebarExpandedChange?.(true);
    },
    onSwipeLeft: () => {
      closeDrawer();
      if (sidebarExpanded) onSidebarExpandedChange?.(false);
      else if (menuOpen) onMenuOpenChange?.(false);
    },
    onReload: () => { window.location.reload(); },
  });

  const edge = preview?.edge;
  const previewOffsets = {
    right:  edge === 'right'  ? Math.min(1, preview.progress) : 0,
    header: edge === 'top'    ? Math.min(1, preview.progress) : 0,
    footer: edge === 'bottom' ? Math.min(1, preview.progress) : 0,
  };
  // Only show drag-follow preview when a slot is registered for that edge.
  const headerSlot = slots.header;
  const footerSlot = slots.footer;
  const rightSlot  = slots.right;

  return (
    <>
      <ReloadIndicator progress={reloadProgress} />
      <DrawerIndicators
        anyDrawerOpen={menuOpen || anyGestureDrawerOpen}
        activeEdge={edge}
        progress={preview?.progress ?? 0}
      />
      <HeaderDrawer
        open={openEdge === 'header'}
        onClose={closeDrawer}
        title={headerSlot?.title}
        dragProgress={openEdge === 'header' || !headerSlot ? 0 : previewOffsets.header}
      >
        {headerSlot?.content ?? null}
      </HeaderDrawer>
      <FooterDrawer
        open={openEdge === 'footer'}
        onClose={closeDrawer}
        title={footerSlot?.title}
        dragProgress={openEdge === 'footer' || !footerSlot ? 0 : previewOffsets.footer}
      >
        {footerSlot?.content ?? null}
      </FooterDrawer>
      <RightDrawer
        open={openEdge === 'right'}
        onClose={closeDrawer}
        title={rightSlot?.title}
        dragProgress={openEdge === 'right' || !rightSlot ? 0 : previewOffsets.right}
      >
        {rightSlot?.content ?? null}
      </RightDrawer>
    </>
  );
}
