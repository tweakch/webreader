// Vercel Flags discovery endpoint.
//
// When deployed on Vercel, the Toolbar's Feature Flags panel fetches
// `/.well-known/vercel/flags` and expects a JSON payload describing every
// flag the app exposes. This function reads the same flags.json that the
// OpenFeature InMemoryProvider reads at runtime, so the Toolbar stays in
// sync with the app's source of truth.
//
// Auth: Vercel sends `Authorization: Bearer <FLAGS_SECRET>`. The endpoint
// only responds when the secret matches. Set `FLAGS_SECRET` in the Vercel
// project env vars.

import flags from '../../../flags.json' with { type: 'json' };

function describe(key, config) {
  const variants = Object.entries(config.variants ?? {}).map(([label, value]) => ({
    label,
    value,
  }));
  return {
    key,
    origin: `/profile?flag=${encodeURIComponent(key)}`,
    description: `Toggle for the "${key}" feature flag.`,
    options: variants,
    defaultValue: config.variants?.[config.defaultVariant],
  };
}

export default function handler(req, res) {
  const expected = process.env.FLAGS_SECRET;
  const provided = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
  if (!expected || provided !== expected) {
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
