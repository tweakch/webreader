import { useEffect, useRef, useState, useCallback } from 'react';

export default function AppAnimationWrapper({ children }) {
  const wrapperRef = useRef(null);
  const [isLocked, setIsLocked] = useState(true);
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
    const el = wrapperRef.current;
    if (!el) return;

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
      // Trigger exit animation when component unmounts (navigating away)
      handleExit();
      window.removeEventListener('pagehide', handleExit);
      window.removeEventListener('beforeunload', handleExit);
      window.removeEventListener('app:request-close', onRequestClose);
    };
  }, [handleExit]);

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

  return (
    <div 
      ref={wrapperRef} 
      className="app-enter relative h-full w-full overflow-hidden"
      onTouchStart={(e) => onStart(e.touches[0].clientY)}
      onTouchEnd={(e) => onEnd(e.changedTouches[0].clientY)}
      onMouseDown={(e) => onStart(e.clientY)}
      onMouseUp={(e) => onEnd(e.clientY)}
    >
      <div className={`h-full w-full ${isLocked ? 'pointer-events-none blur-sm grayscale' : ''}`}>
        {children}
      </div>

      {isLocked && (
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
