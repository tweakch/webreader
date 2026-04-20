import { useMemo } from 'react';
import { Minus, Plus, User, SlidersHorizontal } from 'lucide-react';
import { MenuToggleButton } from './SidebarDrawerBridge';
import IconButton from '../ui/IconButton';
import { cn } from '../ui/cn';
import { useTheme } from '../ui/ThemeContext';
import { GestureDrawerContent, useGestureDrawers } from './GestureDrawerContext';

/**
 * Unified app top surface.
 *
 * Renders the persistent header (menu toggle, title/branding, font size
 * controls, voice control slot, theme toggle) and — when enhanced gestures
 * are enabled inside the reader — also registers the swipe-down drawer
 * content that extends it with shortcuts to the Profile panel and the
 * typography panel.
 *
 * The drawer purely adds shortcuts; it does not duplicate any persistent
 * header control.
 */

function DrawerBody({ onOpenProfile, onOpenTypography }) {
  const { tc } = useTheme();
  const { closeDrawer } = useGestureDrawers();
  const btn = cn(
    'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm transition-colors',
    tc({
      light: 'bg-amber-100 text-amber-900 hover:bg-amber-200',
      dark: 'bg-slate-800 text-amber-200 hover:bg-slate-700',
      hcLight: 'border border-black',
      hcDark: 'border border-white',
    })
  );
  return (
    <div className="flex gap-2">
      <button
        data-testid="gesture-header-open-profile"
        onClick={() => {
          closeDrawer();
          onOpenProfile?.();
        }}
        className={btn}
      >
        <User size={16} /> Profil
      </button>
      <button
        data-testid="gesture-header-open-typography"
        onClick={() => {
          closeDrawer();
          onOpenTypography?.();
        }}
        className={btn}
      >
        <SlidersHorizontal size={16} /> Typografie
      </button>
    </div>
  );
}

function DrawerRegistration({ onOpenProfile, onOpenTypography }) {
  const node = useMemo(
    () => <DrawerBody onOpenProfile={onOpenProfile} onOpenTypography={onOpenTypography} />,
    [onOpenProfile, onOpenTypography]
  );
  return (
    <GestureDrawerContent edge="header" title="Schnelleinstellungen">
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

      {visible && (
        <header
          className={`flex-shrink-0 backdrop-blur-md transition-colors duration-300 z-40 ${
            highContrast
              ? darkMode
                ? 'bg-black border-white/40'
                : 'bg-white border-black/30'
              : darkMode
                ? 'bg-slate-900/80 border-amber-700/30'
                : 'bg-white/80 border-amber-200/50'
          } border-b`}
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
                className={`text-2xl font-serif font-bold tracking-wide ${
                  darkMode ? 'text-amber-200' : 'text-amber-900'
                }`}
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
                  className={`text-sm font-medium w-12 text-center ${
                    darkMode ? 'text-amber-200' : 'text-amber-900'
                  }`}
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
      )}
    </>
  );
}
