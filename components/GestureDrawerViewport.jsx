import { useCallback, useEffect, useRef, useState } from 'react';
import { EdgeDrawer, DrawerBackdrop, ReloadIndicator } from './GestureDrawers';
import DrawerIndicators from './DrawerIndicators';
import { useGestureDrawers } from './GestureDrawerContext';
import {
  CLOSE_AXIS,
  EDGE_CLOSED_TRANSFORM,
  EDGE_DIRECTION,
  computeCloseDragTransform,
  computeOpenDragTransform,
  edgeForSwipe,
  scrollableAncestorCanAbsorb,
  sizeOf,
} from './gestureDrawerHelpers';

/**
 * GestureDrawerViewport
 *
 * Single gesture+drawer host for the app. It:
 *   - Listens at the window level for pointer events. A pointerdown anywhere
 *     in the viewport can start a drag; the target edge is decided from the
 *     swipe direction once movement exceeds DRAG_GRACE (swipe right opens the
 *     left drawer, swipe down opens the top drawer, etc.).
 *   - While a drawer is open, a swipe *in that drawer's close direction*
 *     (top→up, bottom→down, left→left, right→right) progressively pulls the
 *     drawer closed, whether the swipe starts on the backdrop or on the
 *     drawer itself. Swipes in the opposite direction, or swipes that a
 *     scrollable ancestor inside the drawer can absorb, are left to native
 *     scroll / content handling.
 *   - Drives the drawer transform directly on the DOM node during a drag for
 *     60fps follow, falling back to the CSS-driven open/close transition on
 *     release.
 *   - Commits a drag when progress ≥ COMMIT_RATIO OR velocity crosses
 *     VELOCITY_COMMIT.
 *   - Pull-to-reload fires when a swipe-down that started near the top of the
 *     reader area exceeds RELOAD_RATIO × reader height.
 */

const RELOAD_EDGE_ZONE = 44;    // px from top edge that arms pull-to-reload
const COMMIT_RATIO = 0.32;      // ratio of drawer size to commit-open
const VELOCITY_COMMIT = 0.55;   // px/ms — flick commits below COMMIT_RATIO
const RELOAD_RATIO = 0.55;      // top drag past this × reader height = reload
const DRAG_GRACE = 8;           // px — ignore jitter before treating as drag

