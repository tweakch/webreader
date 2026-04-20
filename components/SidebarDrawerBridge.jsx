import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Menu, X } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { GestureDrawerContent, useGestureDrawers } from './GestureDrawerContext';

/**
 * Bridges the legacy `menuOpen` sidebar state with the gesture drawer system
 * when the sidebar is rendered inside the left edge drawer (mobile +
 * enhanced-gestures path).
 *
 * Source of truth: when `enabled`, `openEdge === 'left'` is authoritative.
 * The bridge syncs `menuOpen` from openEdge in one direction so existing
 * consumers (close-prompt visibility, etc.) keep reading menuOpen as before.
 *
 * For the *other* direction (something calls setMenuOpen externally — e.g.
 * `handleSelectStory` after a user picks a story), grimm-reader holds a
 * `controllerRef` whose `close()` method routes through `closeDrawer`. This
 * avoids a two-way state sync loop where one side reverses the other.
 */

export const SidebarLeftSlot = forwardRef(function SidebarLeftSlot(
  { enabled, content, size = 320, menuOpen, onMenuOpenChange },
  controllerRef,
) {
  const { openEdge, openDrawer, closeDrawer } = useGestureDrawers();

  // openEdge → menuOpen (one-way). The bridge owns the drawer state; menuOpen
  // is a downstream mirror so existing readers see the right value.
  useEffect(() => {
    if (!enabled) return;
    const drawerOpen = openEdge === 'left';
    if (drawerOpen !== menuOpen) onMenuOpenChange?.(drawerOpen);
  }, [enabled, openEdge, menuOpen, onMenuOpenChange]);

  // Expose imperative open/close to grimm-reader so external setMenuOpen
  // callsites can route through the drawer system instead of fighting the
  // openEdge → menuOpen sync.
  useImperativeHandle(controllerRef, () => ({
    open: () => openDrawer('left'),
    close: () => closeDrawer(),
    toggle: () => (openEdge === 'left' ? closeDrawer() : openDrawer('left')),
  }), [openDrawer, closeDrawer, openEdge]);

  if (!enabled) return null;
  return (
    <GestureDrawerContent edge="left" size={size} chromeless>
      {content}
    </GestureDrawerContent>
  );
});

export function useSidebarToggle({ enabled, menuOpen, onMenuOpenChange }) {
  const { openEdge, openDrawer, closeDrawer } = useGestureDrawers();
  if (!enabled) {
    return {
      isOpen: menuOpen,
      toggle: () => onMenuOpenChange?.(!menuOpen),
    };
  }
  const isOpen = openEdge === 'left';
  return {
    isOpen,
    toggle: () => (isOpen ? closeDrawer() : openDrawer('left')),
  };
}

/**
 * Drop-in replacement for the inline mobile menu-toggle IconButton in the
 * grimm-reader header — picks the right open/close API based on `enabled`.
 */
export function MenuToggleButton({ enabled, menuOpen, onMenuOpenChange, className }) {
  const { isOpen, toggle } = useSidebarToggle({ enabled, menuOpen, onMenuOpenChange });
  return (
    <IconButton data-testid="menu-toggle" onClick={toggle} className={className}>
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </IconButton>
  );
}
