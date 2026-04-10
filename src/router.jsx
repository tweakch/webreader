import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import MarketingLayout from './layouts/MarketingLayout';
import AppLayout from './layouts/AppLayout';

const HomePage = React.lazy(() => import('./pages/marketing/HomePage'));
const ProductPage = React.lazy(() => import('./pages/marketing/ProductPage'));
const ProductFeaturesPage = React.lazy(() => import('./pages/marketing/ProductFeaturesPage'));
const ProductHowItWorksPage = React.lazy(() => import('./pages/marketing/ProductHowItWorksPage'));
const ProductIntegrationsPage = React.lazy(() => import('./pages/marketing/ProductIntegrationsPage'));
const UseCasesPage = React.lazy(() => import('./pages/marketing/UseCasesPage'));
const UseCasesStudentsPage = React.lazy(() => import('./pages/marketing/UseCasesStudentsPage'));
const UseCasesEducatorsPage = React.lazy(() => import('./pages/marketing/UseCasesEducatorsPage'));
const UseCasesProfessionalsPage = React.lazy(() => import('./pages/marketing/UseCasesProfessionalsPage'));
const UseCasesResearchersPage = React.lazy(() => import('./pages/marketing/UseCasesResearchersPage'));
const UseCasesCreatorsPage = React.lazy(() => import('./pages/marketing/UseCasesCreatorsPage'));
const PricingPage = React.lazy(() => import('./pages/marketing/PricingPage'));
const BlogPage = React.lazy(() => import('./pages/marketing/BlogPage'));
const AboutPage = React.lazy(() => import('./pages/marketing/AboutPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

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
      { path: 'use-cases/educators', element: <UseCasesEducatorsPage /> },
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
