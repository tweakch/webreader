import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { OpenFeatureProvider } from '@openfeature/react-sdk';
import { router } from './src/router';
import ErrorBoundary from './components/ErrorBoundary';
import AppAnimationWrapper from './components/AppAnimationWrapper';
import i18n from './src/lib/i18n';
import './src/lib/initFeatureFlags';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OpenFeatureProvider>
      <ErrorBoundary>
        <I18nextProvider i18n={i18n}>
          <RouterProvider router={router} />
        </I18nextProvider>
      </ErrorBoundary>
    </OpenFeatureProvider>
  </React.StrictMode>
);
