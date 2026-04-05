import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Menu, X, Plus, Minus } from 'lucide-react';
import { FEATURES } from './features';
import { useFeatureFlags } from './hooks/useFeatureFlags';
import { useTypography } from './hooks/useTypography';
import { usePersistence } from './hooks/usePersistence';
import FeatureDocs from './FeatureDocs';
import { ThemeContext } from './ui/ThemeContext';
import Toggle from './ui/Toggle';
import IconButton from './ui/IconButton';
import ProfilePanel from './components/ProfilePanel';
import HomeView from './components/HomeView';
import ReaderView from './components/ReaderView';
import Sidebar from './components/Sidebar';
import TypographyPanel, { LINE_HEIGHTS, WORD_SPACINGS, FONT_FAMILIES } from './ui/TypographyPanel';
import AudioPlayer from './ui/AudioPlayer';
import SpeedReaderView from './ui/SpeedReaderView';

const storyAudioFiles = import.meta.glob('/stories/*/*/audio.mp3', { eager: true, query: '?url', import: 'default' });

const GrimmMarchenApp = () => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // Feature flags
  const flags = useFeatureFlags();
  const { maxFontSize } = flags;

  // Typography
  const typo = useTypography({ maxFontSize });
  const { fontSize, setFontSize, lineHeightIdx, setLineHeightIdx, textWidthIdx, setTextWidthIdx, wordSpacingIdx, setWordSpacingIdx, fontFamilyIdx, setFontFamilyIdx, lineHeight, textWidth, hPadding, wordSpacing, fontFamily } = typo;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pages, setPages] = useState([]); // [{paragraphs: string[], hasTitle: bool}]
  const [isFlashing, setIsFlashing] = useState(false);
  const [typoPanelOpen, setTypoPanelOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [docsAnchor, setDocsAnchor] = useState(null);
  const [speedReaderMode, setSpeedReaderMode] = useState(false);
  const [activeSource, setActiveSource] = useState(() => localStorage.getItem('wr-last-source') || null);
  const lastResetStoryRef = useRef(null);


  const readerAreaRef = useRef(null);
  const measureRef = useRef(null);
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

  // Persistence
  const persist = usePersistence({
    stories,
    adaptionsByParent,
    selectedStory,
    activeSource,
    currentPage,
    totalPages,
  });
  const {
    completedStories, resumeSession, setResumeSession,
    variantPrefs, setVariantPrefs, selectedVariant, setSelectedVariant,
    blacklist, blacklistInput, setBlacklistInput,
    favorites, setFavorites, favoritesOnly, setFavoritesOnly,
    selectVariant, toggleFavorite, toggleFavoriteById,
    addBlacklistWord, removeBlacklistWord, pendingResumePageRef,
  } = persist;

  const visibleStories = React.useMemo(() => {
    if (blacklist.size === 0) return stories;
    const words = [...blacklist].map(w => w.toLowerCase());
    return stories.filter(s =>
      !words.some(w => s.title.toLowerCase().includes(w) || s.content.toLowerCase().includes(w))
    );
  }, [stories, blacklist]);

  const storiesBySource = React.useMemo(() => {
    const map = {};
    for (const story of visibleStories) {
      if (!map[story.source]) map[story.source] = [];
      map[story.source].push(story);
    }
    return map;
  }, [visibleStories]);

  const sources = React.useMemo(() =>
    Object.entries(storiesBySource).map(([id, list]) => ({
      id,
      label: list[0].sourceLabel,
      count: list.length,
    }))
  , [storiesBySource]);

  const filteredStories = searchTerm
    ? visibleStories.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];


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

  const {
    showWordCount, showReadingDuration, showFontSizeControls, showEinkFlash,
    showTapZones, showAdaptionSwitcher, showTypographyPanel, showAttribution,
    showFavorites, showFavoritesOnlyToggle, showAudioPlayer, showHighContrastTheme,
    showSpeedReader, showSpeedreaderOrp, showWordBlacklist, _rawFlagValues,
    userFeatureOverrides, setUserFeatureOverrides, _o,
    flagTheme, bigFontsVariant,
  } = flags;

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

  const highContrast = theme === 'light-hc' || theme === 'dark-hc';
  const darkMode = theme === 'dark' || (theme === 'system' && systemDark) || theme === 'dark-hc';

  useEffect(() => { localStorage.setItem('wr-theme', theme); }, [theme]);

  // When HC flag is toggled, map between normal and HC theme variants
  useEffect(() => {
    if (showHighContrastTheme) {
      setTheme(t => t === 'dark' ? 'dark-hc' : (t === 'light' || t === 'system') ? 'light-hc' : t);
    } else {
      setTheme(t => t === 'dark-hc' ? 'dark' : t === 'light-hc' ? 'light' : t);
    }
  }, [showHighContrastTheme]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleShare = useCallback((story) => {
    const text = `„${story.title}"`;
    if (navigator.share) {
      navigator.share({ title: story.title, text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  }, []);

  const favoriteStories = React.useMemo(() =>
    visibleStories.filter(s => favorites.has(s.id)),
    [visibleStories, favorites]
  );

  const storyWordCount = React.useMemo(() => {
    if (!selectedStory) return 0;
    const activeContent = selectedVariant?.content ?? selectedStory.content;
    return activeContent.split(/\s+/).filter(w => w.length > 0).length;
  }, [selectedStory, selectedVariant]);

  const readingMinutes = Math.ceil(storyWordCount / 200);

  const srWords = React.useMemo(() => {
    if (!selectedStory) return [];
    const content = selectedVariant?.content ?? selectedStory.content;
    return content.split(/\s+/).filter(w => w.length > 0);
  }, [selectedStory, selectedVariant]);

  // Exit speed reader mode when flag is disabled or no story is open
  useEffect(() => {
    if (!showSpeedReader || !selectedStory) setSpeedReaderMode(false);
  }, [showSpeedReader, selectedStory]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <ThemeContext.Provider value={{ dark: darkMode, hc: highContrast }}>
    <div className={`fixed inset-0 flex flex-col overflow-hidden transition-colors duration-300 ${
      highContrast
        ? (darkMode ? 'bg-black' : 'bg-white')
        : darkMode
        ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950'
        : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50'
    }`}>
      {/* Header */}
      <header className={`flex-shrink-0 backdrop-blur-md transition-colors duration-300 z-40 ${
        highContrast
          ? (darkMode ? 'bg-black border-white/40' : 'bg-white border-black/30')
          : darkMode
          ? 'bg-slate-900/80 border-amber-700/30'
          : 'bg-white/80 border-amber-200/50'
      } border-b`}>
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <IconButton
              data-testid="menu-toggle"
              onClick={toggleMenu}
              className="lg:hidden"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </IconButton>
            <h1 className={`text-2xl font-serif font-bold tracking-wide ${
              darkMode ? 'text-amber-200' : 'text-amber-900'
            }`}>
              {selectedStory ? '' : 'Märchenschatz'}
            </h1>
          </div>

          {selectedStory && showFontSizeControls && (
            <div className="flex items-center gap-2">
              <IconButton
                data-testid="font-decrease"
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              >
                <Minus size={18} />
              </IconButton>
              <span className={`text-sm font-medium w-12 text-center ${
                darkMode ? 'text-amber-200' : 'text-amber-900'
              }`}>
                {fontSize}
              </span>
              <IconButton
                data-testid="font-increase"
                onClick={() => setFontSize(Math.min(maxFontSize, fontSize + 2))}
              >
                <Plus size={18} />
              </IconButton>
            </div>
          )}

          <button
            onClick={() => setTheme(t => showHighContrastTheme
              ? (t === 'light-hc' ? 'dark-hc' : 'light-hc')
              : (t === 'light' ? 'dark' : t === 'dark' ? 'system' : 'light')
            )}
            title={
              theme === 'light'    ? 'Switch to dark mode' :
              theme === 'dark'     ? 'Switch to system theme' :
              theme === 'system'   ? 'Switch to light mode' :
              theme === 'light-hc' ? 'Switch to dark high contrast' :
                                     'Switch to light high contrast'
            }
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              theme === 'dark-hc'  ? 'bg-white text-black hover:bg-gray-100' :
              theme === 'light-hc' ? 'bg-black text-white hover:bg-gray-900' :
              darkMode             ? 'bg-amber-200 text-slate-900 hover:bg-amber-300' :
                                     'bg-amber-900 text-white hover:bg-amber-800'
            }`}
          >
            {theme === 'light' ? '🌙' : theme === 'dark' ? '🖥️' : theme === 'system' ? '☀️' : theme === 'light-hc' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen(false)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          favoritesOnly={favoritesOnly}
          onToggleFavoritesOnly={() => setFavoritesOnly(v => !v)}
          showFavoritesOnlyToggle={showFavoritesOnlyToggle}
          showFavorites={showFavorites}
          selectedStory={selectedStory}
          activeSource={activeSource}
          onSelectSource={setActiveSource}
          onSelectStory={setSelectedStory}
          completedStories={completedStories}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          showWordCount={showWordCount}
          showReadingDuration={showReadingDuration}
          storyWordCount={storyWordCount}
          readingMinutes={readingMinutes}
          favoriteStories={favoriteStories}
          filteredStories={filteredStories}
          sources={sources}
          storiesBySource={storiesBySource}
          onOpenProfile={() => setProfileOpen(true)}
          profileOpen={profileOpen}
        />

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
            <ProfilePanel
              onBack={() => setProfileOpen(false)}
              onOpenDocs={(anchor) => { setDocsOpen(true); setDocsAnchor(anchor); setProfileOpen(false); }}
              favorites={favorites}
              completedStories={completedStories}
              totalStories={stories.length}
              showWordBlacklist={showWordBlacklist}
              blacklist={blacklist}
              blacklistInput={blacklistInput}
              onBlacklistInputChange={setBlacklistInput}
              onAddBlacklistWord={addBlacklistWord}
              onRemoveBlacklistWord={removeBlacklistWord}
              features={FEATURES}
              _rawFlagValues={_rawFlagValues}
              userFeatureOverrides={userFeatureOverrides}
              onToggleFeature={(key) => setUserFeatureOverrides(prev => ({ ...prev, [key]: !_o(key, _rawFlagValues[key] ?? false) }))}
            />
          ) : selectedStory ? (
            <ReaderView
              readerAreaRef={readerAreaRef}
              selectedStory={selectedStory}
              selectedVariant={selectedVariant}
              pages={pages}
              currentPage={currentPage}
              totalPages={totalPages}
              isFlashing={isFlashing}
              srWords={srWords}
              speedReaderMode={speedReaderMode}
              onSetSpeedReaderMode={setSpeedReaderMode}
              onGoToPage={goToPage}
              showEinkFlash={showEinkFlash}
              showTapZones={showTapZones}
              showAdaptionSwitcher={showAdaptionSwitcher}
              adaptionsByParent={adaptionsByParent}
              onSelectVariant={selectVariant}
              showTypographyPanel={showTypographyPanel}
              typoPanelOpen={typoPanelOpen}
              onToggleTypoPanel={() => !speedReaderMode && showTypographyPanel && setTypoPanelOpen(v => !v)}
              lineHeightIdx={lineHeightIdx}
              onLineHeightChange={setLineHeightIdx}
              textWidthIdx={textWidthIdx}
              onTextWidthChange={setTextWidthIdx}
              wordSpacingIdx={wordSpacingIdx}
              onWordSpacingChange={setWordSpacingIdx}
              fontFamilyIdx={fontFamilyIdx}
              onFontFamilyChange={setFontFamilyIdx}
              showAudioPlayer={showAudioPlayer}
              storyAudioFiles={storyAudioFiles}
              showSpeedReader={showSpeedReader}
              showSpeedreaderOrp={showSpeedreaderOrp}
              darkMode={darkMode}
              highContrast={highContrast}
              fontSize={fontSize}
              lineHeight={lineHeight}
              wordSpacing={wordSpacing}
              fontFamily={fontFamily}
              textWidth={textWidth}
              hPadding={hPadding}
              showAttribution={showAttribution}
              showFavorites={showFavorites}
              favorites={favorites}
              onShare={() => handleShare(selectedStory)}
              onToggleFavorite={() => toggleFavoriteById(selectedStory.id)}
              onClose={() => setSelectedStory(null)}
            />
          ) : (
            <HomeView
              resumeSession={resumeSession}
              onResume={(story, page) => {
                pendingResumePageRef.current = page;
                setSelectedStory(story);
                setMenuOpen(false);
              }}
              onDismissResume={() => setResumeSession(null)}
              favoriteStories={favoriteStories}
              completedStories={completedStories}
              showFavorites={showFavorites}
              showWordCount={showWordCount}
              onSelectStory={setSelectedStory}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </main>
      </div>
    </div>
    </ThemeContext.Provider>
  );
};

export default GrimmMarchenApp;
