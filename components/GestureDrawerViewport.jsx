import { useCallback, useEffect, useRef, useState } from 'react';
import { EdgeDrawer, DrawerBackdrop, ReloadIndicator } from './GestureDrawers';
import DrawerIndicators from './DrawerIndicators';
import { useGestureDrawers } from './GestureDrawerContext';

/**
 * GestureDrawerViewport
 *
 * Single gesture+drawer host for the app. It:
 *   - Listens at the window level for pointer events and decides whether a
 *     pointerdown has started an edge drag (based on proximity to one of the
 *     four viewport edges and whether a drawer is registered there).
 *   - Drives the drawer transform directly on the DOM node during a drag for
 *     60fps follow, falling back to the CSS-driven open/close transition on
 *     release.
 *   - Commits a drag when progress ≥ COMMIT_RATIO OR velocity crosses
 *     VELOCITY_COMMIT.
 *   - A top-edge drag that passes RELOAD_RATIO of the viewport height triggers
 *     pull-to-reload (page reload by default, overridable via provider
 *     `onReload`).
 *
 * Left-edge gestures currently delegate to the sidebar component unless a
 * `left` drawer is registered (future extension). Sidebar close (swipe left
 * while menu open) is kept intact.
 */

const EDGE_ZONE = 44;           // px from edge to start a drag
const COMMIT_RATIO = 0.32;      // ratio of drawer size to commit-open
const VELOCITY_COMMIT = 0.55;   // px/ms — flick commits below COMMIT_RATIO
const RELOAD_RATIO = 0.55;      // top drag past this × viewport height = reload
const DRAG_GRACE = 8;           // px — ignore jitter before treating as drag
const DEFAULT_SIZE = { top: 320, right: 320, bottom: 280, left: 300 };
const EDGE_CLOSED_TRANSFORM = {
  top: 'translate3d(0, -100%, 0)',
  bottom: 'translate3d(0, 100%, 0)',
  left: 'translate3d(-100%, 0, 0)',
  right: 'translate3d(100%, 0, 0)',
};

function sizeOf(edge, slot) {
  if (slot?.size) return slot.size;
  return DEFAULT_SIZE[edge];
}

