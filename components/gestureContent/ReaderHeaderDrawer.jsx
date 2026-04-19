import { useMemo } from 'react';
import { User, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../ui/cn';
import { useTheme } from '../../ui/ThemeContext';
import { GestureDrawerContent, useGestureDrawers } from '../GestureDrawerContext';

/**
 * Top-drawer payload for the reader page: two shortcut buttons so the
 * reader can jump to the Profile panel or the inline typography/TTS
 * panel without hunting in the nav bar.
 */
export default function ReaderHeaderDrawer({ onOpenProfile, onOpenTypography }) {
  const { closeDrawer } = useGestureDrawers();
  const { tc } = useTheme();

  const node = useMemo(() => {
    const btn = cn(
      'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm transition-colors',
      tc({
        light:   'bg-amber-100 text-amber-900 hover:bg-amber-200',
        dark:    'bg-slate-800 text-amber-200 hover:bg-slate-700',
        hcLight: 'border border-black',
        hcDark:  'border border-white',
      }),
    );
    return (
      <div className="flex gap-2">
        <button
          data-testid="gesture-header-open-profile"
          onClick={() => { closeDrawer(); onOpenProfile?.(); }}
          className={btn}
        >
          <User size={16} /> Profil
        </button>
        <button
          data-testid="gesture-header-open-typography"
          onClick={() => { closeDrawer(); onOpenTypography?.(); }}
          className={btn}
        >
          <SlidersHorizontal size={16} /> Typografie
        </button>
      </div>
    );
  }, [tc, closeDrawer, onOpenProfile, onOpenTypography]);

  return (
    <GestureDrawerContent edge="header" title="Schnelleinstellungen">
      {node}
    </GestureDrawerContent>
  );
}
