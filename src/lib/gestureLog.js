/**
 * Client-side gesture/interaction logger.
 *
 * Emits structured events from anywhere pointer / touch / click handling
 * happens in the app. Each entry is buffered and batch-POSTed to `/api/log`
 * where the serverless sink prints to stdout — Vercel captures that stream
 * in the Logs tab, downloadable as NDJSON.
 *
 * Also logs to `console.debug` so the same trace is visible in DevTools
 * during local repro. Safe to call at human-interaction frequency; do NOT
 * call on every pointermove (that would flood the batch).
 *
 * Enable/disable at runtime via `localStorage['wr-gesture-log'] = '0'` to
 * silence, `'1'` to force on. Default is on.
 */
const ENDPOINT = '/api/log';
const FLUSH_INTERVAL_MS = 750;
const MAX_BATCH = 40;

let buffer = [];
let flushTimer = null;
let sessionId = null;

function getSessionId() {
  if (sessionId) return sessionId;
  try {
    let sid = sessionStorage.getItem('wr-gesture-session');
    if (!sid) {
      sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem('wr-gesture-session', sid);
    }
    sessionId = sid;
  } catch {
    sessionId = `ephemeral-${Math.random().toString(36).slice(2, 10)}`;
  }
  return sessionId;
}

function isEnabled() {
  if (typeof window === 'undefined') return false;
  try {
    const v = localStorage.getItem('wr-gesture-log');
    if (v === '0') return false;
  } catch {
    // fall through
  }
  return true;
}

function scheduleFlush() {
  if (flushTimer !== null) return;
  flushTimer = setTimeout(flush, FLUSH_INTERVAL_MS);
}

function flush() {
  flushTimer = null;
  if (buffer.length === 0) return;
  const entries = buffer;
  buffer = [];
  const body = JSON.stringify({ entries });
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      const ok = navigator.sendBeacon(ENDPOINT, blob);
      if (ok) return;
    }
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Network down is fine — DevTools console still has the entries.
  }
}

if (typeof window !== 'undefined') {
  // Make sure in-flight entries escape the page before unload.
  window.addEventListener('pagehide', flush);
  window.addEventListener('beforeunload', flush);
}

/**
 * Record a single interaction event.
 *
 * @param {string} name  Dotted name, e.g. 'gesture.pointerdown', 'tap.zone.left'
 * @param {object} [data] Arbitrary serializable payload. Keep small.
 */
export function gestureLog(name, data = {}) {
  if (!isEnabled()) return;
  const entry = {
    t: Date.now(),
    sid: getSessionId(),
    name,
    ...data,
  };
  buffer.push(entry);
  // Mirror to DevTools so local repro doesn't need the network round-trip.
  if (typeof console !== 'undefined' && console.debug) {
    console.debug(`[gl] ${name}`, data);
  }
  if (buffer.length >= MAX_BATCH) flush();
  else scheduleFlush();
}

export function describeTarget(el) {
  if (!el || !(el instanceof Element)) return null;
  const id = el.id ? `#${el.id}` : '';
  const testId = el.getAttribute?.('data-testid');
  const cls =
    typeof el.className === 'string' && el.className
      ? `.${el.className.split(/\s+/).slice(0, 2).join('.')}`
      : '';
  return `${el.tagName.toLowerCase()}${id}${testId ? `[tid=${testId}]` : ''}${cls}`;
}
