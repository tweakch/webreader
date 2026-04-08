import React from 'react';
import { OpenFeatureProvider } from '@openfeature/react-sdk';
import GrimmMarchenApp from '../../grimm-reader';
import '../lib/initFeatureFlags.js';

export default function AppLayout() {
  return (
    <OpenFeatureProvider>
      <GrimmMarchenApp />
    </OpenFeatureProvider>
  );
}
