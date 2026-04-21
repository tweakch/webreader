import { useCallback, useEffect, useRef, useState } from 'react';
import { EdgeDrawer, DrawerBackdrop, ReloadIndicator } from './GestureDrawers';
import DrawerIndicators from './DrawerIndicators';
import { useGestureDrawers } from './GestureDrawerContext';
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
 *   - Listens at the window level for pointer events. Every pointermove
 *     is pushed into a small ring buffer; a drag "commits" once either
 *     the fast path fires (travel > MIN_DIST, weighted velocity above
 *     MIN_VELOCITY, and motion inside an angular cone around one
 *     cardinal axis) or the slow path fires (travel > FALLBACK_DIST,
 *     still inside the cone). Before commit, nothing moves visually;
 *     after commit, the drawer's open-drag transform ease-in-amplifies
 *     the first ~60px so the surface leaps to meet the finger.
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

const RELOAD_EDGE_ZONE = 44;                  // px from top edge that arms pull-to-reload
const RELOAD_RATIO = 0.55;                    // top drag past this × reader height = reload
const MIN_DIST = 3;                           // px — minimum travel before any gate fires
const FALLBACK_DIST = 10;                     // px — slow-deliberate commit without velocity
const MIN_VELOCITY = 0.15;                    // px/ms — fast-path velocity threshold
const ANGLE_CONE_RAD = 35 * Math.PI / 180;    // ±35° cone around a cardinal axis
const PROJECTION_MS = 180;                    // ms — release-time forecast window
const COMMIT_PROJECTION_RATIO = 0.5;          // projected progress ≥ this → commit

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

    drawerEl.style.transition = 'transform var(--motion-md) var(--motion-ease-standard)';
    if (backdropRef.current) backdropRef.current.style.transition = 'opacity var(--motion-md) var(--motion-ease-standard)';

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

      const now = performance.now();
      const samples = createSampleBuffer();
      pushSample(samples, x, y, now);
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
        lastT: now,
        samples,                 // ring buffer of recent (x, y, t) samples
        velocity: 0,             // aligned axis velocity (signed, px/ms)
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
      d.lastX = x; d.lastY = y; d.lastT = now;
      pushSample(d.samples, x, y, now);

      const dx = x - d.startX;
      const dy = y - d.startY;

      if (!d.committedAxis) {
        // Always-on sampling. The gate is:
        //   fast path — dist > MIN_DIST AND velocity > MIN_VELOCITY
        //               AND motion vector within ANGLE_CONE of a cardinal axis
        //   slow path — dist > FALLBACK_DIST AND motion within ANGLE_CONE
        // Below MIN_DIST nothing can commit; between MIN_DIST and FALLBACK_DIST
        // a fast flick commits immediately; above FALLBACK_DIST a deliberate
        // slow drag commits even without velocity.
        const dist = Math.hypot(dx, dy);
        if (dist < MIN_DIST) return;

        const { vx, vy } = computeVelocity(d.samples);
        const speed = Math.hypot(vx, vy);
        const deviation = axisDeviationRad(dx, dy);
        const withinCone = deviation <= ANGLE_CONE_RAD;
        const fastPath = withinCone && speed >= MIN_VELOCITY;
        const slowPath = withinCone && dist >= FALLBACK_DIST;
        if (!(fastPath || slowPath)) return;

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

      // Aligned velocity along the committed axis, signed. The `+` direction
      // is opening; a negative value means the user is pulling back.
      const { vx, vy } = computeVelocity(d.samples);
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
