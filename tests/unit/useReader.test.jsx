import { createRef } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useReader } from '../../hooks/useReader';

const STORY = {
  id: 'grimm/aschenputtel',
  title: 'Aschenputtel',
  content: Array.from({ length: 120 }, (_, i) => `wort${i + 1}`).join(' '),
};

const VARIANT = {
  adaptionName: 'Kurzfassung',
  content: 'eins zwei drei vier',
};

function createMeasureElement() {
  const el = document.createElement('div');
  Object.defineProperty(el, 'scrollHeight', {
    get() {
      const textLength = (el.textContent ?? '').length;
      return Math.ceil(textLength / 45) * 22 + 20;
    },
  });
  return el;
}

function createRefs() {
  const readerAreaRef = createRef();
  const measureRef = createRef();
  readerAreaRef.current = { clientHeight: 220, clientWidth: 900 };
  measureRef.current = createMeasureElement();
  return { readerAreaRef, measureRef };
}

describe('useReader', () => {
  beforeEach(() => {
    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }
    global.ResizeObserver = MockResizeObserver;
    vi.useFakeTimers();
  });

  it('builds speed-reader words and word count from selected variant content', () => {
    const refs = createRefs();
    const pendingResumePageRef = { current: null };
    const { result } = renderHook(() => useReader({
      ...refs,
      selectedStory: STORY,
      selectedVariant: VARIANT,
      typographyValues: {
        fontSize: 18,
        lineHeight: 1.8,
        textWidth: 640,
        hPadding: 32,
        wordSpacing: 'normal',
        fontFamily: 'Georgia, serif',
      },
      showSpeedReader: true,
      pendingResumePageRef,
    }));

    expect(result.current.srWords).toEqual(['eins', 'zwei', 'drei', 'vier']);
    expect(result.current.storyWordCount).toBe(4);
  });

  it('restores pending resume page on initial build and clears pending value', () => {
    const refs = createRefs();
    const pendingResumePageRef = { current: 2 };
    const { result } = renderHook(() => useReader({
      ...refs,
      selectedStory: STORY,
      selectedVariant: null,
      typographyValues: {
        fontSize: 18,
        lineHeight: 1.8,
        textWidth: 640,
        hPadding: 32,
        wordSpacing: 'normal',
        fontFamily: 'Georgia, serif',
      },
      showSpeedReader: true,
      pendingResumePageRef,
    }));

    expect(result.current.totalPages).toBeGreaterThan(1);
    expect(result.current.currentPage).toBe(2);
    expect(pendingResumePageRef.current).toBeNull();
  });

  it('navigates to next page on ArrowRight keydown', () => {
    const refs = createRefs();
    const pendingResumePageRef = { current: null };
    const { result } = renderHook(() => useReader({
      ...refs,
      selectedStory: STORY,
      selectedVariant: null,
      typographyValues: {
        fontSize: 18,
        lineHeight: 1.8,
        textWidth: 640,
        hPadding: 32,
        wordSpacing: 'normal',
        fontFamily: 'Georgia, serif',
      },
      showSpeedReader: true,
      pendingResumePageRef,
    }));

    expect(result.current.currentPage).toBe(0);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      vi.advanceTimersByTime(131);
    });
    expect(result.current.currentPage).toBe(1);
  });

  it('forces speedReaderMode off when speed reader flag is disabled', () => {
    const refs = createRefs();
    const pendingResumePageRef = { current: null };
    const { result, rerender } = renderHook(
      ({ showSpeedReader }) => useReader({
        ...refs,
        selectedStory: STORY,
        selectedVariant: null,
        typographyValues: {
          fontSize: 18,
          lineHeight: 1.8,
          textWidth: 640,
          hPadding: 32,
          wordSpacing: 'normal',
          fontFamily: 'Georgia, serif',
        },
        showSpeedReader,
        pendingResumePageRef,
      }),
      { initialProps: { showSpeedReader: true } },
    );

    act(() => result.current.setSpeedReaderMode(true));
    expect(result.current.speedReaderMode).toBe(true);

    rerender({ showSpeedReader: false });
    expect(result.current.speedReaderMode).toBe(false);
  });
});
