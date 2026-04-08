import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import MarketingLayout from './layouts/MarketingLayout';
import AppLayout from './layouts/AppLayout';

import HomePage from './pages/marketing/HomePage';
import ProductPage from './pages/marketing/ProductPage';
import ProductFeaturesPage from './pages/marketing/ProductFeaturesPage';
import ProductHowItWorksPage from './pages/marketing/ProductHowItWorksPage';
import ProductIntegrationsPage from './pages/marketing/ProductIntegrationsPage';
import UseCasesPage from './pages/marketing/UseCasesPage';
import UseCasesStudentsPage from './pages/marketing/UseCasesStudentsPage';
import UseCasesProfessionalsPage from './pages/marketing/UseCasesProfessionalsPage';
import UseCasesResearchersPage from './pages/marketing/UseCasesResearchersPage';
import UseCasesCreatorsPage from './pages/marketing/UseCasesCreatorsPage';
import PricingPage from './pages/marketing/PricingPage';
import BlogPage from './pages/marketing/BlogPage';
import AboutPage from './pages/marketing/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/app',
    element: <AppLayout />,
  },
  {
    path: '/',
    element: <MarketingLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'product', element: <ProductPage /> },
      { path: 'product/features', element: <ProductFeaturesPage /> },
      { path: 'product/how-it-works', element: <ProductHowItWorksPage /> },
      { path: 'product/integrations', element: <ProductIntegrationsPage /> },
      { path: 'use-cases', element: <UseCasesPage /> },
      { path: 'use-cases/students', element: <UseCasesStudentsPage /> },
      { path: 'use-cases/professionals', element: <UseCasesProfessionalsPage /> },
      { path: 'use-cases/researchers', element: <UseCasesResearchersPage /> },
      { path: 'use-cases/creators', element: <UseCasesCreatorsPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
