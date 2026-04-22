import { useCallback, useEffect, useRef, useState } from 'react';
import { EdgeDrawer, DrawerBackdrop, ReloadIndicator } from './GestureDrawers';
import DrawerIndicators from './DrawerIndicators';
import { useGestureDrawers } from './GestureDrawerContext';
import { gestureLog, describeTarget } from '../src/lib/gestureLog';
import {
  CLOSE_AXIS,
  EDGE_CLOSED_TRANSFORM,
  EDGE_DIRECTION,
  axisDeviationRad,
  computeCloseDragTransform,
  computeOpenDragTransform,
  computeVelocity,
  createSampleBuffer,
  edgeForSwipe,
  projectCommit,
  pushSample,
  scrollableAncestorCanAbsorb,
  sizeOf,
} from './gestureDrawerHelpers';

/**
 * GestureDrawerViewport
 *
 * Single gesture+drawer host for the app. It:
 *   - Listens at the window level for pointer events. A drag "commits"
 *     to an axis once the pointer has travelled past MIN_DIST (anti-tap
 *     jitter guard) inside an angular cone around one cardinal axis.
 *     The drawer then follows the finger 1:1 so a slow deliberate pull
 *     shows live feedback instead of dead-zoning. `commitPath` keeps
 *     the old fast-path / slow-path labels for telemetry only. Release-
 *     time projection decides whether the drawer opens/closes or snaps
 *     back; click suppression only fires on an actual state change.
 *   - While a drawer is open, a swipe *in that drawer's close direction*
 *     (top→up, bottom→down, left→left, right→right) progressively pulls the
 *     drawer closed, whether the swipe starts on the backdrop or on the
 *     drawer itself. Swipes in the opposite direction, or swipes that a
 *     scrollable ancestor inside the drawer can absorb, are left to native
 *     scroll / content handling.
 *   - Drives the drawer transform directly on the DOM node during a drag for
 *     60fps follow, falling back to the CSS-driven open/close transition on
 *     release.
 *   - Commits at release via projection: forecasts where the drawer would
 *     rest if the aligned velocity decayed over `PROJECTION_MS` and commits
 *     once that forecast crosses half the drawer's size — the same model
 *     iOS uses for sheet detents.
 *   - Pull-to-reload fires when a swipe-down that started near the top of the
 *     reader area exceeds RELOAD_RATIO × reader height.
 */

const RELOAD_EDGE_ZONE = 44; // px from top edge that arms pull-to-reload
const RELOAD_RATIO = 0.55; // top drag past this × reader height = reload
// Gate thresholds are calibrated so that a natural tap (a few px of
// pointer roll between pointerdown and pointerup) does NOT commit to a
// swipe. Production logs showed taps with dx≈2px committing the slow
// path, hijacking tap-zone-middle taps into drawer opens. MIN_DIST at
// 8 covers normal tap jitter; FALLBACK_DIST at 16 aligns with the
// Material tap-slop convention for "this was a deliberate drag."
const MIN_DIST = 8; // px — minimum travel before any gate fires
const FALLBACK_DIST = 16; // px — slow-deliberate commit without velocity
const MIN_VELOCITY = 0.15; // px/ms — fast-path velocity threshold
const ANGLE_CONE_RAD = (35 * Math.PI) / 180; // ±35° cone around a cardinal axis
const PROJECTION_MS = 180; // ms — release-time forecast window
const COMMIT_PROJECTION_RATIO = 0.5; // projected progress ≥ this → commit
const STALE_DRAG_MS = 1500; // ms with no pointer events → assume stuck drag

