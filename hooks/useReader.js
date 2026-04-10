import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';

/**
 * useReader - encapsulates page pagination, navigation, and speed reader logic.
 *
 * Dependencies:
 * - readerAreaRef: ref to the reading viewport
 * - measureRef: ref to the off-screen measurement container
 * - selectedStory: currently selected story object or null
 * - selectedVariant: optional variant object with { adaptionName, content }
 * - typographyValues: { fontSize, lineHeight, textWidth, hPadding, wordSpacing, fontFamily }
 * - showSpeedReader: feature flag for speed reader
 * - pendingResumePageRef: ref for resume page restoration
 *
 * Returns:
 * - pages: array of { tokens: [...], hasTitle: bool }
 * - currentPage: current page index
 * - setCurrentPage: function to set current page
 * - totalPages: total number of pages
 * - goToPage: function to navigate to page with animation
 * - isFlashing: whether flash overlay should show
 * - srWords: array of words for speed reader mode
 * - speedReaderMode: boolean
 * - setSpeedReaderMode: function to toggle speed reader
 * - storyWordCount: word count of selected story
 */
export function useReader({
  readerAreaRef,
  measureRef,
  selectedStory,
  selectedVariant,
  typographyValues: { fontSize, lineHeight, textWidth, hPadding, wordSpacing, fontFamily },
  showSpeedReader,
  pendingResumePageRef,
}) {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isFlashing, setIsFlashing] = useState(false);
  const [speedReaderMode, setSpeedReaderMode] = useState(false);
  const lastResetStoryRef = useRef(null);

  // Build pages via DOM measurement word-packing algorithm
  const buildPages = useCallback(() => {
    if (!readerAreaRef.current || !measureRef.current || !selectedStory) return;

    const viewportH = readerAreaRef.current.clientHeight;
    const viewportW = readerAreaRef.current.clientWidth;
    if (viewportH === 0) return;

    const PADDING_V = 32; // 2rem top + bottom (fixed)
    const contentW = Math.min(viewportW - hPadding * 2, textWidth);
    const availableH = viewportH - PADDING_V * 2; // subtract top+bottom padding

    const m = measureRef.current;
    m.style.width = contentW + 'px'; // exact same width as the rendered text
    m.style.padding = '0';

    const activeContent = selectedVariant?.content ?? selectedStory.content;
    const activeTitle = selectedVariant?.title ?? selectedStory.title;

    // Split content into tokens: words and paragraph markers
    const paragraphs = activeContent.split('\n\n');
    const tokens = [];

    paragraphs.forEach((para) => {
      const words = para.split(/\s+/).filter(w => w.length > 0);
      words.forEach((word, wordIdx) => {
        tokens.push({
          word,
          isPara: wordIdx === words.length - 1, // last word of THIS paragraph
        });
      });
    });

    // Render and measure: build pages by adding words until they overflow
    const pages = [];
    let isFirstPage = true;

    while (tokens.length > 0) {
      m.innerHTML = '';

      // Add title to first page only
      if (isFirstPage) {
        const h2 = document.createElement('h2');
        h2.style.cssText = `font-size:2.25rem;font-weight:bold;margin:0 0 0.5rem;font-family:${fontFamily};line-height:1.25;`;
        h2.textContent = activeTitle;
        m.appendChild(h2);
        const divider = document.createElement('div');
        divider.style.cssText = 'height:4px;width:5rem;margin-bottom:2rem;';
        m.appendChild(divider);
      }

      // Add a placeholder paragraph container for text
      const contentDiv = document.createElement('div');
      contentDiv.style.cssText = `font-size:${fontSize}px;line-height:${lineHeight};word-spacing:${wordSpacing};font-family:${fontFamily};`;
      let currentPara = document.createElement('p');
      currentPara.style.cssText = 'margin:0 0 1.5rem;';
      contentDiv.appendChild(currentPara);
      m.appendChild(contentDiv);

      let pageTokens = [];

      // Fill this page with words
      while (tokens.length > 0) {
        const token = tokens[0];
        const word = token.word + (token.isPara ? '' : ' ');

        // Tentatively add the word
        if (currentPara.textContent.length === 0) {
          currentPara.textContent = word;
        } else {
          currentPara.textContent += word;
        }

        // Check overflow: zero out the trailing margin on the last paragraph so it
        // doesn't count as used space (the margin only matters between paragraphs).
        currentPara.style.marginBottom = '0';
        const overflows = m.scrollHeight > availableH;
        currentPara.style.marginBottom = '1.5rem';

        if (overflows) {
          // Word doesn't fit - remove it and end page
          currentPara.textContent = currentPara.textContent.slice(0, -word.length);
          // On very small viewports (or long titles), the first word may not fit
          // after adding the title block. Force one token to avoid empty pages.
          if (pageTokens.length === 0) {
            currentPara.textContent = word;
            tokens.shift();
            pageTokens.push(token);
          }
          break;
        }

        // Word fits - consume it
        tokens.shift();
        pageTokens.push(token);

        // If paragraph ends, add a new paragraph element for the next word
        if (token.isPara && tokens.length > 0) {
          currentPara = document.createElement('p');
          currentPara.style.cssText = 'margin:0 0 1.5rem;';
          contentDiv.appendChild(currentPara);
        }
      }

      pages.push({
        tokens: pageTokens,
        hasTitle: isFirstPage,
      });

      isFirstPage = false;
    }

    m.innerHTML = '';
    setPages(pages);
    setTotalPages(pages.length);

    const currentStoryId = selectedStory?.id ?? null;
    if (lastResetStoryRef.current !== currentStoryId) {
      // First build for this story: restore resume page or go to first page.
      lastResetStoryRef.current = currentStoryId;
      const resumePage = pendingResumePageRef.current;
      pendingResumePageRef.current = null;
      setCurrentPage(resumePage !== null ? Math.min(resumePage, pages.length - 1) : 0);
    } else {
      // Subsequent builds (resize, font change): clamp to valid range.
      setCurrentPage(p => Math.min(p, pages.length - 1));
    }
  }, [selectedStory, selectedVariant, fontSize, lineHeight, textWidth, hPadding, wordSpacing, fontFamily]);

  // Build pages synchronously before paint when story or font size changes
  useLayoutEffect(() => {
    if (!selectedStory) return;
    buildPages();
  }, [selectedStory, fontSize, buildPages]);

  // Rebuild on container resize
  useEffect(() => {
    if (!readerAreaRef.current) return;
    const observer = new ResizeObserver(buildPages);
    observer.observe(readerAreaRef.current);
    return () => observer.disconnect();
  }, [selectedStory, buildPages]);

  // Navigate to page with flash animation
  const goToPage = useCallback((newPage) => {
    if (isFlashing) return;
    const clamped = Math.max(0, Math.min(newPage, totalPages - 1));
    if (clamped === currentPage) return;
    setIsFlashing(true);
    setTimeout(() => {
      setCurrentPage(clamped);
      setTimeout(() => setIsFlashing(false), 50);
    }, 80);
  }, [totalPages, currentPage, isFlashing]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (!selectedStory) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goToPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPage(currentPage - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedStory, currentPage, goToPage]);

  // Compute speed reader words
  const srWords = useMemo(() => {
    if (!selectedStory) return [];
    const content = selectedVariant?.content ?? selectedStory.content;
    return content.split(/\s+/).filter(w => w.length > 0);
  }, [selectedStory, selectedVariant]);

  // Compute story word count
  const storyWordCount = useMemo(() => {
    if (!selectedStory) return 0;
    const activeContent = selectedVariant?.content ?? selectedStory.content;
    return activeContent.split(/\s+/).filter(w => w.length > 0).length;
  }, [selectedStory, selectedVariant]);

  // Exit speed reader mode when flag is disabled or no story is open
  useEffect(() => {
    if (!showSpeedReader || !selectedStory) setSpeedReaderMode(false);
  }, [showSpeedReader, selectedStory]);

  return {
    pages,
    currentPage,
    setCurrentPage,
    totalPages,
    goToPage,
    isFlashing,
    srWords,
    speedReaderMode,
    setSpeedReaderMode,
    storyWordCount,
  };
}
