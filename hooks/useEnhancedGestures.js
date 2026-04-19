import { useEffect, useRef, useState } from 'react';

const EDGE_PX = 40;
const MIN_DIST = 56;
const MAX_DT = 650;
const RELOAD_THRESHOLD = 0.6;

/**
 * Enhanced reader gestures.
 *
 * Detects single-finger swipes in four directions on a target element and
 * translates them into app-level intents. Pinch (2+ fingers) is ignored so
 * this coexists with `pinch-font-size`.
 *
 * Gesture vocabulary:
 *   swipe-down  from near the top edge   → open header drawer
 *   swipe-up    from near the bottom edge → open footer drawer
 *   swipe-down  long (>60% viewport)      → trigger reload
 *   swipe-left  from near the right edge → open right drawer
 *   swipe-right from near the left edge  → stepped sidebar open/expand
 *   swipe-left  anywhere (sidebar open)  → stepped sidebar collapse/close
 *
 * Returns a live progress channel (`reloadProgress` 0..1) so UI can show a
 * long-swipe reload indicator during an in-flight gesture.
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
} = {}) {
  const [reloadProgress, setReloadProgress] = useState(0);
  const stateRef = useRef(null);

  useEffect(() => {
    if (!enabled) { setReloadProgress(0); return undefined; }
    const target = targetRef?.current;
    if (!target) return undefined;

    const resetReload = () => {
      if (stateRef.current) stateRef.current.reloadArmed = false;
      setReloadProgress(0);
    };

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) {
        stateRef.current = null;
        setReloadProgress(0);
        return;
      }
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
      };
    };

    const onTouchMove = (e) => {
      const s = stateRef.current;
      if (!s) return;
      if (e.touches.length !== 1) { stateRef.current = null; setReloadProgress(0); return; }
      const t = e.touches[0];
      const dx = t.clientX - s.startX;
      const dy = t.clientY - s.startY;

      // Track long swipe-down reload progress once the gesture looks vertical.
      if (dy > MIN_DIST && Math.abs(dy) > Math.abs(dx) * 1.5 && s.fromTop === false) {
        const ratio = Math.max(0, Math.min(1, dy / s.rect.height));
        s.reloadArmed = ratio >= RELOAD_THRESHOLD;
        setReloadProgress(ratio);
      } else if (reloadProgress !== 0) {
        setReloadProgress(0);
      }
    };

    const onTouchEnd = (e) => {
      const s = stateRef.current;
      stateRef.current = null;
      if (!s) { setReloadProgress(0); return; }
      const t = (e.changedTouches && e.changedTouches[0]) || null;
      if (!t) { setReloadProgress(0); return; }
      const dx = t.clientX - s.startX;
      const dy = t.clientY - s.startY;
      const dt = Date.now() - s.startTime;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Long-swipe reload — priority over the regular direction dispatch.
      if (s.reloadArmed && dy > 0 && absDy > absDx) {
        resetReload();
        onReload?.();
        return;
      }
      setReloadProgress(0);

      if (dt > MAX_DT && absDx < MIN_DIST * 2 && absDy < MIN_DIST * 2) return;
      const horizontal = absDx > absDy;

      if (horizontal) {
        if (absDx < MIN_DIST) return;
        if (dx > 0) {
          // swipe right — always dispatch; parent handles edge preference.
          onSwipeRight?.({ fromLeftEdge: s.fromLeft });
        } else {
          if (s.fromRight) onSwipeLeftRight?.();
          else onSwipeLeft?.();
        }
      } else {
        if (absDy < MIN_DIST) return;
        if (dy < 0) {
          if (s.fromBottom) onSwipeUpBottom?.();
        } else {
          if (s.fromTop) onSwipeDownTop?.();
        }
      }
    };

    const onTouchCancel = () => { stateRef.current = null; setReloadProgress(0); };

    target.addEventListener('touchstart', onTouchStart, { passive: true });
    target.addEventListener('touchmove', onTouchMove, { passive: true });
    target.addEventListener('touchend', onTouchEnd, { passive: true });
    target.addEventListener('touchcancel', onTouchCancel, { passive: true });
    return () => {
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchmove', onTouchMove);
      target.removeEventListener('touchend', onTouchEnd);
      target.removeEventListener('touchcancel', onTouchCancel);
    };
    // Re-register when callbacks change so closures see the latest handlers.
  }, [enabled, targetRef, onSwipeDownTop, onSwipeUpBottom, onSwipeLeftRight, onSwipeRight, onSwipeLeft, onReload]); // eslint-disable-line react-hooks/exhaustive-deps

  return { reloadProgress };
}
