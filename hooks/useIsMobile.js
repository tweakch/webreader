import { useEffect, useState } from 'react';

/**
 * Tracks whether the viewport is below the Tailwind `lg` breakpoint (1024px).
 *
 * Used to decide whether the sidebar renders in its overlay form (mobile)
 * or as a static flex column (desktop).
 */
const QUERY = '(max-width: 1023px)';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mql = window.matchMedia(QUERY);
    const update = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return isMobile;
}
