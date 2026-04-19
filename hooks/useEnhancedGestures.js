import { useEffect, useRef, useState } from 'react';

const EDGE_PX = 44;
const MIN_DIST = 40;
const MIN_VELOCITY = 0.35; // px/ms — fast flicks commit on shorter travel
const MIN_FLICK_DIST = 24;
const MAX_DT = 600;
const RELOAD_THRESHOLD = 0.6;
const DRAG_GRACE = 10; // px — ignore tiny jitter before treating as a drag

/**
 * Enhanced reader gestures.
 *
 * Listens at the window level so touches on any overlay (sidebar, drawers)
 * also dispatch, and uses `targetRef`'s bounding rect purely to decide which
 * edge a gesture started from. Pinch (2+ fingers) is ignored so this coexists
 * with `pinch-font-size`.
 *
 * Gesture vocabulary:
 *   swipe-down  from near the top edge    → open header drawer
 *   swipe-up    from near the bottom edge → open footer drawer
 *   swipe-down  long (>60% viewport)      → trigger reload
 *   swipe-left  from near the right edge  → open right drawer
 *   swipe-right from near the left edge   → open sidebar / expand
 *   swipe-left  anywhere (sidebar open)   → close sidebar
 *
 * Callback `onPreview({ edge, axis, dx, dy, distance, progress }|null)` fires
 * continuously while a gesture is in-flight so the UI can animate drawers
 * following the finger.
 *
 * Returns `{ reloadProgress }` — 0..1 channel for the pull-to-reload indicator.
 */
