import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppAnimation } from '../hooks/useAppAnimation';

/**
 * Wraps the app with entry/exit animations and an optional swipe-to-unlock
 * lock screen.
 *
 * The .app-enter / .app-exit classes are the stable test contract (see
 * tests/animation-navigation.spec.js). On top of them we layer:
 *
 *   • `app-anim-<variant>`  — selects the motion style (seal, fade, sparkle, ink)
 *   • `app-theme-<theme>`   — scopes CSS variables so the animation palette
 *                             matches the user's selected theme
 *
 * enableLockScreen: when false, the lock screen never renders and the app is
 * unlocked from first paint. The pagehide/beforeunload → app-exit animation
 * still runs so navigation transitions remain consistent.
 */
export default function AppAnimationWrapper({ children, enableLockScreen = true }) {
  const wrapperRef = useRef(null);
  const [isLocked, setIsLocked] = useState(enableLockScreen);
  const [isClosing, setIsClosing] = useState(false);
  const touchStartRef = useRef(null);
  const threshold = 50;

  const { variantClass, themeClass, theme } = useAppAnimation();

  const handleExit = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.classList.remove('app-enter');
    el.classList.add('app-exit');
  }, []);

  useEffect(() => {
    window.addEventListener('pagehide', handleExit);
    window.addEventListener('beforeunload', handleExit);

    const onRequestClose = () => {
      setIsLocked(true);
      setIsClosing(true);
    };
    window.addEventListener('app:request-close', onRequestClose);

    return () => {
      // Intentionally NOT calling handleExit() on unmount: React StrictMode's
      // dev-only mount→unmount→remount would leave the DOM with `app-exit`
      // while JSX still says `app-enter`, and React wouldn't re-apply the
      // className (it tracks the prop, not DOM mutations). The real
      // navigate-away path runs via the pagehide listener, which fires before
      // React has a chance to unmount.
      window.removeEventListener('pagehide', handleExit);
      window.removeEventListener('beforeunload', handleExit);
      window.removeEventListener('app:request-close', onRequestClose);
    };
  }, [handleExit]);

  // If the flag flips off while locked (and not mid-closing), unlock.
  useEffect(() => {
    if (!enableLockScreen && isLocked && !isClosing) setIsLocked(false);
  }, [enableLockScreen, isLocked, isClosing]);

  const onStart = (y) => {
    touchStartRef.current = y;
  };

  const onEnd = (y) => {
    if (touchStartRef.current === null) return;
    const deltaY = y - touchStartRef.current;

    if (isLocked && !isClosing) {
      if (deltaY < -threshold) setIsLocked(false);
    } else if (isLocked && isClosing) {
      if (deltaY > threshold) {
        handleExit();
        setTimeout(() => { window.location.assign('/'); }, 100);
      }
    }
    touchStartRef.current = null;
  };

  const showLock = isLocked && enableLockScreen;
  const isHighContrast = theme === 'light-hc' || theme === 'dark-hc';
  const isDark = theme === 'dark' || theme === 'dark-hc';

  // Lock screen palette — matches the resolved app theme so the unlock surface
  // never clashes with the visible app underneath.
  const lockBg = isHighContrast
    ? (isDark ? 'bg-black' : 'bg-white')
    : (isDark ? 'bg-slate-950/75' : 'bg-amber-950/55');
  const lockText = isHighContrast
    ? (isDark ? 'text-white' : 'text-black')
    : (isDark ? 'text-amber-100' : 'text-amber-50');
  const lockRing = isHighContrast
    ? (isDark ? 'border-white' : 'border-black')
    : 'border-white/80';

  return (
    <div
      ref={wrapperRef}
      className={`app-enter ${variantClass} ${themeClass} fixed inset-0 overflow-hidden`}
      style={{ width: '100%', height: '100%' }}
      onTouchStart={(e) => onStart(e.touches[0].clientY)}
      onTouchEnd={(e) => onEnd(e.changedTouches[0].clientY)}
      onMouseDown={(e) => onStart(e.clientY)}
      onMouseUp={(e) => onEnd(e.clientY)}
    >
      <div className={`h-full w-full ${showLock ? 'pointer-events-none blur-sm grayscale' : ''}`}>
        {children}
      </div>

      {showLock && (
        <div
          data-testid="lock-screen"
          className={`app-lock-fade absolute inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-md ${lockBg} ${lockText}`}
        >
          <div className="flex flex-col items-center gap-6">
            <div
              className={`w-14 h-14 rounded-full border-2 ${lockRing} flex items-center justify-center ${isClosing ? 'app-lock-hint-down' : 'app-lock-hint'}`}
              aria-hidden="true"
            >
              <span className="text-2xl leading-none">{isClosing ? '↓' : '↑'}</span>
            </div>
            <p className="text-lg font-medium tracking-wide">
              {isClosing ? 'Swipe down to close' : 'Swipe up to unlock'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
