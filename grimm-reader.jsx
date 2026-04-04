import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Menu, X, Plus, Minus, Search, ChevronLeft, ChevronRight, Heart, User, Play, Pause, RotateCcw } from 'lucide-react';
import { useBooleanFlagValue, useStringFlagValue } from '@openfeature/react-sdk';
import { FEATURES } from './features';
import FeatureDocs from './FeatureDocs';

const storyAudioFiles = import.meta.glob('/stories/*/*/audio.mp3', { eager: true, query: '?url', import: 'default' });

const GrimmMarchenApp = () => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('wr-fs') ?? '18'));
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pages, setPages] = useState([]); // [{paragraphs: string[], hasTitle: bool}]
  const [isFlashing, setIsFlashing] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [typoPanelOpen, setTypoPanelOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [docsAnchor, setDocsAnchor] = useState(null);
  const [lineHeightIdx, setLineHeightIdx] = useState(() => parseInt(localStorage.getItem('wr-lh') ?? '1'));
  const [textWidthIdx, setTextWidthIdx] = useState(() => parseInt(localStorage.getItem('wr-tw') ?? '1'));
  const [wordSpacingIdx, setWordSpacingIdx] = useState(() => parseInt(localStorage.getItem('wr-ws') ?? '0'));
  const [fontFamilyIdx, setFontFamilyIdx] = useState(() => parseInt(localStorage.getItem('wr-ff') ?? '0'));
  const [completedStories, setCompletedStories] = useState(() =>
    new Set(JSON.parse(localStorage.getItem('wr-completed') ?? '[]'))
  );
  const [resumeSession, setResumeSession] = useState(null); // { story, page }
  const [variantPrefs, setVariantPrefs] = useState(() =>
    JSON.parse(localStorage.getItem('wr-variant-prefs') ?? '{}')
  );
  const pendingResumePageRef = useRef(null);
  const lastResetStoryRef = useRef(null);
  const initialResumeApplied = useRef(false);

  const LINE_HEIGHTS = [1.5, 1.8, 2.2];
  const TEXT_WIDTHS = [560, 768, 1200];   // max column width cap (desktop)
  const H_PADDINGS  = [56,  32,  12];    // horizontal padding px (narrow→wide)
  const WORD_SPACINGS = ['normal', '0.06em', '0.15em'];
  const FONT_FAMILIES = [
    { label: 'Serif',      css: 'Georgia, serif' },
    { label: 'Sans',       css: 'system-ui, sans-serif' },
    { label: 'Comic Sans', css: '"Comic Sans MS", "Comic Sans", cursive' },
  ];

  const lineHeight = LINE_HEIGHTS[lineHeightIdx];
  const textWidth  = TEXT_WIDTHS[textWidthIdx];
  const hPadding   = H_PADDINGS[textWidthIdx];
  const wordSpacing = WORD_SPACINGS[wordSpacingIdx];
  const fontFamily  = FONT_FAMILIES[fontFamilyIdx].css;

  const readerAreaRef = useRef(null);
  const measureRef = useRef(null);
  const audioRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const stories = React.useMemo(() => {
    const modules = import.meta.glob('/stories/*/*/content.md', { eager: true, query: '?raw', import: 'default' });
    return Object.entries(modules)
      .map(([path, raw]) => {
        // Extract source and slug from path: /stories/{source}/{slug}/content.md
        const parts = path.split('/');
        const slug = parts[parts.length - 2];
        const source = parts[parts.length - 3];

        // Parse YAML frontmatter
        const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
        const fmBlock = fmMatch ? fmMatch[1] : '';
        const titleMatch = fmBlock.match(/^title:\s*"(.+)"$/m);
        const title = titleMatch ? titleMatch[1] : slug;
        const sourceLabelMatch = fmBlock.match(/^source:\s*"(.+)"$/m);
        const sourceLabel = sourceLabelMatch ? sourceLabelMatch[1] : source;
        const wordCountMatch = fmBlock.match(/^wordCount:\s*(\d+)$/m);
        const wordCount = wordCountMatch ? parseInt(wordCountMatch[1], 10) : null;

        // Strip frontmatter and the # heading line, leaving only paragraphs
        const afterFm = fmMatch ? raw.slice(fmMatch[0].length) : raw;
        const content = afterFm.replace(/^#[^\n]*\n\n/, '').trimEnd();

        return { id: `${source}/${slug}`, title, content, source, sourceLabel, wordCount };
      })
      .sort((a, b) => a.title.localeCompare(b.title, 'de'));
  }, []);

  const adaptionsByParent = React.useMemo(() => {
    const modules = import.meta.glob('/stories/*/*/adaptions/*/content.md', { eager: true, query: '?raw', import: 'default' });
    const map = {};
    Object.entries(modules).forEach(([path, raw]) => {
      // /stories/{source}/{parentSlug}/adaptions/{adaptionSlug}/content.md
      const parts = path.split('/');
      const source = parts[parts.length - 5];
      const parentSlug = parts[parts.length - 4];
      const parentId = `${source}/${parentSlug}`;

      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
      const fmBlock = fmMatch ? fmMatch[1] : '';
      const adaptionNameMatch = fmBlock.match(/^adaption:\s*"(.+)"$/m);
      const adaptionName = adaptionNameMatch ? adaptionNameMatch[1] : parts[parts.length - 2];

      const afterFm = fmMatch ? raw.slice(fmMatch[0].length) : raw;
      // Strip bold title line (e.g. **Title**\n\n) that adaptions embed in content
      const content = afterFm.replace(/^\*\*[^\n]*\*\*\n\n/, '').trimEnd();

      if (!map[parentId]) map[parentId] = [];
      map[parentId].push({ adaptionName, content });
    });
    return map;
  }, []);

  const [activeSource, setActiveSource] = useState(() => localStorage.getItem('wr-last-source') || null);

  const storiesBySource = React.useMemo(() => {
    const map = {};
    for (const story of stories) {
      if (!map[story.source]) map[story.source] = [];
      map[story.source].push(story);
    }
    return map;
  }, [stories]);

  const sources = React.useMemo(() =>
    Object.entries(storiesBySource).map(([id, list]) => ({
      id,
      label: list[0].sourceLabel,
      count: list.length,
    }))
  , [storiesBySource]);

  const filteredStories = searchTerm
    ? stories.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  // Persist typography settings
  useEffect(() => { localStorage.setItem('wr-lh', lineHeightIdx); }, [lineHeightIdx]);
  useEffect(() => { localStorage.setItem('wr-tw', textWidthIdx); }, [textWidthIdx]);
  useEffect(() => { localStorage.setItem('wr-ws', wordSpacingIdx); }, [wordSpacingIdx]);
  useEffect(() => { localStorage.setItem('wr-ff', fontFamilyIdx); }, [fontFamilyIdx]);
  useEffect(() => { localStorage.setItem('wr-fs', fontSize); }, [fontSize]);

  // Reset variant when a new story is selected; restore persisted preference if available
  useEffect(() => {
    if (!selectedStory) { setSelectedVariant(null); return; }
    const prefName = variantPrefs[selectedStory.id] ?? null;
    if (!prefName) { setSelectedVariant(null); return; }
    const adaptions = adaptionsByParent[selectedStory.id] ?? [];
    setSelectedVariant(adaptions.find(a => a.adaptionName === prefName) ?? null);
  }, [selectedStory]); // variantPrefs intentionally omitted — only re-run on story change

  // Pause and reset audio whenever the story changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsAudioPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration(0);
  }, [selectedStory]);

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
    const activeTitle = selectedVariant?.adaptionName ?? selectedStory.title;

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
      let paraEnded = false;

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
          // Word doesn't fit — remove it and end page
          currentPara.textContent = currentPara.textContent.slice(0, -word.length);
          break;
        }

        // Word fits — consume it
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
    // Only reset/restore the page on the first build for a given story.
    // Subsequent calls from the ResizeObserver on the same story should not
    // touch currentPage — the existing clamping effect handles out-of-bounds.
    const currentStoryId = selectedStory?.id ?? null;
    if (lastResetStoryRef.current !== currentStoryId) {
      lastResetStoryRef.current = currentStoryId;
      const resumePage = pendingResumePageRef.current;
      pendingResumePageRef.current = null;
      setCurrentPage(resumePage !== null ? Math.min(resumePage, pages.length - 1) : 0);
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

  // Clamp page when totalPages shrinks
  useEffect(() => {
    setCurrentPage(p => Math.min(p, Math.max(0, totalPages - 1)));
  }, [totalPages]);

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

  const _rawWordCount          = useBooleanFlagValue('word-count', false);
  const _rawReadingDuration    = useBooleanFlagValue('reading-duration', false);
  const _rawFontSizeControls   = useBooleanFlagValue('font-size-controls', true);
  const _rawEinkFlash          = useBooleanFlagValue('eink-flash', true);
  const _rawTapZones           = useBooleanFlagValue('tap-zones', true);
  const _rawAdaptionSwitcher   = useBooleanFlagValue('adaption-switcher', true);
  const _rawTypographyPanel    = useBooleanFlagValue('typography-panel', true);
  const _rawAttribution        = useBooleanFlagValue('attribution', true);
  const _rawFavorites          = useBooleanFlagValue('favorites', false);
  const _rawFavoritesOnlyToggle = useBooleanFlagValue('favorites-only-toggle', false);
  const _rawAudioPlayer        = useBooleanFlagValue('audio-player', false);
  const _rawHighContrastTheme  = useBooleanFlagValue('high-contrast-theme', false);

  // User feature overrides — stored in localStorage, take precedence over flag defaults
  const [userFeatureOverrides, setUserFeatureOverrides] = useState(
    () => JSON.parse(localStorage.getItem('wr-feature-overrides') ?? '{}')
  );
  useEffect(() => {
    localStorage.setItem('wr-feature-overrides', JSON.stringify(userFeatureOverrides));
  }, [userFeatureOverrides]);

  const _o = (key, raw) => Object.hasOwn(userFeatureOverrides, key) ? userFeatureOverrides[key] : raw;
  const showWordCount           = _o('word-count',           _rawWordCount);
  const showReadingDuration     = _o('reading-duration',     _rawReadingDuration);
  const showFontSizeControls    = _o('font-size-controls',   _rawFontSizeControls);
  const showEinkFlash           = _o('eink-flash',           _rawEinkFlash);
  const showTapZones            = _o('tap-zones',            _rawTapZones);
  const showAdaptionSwitcher    = _o('adaption-switcher',    _rawAdaptionSwitcher);
  const showTypographyPanel     = _o('typography-panel',     _rawTypographyPanel);
  const showAttribution         = _o('attribution',          _rawAttribution);
  const showFavorites           = _o('favorites',            _rawFavorites);
  const showFavoritesOnlyToggle = _o('favorites-only-toggle', _rawFavoritesOnlyToggle);
  const showAudioPlayer         = _o('audio-player',          _rawAudioPlayer);
  const showHighContrastTheme   = _o('high-contrast-theme',   _rawHighContrastTheme);

  // Raw values keyed by feature key — used in profile feature toggles
  const _rawFlagValues = {
    'word-count': _rawWordCount, 'reading-duration': _rawReadingDuration,
    'font-size-controls': _rawFontSizeControls, 'eink-flash': _rawEinkFlash,
    'tap-zones': _rawTapZones, 'adaption-switcher': _rawAdaptionSwitcher,
    'typography-panel': _rawTypographyPanel, 'attribution': _rawAttribution,
    'favorites': _rawFavorites, 'favorites-only-toggle': _rawFavoritesOnlyToggle,
    'audio-player': _rawAudioPlayer,
    'high-contrast-theme': _rawHighContrastTheme,
  };

  const [favoritesOnly, setFavoritesOnly] = useState(() => localStorage.getItem('wr-favorites-only') === 'true');
  const flagTheme = useStringFlagValue('theme', 'light');
  const bigFontsVariant = useStringFlagValue('big-fonts', 'off');
  const maxFontSize = { off: 28, big: 28, bigger: 34, biggest: 40 }[bigFontsVariant] ?? 28;

  // Clamp stored font size when the flag variant reduces the ceiling
  useEffect(() => { setFontSize(f => Math.min(f, maxFontSize)); }, [maxFontSize]);

  const [theme, setTheme] = useState(() => localStorage.getItem('wr-theme') ?? flagTheme); // 'light' | 'dark' | 'system'
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = e => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const highContrast = theme === 'high-contrast';
  const darkMode = theme === 'dark' || (theme === 'system' && systemDark) || highContrast;

  const [favorites, setFavorites] = useState(() =>
    new Set(JSON.parse(localStorage.getItem('wr-favorites') ?? '[]'))
  );

  useEffect(() => {
    localStorage.setItem('wr-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => { localStorage.setItem('wr-theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('wr-favorites-only', favoritesOnly); }, [favoritesOnly]);
  useEffect(() => { localStorage.setItem('wr-completed', JSON.stringify([...completedStories])); }, [completedStories]);
  useEffect(() => { localStorage.setItem('wr-variant-prefs', JSON.stringify(variantPrefs)); }, [variantPrefs]);
  useEffect(() => { localStorage.setItem('wr-last-source', activeSource ?? ''); }, [activeSource]);
  useEffect(() => {
    if (!selectedStory) return;
    localStorage.setItem('wr-last-story', selectedStory.id);
    localStorage.setItem('wr-last-page', String(currentPage));
  }, [selectedStory, currentPage]);

  // Bootstrap resume session once after stories load
  useEffect(() => {
    if (initialResumeApplied.current || stories.length === 0) return;
    initialResumeApplied.current = true;
    const lastStoryId = localStorage.getItem('wr-last-story');
    const lastPage = parseInt(localStorage.getItem('wr-last-page') ?? '0', 10);
    if (!lastStoryId) return;
    const story = stories.find(s => s.id === lastStoryId);
    if (story) setResumeSession({ story, page: lastPage });
  }, [stories]);

  // Clear resume banner once a story is open
  useEffect(() => {
    if (selectedStory) setResumeSession(null);
  }, [selectedStory]);

  // Mark story as completed when reaching the last page
  useEffect(() => {
    if (!selectedStory || totalPages <= 1 || currentPage !== totalPages - 1) return;
    setCompletedStories(prev => {
      if (prev.has(selectedStory.id)) return prev;
      const next = new Set(prev);
      next.add(selectedStory.id);
      return next;
    });
  }, [selectedStory, currentPage, totalPages]);

  const selectVariant = useCallback((variant) => {
    setSelectedVariant(variant);
    if (selectedStory) {
      setVariantPrefs(prev => ({ ...prev, [selectedStory.id]: variant?.adaptionName ?? null }));
    }
  }, [selectedStory]);

  const toggleFavorite = useCallback((storyId, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(storyId)) next.delete(storyId); else next.add(storyId);
      return next;
    });
  }, []);

  const favoriteStories = React.useMemo(() =>
    stories.filter(s => favorites.has(s.id)),
    [stories, favorites]
  );

  const storyWordCount = React.useMemo(() => {
    if (!selectedStory) return 0;
    const activeContent = selectedVariant?.content ?? selectedStory.content;
    return activeContent.split(/\s+/).filter(w => w.length > 0).length;
  }, [selectedStory, selectedVariant]);

  const readingMinutes = Math.ceil(storyWordCount / 200);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className={`fixed inset-0 flex flex-col overflow-hidden transition-colors duration-300 ${
      highContrast
        ? 'bg-black'
        : darkMode
        ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950'
        : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50'
    }`}>
      {/* Header */}
      <header className={`flex-shrink-0 backdrop-blur-md transition-colors duration-300 z-40 ${
        highContrast
          ? 'bg-black border-white/40'
          : darkMode
          ? 'bg-slate-900/80 border-amber-700/30'
          : 'bg-white/80 border-amber-200/50'
      } border-b`}>
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <button
              data-testid="menu-toggle"
              onClick={toggleMenu}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'hover:bg-slate-800 text-amber-200'
                  : 'hover:bg-amber-100 text-amber-900'
              }`}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className={`text-2xl font-serif font-bold tracking-wide ${
              darkMode ? 'text-amber-200' : 'text-amber-900'
            }`}>
              {selectedStory ? '' : 'Märchenschatz'}
            </h1>
          </div>

          {selectedStory && showFontSizeControls && (
            <div className="flex items-center gap-2">
              <button
                data-testid="font-decrease"
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'hover:bg-slate-800 text-amber-200'
                    : 'hover:bg-amber-100 text-amber-900'
                }`}
              >
                <Minus size={18} />
              </button>
              <span className={`text-sm font-medium w-12 text-center ${
                darkMode ? 'text-amber-200' : 'text-amber-900'
              }`}>
                {fontSize}
              </span>
              <button
                data-testid="font-increase"
                onClick={() => setFontSize(Math.min(maxFontSize, fontSize + 2))}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'hover:bg-slate-800 text-amber-200'
                    : 'hover:bg-amber-100 text-amber-900'
                }`}
              >
                <Plus size={18} />
              </button>
            </div>
          )}

          <button
            onClick={() => setTheme(t => showHighContrastTheme
              ? (t === 'light' ? 'dark' : t === 'dark' ? 'system' : t === 'system' ? 'high-contrast' : 'light')
              : (t === 'light' ? 'dark' : t === 'dark' ? 'system' : 'light')
            )}
            title={theme === 'light' ? 'Switch to dark mode' : theme === 'dark' ? 'Switch to system theme' : theme === 'system' ? 'Switch to high contrast' : 'Switch to light mode'}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              highContrast
                ? 'bg-white text-black hover:bg-gray-100'
                : darkMode
                ? 'bg-amber-200 text-slate-900 hover:bg-amber-300'
                : 'bg-amber-900 text-white hover:bg-amber-800'
            }`}
          >
            {theme === 'light' ? '🌙' : theme === 'dark' ? '🖥️' : theme === 'system' ? (showHighContrastTheme ? '◑' : '☀️') : '☀️'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed lg:static top-16 bottom-0 left-0 w-80 lg:w-72 z-30 transform transition-transform duration-300 flex flex-col ${
          menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          highContrast
            ? 'bg-black border-white/40'
            : darkMode
            ? 'bg-slate-950/95 border-amber-700/30'
            : 'bg-white/95 border-amber-200/50'
        } border-r backdrop-blur-sm`}>
          <div className="flex-1 overflow-y-auto">

          {/* Search — always visible */}
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className={`relative flex-1 ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>
                <Search size={18} className="absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Märchen suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-slate-800 border-amber-700/50 text-amber-200 placeholder-amber-600'
                      : 'bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-600'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
              </div>
              {showFavoritesOnlyToggle && showFavorites && (
                <button
                  onClick={() => setFavoritesOnly(v => !v)}
                  title={favoritesOnly ? 'Alle anzeigen' : 'Nur Favoriten'}
                  className={`flex-shrink-0 p-2 rounded-lg border transition-colors ${
                    favoritesOnly
                      ? darkMode
                        ? 'bg-amber-700 border-amber-600 text-white'
                        : 'bg-amber-200 border-amber-300 text-amber-900'
                      : darkMode
                        ? 'border-amber-700/50 text-amber-600 hover:text-amber-400 hover:bg-slate-800'
                        : 'border-amber-300 text-amber-400 hover:text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <Heart size={16} fill={favoritesOnly ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
          </div>

          {selectedStory && (showWordCount || showReadingDuration) && (
            <div className={`mx-4 mb-2 rounded-xl px-4 py-3 space-y-1.5 ${
              darkMode ? 'bg-slate-800' : 'bg-amber-50'
            }`}>
              {showWordCount && (
                <div className={`flex items-center justify-between text-sm ${
                  darkMode ? 'text-amber-400' : 'text-amber-700'
                }`}>
                  <span>Wörter</span>
                  <span className="tabular-nums font-medium">{storyWordCount.toLocaleString('de')}</span>
                </div>
              )}
              {showReadingDuration && (
                <div className={`flex items-center justify-between text-sm ${
                  darkMode ? 'text-amber-400' : 'text-amber-700'
                }`}>
                  <span>Lesezeit</span>
                  <span className="tabular-nums font-medium">~{readingMinutes} min</span>
                </div>
              )}
            </div>
          )}

          {favoritesOnly && showFavorites ? (
            /* Favorites-only view */
            <div className="px-3 pb-4 space-y-1">
              {favoriteStories.length === 0 ? (
                <p className={`px-2 py-3 text-sm ${darkMode ? 'text-amber-600' : 'text-amber-700'}`}>
                  Keine Favoriten
                </p>
              ) : favoriteStories.map(story => (
                <div key={story.id} className="flex items-center gap-1">
                  <button
                    data-testid="story-button"
                    onClick={() => { setSelectedStory(story); setMenuOpen(false); }}
                    className={`flex-1 min-w-0 text-left px-3 py-2.5 rounded-lg transition-all ${
                      selectedStory?.id === story.id
                        ? darkMode ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
                        : darkMode ? 'text-amber-100 hover:bg-slate-800' : 'text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    <span className="font-serif text-base line-clamp-2 block">{story.title}</span>
                    <div className="flex items-center gap-1 flex-wrap mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        selectedStory?.id === story.id
                          ? darkMode ? 'bg-amber-600/60 text-amber-100' : 'bg-amber-300/60 text-amber-800'
                          : darkMode ? 'bg-slate-700 text-amber-400' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {story.sourceLabel}
                      </span>
                      {completedStories.has(story.id) && (
                        <span data-testid="completed-indicator" className={`text-xs px-1.5 py-0.5 rounded ${
                          selectedStory?.id === story.id
                            ? darkMode ? 'bg-amber-600/60 text-amber-100' : 'bg-amber-300/60 text-amber-800'
                            : darkMode ? 'bg-slate-700 text-amber-500' : 'bg-amber-100 text-amber-600'
                        }`}>✓</span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={(e) => toggleFavorite(story.id, e)}
                    className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                      darkMode ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-600 hover:bg-amber-100'
                    }`}
                  >
                    <Heart size={14} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            /* Search results — global, with source badge */
            <div className="px-3 pb-4 space-y-1">
              {filteredStories.length === 0 && (
                <p className={`px-2 py-3 text-sm ${darkMode ? 'text-amber-600' : 'text-amber-700'}`}>
                  Keine Ergebnisse
                </p>
              )}
              {filteredStories.map(story => (
                <div key={story.id} className="flex items-center gap-1">
                  <button
                    onClick={() => { setSelectedStory(story); setMenuOpen(false); }}
                    className={`flex-1 min-w-0 text-left px-3 py-2.5 rounded-lg transition-all ${
                      selectedStory?.id === story.id
                        ? darkMode ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
                        : darkMode ? 'text-amber-100 hover:bg-slate-800' : 'text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    <span className="font-serif text-base leading-snug">{story.title}</span>
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded font-sans align-middle ${
                      darkMode ? 'bg-slate-700 text-amber-400' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {story.sourceLabel}
                    </span>
                    {showWordCount && story.wordCount != null && (
                      <span className={`ml-1 text-xs tabular-nums px-1.5 py-0.5 rounded font-sans align-middle ${
                        darkMode ? 'bg-slate-700 text-amber-500' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {story.wordCount.toLocaleString('de')} W
                      </span>
                    )}
                    {completedStories.has(story.id) && (
                      <span data-testid="completed-indicator" className={`ml-1 text-xs px-1.5 py-0.5 rounded font-sans align-middle ${
                        darkMode ? 'bg-slate-700 text-amber-500' : 'bg-amber-100 text-amber-600'
                      }`}>✓</span>
                    )}
                  </button>
                  {showFavorites && (
                    <button
                      onClick={(e) => toggleFavorite(story.id, e)}
                      className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                        favorites.has(story.id)
                          ? darkMode ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-600 hover:bg-amber-100'
                          : darkMode ? 'text-slate-600 hover:text-amber-400 hover:bg-slate-800' : 'text-amber-300 hover:text-amber-600 hover:bg-amber-100'
                      }`}
                    >
                      <Heart size={14} fill={favorites.has(story.id) ? 'currentColor' : 'none'} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : activeSource ? (
            /* Drilled into a source — back button + story list */
            <>
              <div className="px-3 pb-2">
                <button
                  data-testid="back-to-sources"
                  onClick={() => setActiveSource(null)}
                  className={`flex items-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    darkMode
                      ? 'text-amber-400 hover:bg-slate-800'
                      : 'text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  <ChevronLeft size={16} />
                  <span>{sources.find(s => s.id === activeSource)?.label}</span>
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${
                    darkMode ? 'bg-slate-700 text-amber-500' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {storiesBySource[activeSource]?.length}
                  </span>
                </button>
              </div>
              <div className={`mx-3 mb-3 h-px ${darkMode ? 'bg-amber-800/40' : 'bg-amber-200'}`} />
              <div className="px-3 pb-4 space-y-1">
                {(storiesBySource[activeSource] ?? []).map(story => (
                  <div key={story.id} className="flex items-center gap-1">
                    <button
                      data-testid="story-button"
                      onClick={() => { setSelectedStory(story); setMenuOpen(false); }}
                      className={`flex-1 min-w-0 text-left px-3 py-2.5 rounded-lg transition-all ${
                        selectedStory?.id === story.id
                          ? darkMode ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
                          : darkMode ? 'text-amber-100 hover:bg-slate-800' : 'text-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      <span className="font-serif text-base line-clamp-2 block">{story.title}</span>
                      {(showWordCount && story.wordCount != null || completedStories.has(story.id)) && (
                        <div className="flex items-center gap-1 flex-wrap mt-0.5">
                          {showWordCount && story.wordCount != null && (
                            <span className={`inline-block text-xs tabular-nums px-1.5 py-0.5 rounded ${
                              selectedStory?.id === story.id
                                ? darkMode ? 'bg-amber-600/60 text-amber-100' : 'bg-amber-300/60 text-amber-800'
                                : darkMode ? 'bg-slate-700 text-amber-500' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {story.wordCount.toLocaleString('de')} W
                            </span>
                          )}
                          {completedStories.has(story.id) && (
                            <span data-testid="completed-indicator" className={`inline-block text-xs px-1.5 py-0.5 rounded ${
                              selectedStory?.id === story.id
                                ? darkMode ? 'bg-amber-600/60 text-amber-100' : 'bg-amber-300/60 text-amber-800'
                                : darkMode ? 'bg-slate-700 text-amber-500' : 'bg-amber-100 text-amber-600'
                            }`}>✓</span>
                          )}
                        </div>
                      )}
                    </button>
                    {showFavorites && (
                      <button
                        onClick={(e) => toggleFavorite(story.id, e)}
                        className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                          favorites.has(story.id)
                            ? darkMode ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-600 hover:bg-amber-100'
                            : darkMode ? 'text-slate-600 hover:text-amber-400 hover:bg-slate-800' : 'text-amber-300 hover:text-amber-600 hover:bg-amber-100'
                        }`}
                      >
                        <Heart size={14} fill={favorites.has(story.id) ? 'currentColor' : 'none'} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Source list */
            <div className="px-3 pb-4 space-y-2">
              {sources.map(src => (
                <button
                  key={src.id}
                  data-testid="source-button"
                  onClick={() => setActiveSource(src.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${
                    darkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-100'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
                  }`}
                >
                  <span className="font-serif text-base font-medium">{src.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm tabular-nums ${darkMode ? 'text-amber-500' : 'text-amber-600'}`}>
                      {src.count}
                    </span>
                    <ChevronRight size={16} className={darkMode ? 'text-amber-600' : 'text-amber-400'} />
                  </div>
                </button>
              ))}
            </div>
          )}
          </div>{/* end scrollable list */}

          {/* Profile drawer — always visible at sidebar bottom */}
          <div className={`flex-shrink-0 border-t ${
            darkMode ? 'border-amber-700/30' : 'border-amber-200/50'
          }`}>
            <button
              onClick={() => { setProfileOpen(true); setMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors ${
                profileOpen
                  ? darkMode ? 'bg-amber-700/20 text-amber-200' : 'bg-amber-100 text-amber-900'
                  : darkMode ? 'text-amber-400 hover:bg-slate-800 hover:text-amber-200' : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-slate-700' : 'bg-amber-100'
              }`}>
                <User size={16} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">Mein Profil</p>
              </div>
              <ChevronRight size={14} className="flex-shrink-0 opacity-50" />
            </button>
          </div>
        </aside>

        {/* Hidden measurement container — off-screen, used to calculate paragraph heights */}
        <div
          ref={measureRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
          }}
        />

        {/* Reader Area */}
        <main className="flex-1 flex flex-col overflow-hidden w-full">
          {docsOpen ? (
            <FeatureDocs
              darkMode={darkMode}
              initialAnchor={docsAnchor}
              onBack={() => { setDocsOpen(false); setProfileOpen(true); }}
              featureState={Object.fromEntries(FEATURES.map(({ key }) => [key, _o(key, _rawFlagValues[key] ?? false)]))}
              onToggle={(key) => setUserFeatureOverrides(prev => ({ ...prev, [key]: !_o(key, _rawFlagValues[key] ?? false) }))}
            />
          ) : profileOpen ? (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-lg mx-auto px-6 py-12">
                <button
                  onClick={() => setProfileOpen(false)}
                  className={`flex items-center gap-2 mb-8 text-sm font-medium transition-colors ${
                    darkMode ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'
                  }`}
                >
                  <ChevronLeft size={16} />
                  Zurück
                </button>

                {/* Avatar */}
                <div className="flex flex-col items-center gap-4 mb-10">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-slate-700 text-amber-300' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <User size={36} />
                  </div>
                  <div className="text-center">
                    <p className={`text-xl font-serif font-bold ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>
                      Leser
                    </p>
                    <p className={`text-sm mt-0.5 ${darkMode ? 'text-amber-600' : 'text-amber-600'}`}>
                      Gast-Konto
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className={`rounded-2xl border divide-y ${
                  darkMode ? 'border-amber-700/30 divide-amber-700/30' : 'border-amber-200 divide-amber-200'
                }`}>
                  {[
                    { label: 'Favoriten', value: favorites.size },
                    { label: 'Gelesen', value: completedStories.size },
                    { label: 'Verfügbare Märchen', value: stories.length.toLocaleString('de') },
                  ].map(({ label, value }) => (
                    <div key={label} className={`flex items-center justify-between px-5 py-4 ${
                      darkMode ? 'text-amber-200' : 'text-amber-900'
                    }`}>
                      <span className="text-sm">{label}</span>
                      <span className="text-sm font-medium tabular-nums">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Feature toggles */}
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className={`text-xs font-semibold uppercase tracking-wider ${
                      darkMode ? 'text-amber-500' : 'text-amber-600'
                    }`}>
                      Funktionen
                    </h2>
                    <button
                      onClick={() => { setDocsOpen(true); setDocsAnchor(null); setProfileOpen(false); }}
                      className={`text-xs transition-colors hover:underline ${
                        darkMode ? 'text-amber-400/70 hover:text-amber-400' : 'text-amber-600/70 hover:text-amber-700'
                      }`}
                    >
                      Alle Funktionen erklärt →
                    </button>
                  </div>
                  <div className={`rounded-2xl border divide-y ${
                    darkMode ? 'border-amber-700/30 divide-amber-700/30' : 'border-amber-200 divide-amber-200'
                  }`}>
                    {FEATURES.map(({ key, label, description, Icon }) => {
                      const effective = _o(key, _rawFlagValues[key] ?? false);
                      return (
                        <div key={key} className={`px-5 py-4 flex items-start gap-4 ${
                          darkMode ? 'text-amber-200' : 'text-amber-900'
                        }`}>
                          <div className={`flex-shrink-0 mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            effective
                              ? darkMode ? 'bg-amber-700/40 text-amber-300' : 'bg-amber-100 text-amber-700'
                              : darkMode ? 'bg-slate-700/60 text-amber-700' : 'bg-amber-50/80 text-amber-400'
                          }`}>
                            <div className="w-5 h-5"><Icon /></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <p className={`text-sm font-medium transition-opacity ${
                                effective ? '' : 'opacity-40'
                              }`}>{label}</p>
                              <button
                                role="switch"
                                aria-checked={effective}
                                aria-label={label}
                                onClick={() => setUserFeatureOverrides(prev => ({ ...prev, [key]: !effective }))}
                                className={`flex-shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                                  effective
                                    ? darkMode ? 'bg-amber-500' : 'bg-amber-600'
                                    : darkMode ? 'bg-slate-600' : 'bg-amber-200'
                                }`}
                              >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                                  effective ? 'translate-x-[18px]' : 'translate-x-[2px]'
                                }`} />
                              </button>
                            </div>
                            <p className={`text-xs mt-1 leading-relaxed ${
                              darkMode ? 'text-amber-600' : 'text-amber-500'
                            }`}>{description}</p>
                            <button
                              onClick={() => { setDocsOpen(true); setDocsAnchor(key); setProfileOpen(false); }}
                              className={`text-xs mt-1 inline-block transition-colors hover:underline ${
                                darkMode ? 'text-amber-400/70 hover:text-amber-400' : 'text-amber-600/70 hover:text-amber-700'
                              }`}
                            >
                              Mehr erfahren →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : selectedStory ? (
            <>
              {/* Reading viewport */}
              <div
                ref={readerAreaRef}
                data-testid="reader-viewport"
                className="flex-1 overflow-hidden relative"
              >
                {/* E-ink flash overlay */}
                {showEinkFlash && (
                  <div
                    className={`absolute inset-0 z-20 pointer-events-none ${
                      highContrast ? 'bg-black' : darkMode ? 'bg-slate-800' : 'bg-white'
                    }`}
                    style={{
                      opacity: isFlashing ? 1 : 0,
                      transition: isFlashing ? 'none' : 'opacity 0.05s',
                    }}
                  />
                )}

                {/* Current page content — rendered statically, no translateY */}
                {pages[currentPage] && (
                  <div
                    data-testid="page-content"
                    className={`h-full transition-colors duration-300 ${
                      highContrast ? 'bg-black' : darkMode ? 'bg-slate-800/50' : 'bg-white/70'
                    }`}
                    style={{ padding: `2rem ${hPadding}px` }}
                  >
                    <div className="mx-auto w-full" style={{ maxWidth: textWidth + 'px' }}>
                      {pages[currentPage].hasTitle && (
                        <>
                          <h2 style={{ fontFamily }} className={`text-4xl font-bold mb-2 ${
                            highContrast ? 'text-white' : darkMode ? 'text-amber-200' : 'text-amber-900'
                          }`}>
                            {selectedVariant?.adaptionName ?? selectedStory.title}
                          </h2>
                          <div className={`h-1 w-20 rounded-full mb-8 ${
                            highContrast ? 'bg-white' : darkMode ? 'bg-amber-700' : 'bg-amber-300'
                          }`} />
                        </>
                      )}

                      <div
                        style={{ fontSize: `${fontSize}px`, lineHeight, wordSpacing, fontFamily }}
                        className={highContrast ? 'text-white' : darkMode ? 'text-amber-50' : 'text-amber-950'}
                      >
                        {/* Reconstruct paragraphs from word tokens */}
                        {(() => {
                          const paras = [];
                          let currentPara = [];

                          pages[currentPage].tokens.forEach((token) => {
                            currentPara.push(token.word);
                            if (token.isPara) {
                              paras.push(currentPara.join(' '));
                              currentPara = [];
                            }
                          });

                          // If there are leftover words (happens when page breaks mid-paragraph)
                          if (currentPara.length > 0) {
                            paras.push(currentPara.join(' '));
                          }

                          return paras.map((text, idx) => (
                            <p key={idx} className="mb-6 first-letter:font-bold">
                              {text}
                            </p>
                          ));
                        })()}
                      </div>

                      {showAttribution && currentPage === totalPages - 1 && (
                        <div className={`mt-8 pt-6 border-t ${
                          darkMode ? 'border-amber-700/30' : 'border-amber-300'
                        }`}>
                          <p className={`text-sm italic ${
                            darkMode ? 'text-amber-600' : 'text-amber-700'
                          }`}>
                            — Jacob und Wilhelm Grimm
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Left tap zone — previous page */}
                {showTapZones && (
                  <div
                    className="absolute left-0 top-0 bottom-0 z-10 cursor-pointer"
                    style={{ width: '30%' }}
                    onClick={() => goToPage(currentPage - 1)}
                  />
                )}

                {/* Right tap zone — next page */}
                {showTapZones && (
                  <div
                    className="absolute right-0 top-0 bottom-0 z-10 cursor-pointer"
                    style={{ width: '30%' }}
                    onClick={() => goToPage(currentPage + 1)}
                  />
                )}
              </div>

              {/* Variant switcher — shown only when adaptions exist */}
              {showAdaptionSwitcher && (adaptionsByParent[selectedStory.id] ?? []).length > 0 && (
                <div className={`flex-shrink-0 flex items-center gap-2 px-4 py-1.5 border-t ${
                  darkMode ? 'bg-slate-900/90 border-amber-700/30' : 'bg-white/90 border-amber-200/50'
                }`}>
                  <button
                    onClick={() => selectVariant(null)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedVariant === null
                        ? darkMode ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
                        : darkMode ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    Original
                  </button>
                  {(adaptionsByParent[selectedStory.id] ?? []).map((a, i) => (
                    <button
                      key={i}
                      onClick={() => selectVariant(a)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedVariant === a
                          ? darkMode ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
                          : darkMode ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      {a.adaptionName}
                    </button>
                  ))}
                </div>
              )}

              {/* Typography panel — slides open above nav bar */}
              {showTypographyPanel && typoPanelOpen && (
                <div className={`flex-shrink-0 border-t px-5 py-3 transition-colors ${
                  darkMode ? 'bg-slate-900/95 border-amber-700/30' : 'bg-white/95 border-amber-200/50'
                }`}>
                  {[
                    {
                      label: 'Zeilenabstand',
                      options: LINE_HEIGHTS.map((v, i) => ({
                        i,
                        icon: (
                          <span className="flex flex-col gap-px items-center" style={{ gap: `${i * 2 + 1}px` }}>
                            {[0,1,2].map(n => <span key={n} className="block h-px w-4 bg-current" />)}
                          </span>
                        ),
                      })),
                      idx: lineHeightIdx,
                      set: setLineHeightIdx,
                    },
                    {
                      label: 'Textbreite',
                      options: [4, 6, 8].map((w, i) => ({
                        i,
                        icon: (
                          <span className="flex flex-col gap-px items-center">
                            <span className="block h-px bg-current" style={{ width: `${w * 4}px` }} />
                            <span className="block h-px bg-current" style={{ width: `${w * 4}px` }} />
                            <span className="block h-px bg-current" style={{ width: `${w * 4}px` }} />
                          </span>
                        ),
                      })),
                      idx: textWidthIdx,
                      set: setTextWidthIdx,
                    },
                    {
                      label: 'Wortabstand',
                      options: ['aa', 'a a', 'a  a'].map((txt, i) => ({
                        i,
                        icon: <span className="font-serif text-sm leading-none">{txt}</span>,
                      })),
                      idx: wordSpacingIdx,
                      set: setWordSpacingIdx,
                    },
                    {
                      label: 'Schriftart',
                      options: FONT_FAMILIES.map(({ label, css }, i) => ({
                        i,
                        icon: <span style={{ fontFamily: css }} className="text-sm leading-none">Aa</span>,
                        label,
                      })),
                      idx: fontFamilyIdx,
                      set: setFontFamilyIdx,
                    },
                  ].map(({ label, options, idx, set }) => (
                    <div key={label} className="flex items-center gap-3 py-1">
                      <span className={`text-xs w-24 shrink-0 ${darkMode ? 'text-amber-500' : 'text-amber-600'}`}>
                        {label}
                      </span>
                      <div className="flex gap-1.5">
                        {options.map(({ i, icon }) => (
                          <button
                            key={i}
                            onClick={() => set(i)}
                            className={`w-10 h-8 flex items-center justify-center rounded-lg transition-colors ${
                              idx === i
                                ? darkMode ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
                                : darkMode ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-700 hover:bg-amber-100'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Audio player — only when flag is on and the story has an audio file */}
              {showAudioPlayer && (() => {
                const audioUrl = selectedStory
                  ? (storyAudioFiles[`/stories/${selectedStory.id}/audio.mp3`] ?? null)
                  : null;
                if (!audioUrl) return null;
                const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
                const progress = audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0;
                return (
                  <>
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onTimeUpdate={() => setAudioCurrentTime(audioRef.current?.currentTime ?? 0)}
                      onLoadedMetadata={() => setAudioDuration(audioRef.current?.duration ?? 0)}
                      onEnded={() => setIsAudioPlaying(false)}
                    />
                    <div className={`flex-shrink-0 border-t transition-colors ${
                      darkMode ? 'bg-slate-900/95 border-amber-700/30' : 'bg-white/95 border-amber-200/50'
                    }`}>
                      {/* Progress bar */}
                      <div className={`h-0.5 ${darkMode ? 'bg-slate-700' : 'bg-amber-100'}`}>
                        <div
                          className={`h-full transition-all duration-300 ${darkMode ? 'bg-amber-500' : 'bg-amber-600'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-3 px-5 py-2">
                        {/* Reset */}
                        <button
                          onClick={() => {
                            audioRef.current.pause();
                            audioRef.current.currentTime = 0;
                            setIsAudioPlaying(false);
                            setAudioCurrentTime(0);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            darkMode ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          <RotateCcw size={15} />
                        </button>
                        {/* Play / Pause */}
                        <button
                          onClick={() => {
                            if (isAudioPlaying) {
                              audioRef.current.pause();
                              setIsAudioPlaying(false);
                            } else {
                              audioRef.current.play();
                              setIsAudioPlaying(true);
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            darkMode ? 'text-amber-300 hover:bg-slate-800' : 'text-amber-800 hover:bg-amber-100'
                          }`}
                        >
                          {isAudioPlaying ? <Pause size={17} /> : <Play size={17} />}
                        </button>
                        {/* Time */}
                        <span className={`text-xs tabular-nums ml-1 ${darkMode ? 'text-amber-600' : 'text-amber-500'}`}>
                          {fmtTime(audioCurrentTime)}
                          {audioDuration > 0 && <> / {fmtTime(audioDuration)}</>}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Page navigation bar — flex sibling, not overlapping */}
              <div data-testid="nav-bar" className={`flex-shrink-0 h-12 flex items-center justify-between px-6 backdrop-blur-sm border-t transition-colors ${
                highContrast
                  ? 'bg-black border-white/40 text-white'
                  : darkMode
                  ? 'bg-slate-900/90 border-amber-700/30 text-amber-300'
                  : 'bg-white/90 border-amber-200/50 text-amber-800'
              }`}>
                <button
                  data-testid="prev-page"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className={`p-1 rounded transition-colors disabled:opacity-30 ${
                    darkMode ? 'hover:bg-slate-700' : 'hover:bg-amber-100'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={() => showTypographyPanel && setTypoPanelOpen(v => !v)}
                  className={`flex flex-col items-center gap-0.5 min-w-0 overflow-hidden px-3 py-1 rounded-lg transition-colors ${
                    typoPanelOpen
                      ? darkMode ? 'bg-slate-700' : 'bg-amber-100'
                      : darkMode ? 'hover:bg-slate-800' : 'hover:bg-amber-50'
                  }`}
                >
                  <span className={`text-xs font-serif truncate max-w-full ${
                    darkMode ? 'text-amber-500' : 'text-amber-600'
                  }`}>
                    {selectedStory.title}
                  </span>
                  <span data-testid="page-counter" className="text-xs font-medium tabular-nums">
                    {currentPage + 1} / {totalPages}
                  </span>
                </button>

                <button
                  data-testid="next-page"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className={`p-1 rounded transition-colors disabled:opacity-30 ${
                    darkMode ? 'hover:bg-slate-700' : 'hover:bg-amber-100'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full h-full overflow-y-auto">
              {resumeSession && (
                <div
                  data-testid="resume-banner"
                  className={`mx-4 mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    darkMode
                      ? 'bg-amber-900/30 border-amber-700/40 text-amber-200'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <span className="text-xl">📖</span>
                  <button
                    data-testid="resume-confirm"
                    onClick={() => {
                      pendingResumePageRef.current = resumeSession.page;
                      setSelectedStory(resumeSession.story);
                      setMenuOpen(false);
                    }}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-sm font-medium truncate">Weiterlesen</p>
                    <p className={`text-xs truncate ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      {resumeSession.story.title}, Seite {resumeSession.page + 1}
                    </p>
                  </button>
                  <button
                    data-testid="resume-dismiss"
                    onClick={() => setResumeSession(null)}
                    className={`flex-shrink-0 p-1 rounded transition-colors ${
                      darkMode ? 'hover:bg-amber-800/50 text-amber-400' : 'hover:bg-amber-200 text-amber-600'
                    }`}
                    aria-label="Schließen"
                  >
                    ×
                  </button>
                </div>
              )}
              {showFavorites && favoriteStories.length > 0 ? (
                <div className="p-8 max-w-4xl mx-auto">
                  <div className="flex items-center gap-2 mb-6">
                    <Heart size={20} fill="currentColor" className={darkMode ? 'text-amber-400' : 'text-amber-600'} />
                    <h2 className={`text-xl font-serif font-bold ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>
                      Favoriten
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {favoriteStories.map(story => (
                      <div
                        key={story.id}
                        className={`group relative rounded-xl border p-4 transition-colors cursor-pointer ${
                          darkMode
                            ? 'bg-slate-800/60 border-amber-700/20 hover:bg-slate-800'
                            : 'bg-white/80 border-amber-200/60 hover:bg-white'
                        }`}
                        onClick={() => setSelectedStory(story)}
                      >
                        <p className={`font-serif text-base font-medium leading-snug mb-2 pr-6 ${
                          darkMode ? 'text-amber-100' : 'text-amber-950'
                        }`}>
                          {story.title}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            darkMode ? 'bg-slate-700 text-amber-400' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {story.sourceLabel}
                          </span>
                          {showWordCount && story.wordCount != null && (
                            <span className={`text-xs tabular-nums ${darkMode ? 'text-amber-600' : 'text-amber-500'}`}>
                              {story.wordCount.toLocaleString('de')} W
                            </span>
                          )}
                          {completedStories.has(story.id) && (
                            <span data-testid="completed-indicator" className={`text-xs px-1.5 py-0.5 rounded ${
                              darkMode ? 'bg-slate-700 text-amber-500' : 'bg-amber-100 text-amber-600'
                            }`}>✓</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(story.id, e)}
                          className={`absolute top-3 right-3 p-1 rounded transition-colors ${
                            darkMode ? 'text-amber-400 hover:bg-slate-700' : 'text-amber-500 hover:bg-amber-100'
                          }`}
                        >
                          <Heart size={14} fill="currentColor" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="text-6xl mb-4">📚</div>
                  <p className={`text-2xl font-serif font-bold mb-2 ${
                    darkMode ? 'text-amber-200' : 'text-amber-900'
                  }`}>
                    Wähle ein Märchen
                  </p>
                  <p className={`${darkMode ? 'text-amber-600' : 'text-amber-700'}`}>
                    Klicke auf einen Titel in der Seitenleiste
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GrimmMarchenApp;
