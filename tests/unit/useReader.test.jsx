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

  const PARA_SLOT_MAP = new Map([
    [0, { id: 'pilot', src: '/packs/pilot.svg', alt: 'Pilot', anchor: { type: 'paragraph', index: 0 } }],
  ]);
  const EMPTY_PARA_MAP = new Map();
  const MISSING_SRC_MAP = new Map([
    [0, { id: 'x', src: null, anchor: { type: 'paragraph', index: 0 } }],
  ]);

  it('inserts a dedicated illustration page after the anchored paragraph', () => {
    const refs = createRefs();
    const pendingResumePageRef = { current: null };
    const shortStory = { ...STORY, content: 'Es war einmal.\n\nDann geschah etwas.' };
    const { result } = renderHook(() => useReader({
      ...refs,
      selectedStory: shortStory,
      selectedVariant: null,
      typographyValues: {
        fontSize: 18,
        lineHeight: 1.8,
        textWidth: 640,
        hPadding: 32,
        wordSpacing: 'normal',
        fontFamily: 'Georgia, serif',
      },
      showSpeedReader: false,
      showIllustrations: true,
      illustrationByParagraph: PARA_SLOT_MAP,
      pendingResumePageRef,
    }));

    const slotIndex = result.current.pages.findIndex((p) => p.illustration?.src);
    expect(slotIndex).toBeGreaterThanOrEqual(0);
    expect(result.current.pages[slotIndex].tokens).toEqual([]);
    expect(result.current.pages[slotIndex].illustration.id).toBe('pilot');
    const textBefore = result.current.pages.slice(0, slotIndex).flatMap((p) => p.tokens.map((t) => t.word));
    expect(textBefore.join(' ')).toMatch(/Es war einmal/);
    const textAfter = result.current.pages.slice(slotIndex + 1).flatMap((p) => p.tokens.map((t) => t.word));
    expect(textAfter.join(' ')).toMatch(/Dann geschah etwas/);
  });

  it('does not change paging when byParagraph is empty (missing pack)', () => {
    const refs = createRefs();
    const typographyValues = {
      fontSize: 18,
      lineHeight: 1.8,
      textWidth: 640,
      hPadding: 32,
      wordSpacing: 'normal',
      fontFamily: 'Georgia, serif',
    };
    const { result: without } = renderHook(() => useReader({
      ...refs,
      selectedStory: STORY,
      selectedVariant: null,
      typographyValues,
      showSpeedReader: false,
      showIllustrations: true,
      illustrationByParagraph: EMPTY_PARA_MAP,
      pendingResumePageRef: { current: null },
    }));
    const { result: missing } = renderHook(() => useReader({
      ...createRefs(),
      selectedStory: STORY,
      selectedVariant: null,
      typographyValues,
      showSpeedReader: false,
      showIllustrations: true,
      illustrationByParagraph: MISSING_SRC_MAP,
      pendingResumePageRef: { current: null },
    }));

    expect(missing.current.totalPages).toBe(without.current.totalPages);
    expect(missing.current.pages.some((p) => p.illustration)).toBe(false);
  });

  it('consumes getIllustrationSlotMap and leaves paging unchanged without a pack', () => {
    const refs = createRefs();
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
      showSpeedReader: false,
      showIllustrations: true,
      pendingResumePageRef: { current: null },
    }));

    expect(result.current.pages.some((p) => p.illustration)).toBe(false);
    expect(result.current.totalPages).toBeGreaterThan(0);
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
