import React from 'react';
import ErrorBoundary from '../../components/ErrorBoundary';
import AppAnimationWrapper from '../../components/AppAnimationWrapper';

const GrimmMarchenApp = React.lazy(() => import('../../grimm-reader'));

export default function AppLayout() {
  return (
    <AppAnimationWrapper>
      <div className="h-screen overflow-hidden">
        <ErrorBoundary>
          <React.Suspense fallback={<div className="mx-auto max-w-6xl px-6 py-10 text-amber-700">Loading reader...</div>}>
            <GrimmMarchenApp />
          </React.Suspense>
        </ErrorBoundary>
      </div>
    </AppAnimationWrapper>
  );
}
