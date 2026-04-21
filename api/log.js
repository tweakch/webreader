/**
 * Serverless log sink.
 *
 * Accepts POST /api/log with JSON body `{ entries: [...] }` (also handles
 * `navigator.sendBeacon` which sends application/json with no preflight).
 * Each entry is printed to stdout as a JSON line — Vercel captures this in
 * the Runtime Logs tab where it can be filtered, streamed, and downloaded
 * (NDJSON). No persistence here; the Vercel log drain is the store.
 *
 * Kept deliberately minimal: no auth, no schema validation, no rate limit.
 * Client-side `gestureLog` batches and throttles so the endpoint is hit at
 * most once every ~750ms per tab during active gesture activity.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  try {
    // sendBeacon delivers the body as a Blob; Node parses it if
    // `content-type: application/json`. Fall back to manual parse for
    // environments that don't.
    let payload = req.body;
    if (typeof payload === 'string') payload = JSON.parse(payload);
    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ error: 'bad body' });
      return;
    }

    const entries = Array.isArray(payload.entries) ? payload.entries : [];
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      null;
    const ua = req.headers['user-agent'] || null;

    for (const entry of entries) {
      const line = JSON.stringify({ ...entry, ip, ua });
      console.log(`[gestureLog] ${line}`);
    }

    res.status(204).end();
  } catch (err) {
    console.error('[gestureLog] sink error', err?.message);
    res.status(500).json({ error: 'sink error' });
  }
}