export default function GestureDrawerViewport({ enabled, readerAreaRef }) {
  const { slots, openEdge, openDrawer, closeDrawer, onReload } = useGestureDrawers();

  const [preview, setPreview] = useState(null);
  const [reloadProgress, setReloadProgress] = useState(0);

  const drawerRefs = useRef({});
  const backdropRef = useRef(null);
  const dragRef = useRef(null);
  // Slots change identity on every parent render (React children aren't
  // memoized at the boundary), but the *set of edges that have a slot* is
  // what the pointer handlers actually read. Track a stable shape string
  // for the effect dep and a ref for the live payload — this stops the
  // pointer listeners from being torn down and re-installed each render,
  // which was cutting gestures mid-drag.
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  const slotShape =
    `${slots.top ? '1' : '0'}${slots.bottom ? '1' : '0'}` +
    `${slots.left ? '1' : '0'}${slots.right ? '1' : '0'}`;

  // `openEdge` is also read inside pointerdown to decide close-vs-open
  // mode. Reading via a ref keeps the pointer listeners stable across
  // drawer open/close cycles — which otherwise would tear down the
  // listeners at the exact moment a user is starting their next gesture.
  const openEdgeRef = useRef(openEdge);
  openEdgeRef.current = openEdge;

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

  const applyOpenDragTransform = useCallback((edge, dx, dy, size, height, noBackdrop) => {
    const drawerEl = drawerRefs.current[edge];
    if (!drawerEl) return 0;
    const { progress, transform, reloadRatio } = computeOpenDragTransform(
      edge,
      dx,
      dy,
      size,
      height
    );

    if (reloadRatio !== null) setReloadProgress(reloadRatio);
    drawerEl.style.transition = 'none';
    drawerEl.style.transform = transform;
    if (backdropRef.current && !noBackdrop) {
      backdropRef.current.style.transition = 'none';
      backdropRef.current.style.opacity = String(progress * 0.3);
      backdropRef.current.style.pointerEvents = progress > 0.05 ? 'auto' : 'none';
    }
    return progress;
  }, []);

  const applyCloseDragTransform = useCallback((edge, dx, dy, size, noBackdrop) => {
    const drawerEl = drawerRefs.current[edge];
    if (!drawerEl) return 0;
    const { progress, transform } = computeCloseDragTransform(edge, dx, dy, size);

    drawerEl.style.transition = 'none';
    drawerEl.style.transform = transform;
    if (backdropRef.current && !noBackdrop) {
      backdropRef.current.style.transition = 'none';
      // Backdrop fades from 0.3 (open) to 0 (closed) as close-progress grows.
      backdropRef.current.style.opacity = String((1 - progress) * 0.3);
      backdropRef.current.style.pointerEvents = progress < 0.95 ? 'auto' : 'none';
    }
    return progress;
  }, []);

  // After a committed drag the browser still dispatches a `click` on the
  // original pointerdown target; without this, a drag-to-open on a button
  // also fires the button handler. 400ms safety timeout removes the
  // listener if no click ever follows.
  const suppressNextClick = useCallback(() => {
    if (typeof window === 'undefined') return;
    const suppress = (e) => {
      gestureLog('gesture.click-suppressed', { target: describeTarget(e.target) });
      e.preventDefault();
      e.stopPropagation();
      window.removeEventListener('click', suppress, true);
    };
    window.addEventListener('click', suppress, true);
    setTimeout(() => window.removeEventListener('click', suppress, true), 400);
  }, []);

  const commitOrReset = useCallback(
    (d, finalProgress) => {
      // A tap (pointerdown + pointerup with no qualifying move) ends here
      // without ever committing an axis. There is nothing to animate — leaving
      // the drawer's style alone preserves whatever state it had before the
      // tap (open drawers stay open, closed stay closed).
      if (!d.committedAxis || !d.mode) return;

      const drawerEl = drawerRefs.current[d.edge];
      if (!drawerEl) return;

      drawerEl.style.transition = 'transform var(--motion-md) var(--motion-ease-standard)';
      if (backdropRef.current)
        backdropRef.current.style.transition =
          'opacity var(--motion-md) var(--motion-ease-standard)';

      // Projection-based commit: forecast where the drawer would come to rest
      // if the velocity aligned with the commit direction decayed over
      // PROJECTION_MS, and commit if the forecast crosses half of the drawer's
      // size. `finalProgress` and `d.direction` are already oriented toward
      // the commit outcome for both modes — open-drag "commits" by opening,
      // close-drag "commits" by closing — so one formula covers both. A mild
      // flick that's only 20% through still commits if the projection reaches
      // the halfway line. Matches the iOS sheet-detent / Material fling model.
      const aligned = (d.velocity ?? 0) * (d.direction ?? 1);
      const shouldCommit = projectCommit({
        travel: finalProgress * d.size,
        aligned,
        size: d.size,
        projectionMs: PROJECTION_MS,
        ratio: COMMIT_PROJECTION_RATIO,
      });

      // `noBackdrop` slots keep the global backdrop dormant even when open.
      const writeBackdrop = backdropRef.current && !d.noBackdrop;

      if (d.mode === 'close') {
        if (shouldCommit) {
          drawerEl.style.transform = EDGE_CLOSED_TRANSFORM[d.edge] ?? '';
          if (writeBackdrop) {
            backdropRef.current.style.opacity = '0';
            backdropRef.current.style.pointerEvents = 'none';
          }
          closeDrawer('gesture');
          suppressNextClick();
        } else {
          drawerEl.style.transform = 'translate3d(0, 0, 0)';
          if (writeBackdrop) {
            backdropRef.current.style.opacity = '0.3';
            backdropRef.current.style.pointerEvents = 'auto';
          }
        }
        return;
      }

      if (shouldCommit) {
        drawerEl.style.transform = 'translate3d(0, 0, 0)';
        if (writeBackdrop) {
          backdropRef.current.style.opacity = '0.3';
          backdropRef.current.style.pointerEvents = 'auto';
        }
        openDrawer(d.edge, 'gesture');
        suppressNextClick();
      } else {
        drawerEl.style.transform = EDGE_CLOSED_TRANSFORM[d.edge] ?? '';
        if (writeBackdrop) {
          backdropRef.current.style.opacity = '0';
          backdropRef.current.style.pointerEvents = 'none';
        }
      }
    },
    [openDrawer, closeDrawer, suppressNextClick]
  );

  const triggerReload = useCallback(() => {
    setReloadProgress(0);
    if (typeof onReload === 'function') onReload();
    else if (typeof window !== 'undefined') window.location.reload();
  }, [onReload]);

  // Window pointerdown — decide whether a drag starts at all.
  useEffect(() => {
    if (!enabled) {
      setPreview(null);
      setReloadProgress(0);
      return undefined;
    }
    if (typeof window === 'undefined') return undefined;

    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      // Clear a stuck drag from a dropped pointerup/pointercancel. Without
      // this, a single dropped event locks all further drags until reload.
      const existing = dragRef.current;
      if (existing) {
        const age = performance.now() - (existing.lastT ?? 0);
        if (age > STALE_DRAG_MS) {
          gestureLog('gesture.stale-drag', { ageMs: Math.round(age) });
          dragRef.current = null;
        } else {
          return;
        }
      }

      const { vw, vh, rect } = resolveBounds();
      const x = e.clientX;
      const y = e.clientY;
      // Snapshot drawer state at pointerdown time so the rest of the drag
      // reads consistent values — the refs are live but we only need the
      // initial state to classify open-vs-close mode.
      const liveOpenEdge = openEdgeRef.current;
      const drawerOpen = liveOpenEdge !== null;

      // If a drawer is already open, figure out whether this pointerdown is
      // on the drawer itself (possible close-drag gated by direction + scroll
      // ancestor) or on the backdrop / uncovered viewport (close-drag also
      // possible, same rules — the progressive-close animation is consistent
      // whether you swipe on the drawer or the backdrop).
      let insideOpenDrawer = false;
      if (drawerOpen) {
        const openDrawerEl = drawerRefs.current[liveOpenEdge];
        if (openDrawerEl && e.target instanceof Node && openDrawerEl.contains(e.target)) {
          insideOpenDrawer = true;
        }
      }

      const now = performance.now();
      const samples = createSampleBuffer();
      pushSample(samples, x, y, now);
      dragRef.current = {
        active: true,
        mode: null, // 'open' | 'close' — decided on first move
        edge: drawerOpen ? liveOpenEdge : null,
        closeMode: drawerOpen,
        insideOpenDrawer,
        targetEl: e.target instanceof Element ? e.target : null,
        startTarget: describeTarget(e.target),
        pointerId: e.pointerId,
        pointerType: e.pointerType,
        startX: x,
        startY: y,
        lastX: x,
        lastY: y,
        lastT: now,
        samples,
        velocity: 0,
        direction: 0,
        vw,
        vh,
        readerHeight: rect.height || vh,
        startedNearTop: y - rect.top <= RELOAD_EDGE_ZONE,
        size: 0,
        progress: 0,
        committedAxis: false,
        peakDist: 0,
        peakSpeed: 0,
        peakDeviationRad: Math.PI / 2,
        moveCount: 0,
        touchMoveCount: 0,
        startT: now,
        endedBy: 'missing',
        commitPath: null, // 'fast' | 'slow'
        abortReason: null, // 'no-close-axis' | 'close-wrong-direction' | 'scroll-ancestor-absorb' | 'no-slot'
        openEdgeAtStart: liveOpenEdge,
      };
    };

    const onPointerMove = (e) => {
      const d = dragRef.current;
      if (!d || !d.active || e.pointerId !== d.pointerId) return;

      const x = e.clientX;
      const y = e.clientY;
      const now = performance.now();
      d.lastX = x;
      d.lastY = y;
      d.lastT = now;
      d.moveCount += 1;
      pushSample(d.samples, x, y, now);

      const dx = x - d.startX;
      const dy = y - d.startY;

      if (!d.committedAxis) {
        const dist = Math.hypot(dx, dy);
        if (dist > d.peakDist) d.peakDist = dist;
        if (dist < MIN_DIST) return;

        const { vx, vy } = computeVelocity(d.samples);
        const speed = Math.hypot(vx, vy);
        const deviation = axisDeviationRad(dx, dy);
        if (speed > d.peakSpeed) d.peakSpeed = speed;
        if (deviation < d.peakDeviationRad) d.peakDeviationRad = deviation;
        if (deviation > ANGLE_CONE_RAD) return;
        // Past MIN_DIST + axis-aligned: start following. fastPath/slowPath
        // are telemetry only now — projection decides commit on release.
        const fastPath = speed >= MIN_VELOCITY;
        const slowPath = dist >= FALLBACK_DIST;

        if (d.closeMode) {
          const edge = d.edge;
          const closeAxis = CLOSE_AXIS[edge];
          if (!closeAxis) {
            d.abortReason = 'no-close-axis';
            d.endedBy = 'gate-abort';
            endDrag(d);
            return;
          }
          const axisMatches =
            closeAxis.axis === 'y' ? Math.abs(dy) > Math.abs(dx) : Math.abs(dx) > Math.abs(dy);
          const signMatches =
            closeAxis.axis === 'y'
              ? Math.sign(dy) === closeAxis.sign
              : Math.sign(dx) === closeAxis.sign;
          if (!axisMatches || !signMatches) {
            d.abortReason = 'close-wrong-direction';
            d.endedBy = 'gate-abort';
            endDrag(d);
            return;
          }
          const openDrawerEl = drawerRefs.current[edge];
          if (d.insideOpenDrawer && scrollableAncestorCanAbsorb(d.targetEl, openDrawerEl, dx, dy)) {
            d.abortReason = 'scroll-ancestor-absorb';
            d.endedBy = 'gate-abort';
            endDrag(d);
            return;
          }
          const liveSlot = slotsRef.current[edge];
          d.mode = 'close';
          d.direction = closeAxis.sign;
          d.size = sizeOf(edge, liveSlot);
          d.noBackdrop = !!liveSlot?.noBackdrop;
          d.committedAxis = true;
          d.commitPath = fastPath ? 'fast' : slowPath ? 'slow' : 'preview';
        } else {
          const edge = edgeForSwipe(dx, dy);
          const liveSlots = slotsRef.current;
          if (!liveSlots[edge]) {
            d.abortReason = 'no-slot';
            d.edge = edge;
            d.endedBy = 'gate-abort';
            endDrag(d);
            return;
          }
          d.mode = 'open';
          d.edge = edge;
          d.direction = EDGE_DIRECTION[edge];
          d.size = sizeOf(edge, liveSlots[edge]);
          d.noBackdrop = !!liveSlots[edge]?.noBackdrop;
          d.committedAxis = true;
          d.commitPath = fastPath ? 'fast' : slowPath ? 'slow' : 'preview';
        }
      }

      // Aligned velocity along the committed axis, signed. The `+` direction
      // is opening; a negative value means the user is pulling back.
      const { vx, vy } = computeVelocity(d.samples);
      d.velocity = d.edge === 'top' || d.edge === 'bottom' ? vy : vx;

      const progress =
        d.mode === 'close'
          ? applyCloseDragTransform(d.edge, dx, dy, d.size, d.noBackdrop)
          : applyOpenDragTransform(d.edge, dx, dy, d.size, d.readerHeight, d.noBackdrop);
      d.progress = progress;
      setPreview({ edge: d.edge, progress });
    };

    // Emit one consolidated `gesture.trace` at the end of the gesture. This
    // replaces the per-event log spam (pointerdown/move/up/commit/release/
    // never-committed/abort) with a single row per user interaction so one
    // page of Vercel logs fits many complete gestures instead of fragments
    // of a few.
    const emitTrace = (d) => {
      const dt = Math.round(performance.now() - d.startT);
      const dx = Math.round(d.lastX - d.startX);
      const dy = Math.round(d.lastY - d.startY);
      const peakDeviationDeg = Math.round((d.peakDeviationRad * 180) / Math.PI);

      // Classify outcome.
      let outcome;
      let rejectReason = null;
      if (d.committedAxis) {
        outcome = d.mode; // 'open' | 'close'
      } else if (d.abortReason) {
        outcome = 'abort';
        rejectReason = d.abortReason;
      } else {
        outcome = 'tap';
        rejectReason =
          d.moveCount === 0
            ? 'no-moves-observed'
            : d.peakDist < MIN_DIST
              ? 'below-min-dist'
              : peakDeviationDeg > 35
                ? 'outside-angle-cone'
                : d.peakSpeed < MIN_VELOCITY && d.peakDist < FALLBACK_DIST
                  ? 'below-speed-and-fallback'
                  : 'unknown';
      }

      gestureLog('gesture.trace', {
        outcome,
        startTarget: d.startTarget,
        startX: Math.round(d.startX),
        startY: Math.round(d.startY),
        dx,
        dy,
        dtMs: dt,
        pointerType: d.pointerType,
        moveCount: d.moveCount,
        touchMoveCount: d.touchMoveCount,
        endedBy: d.endedBy, // 'pointerup' | 'pointercancel' | 'missing' (gate-abort path)
        openEdgeAtStart: d.openEdgeAtStart,
        mode: d.mode,
        edge: d.edge,
        commitPath: d.commitPath, // 'fast' | 'slow' | 'preview' | null
        progress: Math.round(d.progress * 100) / 100,
        velocity: Math.round((d.velocity ?? 0) * 1000) / 1000,
        peakDist: Math.round(d.peakDist),
        peakSpeed: Math.round(d.peakSpeed * 1000) / 1000,
        peakDeviationDeg,
        rejectReason,
        insideOpenDrawer: d.insideOpenDrawer,
      });
    };

    const endDrag = (d) => {
      dragRef.current = null;
      setPreview(null);
      // Click suppression lives inside commitOrReset now: only drags that
      // change drawer state eat the follow-up click. Drags that snap back
      // let the original click through.
      emitTrace(d);

      // Reload intent: swipe-down that armed near the top edge and crossed
      // RELOAD_RATIO of reader height. Only for open-drags on the top edge;
      // close-drags on the already-open top drawer never trigger reload.
      if (d.mode === 'open' && d.edge === 'top' && d.startedNearTop) {
        const dy = d.lastY - d.startY;
        if (dy > d.readerHeight * RELOAD_RATIO) {
          gestureLog('gesture.reload', { dy: Math.round(dy) });
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
      if (d.abortReason || !d.committedAxis) {
        // Gate-abort and tap paths don't need commitOrReset — there was no
        // in-progress drawer transform to settle.
        return;
      }
      commitOrReset(d, d.progress);
    };

    const onPointerUp = (e) => {
      const d = dragRef.current;
      if (!d || !d.active || e.pointerId !== d.pointerId) return;
      d.endedBy = 'pointerup';
      endDrag(d);
    };

    const onPointerCancel = (e) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.pointerId) return;
      d.endedBy = 'pointercancel';
      dragRef.current = null;
      setPreview(null);
      setReloadProgress(0);
      emitTrace(d);
      if (d.committedAxis) commitOrReset(d, 0);
    };

    // Native touch mirror — only to count touchmove events per drag so the
    // trace can report touchMoveCount alongside pointer moveCount. If one is
    // high and the other is low, we can tell whether the browser is starving
    // us of pointer events.
    const onTouchStart = () => {
      const d = dragRef.current;
      if (d) d.touchMoveCount = 0;
    };
    const onTouchMove = () => {
      const d = dragRef.current;
      if (d) d.touchMoveCount += 1;
    };

    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [
    enabled,
    slotShape,
    resolveBounds,
    applyOpenDragTransform,
    applyCloseDragTransform,
    commitOrReset,
    triggerReload,
    closeDrawer,
  ]);

  // ---------- render ----------

  const edges = ['top', 'bottom', 'left', 'right'];
  const activeSlot = openEdge ? slots[openEdge] : null;
  // `noBackdrop` lets a slot opt out of the dimming overlay so it can sit
  // inline with page chrome (e.g. an expanded header) without darkening the
  // reader below it.
  const backdropOpen = anyGestureDrawerOpen && !activeSlot?.noBackdrop;

  return (
    <>
      <ReloadIndicator progress={reloadProgress} />
      <DrawerIndicators
        anyDrawerOpen={anyGestureDrawerOpen}
        activeEdge={preview?.edge}
        progress={preview?.progress ?? 0}
      />
      <DrawerBackdrop ref={backdropRef} open={backdropOpen} onClose={closeDrawer} />
      {edges.map((edge) => {
        const slot = slots[edge];
        if (!slot) return null;
        return (
          <EdgeDrawer
            key={edge}
            ref={(el) => {
              drawerRefs.current[edge] = el;
            }}
            edge={edge}
            open={openEdge === edge}
            onClose={closeDrawer}
            title={slot.title}
            size={slot.size}
            chromeless={slot.chromeless}
            offsetTop={slot.offsetTop}
          >
            {slot.content ?? null}
          </EdgeDrawer>
        );
      })}
    </>
  );
}