export default function GestureDrawerViewport({
  enabled,
  readerAreaRef,
  menuOpen,
  onMenuOpenChange,
  sidebarExpanded,
  onSidebarExpandedChange,
  onSidebarDragOffsetChange,
}) {
  const { slots, openEdge, openDrawer, closeDrawer, onReload } = useGestureDrawers();

  const [preview, setPreview] = useState(null);
  const [reloadProgress, setReloadProgress] = useState(0);

  const drawerRefs = useRef({});
  const backdropRef = useRef(null);
  const dragRef = useRef(null);

  const anyGestureDrawerOpen = openEdge !== null;

  // Mutual exclusion: if the sidebar opens, close any gesture drawer.
  useEffect(() => {
    if (menuOpen && anyGestureDrawerOpen) closeDrawer();
  }, [menuOpen, anyGestureDrawerOpen, closeDrawer]);

  // Collapse any expanded sidebar state when the menu closes.
  useEffect(() => {
    if (!menuOpen && sidebarExpanded) onSidebarExpandedChange?.(false);
  }, [menuOpen, sidebarExpanded, onSidebarExpandedChange]);

  // Publish sidebar drag offset (for the sidebar component to slide with the
  // finger). `left` = opening, `left-close` = closing.
  const lastSidebarOffset = useRef(0);
  useEffect(() => {
    const edge = preview?.edge;
    let offset = 0;
    if (edge === 'left-open') offset = Math.min(1, preview.progress);
    else if (edge === 'left-close') offset = -Math.min(1, preview.progress);
    if (offset !== lastSidebarOffset.current) {
      lastSidebarOffset.current = offset;
      onSidebarDragOffsetChange?.(offset);
    }
  }, [preview, onSidebarDragOffsetChange]);

  // ---------- pointer gesture ----------

  // Edge detection uses the viewport (window) bounds so gestures originating
  // above the reader area (e.g. near the top of the browser chrome) still
  // register as a top-edge swipe. The readerAreaRef is only consulted for
  // reload-ratio reference (reader-height-aware pull-to-reload).
  const resolveBounds = useCallback(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1;
    const el = readerAreaRef?.current;
    const rect = el
      ? el.getBoundingClientRect()
      : { top: 0, height: vh };
    return { vw, vh, rect };
  }, [readerAreaRef]);

  const applyDragTransform = useCallback((edge, dx, dy, size, height) => {
    const drawerEl = drawerRefs.current[edge];
    if (!drawerEl) return 0;
    let progress = 0;
    let transform = '';

    if (edge === 'top') {
      const travel = Math.max(0, dy);
      progress = Math.min(1, travel / size);
      const offset = -size + Math.min(travel, size);
      const overshoot = Math.max(0, travel - size);
      const pull = overshoot > 0 ? Math.pow(overshoot, 0.7) * 0.6 : 0;
      transform = `translate3d(0, ${offset + pull}px, 0)`;
      const ratio = Math.max(0, Math.min(1, travel / height));
      setReloadProgress(ratio);
    } else if (edge === 'bottom') {
      const travel = Math.max(0, -dy);
      progress = Math.min(1, travel / size);
      const offset = size - Math.min(travel, size);
      const overshoot = Math.max(0, travel - size);
      const pull = overshoot > 0 ? Math.pow(overshoot, 0.7) * 0.6 : 0;
      transform = `translate3d(0, ${offset - pull}px, 0)`;
    } else if (edge === 'left') {
      const travel = Math.max(0, dx);
      progress = Math.min(1, travel / size);
      const offset = -size + Math.min(travel, size);
      transform = `translate3d(${offset}px, 0, 0)`;
    } else if (edge === 'right') {
      const travel = Math.max(0, -dx);
      progress = Math.min(1, travel / size);
      const offset = size - Math.min(travel, size);
      transform = `translate3d(${offset}px, 0, 0)`;
    }

    drawerEl.style.transition = 'none';
    drawerEl.style.transform = transform;
    if (backdropRef.current) {
      backdropRef.current.style.transition = 'none';
      backdropRef.current.style.opacity = String(progress * 0.3);
      backdropRef.current.style.pointerEvents = progress > 0.05 ? 'auto' : 'none';
    }
    return progress;
  }, []);

  const commitOrReset = useCallback((d, finalProgress) => {
    const drawerEl = drawerRefs.current[d.edge];
    if (!drawerEl) return;

    drawerEl.style.transition = 'transform 320ms cubic-bezier(0.32, 0.72, 0.36, 1)';
    if (backdropRef.current) backdropRef.current.style.transition = 'opacity 320ms ease-out';

    const velocityCommit = Math.abs(d.velocity) > VELOCITY_COMMIT && d.velocity * d.direction > 0;
    const shouldOpen = finalProgress > COMMIT_RATIO || velocityCommit;

    if (shouldOpen) {
      // Close sidebar first so the mutual-exclusion effect doesn't
      // immediately bounce our open call.
      if (menuOpen) onMenuOpenChange?.(false);
      drawerEl.style.transform = 'translate3d(0, 0, 0)';
      if (backdropRef.current) {
        backdropRef.current.style.opacity = '0.3';
        backdropRef.current.style.pointerEvents = 'auto';
      }
      openDrawer(d.edge);
    } else {
      drawerEl.style.transform = EDGE_CLOSED_TRANSFORM[d.edge] ?? '';
      if (backdropRef.current) {
        backdropRef.current.style.opacity = '0';
        backdropRef.current.style.pointerEvents = 'none';
      }
    }
  }, [openDrawer, menuOpen, onMenuOpenChange]);

  const triggerReload = useCallback(() => {
    setReloadProgress(0);
    if (typeof onReload === 'function') onReload();
    else if (typeof window !== 'undefined') window.location.reload();
  }, [onReload]);

  // Window pointerdown — decide whether a drag starts at all.
  useEffect(() => {
    if (!enabled) { setPreview(null); setReloadProgress(0); return undefined; }
    if (typeof window === 'undefined') return undefined;

    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (dragRef.current) return;
      if (anyGestureDrawerOpen) return; // drawer is open — backdrop/Esc closes it

      const { vw, vh, rect } = resolveBounds();
      const x = e.clientX;
      const y = e.clientY;

      // Edge detection is relative to the reader rect so a gesture from inside
      // the reader that's within EDGE_ZONE of its top/bottom/left/right counts
      // as an edge-start. Negative deltas (touch above/below/outside the rect)
      // are also accepted so the browser-chrome edge is covered.
      const dTop = y - rect.top;
      const dBottom = rect.bottom - y;
      const dLeft = x - rect.left;
      const dRight = rect.right - x;
      let edge = null;
      if (dTop <= EDGE_ZONE && slots.top) edge = 'top';
      else if (dBottom <= EDGE_ZONE && slots.bottom) edge = 'bottom';
      else if (dLeft <= EDGE_ZONE && slots.left) edge = 'left';
      else if (dRight <= EDGE_ZONE && slots.right) edge = 'right';

      // Fallback: left-edge → sidebar open (legacy behavior), unless a `left`
      // slot is registered (handled above).
      let kind = 'drawer';
      if (!edge && dLeft <= EDGE_ZONE && !menuOpen) { edge = 'left-open'; kind = 'sidebar'; }
      // Sidebar-close drag: left-swipe anywhere while menu is open.
      else if (!edge && menuOpen) { edge = 'left-close'; kind = 'sidebar'; }

      if (!edge) return;

      dragRef.current = {
        active: true,
        kind,
        edge,
        pointerId: e.pointerId,
        startX: x,
        startY: y,
        lastX: x,
        lastY: y,
        lastT: performance.now(),
        velocity: 0,
        direction: edge === 'top' || edge === 'bottom' ? (edge === 'top' ? 1 : -1)
                 : edge === 'left' || edge === 'left-open' ? 1
                 : -1,
        vw, vh,
        readerHeight: rect.height || vh,
        size: kind === 'drawer' ? sizeOf(edge, slots[edge]) : Math.min(320, vw * 0.75),
        progress: 0,
        committedAxis: false,
      };
    };

    const onPointerMove = (e) => {
      const d = dragRef.current;
      if (!d || !d.active || e.pointerId !== d.pointerId) return;

      const x = e.clientX;
      const y = e.clientY;
      const now = performance.now();
      const dt = Math.max(1, now - d.lastT);
      const vx = (x - d.lastX) / dt;
      const vy = (y - d.lastY) / dt;
      d.velocity = (d.edge === 'top' || d.edge === 'bottom') ? vy : vx;
      d.lastX = x; d.lastY = y; d.lastT = now;

      const dx = x - d.startX;
      const dy = y - d.startY;

      if (!d.committedAxis) {
        // Require enough travel before committing to an axis.
        if (Math.abs(dx) < DRAG_GRACE && Math.abs(dy) < DRAG_GRACE) return;
        const horizontal = Math.abs(dx) > Math.abs(dy);
        const axisOk =
          ((d.edge === 'top' || d.edge === 'bottom') && !horizontal) ||
          ((d.edge === 'left' || d.edge === 'right' || d.edge === 'left-open' || d.edge === 'left-close') && horizontal);
        if (!axisOk) { dragRef.current = null; return; }
        d.committedAxis = true;
      }

      if (d.kind === 'drawer') {
        const progress = applyDragTransform(d.edge, dx, dy, d.size, d.readerHeight);
        d.progress = progress;
        setPreview({ edge: d.edge, progress });
      } else {
        // Sidebar drag-follow: report progress via preview state.
        let progress = 0;
        if (d.edge === 'left-open') progress = Math.min(1, Math.max(0, dx) / d.size);
        else if (d.edge === 'left-close') progress = Math.min(1, Math.max(0, -dx) / d.size);
        d.progress = progress;
        setPreview({ edge: d.edge, progress });
      }
    };

    const endDrag = (d) => {
      dragRef.current = null;
      setPreview(null);

      if (d.kind === 'drawer') {
        // Reload intent: top-edge drag past RELOAD_RATIO of viewport height.
        if (d.edge === 'top') {
          const dy = d.lastY - d.startY;
          if (dy > d.readerHeight * RELOAD_RATIO) {
            const drawerEl = drawerRefs.current[d.edge];
            if (drawerEl) {
              drawerEl.style.transition = 'transform 400ms cubic-bezier(0.32, 0.72, 0.36, 1)';
              drawerEl.style.transform = '';
            }
            if (backdropRef.current) {
              backdropRef.current.style.transition = 'opacity 300ms ease-out';
              backdropRef.current.style.opacity = '0';
              backdropRef.current.style.pointerEvents = 'none';
            }
            triggerReload();
            return;
          }
          setReloadProgress(0);
        }
        commitOrReset(d, d.progress);
      } else {
        // Sidebar commit by ratio or velocity.
        const velocityCommit = Math.abs(d.velocity) > VELOCITY_COMMIT;
        const shouldToggle = d.progress > COMMIT_RATIO || velocityCommit;
        if (shouldToggle) {
          if (d.edge === 'left-open') onMenuOpenChange?.(true);
          else if (d.edge === 'left-close') onMenuOpenChange?.(false);
        }
        // Clear the drag offset so the sidebar settles.
        onSidebarDragOffsetChange?.(0);
      }
    };

    const onPointerUp = (e) => {
      const d = dragRef.current;
      if (!d || !d.active || e.pointerId !== d.pointerId) return;
      endDrag(d);
    };

    const onPointerCancel = (e) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.pointerId) return;
      // Reset without committing.
      dragRef.current = null;
      setPreview(null);
      setReloadProgress(0);
      if (d.kind === 'drawer') {
        commitOrReset(d, 0);
      } else {
        onSidebarDragOffsetChange?.(0);
      }
    };

    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [enabled, slots, anyGestureDrawerOpen, menuOpen, resolveBounds, applyDragTransform, commitOrReset, triggerReload, onMenuOpenChange, onSidebarDragOffsetChange]);

  // ---------- render ----------

  const edges = ['top', 'bottom', 'left', 'right'];

  return (
    <>
      <ReloadIndicator progress={reloadProgress} />
      <DrawerIndicators
        anyDrawerOpen={menuOpen || anyGestureDrawerOpen}
        activeEdge={preview?.edge === 'left-open' || preview?.edge === 'left-close' ? 'left' : preview?.edge}
        progress={preview?.progress ?? 0}
      />
      <DrawerBackdrop
        ref={backdropRef}
        open={anyGestureDrawerOpen}
        onClose={closeDrawer}
      />
      {edges.map((edge) => {
        const slot = slots[edge];
        if (!slot) return null;
        return (
          <EdgeDrawer
            key={edge}
            ref={(el) => { drawerRefs.current[edge] = el; }}
            edge={edge}
            open={openEdge === edge}
            onClose={closeDrawer}
            title={slot.title}
            size={slot.size}
          >
            {slot.content ?? null}
          </EdgeDrawer>
        );
      })}
    </>
  );
}