export function useEnhancedGestures({
  enabled,
  targetRef,
  onSwipeDownTop,
  onSwipeUpBottom,
  onSwipeLeftRight,
  onSwipeRight,
  onSwipeLeft,
  onReload,
  onPreview,
  sidebarOpen,
} = {}) {
  const [reloadProgress, setReloadProgress] = useState(0);
  const stateRef = useRef(null);
  const onPreviewRef = useRef(onPreview);
  const sidebarOpenRef = useRef(sidebarOpen);
  useEffect(() => { onPreviewRef.current = onPreview; }, [onPreview]);
  useEffect(() => { sidebarOpenRef.current = sidebarOpen; }, [sidebarOpen]);

  useEffect(() => {
    if (!enabled) {
      setReloadProgress(0);
      onPreviewRef.current?.(null);
      return undefined;
    }
    // Resolve the target fresh at each touchstart rather than closing over
    // it, so dynamic/fallback refs (e.g. reader-viewport when set, otherwise
    // main content area) are honoured when the user navigates between pages.
    const resolveTarget = () => targetRef?.current ?? null;

    const emitPreview = (p) => { onPreviewRef.current?.(p); };

    const resolveEdge = (s, dx, dy, absDx, absDy) => {
      // Only commit to an edge once we know the dominant axis.
      if (absDx < DRAG_GRACE && absDy < DRAG_GRACE) return null;
      const horizontal = absDx >= absDy;
      if (horizontal) {
        if (dx > 0 && s.fromLeft) return 'left';
        if (dx < 0 && s.fromRight) return 'right';
        if (dx < 0 && sidebarOpenRef.current) return 'left-close';
        return null;
      }
      if (dy > 0 && s.fromTop) return 'top';
      if (dy < 0 && s.fromBottom) return 'bottom';
      return null;
    };

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) {
        stateRef.current = null;
        setReloadProgress(0);
        emitPreview(null);
        return;
      }
      const target = resolveTarget();
      if (!target) { stateRef.current = null; return; }
      const t = e.touches[0];
      const rect = target.getBoundingClientRect();
      stateRef.current = {
        startX: t.clientX,
        startY: t.clientY,
        startTime: Date.now(),
        rect,
        fromTop: t.clientY - rect.top <= EDGE_PX,
        fromBottom: rect.bottom - t.clientY <= EDGE_PX,
        fromLeft: t.clientX - rect.left <= EDGE_PX,
        fromRight: rect.right - t.clientX <= EDGE_PX,
        reloadArmed: false,
        reloadRatio: 0,
        committedEdge: null,
      };
    };

    const onTouchMove = (e) => {
      const s = stateRef.current;
      if (!s) return;
      if (e.touches.length !== 1) {
        stateRef.current = null;
        setReloadProgress(0);
        emitPreview(null);
        return;
      }
      const t = e.touches[0];
      const dx = t.clientX - s.startX;
      const dy = t.clientY - s.startY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Long swipe-down reload tracking.
      if (dy > MIN_DIST && absDy > absDx * 1.5 && !s.fromTop) {
        const ratio = Math.max(0, Math.min(1, dy / s.rect.height));
        s.reloadArmed = ratio >= RELOAD_THRESHOLD;
        s.reloadRatio = ratio;
        setReloadProgress(ratio);
      } else if (s.reloadRatio !== 0) {
        s.reloadRatio = 0;
        setReloadProgress(0);
      }

      const edge = s.committedEdge ?? resolveEdge(s, dx, dy, absDx, absDy);
      if (edge && !s.committedEdge) s.committedEdge = edge;

      if (!edge) {
        emitPreview(null);
        return;
      }

      // Convert to a progress value per-edge in [0, 1].
      const w = s.rect.width || 1;
      const h = s.rect.height || 1;
      let distance = 0;
      let progress = 0;
      let axis = 'x';
      if (edge === 'left') { distance = Math.max(0, dx); progress = Math.min(1, distance / (w * 0.35)); }
      else if (edge === 'right') { distance = Math.max(0, -dx); progress = Math.min(1, distance / (w * 0.35)); }
      else if (edge === 'left-close') { distance = Math.max(0, -dx); progress = Math.min(1, distance / (w * 0.35)); }
      else if (edge === 'top') { distance = Math.max(0, dy); progress = Math.min(1, distance / (h * 0.25)); axis = 'y'; }
      else if (edge === 'bottom') { distance = Math.max(0, -dy); progress = Math.min(1, distance / (h * 0.25)); axis = 'y'; }

      emitPreview({ edge, axis, dx, dy, distance, progress });
    };

    const dispatch = (s, dx, dy) => {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const dt = Math.max(1, Date.now() - s.startTime);
      const velX = absDx / dt;
      const velY = absDy / dt;

      // Long-swipe reload takes priority.
      if (s.reloadArmed && dy > 0 && absDy > absDx) {
        s.reloadArmed = false;
        setReloadProgress(0);
        onReload?.();
        return;
      }

      const horizontal = absDx > absDy;
      const distGateH = absDx >= MIN_DIST || (absDx >= MIN_FLICK_DIST && velX >= MIN_VELOCITY);
      const distGateV = absDy >= MIN_DIST || (absDy >= MIN_FLICK_DIST && velY >= MIN_VELOCITY);

      if (horizontal) {
        if (!distGateH) return;
        if (dx > 0) onSwipeRight?.({ fromLeftEdge: s.fromLeft });
        else if (s.fromRight) onSwipeLeftRight?.();
        else onSwipeLeft?.();
      } else {
        if (!distGateV) return;
        if (dy < 0 && s.fromBottom) onSwipeUpBottom?.();
        else if (dy > 0 && s.fromTop) onSwipeDownTop?.();
      }
    };

    const onTouchEnd = (e) => {
      const s = stateRef.current;
      stateRef.current = null;
      emitPreview(null);
      if (!s) { setReloadProgress(0); return; }
      const t = (e.changedTouches && e.changedTouches[0]) || null;
      if (!t) { setReloadProgress(0); return; }
      const dx = t.clientX - s.startX;
      const dy = t.clientY - s.startY;
      setReloadProgress(0);
      if (Date.now() - s.startTime > MAX_DT && Math.abs(dx) < MIN_DIST * 2 && Math.abs(dy) < MIN_DIST * 2) return;
      dispatch(s, dx, dy);
    };

    const onTouchCancel = () => {
      stateRef.current = null;
      setReloadProgress(0);
      emitPreview(null);
    };

    // Listen on window so touches on the sidebar or drawers also reach us —
    // otherwise swipe-left from within the open sidebar couldn't close it
    // because the sidebar overlay sits above `target` in the stacking order.
    // `target` is still used above for the bounding rect (edge detection).
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchCancel, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchCancel);
    };
    // Re-register when callbacks change so closures see the latest handlers.
  }, [enabled, targetRef, onSwipeDownTop, onSwipeUpBottom, onSwipeLeftRight, onSwipeRight, onSwipeLeft, onReload]); // eslint-disable-line react-hooks/exhaustive-deps

  return { reloadProgress };
}
