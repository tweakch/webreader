import { useEffect, useRef } from 'react';

export default function AppAnimationWrapper({ children }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const handleExit = () => {
      el.classList.remove('app-enter');
      el.classList.add('app-exit');
    };

    // pagehide fires on tab close, window close, back navigation, and mobile app switching
    window.addEventListener('pagehide', handleExit);
    // beforeunload as a fallback for browsers that fire it before pagehide
    window.addEventListener('beforeunload', handleExit);

    return () => {
      // Trigger exit animation when component unmounts (navigating away)
      handleExit();
      window.removeEventListener('pagehide', handleExit);
      window.removeEventListener('beforeunload', handleExit);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="app-enter" style={{ width: '100%' }}>
      {children}
    </div>
  );
}
