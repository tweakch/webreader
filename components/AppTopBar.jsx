import { Minus, Plus } from 'lucide-react';
import { MenuToggleButton } from './SidebarDrawerBridge';
import IconButton from '../ui/IconButton';
import { useTheme } from '../ui/ThemeContext';

/**
 * Unified app top surface.
 *
 * Renders the compact persistent header: menu toggle, title/branding,
 * font-size controls, voice control slot, and the theme toggle. Shown on
 * both the home and reader views.
 */

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
}) {
  const { dark: darkMode, hc: highContrast } = useTheme();

  return (
    <>
      <header
        aria-hidden={!visible}
        className={`flex-shrink-0 z-40 border-b ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: 'var(--paper-surface)',
          color: 'var(--paper-ink)',
          borderBottomColor: 'var(--paper-rule)',
          transition: 'opacity var(--motion-sm) var(--motion-ease-standard)',
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
