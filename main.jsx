import React from 'react';
import ReactDOM from 'react-dom/client';
import { OpenFeature, OpenFeatureProvider, InMemoryProvider } from '@openfeature/react-sdk';
import GrimmMarchenApp from './grimm-reader';
import './index.css';
import flagConfig from './flags.json';

// Allow tests to override individual flag variants via localStorage.
// Set key '__openfeature_overrides__' to a JSON object mapping flag key → variant name.
// e.g. localStorage.setItem('__openfeature_overrides__', JSON.stringify({ 'word-count': 'on' }))
const storageOverrides = JSON.parse(localStorage.getItem('__openfeature_overrides__') ?? '{}');
const resolvedFlags = Object.fromEntries(
  Object.entries(flagConfig).map(([key, config]) => [
    key,
    Object.hasOwn(storageOverrides, key)
      ? { ...config, defaultVariant: storageOverrides[key] }
      : config,
  ]),
);
OpenFeature.setProvider(new InMemoryProvider(resolvedFlags));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OpenFeatureProvider>
      <GrimmMarchenApp />
    </OpenFeatureProvider>
  </React.StrictMode>
);
