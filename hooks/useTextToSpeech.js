import { useState, useEffect, useRef, useCallback } from 'react';

/** Playback rates exposed in the TTS rate picker; index is the stored selection. */
export const TTS_RATES = [0.7, 0.85, 1.0, 1.2, 1.5];
const DEFAULT_RATE_IDX = 2;

function getSynthesis() {
  return typeof window !== 'undefined' ? window.speechSynthesis : null;
}

function loadVoicesOnce(synth) {
  return new Promise((resolve) => {
    const existing = synth.getVoices();
    if (existing && existing.length) return resolve(existing);
    const handle = () => {
      synth.removeEventListener('voiceschanged', handle);
      resolve(synth.getVoices());
    };
    synth.addEventListener('voiceschanged', handle);
  });
}

/**
 * Text-to-speech hook built on the Web Speech API.
 * Exposes play/pause/stop, rate + voice selection, and an `onFinish` callback
 * that fires when the current utterance ends naturally (used for page auto-advance).
 */
export function useTextToSpeech({ enabled = false, lang = 'de-DE' } = {}) {
  const synth = getSynthesis();
  const supported = !!synth;

  const [voices, setVoices] = useState([]);
  const [voiceURI, setVoiceURI] = useState(() => localStorage.getItem('wr-tts-voice') ?? '');
  const [rateIdx, setRateIdx] = useState(() => {
    const v = parseInt(localStorage.getItem('wr-tts-rate') ?? '');
    return Number.isFinite(v) ? v : DEFAULT_RATE_IDX;
  });
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);

  const finishHandlerRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => { localStorage.setItem('wr-tts-voice', voiceURI); }, [voiceURI]);
  useEffect(() => { localStorage.setItem('wr-tts-rate', String(rateIdx)); }, [rateIdx]);

  useEffect(() => {
    if (!supported) return;
    let active = true;
    loadVoicesOnce(synth).then((vs) => {
      if (!active) return;
      const localized = vs.filter(v => v.lang.startsWith(lang.slice(0, 2)));
      setVoices(localized.length ? localized : vs);
    });
    return () => { active = false; };
  }, [supported, synth, lang]);

  const stop = useCallback(() => {
    if (!supported) return;
    finishHandlerRef.current = null;
    synth.cancel();
    setPlaying(false);
    setPaused(false);
  }, [supported, synth]);

  const speak = useCallback((text, { onFinish } = {}) => {
    if (!supported || !text) return;
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = TTS_RATES[rateIdx] ?? 1.0;
    const chosen = voices.find(v => v.voiceURI === voiceURI);
    if (chosen) utter.voice = chosen;

    finishHandlerRef.current = onFinish ?? null;
    utteranceRef.current = utter;

    utter.onend = () => {
      setPlaying(false);
      setPaused(false);
      const cb = finishHandlerRef.current;
      finishHandlerRef.current = null;
      if (cb) cb();
    };
    utter.onerror = () => {
      setPlaying(false);
      setPaused(false);
      finishHandlerRef.current = null;
    };

    setPlaying(true);
    setPaused(false);
    synth.speak(utter);
  }, [supported, synth, lang, rateIdx, voices, voiceURI]);

  const pause = useCallback(() => {
    if (!supported || !playing) return;
    synth.pause();
    setPaused(true);
  }, [supported, synth, playing]);

  const resume = useCallback(() => {
    if (!supported || !paused) return;
    synth.resume();
    setPaused(false);
  }, [supported, synth, paused]);

  // Stop on disable or unmount
  useEffect(() => {
    if (!enabled) stop();
    return () => stop();
  }, [enabled, stop]);

  return {
    supported,
    voices,
    voiceURI,
    setVoiceURI,
    rateIdx,
    setRateIdx,
    rate: TTS_RATES[rateIdx] ?? 1.0,
    playing,
    paused,
    speak,
    pause,
    resume,
    stop,
  };
}
