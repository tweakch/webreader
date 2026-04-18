import { renderHook, act } from '@testing-library/react';
import { useTextToSpeech, TTS_RATES } from '../../hooks/useTextToSpeech';

function mockSpeechSynthesis() {
  const listeners = {};
  const queue = [];
  const synth = {
    speak: vi.fn((utter) => {
      queue.push(utter);
      synth._lastUtter = utter;
    }),
    cancel: vi.fn(() => { queue.length = 0; }),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => [
      { voiceURI: 'de-DE-Anna', name: 'Anna', lang: 'de-DE' },
      { voiceURI: 'en-US-Mike', name: 'Mike', lang: 'en-US' },
    ]),
    addEventListener: vi.fn((evt, fn) => { listeners[evt] = fn; }),
    removeEventListener: vi.fn(() => {}),
  };
  window.speechSynthesis = synth;
  window.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; this.onend = null; this.onerror = null; }
  };
  return synth;
}

describe('useTextToSpeech', () => {
  let synth;
  beforeEach(() => {
    synth = mockSpeechSynthesis();
  });

  it('reports supported=true when speechSynthesis exists', () => {
    const { result } = renderHook(() => useTextToSpeech({ enabled: true }));
    expect(result.current.supported).toBe(true);
  });

  it('filters voices by locale (de)', async () => {
    const { result, rerender } = renderHook(() => useTextToSpeech({ enabled: true, lang: 'de-DE' }));
    // voices load via async promise
    await act(async () => { await Promise.resolve(); });
    rerender();
    expect(result.current.voices.map(v => v.voiceURI)).toEqual(['de-DE-Anna']);
  });

  it('persists rate and voice to localStorage', () => {
    const { result } = renderHook(() => useTextToSpeech({ enabled: true }));
    act(() => { result.current.setRateIdx(4); });
    act(() => { result.current.setVoiceURI('de-DE-Anna'); });
    expect(localStorage.getItem('wr-tts-rate')).toBe('4');
    expect(localStorage.getItem('wr-tts-voice')).toBe('de-DE-Anna');
    expect(TTS_RATES[4]).toBe(1.5);
  });

  it('invokes onFinish when utterance ends naturally', () => {
    const { result } = renderHook(() => useTextToSpeech({ enabled: true }));
    const finish = vi.fn();
    act(() => { result.current.speak('Hallo Welt', { onFinish: finish }); });
    const utter = synth._lastUtter;
    act(() => { utter.onend(); });
    expect(finish).toHaveBeenCalledTimes(1);
    expect(result.current.playing).toBe(false);
  });

  it('stop() cancels synthesis and clears onFinish', () => {
    const { result } = renderHook(() => useTextToSpeech({ enabled: true }));
    const finish = vi.fn();
    act(() => { result.current.speak('text', { onFinish: finish }); });
    act(() => { result.current.stop(); });
    expect(synth.cancel).toHaveBeenCalled();
    // onend fired after stop (cancel triggers it) should NOT call finish
    const utter = synth._lastUtter;
    act(() => { utter.onend?.(); });
    expect(finish).not.toHaveBeenCalled();
  });
});
