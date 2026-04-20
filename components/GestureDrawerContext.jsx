import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Pages register drawer payloads (top/bottom/left/right) via
 * `<GestureDrawerContent edge="…" title="…">…</GestureDrawerContent>` or
 * the `useGestureDrawerSlot` hook. The `GestureDrawerViewport` reads those
 * payloads and renders them inside the matching drawer frame.
 *
 * Edge aliases: pages may still register under the legacy names
 * `header` (→ top) and `footer` (→ bottom). Internally both canonical and
 * legacy names are exposed on `slots` so existing consumers keep working.
 *
 * Global drawers (passed to the provider) take precedence over page-registered
 * content for the same edge — used for app-wide overlays (e.g. profile on top).
 */

const DrawerContext = createContext(null);

function canonicalEdge(edge) {
  if (edge === 'header') return 'top';
  if (edge === 'footer') return 'bottom';
  return edge;
}

function withAliases(slots) {
  return {
    top: slots.top ?? null,
    bottom: slots.bottom ?? null,
    left: slots.left ?? null,
    right: slots.right ?? null,
    header: slots.top ?? null,
    footer: slots.bottom ?? null,
  };
}

export function GestureDrawerProvider({ children, globalDrawers = null, onReload }) {
  const [pageSlots, setPageSlots] = useState({ top: null, bottom: null, left: null, right: null });
  const [openEdge, setOpenEdge] = useState(null);

  const setSlot = useCallback((edge, payload) => {
    const key = canonicalEdge(edge);
    setPageSlots((prev) => (prev[key] === payload ? prev : { ...prev, [key]: payload }));
  }, []);

  const openDrawer = useCallback((edge) => setOpenEdge(canonicalEdge(edge)), []);
  const closeDrawer = useCallback(() => setOpenEdge(null), []);

  const merged = useMemo(() => {
    const next = { ...pageSlots };
    if (globalDrawers) {
      for (const key of Object.keys(globalDrawers)) {
        const canonical = canonicalEdge(key);
        if (globalDrawers[key]) next[canonical] = globalDrawers[key];
      }
    }
    return withAliases(next);
  }, [pageSlots, globalDrawers]);

  const value = useMemo(
    () => ({ slots: merged, setSlot, openEdge, openDrawer, closeDrawer, onReload }),
    [merged, setSlot, openEdge, openDrawer, closeDrawer, onReload],
  );

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

export function useGestureDrawers() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useGestureDrawers must be used inside GestureDrawerProvider');
  return ctx;
}

export function useGestureDrawerSlot(edge, payload) {
  const { setSlot } = useGestureDrawers();
  useEffect(() => {
    setSlot(edge, payload);
    return () => setSlot(edge, null);
  }, [edge, payload, setSlot]);
}

/**
 * Declarative alternative:
 *
 *   <GestureDrawerContent edge="header" title="…">
 *     <MyControls />
 *   </GestureDrawerContent>
 *
 * Memoize `children` on the caller side (useMemo) so the payload identity
 * is stable across parent renders.
 */
export function GestureDrawerContent({ edge, title, size, children }) {
  const { setSlot } = useGestureDrawers();
  const payload = useMemo(() => ({ title, size, content: children }), [title, size, children]);
  useEffect(() => {
    setSlot(edge, payload);
    return () => setSlot(edge, null);
  }, [edge, payload, setSlot]);
  return null;
}
