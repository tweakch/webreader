import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, X, Plus, Minus } from 'lucide-react';
import { FEATURES } from './features';
import { useFeatureFlags } from './hooks/useFeatureFlags';
import { useTypography } from './hooks/useTypography';
import { usePersistence } from './hooks/usePersistence';
import { useReader } from './hooks/useReader';
import FeatureDocs from './FeatureDocs';
import { useRole } from './hooks/useRole';
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
import DebugOverlay from './components/DebugOverlay';

const storyAudioModules = import.meta.glob('/stories/*/*/audio.mp3', { query: '?url', import: 'default' });
const storyModules2 = import.meta.glob('/stories/*/*/content.md', { query: '?raw', import: 'default' });
const storyModules3 = import.meta.glob('/stories/*/*/*/content.md', { query: '?raw', import: 'default' });
const adaptionModules = import.meta.glob('/stories/*/*/adaptions/*/content.md', { query: '?raw', import: 'default' });
const SPEED_READER_FONT_SIZE = {
  min: 40,
  max: 60,
  step: 5,
  defaultValue: 50,
};

const GrimmMarchenApp = () => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // Feature flags
  const flags = useFeatureFlags();
  const {
    maxFontSize,
    showWordCount, showReadingDuration, showFontSizeControls, showPinchFontSize, showEinkFlash,
    showTapZones, showAdaptionSwitcher, showTypographyPanel, showAttribution,
    showFavorites, showFavoritesOnlyToggle, showAudioPlayer, showHighContrastTheme,
    showSpeedReader, showSpeedreaderOrp, showWordBlacklist, showStoryDirectories, showDebugBadges,
    _rawFlagValues,
    userFeatureOverrides, setUserFeatureOverrides, _o,
    flagTheme, bigFontsVariant,
  } = flags;

  // Role management
  const {
    role, setRole, isAdmin, visibleFeatureKeys, isFeatureAssignedToRole, toggleFeatureForRole,
  } = useRole();

  // Typography
  const typo = useTypography({ maxFontSize });
  const { fontSize, setFontSize, lineHeightIdx, setLineHeightIdx, textWidthIdx, setTextWidthIdx, wordSpacingIdx, setWordSpacingIdx, fontFamilyIdx, setFontFamilyIdx, lineHeight, textWidth, hPadding, wordSpacing, fontFamily } = typo;

  const [searchTerm, setSearchTerm] = useState('');
  const [typoPanelOpen, setTypoPanelOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [docsAnchor, setDocsAnchor] = useState(null);
  const [activeSource, setActiveSource] = useState(() => localStorage.getItem('wr-last-source') || null);
  const [activeDirectory, setActiveDirectory] = useState(null);
  const [stories, setStories] = useState([]);
  const [adaptionsByParent, setAdaptionsByParent] = useState({});
  const [storyAudioFiles, setStoryAudioFiles] = useState({});
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);

  // Allow deep-linking from marketing pages directly into FeatureDocs.
  useEffect(() => {
    const docs = new URLSearchParams(window.location.search).get('docs');
    if (!docs) return;
    setDocsOpen(true);
    setDocsAnchor(docs);
    setProfileOpen(false);
  }, []);

  const handleSelectSource = React.useCallback((sourceId) => {
    setActiveSource(sourceId);
    setActiveDirectory(null);
  }, []);


  const readerAreaRef = useRef(null);
  const measureRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function loadLibrary() {
      const loadedAudio = Object.fromEntries(
        await Promise.all(
          Object.entries(storyAudioModules).map(async ([path, loader]) => [path, await loader()])
        ),
      );

      const loadedStories = Object.entries({ ...storyModules2, ...storyModules3 });
      const storyPairs = await Promise.all(
        loadedStories.map(async ([path, loader]) => [path, await loader()]),
      );

      const parsedStories = storyPairs
        .map(([path, raw]) => {
          const parts = path.split('/');
          let source, directory, slug;
          if (parts.length === 6) {
            source = parts[2];
            directory = parts[3];
            slug = parts[4];
          } else {
            source = parts[2];
            directory = null;
            slug = parts[3];
          }

          const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
          const fmBlock = fmMatch ? fmMatch[1] : '';
          const titleMatch = fmBlock.match(/^title:\s*"(.+)"$/m);
          const title = titleMatch ? titleMatch[1] : slug;
          const sourceLabelMatch = fmBlock.match(/^source:\s*"(.+)"$/m);
          const sourceLabel = sourceLabelMatch ? sourceLabelMatch[1] : source;
          const wordCountMatch = fmBlock.match(/^wordCount:\s*(\d+)$/m);
          const wordCount = wordCountMatch ? parseInt(wordCountMatch[1], 10) : null;
          const afterFm = fmMatch ? raw.slice(fmMatch[0].length) : raw;
          const content = afterFm.replace(/^#[^\n]*\n\n/, '').trimEnd();

          const id = directory ? `${source}/${directory}/${slug}` : `${source}/${slug}`;
          return { id, title, content, source, directory, sourceLabel, wordCount };
        })
        .sort((a, b) => a.title.localeCompare(b.title, 'de'));

      const adaptionPairs = await Promise.all(
        Object.entries(adaptionModules).map(async ([path, loader]) => [path, await loader()]),
      );
      const loadedAdaptions = {};
      adaptionPairs.forEach(([path, raw]) => {
        const parts = path.split('/');
        const source = parts[parts.length - 5];
        const parentSlug = parts[parts.length - 4];
        const parentId = `${source}/${parentSlug}`;

        const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
        const fmBlock = fmMatch ? fmMatch[1] : '';
        const adaptionNameMatch = fmBlock.match(/^adaption:\s*"(.+)"$/m);
        const adaptionName = adaptionNameMatch ? adaptionNameMatch[1] : parts[parts.length - 2];
        const afterFm = fmMatch ? raw.slice(fmMatch[0].length) : raw;
        const content = afterFm.replace(/^\*\*[^\n]*\*\*\n\n/, '').trimEnd();

        if (!loadedAdaptions[parentId]) loadedAdaptions[parentId] = [];
        loadedAdaptions[parentId].push({ adaptionName, content });
      });

      if (!mounted) return;
      setStoryAudioFiles(loadedAudio);
      setStories(parsedStories);
      setAdaptionsByParent(loadedAdaptions);
      setIsLibraryLoading(false);
    }

    loadLibrary().catch(() => {
      if (!mounted) return;
      setStoryAudioFiles({});
      setStories([]);
      setAdaptionsByParent({});
      setIsLibraryLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Persistence - must come before visibleStories (needs blacklist) and
  // before useReader (needs selectedVariant + pendingResumePageRef).
  const persist = usePersistence({
    stories,
    adaptionsByParent,
    selectedStory,
    activeSource,
  });
  const {
    completedStories, resumeSession, setResumeSession,
    variantPrefs, setVariantPrefs, selectedVariant, setSelectedVariant,
    blacklist, blacklistInput, setBlacklistInput,
    favorites, setFavorites, favoritesOnly, setFavoritesOnly,
    selectVariant, toggleFavorite, toggleFavoriteById,
    addBlacklistWord, removeBlacklistWord, markCompleted, pendingResumePageRef,
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

  const directoriesBySource = React.useMemo(() => {
    const map = {};
    for (const story of visibleStories) {
      if (!story.directory) continue;
      if (!map[story.source]) map[story.source] = {};
      if (!map[story.source][story.directory]) {
        map[story.source][story.directory] = { id: story.directory, label: story.directory, count: 0 };
      }
      map[story.source][story.directory].count++;
    }
    return Object.fromEntries(
      Object.entries(map).map(([src, dirs]) => [src, Object.values(dirs)])
    );
  }, [visibleStories]);

  const filteredStories = searchTerm
    ? visibleStories.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];


  // Reader state and logic
  const {
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
  } = useReader({
    readerAreaRef,
    measureRef,
    selectedStory,
    selectedVariant,
    typographyValues: { fontSize, lineHeight, textWidth, hPadding, wordSpacing, fontFamily },
    showSpeedReader,
    pendingResumePageRef,
  });

  // Effects extracted from usePersistence that depend on reader state
  // (currentPage/totalPages come from useReader above, so they must live here).
  useEffect(() => {
    if (!selectedStory || totalPages <= 1 || currentPage !== totalPages - 1) return;
    markCompleted(selectedStory.id);
  }, [selectedStory, currentPage, totalPages]);

  useEffect(() => {
    if (!selectedStory) return;
    localStorage.setItem('wr-last-story', selectedStory.id);
    localStorage.setItem('wr-last-page', currentPage);
  }, [selectedStory, currentPage]);

  const [theme, setTheme] = useState(() => localStorage.getItem('wr-theme') ?? flagTheme); // 'light' | 'dark' | 'system'
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const pinchGestureRef = useRef({ active: false, startDistance: 0, startFontSize: 18 });
  const fontSizeRef = useRef(fontSize);

  useEffect(() => {
    fontSizeRef.current = fontSize;
  }, [fontSize]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = e => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const highContrast = theme === 'light-hc' || theme === 'dark-hc';
  const darkMode = theme === 'dark' || (theme === 'system' && systemDark) || theme === 'dark-hc';

  useEffect(() => { localStorage.setItem('wr-theme', theme); }, [theme]);

  useEffect(() => {
    if (!showPinchFontSize || !selectedStory || speedReaderMode) return undefined;

    const viewport = readerAreaRef.current;
    if (!viewport) return undefined;

    const distance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const onTouchStart = (event) => {
      if (event.touches.length !== 2) return;
      pinchGestureRef.current = {
        active: true,
        startDistance: distance(event.touches),
        startFontSize: fontSizeRef.current,
      };
    };

    const onTouchMove = (event) => {
      if (!pinchGestureRef.current.active || event.touches.length !== 2) return;
      event.preventDefault();
      const currentDistance = distance(event.touches);
      if (pinchGestureRef.current.startDistance <= 0) return;

      const scale = currentDistance / pinchGestureRef.current.startDistance;
      const scaledFontSize = pinchGestureRef.current.startFontSize * scale;
      const nextFontSize = Math.round(scaledFontSize / 2) * 2;
      const clampedFontSize = Math.max(14, Math.min(maxFontSize, nextFontSize));
      setFontSize(clampedFontSize);
    };

    const onTouchEnd = (event) => {
      if (event.touches.length < 2) {
        pinchGestureRef.current.active = false;
      }
    };

    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: false });
    viewport.addEventListener('touchend', onTouchEnd, { passive: true });
    viewport.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchmove', onTouchMove);
      viewport.removeEventListener('touchend', onTouchEnd);
      viewport.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [showPinchFontSize, selectedStory, speedReaderMode, maxFontSize, setFontSize]);

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

  const readingMinutes = Math.ceil(storyWordCount / 200);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleCloseApp = useCallback(() => {
    window.location.assign('/');
  }, []);

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
          onSelectSource={handleSelectSource}
          activeDirectory={activeDirectory}
          onSelectDirectory={setActiveDirectory}
          showStoryDirectories={showStoryDirectories}
          directoriesBySource={directoriesBySource}
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
          onCloseApp={handleCloseApp}
        />

        {/* Hidden measurement container - off-screen, used to calculate paragraph heights */}
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
              role={role}
              setRole={setRole}
              isAdmin={isAdmin}
              visibleFeatureKeys={visibleFeatureKeys}
              isFeatureAssignedToRole={isFeatureAssignedToRole}
              toggleFeatureForRole={toggleFeatureForRole}
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
              srFontSizeMin={SPEED_READER_FONT_SIZE.min}
              srFontSizeMax={SPEED_READER_FONT_SIZE.max}
              srFontSizeStep={SPEED_READER_FONT_SIZE.step}
              srFontSizeDefault={SPEED_READER_FONT_SIZE.defaultValue}
            />
          ) : isLibraryLoading ? (
            <div className={`h-full w-full grid place-items-center ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>
              Loading library...
            </div>
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

    {showDebugBadges && <DebugOverlay />}
    </ThemeContext.Provider>
  );
};

export default GrimmMarchenApp;
