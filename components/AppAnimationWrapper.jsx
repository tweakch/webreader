import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Wraps the app with entry/exit animations and an optional swipe-to-unlock
 * lock screen.
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
  const threshold = 50; // pixels

  const handleExit = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.classList.remove('app-enter');
    el.classList.add('app-exit');
  }, []);

  useEffect(() => {
    // pagehide fires on tab close, window close, back navigation, and mobile app switching
    window.addEventListener('pagehide', handleExit);
    // beforeunload as a fallback for browsers that fire it before pagehide
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
      // Swipe UP to unlock (deltaY is negative)
      if (deltaY < -threshold) {
        setIsLocked(false);
      }
    } else if (isLocked && isClosing) {
      // Swipe DOWN to close (deltaY is positive)
      if (deltaY > threshold) {
        handleExit();
        // Delay navigation slightly to let exit animation start
        setTimeout(() => {
          window.location.assign('/');
        }, 100);
      }
    }
    touchStartRef.current = null;
  };

  const showLock = isLocked && enableLockScreen;

  return (
    <div
      ref={wrapperRef}
      className="app-enter fixed inset-0 overflow-hidden"
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
          className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md text-white transition-opacity duration-300"
        >
          <div className="flex flex-col items-center gap-6 animate-bounce">
            {isClosing ? (
              <>
                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-2xl">↓</span>
                </div>
                <p className="text-lg font-medium tracking-wide">Swipe down to close</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-2xl">↑</span>
                </div>
                <p className="text-lg font-medium tracking-wide">Swipe up to unlock</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
