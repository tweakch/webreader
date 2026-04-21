import { useMemo } from 'react';
import { Minus, Plus, User, SlidersHorizontal } from 'lucide-react';
import { MenuToggleButton } from './SidebarDrawerBridge';
import IconButton from '../ui/IconButton';
import { useTheme } from '../ui/ThemeContext';
import { GestureDrawerContent, useGestureDrawers } from './GestureDrawerContext';

/**
 * Unified app top surface.
 *
 * Renders the compact persistent header (menu toggle, title/branding,
 * font-size controls, voice control slot, theme toggle) and — when
 * enhanced gestures are enabled in the reader — registers the swipe-down
 * slot that expands the header downward to reveal Profile + Typography
 * shortcuts.
 *
 * The expanded region reads as a second row of the header, not a
 * drawer-over-content: it docks below the compact strip via
 * `offsetTop: 64`, suppresses the dim backdrop via `noBackdrop`, and
 * registers chromeless so we own its layout. The drawer purely adds
 * shortcuts; it does not duplicate any persistent header control.
 */

const HEADER_H = 64; // px — matches the `h-16` compact strip.

function HeaderExtension({ onOpenProfile, onOpenTypography }) {
  const { closeDrawer } = useGestureDrawers();
  return (
    <div className="flex items-center gap-2 px-4 pt-2 pb-3">
      <button
        data-testid="gesture-header-open-profile"
        onClick={() => {
          closeDrawer();
          onOpenProfile?.();
        }}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--paper-hover)]"
        style={{ color: 'var(--paper-ink)' }}
      >
        <User size={16} /> Profil
      </button>
      <button
        data-testid="gesture-header-open-typography"
        onClick={() => {
          closeDrawer();
          onOpenTypography?.();
        }}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--paper-hover)]"
        style={{ color: 'var(--paper-ink)' }}
      >
        <SlidersHorizontal size={16} /> Typografie
      </button>
    </div>
  );
}

function DrawerRegistration({ onOpenProfile, onOpenTypography }) {
  const node = useMemo(
    () => <HeaderExtension onOpenProfile={onOpenProfile} onOpenTypography={onOpenTypography} />,
    [onOpenProfile, onOpenTypography]
  );
  return (
    <GestureDrawerContent
      edge="header"
      chromeless
      offsetTop={HEADER_H}
      noBackdrop
    >
      {node}
    </GestureDrawerContent>
  );
}

export default function AppTopBar({
  visible = true,
  selectedStory,
  useDrawerSidebar,
  menuOpen,
  onMenuOpenChange,
  fontSize,
  maxFontSize,
  onSetFontSize,
  showFontSizeControls,
  voiceControl,
  theme,
  onSetTheme,
  showHighContrastTheme,
  showEnhancedGestures,
  speedReaderMode,
  onOpenProfile,
  onOpenTypography,
}) {
  const { dark: darkMode, hc: highContrast } = useTheme();
  const { openEdge } = useGestureDrawers();
  const extensionOpen = openEdge === 'top';

  // The drawer registers only in the reader (selectedStory present) and only
  // when gesture input is active. The persistent header is orthogonal to the
  // drawer and shows on both the home and reader views.
  const registerDrawer =
    showEnhancedGestures &&
    !speedReaderMode &&
    !!selectedStory &&
    (onOpenProfile || onOpenTypography);

  return (
    <>
      {registerDrawer && (
        <DrawerRegistration onOpenProfile={onOpenProfile} onOpenTypography={onOpenTypography} />
      )}

      <header
        aria-hidden={!visible}
        className={`flex-shrink-0 z-40 border-b ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: 'var(--paper-surface)',
          color: 'var(--paper-ink)',
          // When the header extension is open, drop the seam so the compact
          // strip and the extension read as one continuous surface.
          borderBottomColor: extensionOpen ? 'transparent' : 'var(--paper-rule)',
          transition: 'opacity var(--motion-sm) var(--motion-ease-standard), border-bottom-color var(--motion-md) var(--motion-ease-standard)',
        }}
      >
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <MenuToggleButton
                enabled={useDrawerSidebar}
                menuOpen={menuOpen}
                onMenuOpenChange={onMenuOpenChange}
                className="lg:hidden"
              />
              <h1
                className="text-2xl font-serif font-bold tracking-wide"
                style={{ color: 'var(--paper-ink)' }}
              >
                {selectedStory ? '' : 'Märchenschatz'}
              </h1>
            </div>

            {selectedStory && showFontSizeControls && (
              <div className="flex items-center gap-2">
                <IconButton
                  data-testid="font-decrease"
                  onClick={() => onSetFontSize(Math.max(14, fontSize - 2))}
                >
                  <Minus size={18} />
                </IconButton>
                <span
                  className="text-sm font-medium w-12 text-center"
                  style={{ color: 'var(--paper-ink)' }}
                >
                  {fontSize}
                </span>
                <IconButton
                  data-testid="font-increase"
                  onClick={() => onSetFontSize(Math.min(maxFontSize, fontSize + 2))}
                >
                  <Plus size={18} />
                </IconButton>
              </div>
            )}

            <div className="flex items-center gap-2">
              {voiceControl}
              <button
                onClick={() =>
                  onSetTheme((t) =>
                    showHighContrastTheme
                      ? t === 'light-hc'
                        ? 'dark-hc'
                        : 'light-hc'
                      : t === 'light'
                        ? 'dark'
                        : t === 'dark'
                          ? 'system'
                          : 'light'
                  )
                }
                title={
                  theme === 'light'
                    ? 'Switch to dark mode'
                    : theme === 'dark'
                      ? 'Switch to system theme'
                      : theme === 'system'
                        ? 'Switch to light mode'
                        : theme === 'light-hc'
                          ? 'Switch to dark high contrast'
                          : 'Switch to light high contrast'
                }
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  theme === 'dark-hc'
                    ? 'bg-white text-black hover:bg-gray-100'
                    : theme === 'light-hc'
                      ? 'bg-black text-white hover:bg-gray-900'
                      : darkMode
                        ? 'bg-amber-200 text-slate-900 hover:bg-amber-300'
                        : 'bg-amber-900 text-white hover:bg-amber-800'
                }`}
              >
                {theme === 'light'
                  ? '🌙'
                  : theme === 'dark'
                    ? '🖥️'
                    : theme === 'system'
                      ? '☀️'
                      : theme === 'light-hc'
                        ? '🌙'
                        : '☀️'}
              </button>
            </div>
          </div>
      </header>
    </>
  );
}
