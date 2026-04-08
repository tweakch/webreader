import { OpenFeature, InMemoryProvider } from '@openfeature/react-sdk';
import flagConfig from '../../flags.json';

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
