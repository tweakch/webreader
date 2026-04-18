import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Intercepts the device back button so it walks back through in-app
 * breadcrumbs (e.g. source -> story -> speed-reader) before ever leaving /app.
 *
 * Each forward navigation registers an undo via `pushBreadcrumb(undoFn)`. The
 * hook pushes a matching `history.pushState` entry; when the user triggers
 * popstate (device back) we pop the stack and run the undo. With the stack
 * empty, the user is at the app's landing page and further back would leave
 * /app entirely - the hook surfaces a confirmation dialog via `leavePromptOpen`
 * instead of letting the browser exit immediately.
 */
const SENTINEL = '__wr_breadcrumb_root__';
const ENTRY = '__wr_breadcrumb_entry__';

export function useBreadcrumbNavigation({ onLeaveApp } = {}) {
  const stackRef = useRef([]);
  const [leavePromptOpen, setLeavePromptOpen] = useState(false);
  const onLeaveAppRef = useRef(onLeaveApp);

  useEffect(() => {
    onLeaveAppRef.current = onLeaveApp;
  }, [onLeaveApp]);

  useEffect(() => {
    // Seed history with a sentinel so the very first device-back press hits
    // our popstate handler instead of exiting /app straight away.
    if (!window.history.state || window.history.state.__wrBreadcrumb !== SENTINEL) {
      window.history.pushState({ __wrBreadcrumb: SENTINEL }, '');
    }

    const onPop = () => {
      const handlers = stackRef.current;
      if (handlers.length > 0) {
        const back = handlers.pop();
        try { back(); } catch { /* noop */ }
        return;
      }
      // Stack empty: user would have left /app. Re-seed so follow-up back
      // presses stay captured, then show the confirmation dialog.
      window.history.pushState({ __wrBreadcrumb: SENTINEL }, '');
      setLeavePromptOpen(true);
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const pushBreadcrumb = useCallback((backFn) => {
    if (typeof backFn !== 'function') return;
    stackRef.current.push(backFn);
    window.history.pushState({ __wrBreadcrumb: ENTRY }, '');
  }, []);

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const confirmLeave = useCallback(() => {
    setLeavePromptOpen(false);
    onLeaveAppRef.current?.();
  }, []);

  const cancelLeave = useCallback(() => {
    setLeavePromptOpen(false);
  }, []);

  return {
    pushBreadcrumb,
    goBack,
    leavePromptOpen,
    confirmLeave,
    cancelLeave,
  };
}
