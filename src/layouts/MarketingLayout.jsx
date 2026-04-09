import React from 'react';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import MarketingNav from '../components/marketing/MarketingNav';
import MarketingFooter from '../components/marketing/MarketingFooter';

export default function MarketingLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-amber-50 text-amber-950">
      <MarketingNav />
      <main className="flex-1">
        <ErrorBoundary>
          <React.Suspense fallback={<div className="mx-auto max-w-6xl px-6 py-10 text-amber-700">Loading...</div>}>
            <Outlet />
          </React.Suspense>
        </ErrorBoundary>
      </main>
      <MarketingFooter />
    </div>
  );
}
