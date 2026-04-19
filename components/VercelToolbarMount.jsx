import { useEffect } from 'react';

// Mounts the Vercel Toolbar on local dev and preview deployments so
// reviewers can leave visual comments that sync back to the PR. Never
// mounted in production to avoid exposing the toolbar to end users.
export default function VercelToolbarMount() {
  useEffect(() => {
    const env = import.meta.env.VITE_VERCEL_ENV ?? (import.meta.env.DEV ? 'development' : undefined);
    if (env !== 'preview' && env !== 'development') return;

    let cleanup;
    let cancelled = false;
    import('@vercel/toolbar').then(({ mountVercelToolbar }) => {
      if (cancelled) return;
      cleanup = mountVercelToolbar();
    });
    return () => {
      cancelled = true;
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  return null;
}
