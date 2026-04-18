import React from 'react';
import ErrorBoundary from '../../components/ErrorBoundary';
import AppAnimationWrapper from '../../components/AppAnimationWrapper';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';

const GrimmMarchenApp = React.lazy(() => import('../../grimm-reader'));

export default function AppLayout() {
  const { showAppAnimation } = useFeatureFlags();

  // The wrapper always renders so the enter/exit animation classes and
  // pagehide/beforeunload handling are consistent regardless of the flag.
  // The flag only gates the lock-screen + swipe-to-unlock behaviour.
  return (
    <AppAnimationWrapper enableLockScreen={showAppAnimation}>
      <div className="h-full w-full overflow-hidden">
        <ErrorBoundary>
          <React.Suspense fallback={<div className="mx-auto max-w-6xl px-6 py-10 text-amber-700">Loading reader...</div>}>
            <GrimmMarchenApp />
          </React.Suspense>
        </ErrorBoundary>
      </div>
    </AppAnimationWrapper>
  );
}
