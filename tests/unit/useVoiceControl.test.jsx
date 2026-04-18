import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVoiceControl, isVoiceControlSupported } from '../../hooks/useVoiceControl';

function mockRecognition() {
  const instances = [];
  class FakeRecognition {
    constructor() {
      this.lang = '';
      this.interimResults = false;
      this.continuous = false;
      this.onresult = null;
      this.onerror = null;
      this.onend = null;
      this.onstart = null;
      this._started = 0;
      this._stopped = 0;
      instances.push(this);
    }
    start() {
      this._started += 1;
      this.onstart?.();
    }
    stop() {
      this._stopped += 1;
      this.onend?.();
    }
  }
  window.SpeechRecognition = FakeRecognition;
  return instances;
}

describe('useVoiceControl', () => {
  beforeEach(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
  });

  it('reports supported=false when the API is missing', () => {
    const { result } = renderHook(() => useVoiceControl({ enabled: true }));
    expect(result.current.supported).toBe(false);
    expect(isVoiceControlSupported()).toBe(false);
  });

  it('reports supported=true when SpeechRecognition exists', () => {
    mockRecognition();
    const { result } = renderHook(() => useVoiceControl({ enabled: true }));
    expect(result.current.supported).toBe(true);
    expect(isVoiceControlSupported()).toBe(true);
  });

  it('start() begins listening and stop() ends it', () => {
    const instances = mockRecognition();
    const { result } = renderHook(() => useVoiceControl({ enabled: true }));
    act(() => result.current.start());
    expect(result.current.listening).toBe(true);
    expect(instances[0]._started).toBe(1);
    act(() => result.current.stop());
    expect(result.current.listening).toBe(false);
    expect(instances[0]._stopped).toBe(1);
  });

  it('does not start when disabled', () => {
    const instances = mockRecognition();
    const { result } = renderHook(() => useVoiceControl({ enabled: false }));
    act(() => result.current.start());
    expect(result.current.listening).toBe(false);
    // No recognition instance ever constructed because start() exits early.
    expect(instances.length).toBe(0);
  });

  it('delivers final transcripts to onFinalTranscript', () => {
    const instances = mockRecognition();
    const onFinal = vi.fn();
    const { result } = renderHook(() =>
      useVoiceControl({ enabled: true, onFinalTranscript: onFinal }),
    );
    act(() => result.current.start());
    const rec = instances[0];
    act(() => {
      rec.onresult({
        resultIndex: 0,
        results: (() => {
          const r = [[{ transcript: 'weiter' }]];
          r[0].isFinal = true;
          return r;
        })(),
      });
    });
    expect(onFinal).toHaveBeenCalledWith('weiter');
  });

  it('restarts recognition onend when continuous/hands-free', () => {
    const instances = mockRecognition();
    const { result } = renderHook(() =>
      useVoiceControl({ enabled: true, continuous: true }),
    );
    act(() => result.current.start());
    const rec = instances[0];
    expect(rec._started).toBe(1);
    // Simulate the browser ending the session on silence.
    act(() => rec.onend());
    // The hook should have relaunched: _started now 2.
    expect(rec._started).toBe(2);
    expect(result.current.listening).toBe(true);
    // Explicit stop clears the wantListening flag and no further restart happens.
    act(() => result.current.stop());
    expect(rec._stopped).toBe(1);
    act(() => rec.onend());
    expect(rec._started).toBe(2);
  });

  it('stops on unmount', () => {
    const instances = mockRecognition();
    const { result, unmount } = renderHook(() => useVoiceControl({ enabled: true }));
    act(() => result.current.start());
    const rec = instances[0];
    unmount();
    expect(rec._stopped).toBeGreaterThanOrEqual(1);
  });
});
