import React from 'react';
import { Outlet } from 'react-router-dom';
import MarketingNav from '../components/marketing/MarketingNav';
import MarketingFooter from '../components/marketing/MarketingFooter';

export default function MarketingLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-amber-50 text-amber-950">
      <MarketingNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}
