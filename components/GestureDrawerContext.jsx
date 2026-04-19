import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Pages register drawer payloads (header/footer/right) via
 * `<GestureDrawerContent edge="…" title="…">…</GestureDrawerContent>` or
 * the `useGestureDrawerSlot` hook. The `GestureDrawerViewport` reads those
 * payloads and renders them inside the matching drawer frame.
 *
 * The left edge stays delegated to the main sidebar component.
 */

const DrawerContext = createContext(null);

export function GestureDrawerProvider({ children }) {
  const [slots, setSlots] = useState({ header: null, footer: null, right: null });
  const [openEdge, setOpenEdge] = useState(null);

  const setSlot = useCallback((edge, payload) => {
    setSlots((prev) => (prev[edge] === payload ? prev : { ...prev, [edge]: payload }));
  }, []);
  const openDrawer = useCallback((edge) => setOpenEdge(edge), []);
  const closeDrawer = useCallback(() => setOpenEdge(null), []);

  const value = useMemo(
    () => ({ slots, setSlot, openEdge, openDrawer, closeDrawer }),
    [slots, setSlot, openEdge, openDrawer, closeDrawer],
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
export function GestureDrawerContent({ edge, title, children }) {
  const { setSlot } = useGestureDrawers();
  const payload = useMemo(() => ({ title, content: children }), [title, children]);
  useEffect(() => {
    setSlot(edge, payload);
    return () => setSlot(edge, null);
  }, [edge, payload, setSlot]);
  return null;
}
