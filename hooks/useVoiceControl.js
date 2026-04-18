import { useState, useEffect, useRef, useCallback } from 'react';

function getRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isVoiceControlSupported() {
  return getRecognitionCtor() !== null;
}

/**
 * Microphone capture hook built on the Web Speech API.
 *
 * Two modes:
 *   - push-to-talk (default):       one utterance per `start()` call.
 *   - continuous (hands-free):      restarts the session on every `onend`.
 *
 * Delivers final transcripts to `onFinalTranscript` and interim ones to
 * `onInterimTranscript`. The parent is expected to run them through
 * `parseVoiceCommand` from `src/lib/voiceCommands.js`.
 *
 * Notes:
 *   - Browsers throttle recognition when the tab is hidden; we stop cleanly on
 *     unmount and on `enabled` going false.
 *   - Some browsers (notably Chromium-based) only deliver voices via the
 *     `voiceschanged` event — same as `useTextToSpeech`.
 *   - `lang` should follow the currently selected story. DE-CH content falls
 *     back to de-DE grammar on browsers without Swiss variants.
 */
export function useVoiceControl({
  enabled = false,
  lang = 'de-DE',
  continuous = false,
  onFinalTranscript,
  onInterimTranscript,
  onError,
} = {}) {
  const Ctor = getRecognitionCtor();
  const supported = !!Ctor;

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const continuousRef = useRef(continuous);
  const enabledRef = useRef(enabled);
  const onFinalRef = useRef(onFinalTranscript);
  const onInterimRef = useRef(onInterimTranscript);
  const onErrorRef = useRef(onError);
  const wantListeningRef = useRef(false);

  useEffect(() => { continuousRef.current = continuous; }, [continuous]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { onFinalRef.current = onFinalTranscript; }, [onFinalTranscript]);
  useEffect(() => { onInterimRef.current = onInterimTranscript; }, [onInterimTranscript]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch { /* ignore */ }
    }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (!supported || !enabledRef.current) return;
    let rec = recognitionRef.current;
    if (!rec) {
      rec = new Ctor();
      rec.lang = lang;
      rec.interimResults = true;
      rec.continuous = continuousRef.current;
      rec.onresult = (event) => {
        let finalText = '';
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const chunk = result[0]?.transcript ?? '';
          if (result.isFinal) finalText += chunk;
          else interimText += chunk;
        }
        if (interimText) {
          setTranscript(interimText);
          onInterimRef.current?.(interimText);
        }
        if (finalText) {
          setTranscript(finalText);
          onFinalRef.current?.(finalText);
        }
      };
      rec.onerror = (event) => {
        const message = event?.error ?? 'unknown';
        setError(message);
        onErrorRef.current?.(message);
      };
      rec.onend = () => {
        setListening(false);
        if (continuousRef.current && wantListeningRef.current && enabledRef.current) {
          // Browsers end a "continuous" session on silence; relaunch.
          try {
            rec.start();
            setListening(true);
          } catch {
            wantListeningRef.current = false;
          }
        }
      };
      rec.onstart = () => {
        setError(null);
        setListening(true);
      };
      recognitionRef.current = rec;
    }
    rec.continuous = continuousRef.current;
    rec.lang = lang;
    wantListeningRef.current = true;
    try {
      rec.start();
    } catch {
      // start() throws if already running; treat as a no-op.
    }
  }, [Ctor, supported, lang]);

  const toggle = useCallback(() => {
    if (listening) stop(); else start();
  }, [listening, start, stop]);

  useEffect(() => {
    if (!enabled) stop();
  }, [enabled, stop]);

  useEffect(() => () => {
    wantListeningRef.current = false;
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch { /* ignore */ }
    }
  }, []);

  return {
    supported,
    listening,
    transcript,
    error,
    start,
    stop,
    toggle,
  };
}
