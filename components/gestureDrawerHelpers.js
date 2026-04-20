/**
 * Shared geometry + direction helpers for `GestureDrawerViewport`. Pulled
 * into this module so the viewport file stays under the file-size budget.
 *
 * Naming:
 *   - An "edge" is one of `top` / `bottom` / `left` / `right`, and refers to
 *     which viewport edge the drawer is docked against.
 *   - "Open direction" is the way the finger moves to *open* a drawer from
 *     the closed state (e.g. top drawer: swipe DOWN to open it).
 *   - "Close direction" is the way the finger moves to *close* an open
 *     drawer (e.g. top drawer: swipe UP to close it).
 */

export const DEFAULT_SIZE = { top: 320, right: 320, bottom: 280, left: 300 };

export const EDGE_CLOSED_TRANSFORM = {
  top: 'translate3d(0, -100%, 0)',
  bottom: 'translate3d(0, 100%, 0)',
  left: 'translate3d(-100%, 0, 0)',
  right: 'translate3d(100%, 0, 0)',
};

// Sign of the dominant axis that indicates an OPEN gesture. The viewport
// uses this to gate the velocity-commit check: a flick only commits if its
// sign matches the open direction for the drawer's edge.
export const EDGE_DIRECTION = { top: 1, bottom: -1, left: 1, right: -1 };

// The sign of finger movement that pulls each drawer toward its closed edge.
// For the top drawer you swipe up (dy < 0) to close; for the right drawer
// you swipe right (dx > 0); etc.
export const CLOSE_AXIS = {
  top:    { axis: 'y', sign: -1 },
  bottom: { axis: 'y', sign:  1 },
  left:   { axis: 'x', sign: -1 },
  right:  { axis: 'x', sign:  1 },
};

// Map a committed swipe-axis direction to the drawer edge it opens:
// horizontal swipe-right (dx > 0) exposes the LEFT drawer (which lives off
// the left edge and slides in rightward), swipe-left exposes the RIGHT
// drawer, and analogously for vertical.
export function edgeForSwipe(dx, dy) {
  const horizontal = Math.abs(dx) > Math.abs(dy);
  if (horizontal) return dx > 0 ? 'left' : 'right';
  return dy > 0 ? 'top' : 'bottom';
}

export function sizeOf(edge, slot) {
  if (slot?.size) return slot.size;
  return DEFAULT_SIZE[edge];
}

// Walk from `target` up toward `boundary` (inclusive), looking for a
// scrollable ancestor that can absorb a swipe in the finger direction
// implied by (dx, dy). Returns true if native scroll should win.
//
// "Absorb" follows the natural-scroll convention: finger up (dy<0) asks the
// element to scroll further down (scrollTop can grow); finger down asks for
// scrollTop > 0; and analogously for horizontal.
export function scrollableAncestorCanAbsorb(target, boundary, dx, dy) {
  if (!target || !(target instanceof Element)) return false;
  const getStyle = typeof window !== 'undefined' && window.getComputedStyle
    ? (node) => window.getComputedStyle(node)
    : null;
  if (!getStyle) return false;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  let node = target;
  while (node && node !== boundary?.parentElement) {
    const style = getStyle(node);
    const canScrollY = (style.overflowY === 'auto' || style.overflowY === 'scroll')
      && node.scrollHeight > node.clientHeight + 1;
    const canScrollX = (style.overflowX === 'auto' || style.overflowX === 'scroll')
      && node.scrollWidth > node.clientWidth + 1;
    if (absY >= absX && canScrollY) {
      const maxTop = node.scrollHeight - node.clientHeight;
      if (dy < 0 && node.scrollTop < maxTop - 1) return true;
      if (dy > 0 && node.scrollTop > 1) return true;
    }
    if (absX > absY && canScrollX) {
      const maxLeft = node.scrollWidth - node.clientWidth;
      if (dx < 0 && node.scrollLeft < maxLeft - 1) return true;
      if (dx > 0 && node.scrollLeft > 1) return true;
    }
    if (node === boundary) break;
    node = node.parentElement;
  }
  return false;
}

/**
 * Compute the drawer transform + progress for an OPEN-drag: the drawer slides
 * in from its edge as the finger travels. `dx`/`dy` are measured from
 * pointerdown; `size` is the drawer's closed-axis extent.
 *
 * Returns `{ progress, transform, reloadRatio }`. `reloadRatio` is non-null
 * only for the `top` edge — the viewport uses it to drive the
 * pull-to-reload indicator.
 */
export function computeOpenDragTransform(edge, dx, dy, size, height) {
  let progress = 0;
  let transform = '';
  let reloadRatio = null;

  if (edge === 'top') {
    const travel = Math.max(0, dy);
    progress = Math.min(1, travel / size);
    const offset = -size + Math.min(travel, size);
    const overshoot = Math.max(0, travel - size);
    const pull = overshoot > 0 ? Math.pow(overshoot, 0.7) * 0.6 : 0;
    transform = `translate3d(0, ${offset + pull}px, 0)`;
    reloadRatio = Math.max(0, Math.min(1, travel / height));
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

  return { progress, transform, reloadRatio };
}

/**
 * Compute the drawer transform + progress for a CLOSE-drag: the drawer starts
 * fully open and follows the finger toward its resting closed edge.
 * `progress` of 1 means fully closed.
 */
export function computeCloseDragTransform(edge, dx, dy, size) {
  let progress = 0;
  let transform = '';

  if (edge === 'top') {
    const travel = Math.min(size, Math.max(0, -dy));
    progress = travel / size;
    transform = `translate3d(0, ${-travel}px, 0)`;
  } else if (edge === 'bottom') {
    const travel = Math.min(size, Math.max(0, dy));
    progress = travel / size;
    transform = `translate3d(0, ${travel}px, 0)`;
  } else if (edge === 'left') {
    const travel = Math.min(size, Math.max(0, -dx));
    progress = travel / size;
    transform = `translate3d(${-travel}px, 0, 0)`;
  } else if (edge === 'right') {
    const travel = Math.min(size, Math.max(0, dx));
    progress = travel / size;
    transform = `translate3d(${travel}px, 0, 0)`;
  }

  return { progress, transform };
}