export default function GestureDrawerViewport({ enabled, readerAreaRef }) {
  const { slots, openEdge, openDrawer, closeDrawer, onReload } = useGestureDrawers();

  const [preview, setPreview] = useState(null);
  const [reloadProgress, setReloadProgress] = useState(0);

  const drawerRefs = useRef({});
  const backdropRef = useRef(null);
  const dragRef = useRef(null);

  const anyGestureDrawerOpen = openEdge !== null;

  // ---------- pointer gesture ----------

  // Edge detection uses the reader-area rect so a gesture from inside the
  // reader within EDGE_ZONE of its top/bottom/left/right counts as edge-start.
  // Negative deltas (touches above/below/outside the rect) are also accepted
  // so the browser-chrome edge area is covered.
  const resolveBounds = useCallback(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1;
    const el = readerAreaRef?.current;
    const rect = el
      ? el.getBoundingClientRect()
      : { top: 0, bottom: vh, left: 0, right: vw, width: vw, height: vh };
    return { vw, vh, rect };
  }, [readerAreaRef]);

  const applyOpenDragTransform = useCallback((edge, dx, dy, size, height) => {
    const drawerEl = drawerRefs.current[edge];
    if (!drawerEl) return 0;
    const { progress, transform, reloadRatio } =
      computeOpenDragTransform(edge, dx, dy, size, height);

    if (reloadRatio !== null) setReloadProgress(reloadRatio);
    drawerEl.style.transition = 'none';
    drawerEl.style.transform = transform;
    if (backdropRef.current) {
      backdropRef.current.style.transition = 'none';
      backdropRef.current.style.opacity = String(progress * 0.3);
      backdropRef.current.style.pointerEvents = progress > 0.05 ? 'auto' : 'none';
    }
    return progress;
  }, []);

  const applyCloseDragTransform = useCallback((edge, dx, dy, size) => {
    const drawerEl = drawerRefs.current[edge];
    if (!drawerEl) return 0;
    const { progress, transform } = computeCloseDragTransform(edge, dx, dy, size);

    drawerEl.style.transition = 'none';
    drawerEl.style.transform = transform;
    if (backdropRef.current) {
      backdropRef.current.style.transition = 'none';
      // Backdrop fades from 0.3 (open) to 0 (closed) as close-progress grows.
      backdropRef.current.style.opacity = String((1 - progress) * 0.3);
      backdropRef.current.style.pointerEvents = progress < 0.95 ? 'auto' : 'none';
    }
    return progress;
  }, []);

  const commitOrReset = useCallback((d, finalProgress) => {
    // A tap (pointerdown + pointerup with no qualifying move) ends here
    // without ever committing an axis. There is nothing to animate — leaving
    // the drawer's style alone preserves whatever state it had before the
    // tap (open drawers stay open, closed stay closed).
    if (!d.committedAxis || !d.mode) return;

    const drawerEl = drawerRefs.current[d.edge];
    if (!drawerEl) return;

    drawerEl.style.transition = 'transform 320ms cubic-bezier(0.32, 0.72, 0.36, 1)';
    if (backdropRef.current) backdropRef.current.style.transition = 'opacity 320ms ease-out';

    const velocityCommit = Math.abs(d.velocity) > VELOCITY_COMMIT && d.velocity * d.direction > 0;
    const shouldCommit = finalProgress > COMMIT_RATIO || velocityCommit;

    if (d.mode === 'close') {
      // Close-drag: committing means fully closing; aborting springs back open.
      if (shouldCommit) {
        drawerEl.style.transform = EDGE_CLOSED_TRANSFORM[d.edge] ?? '';
        if (backdropRef.current) {
          backdropRef.current.style.opacity = '0';
          backdropRef.current.style.pointerEvents = 'none';
        }
        closeDrawer();
      } else {
        drawerEl.style.transform = 'translate3d(0, 0, 0)';
        if (backdropRef.current) {
          backdropRef.current.style.opacity = '0.3';
          backdropRef.current.style.pointerEvents = 'auto';
        }
      }
      return;
    }

    // Open-drag: committing means fully opening; aborting snaps closed.
    if (shouldCommit) {
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
  }, [openDrawer, closeDrawer]);

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

      const { vw, vh, rect } = resolveBounds();
      const x = e.clientX;
      const y = e.clientY;

      // If a drawer is already open, figure out whether this pointerdown is
      // on the drawer itself (possible close-drag gated by direction + scroll
      // ancestor) or on the backdrop / uncovered viewport (close-drag also
      // possible, same rules — the progressive-close animation is consistent
      // whether you swipe on the drawer or the backdrop).
      let insideOpenDrawer = false;
      if (anyGestureDrawerOpen) {
        const openDrawerEl = drawerRefs.current[openEdge];
        if (openDrawerEl && e.target instanceof Node && openDrawerEl.contains(e.target)) {
          insideOpenDrawer = true;
        }
      }

      dragRef.current = {
        active: true,
        mode: null,              // 'open' | 'close' — decided on first move
        edge: anyGestureDrawerOpen ? openEdge : null,
        closeMode: anyGestureDrawerOpen,
        insideOpenDrawer,
        targetEl: e.target instanceof Element ? e.target : null,
        pointerId: e.pointerId,
        startX: x,
        startY: y,
        lastX: x,
        lastY: y,
        lastT: performance.now(),
        velocity: 0,
        direction: 0,
        vw, vh,
        readerHeight: rect.height || vh,
        startedNearTop: (y - rect.top) <= RELOAD_EDGE_ZONE,
        size: 0,
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
      d.lastX = x; d.lastY = y; d.lastT = now;

      const dx = x - d.startX;
      const dy = y - d.startY;

      if (!d.committedAxis) {
        if (Math.abs(dx) < DRAG_GRACE && Math.abs(dy) < DRAG_GRACE) return;

        // A drawer is already open: decide whether this is a close-drag.
        // Close-drag commits only if:
        //   (a) the dominant axis matches the drawer's close axis,
        //   (b) the finger is moving in the close-sign (e.g. up for top), and
        //   (c) no scrollable ancestor inside the drawer can absorb the move
        //       (so the internal story list can scroll without the drawer
        //       sliding closed underneath).
        if (d.closeMode) {
          const edge = d.edge;
          const closeAxis = CLOSE_AXIS[edge];
          if (!closeAxis) { dragRef.current = null; return; }
          const axisMatches = closeAxis.axis === 'y'
            ? Math.abs(dy) > Math.abs(dx)
            : Math.abs(dx) > Math.abs(dy);
          const signMatches = closeAxis.axis === 'y'
            ? Math.sign(dy) === closeAxis.sign
            : Math.sign(dx) === closeAxis.sign;
          if (!axisMatches || !signMatches) {
            // Wrong direction — abort so native handling (scroll, tap) wins.
            dragRef.current = null;
            return;
          }
          const openDrawerEl = drawerRefs.current[edge];
          if (d.insideOpenDrawer
              && scrollableAncestorCanAbsorb(d.targetEl, openDrawerEl, dx, dy)) {
            dragRef.current = null;
            return;
          }
          d.mode = 'close';
          d.direction = closeAxis.sign;
          d.size = sizeOf(edge, slots[edge]);
          d.committedAxis = true;
        } else {
          const edge = edgeForSwipe(dx, dy);
          if (!slots[edge]) { dragRef.current = null; return; }
          d.mode = 'open';
          d.edge = edge;
          d.direction = EDGE_DIRECTION[edge];
          d.size = sizeOf(edge, slots[edge]);
          d.committedAxis = true;
        }
      }

      d.velocity = (d.edge === 'top' || d.edge === 'bottom') ? vy : vx;

      const progress = d.mode === 'close'
        ? applyCloseDragTransform(d.edge, dx, dy, d.size)
        : applyOpenDragTransform(d.edge, dx, dy, d.size, d.readerHeight);
      d.progress = progress;
      setPreview({ edge: d.edge, progress });
    };

    const endDrag = (d) => {
      dragRef.current = null;
      setPreview(null);

      // Reload intent: swipe-down that armed near the top edge and crossed
      // RELOAD_RATIO of reader height. Only for open-drags on the top edge;
      // close-drags on the already-open top drawer never trigger reload.
      if (d.mode === 'open' && d.edge === 'top' && d.startedNearTop) {
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
    };

    const onPointerUp = (e) => {
      const d = dragRef.current;
      if (!d || !d.active || e.pointerId !== d.pointerId) return;
      endDrag(d);
    };

    const onPointerCancel = (e) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.pointerId) return;
      dragRef.current = null;
      setPreview(null);
      setReloadProgress(0);
      commitOrReset(d, 0);
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
  }, [enabled, slots, anyGestureDrawerOpen, openEdge, resolveBounds,
      applyOpenDragTransform, applyCloseDragTransform, commitOrReset,
      triggerReload, closeDrawer]);

  // ---------- render ----------

  const edges = ['top', 'bottom', 'left', 'right'];

  return (
    <>
      <ReloadIndicator progress={reloadProgress} />
      <DrawerIndicators
        anyDrawerOpen={anyGestureDrawerOpen}
        activeEdge={preview?.edge}
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
            chromeless={slot.chromeless}
          >
            {slot.content ?? null}
          </EdgeDrawer>
        );
      })}
    </>
  );
}
