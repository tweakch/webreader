// Vercel Flags Explorer discovery endpoint.
//
// The Flags Explorer (Vercel Toolbar → Feature Flags panel) fetches
// `/.well-known/vercel/flags` and expects an `ApiData` response describing
// every flag the app exposes. See https://vercel.com/docs/flags/flags-explorer.
//
// The registry in `src/lib/featureRegistryData.js` is the single source of
// truth for flag metadata (label, description, status, hidden, options). The
// runtime OpenFeature `flags.json` lives next to it; both are kept in sync by
// `tests/unit/registryConsistency.test.js`.
//
// Auth: Vercel sends `Authorization: Bearer <FLAGS_SECRET>`. `verifyAccess`
// from the `flags` package validates that the request comes from the
// authenticated Vercel Toolbar before we return definitions.

import { verifyAccess } from 'flags';
import flags from '../../../flags.json' with { type: 'json' };
import { FEATURE_REGISTRY_DATA } from '../../../src/lib/featureRegistryData.js';

const REGISTRY_BY_KEY = Object.fromEntries(
  FEATURE_REGISTRY_DATA.map((entry) => [entry.key, entry]),
);

function describe(key, config) {
  const entry = REGISTRY_BY_KEY[key];
  const variants = Object.entries(config.variants ?? {});
  const options = variants.map(([label, value]) => ({ value, label }));
  const description = entry
    ? `${entry.label} — ${entry.description} (${entry.status}${entry.hidden ? ', hidden' : ''})`
    : `Feature flag "${key}".`;

  return {
    options,
    origin: `/profile?flag=${encodeURIComponent(key)}`,
    description,
    declaredInCode: true,
    defaultValue: config.variants?.[config.defaultVariant],
  };
}

export default async function handler(req, res) {
  const access = await verifyAccess(req.headers.authorization);
  if (!access) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const definitions = Object.fromEntries(
    Object.entries(flags).map(([key, config]) => [key, describe(key, config)]),
  );

  return res.status(200).json({
    definitions,
    hints: [],
  });
}
