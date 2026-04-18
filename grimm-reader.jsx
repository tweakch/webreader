import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, X, Plus, Minus, User } from 'lucide-react';
import { FEATURES } from './features';
import { useFeatureFlags } from './hooks/useFeatureFlags';
import { useTypography } from './hooks/useTypography';
import { usePersistence } from './hooks/usePersistence';
import { useReader } from './hooks/useReader';
import FeatureDocs from './FeatureDocs';
import { useRole } from './hooks/useRole';
import { useABTesting } from './hooks/useABTesting';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { ThemeContext } from './ui/ThemeContext';
import Toggle from './ui/Toggle';
import IconButton from './ui/IconButton';
import ProfilePanel from './components/ProfilePanel';
import PersonasDocsView from './components/PersonasDocsView';
import HomeView from './components/HomeView';
import ReaderView from './components/ReaderView';
import Sidebar from './components/Sidebar';
import SidebarV2 from './components/SidebarV2';
import TypographyPanel, { LINE_HEIGHTS, WORD_SPACINGS, FONT_FAMILIES } from './ui/TypographyPanel';
import AudioPlayer from './ui/AudioPlayer';
import SpeedReaderView from './ui/SpeedReaderView';
import DebugOverlay from './components/DebugOverlay';
import { getStoryIndex, loadStoryById, loadStoryMetadataById, loadAdaptionsByStoryId, loadStoryAudioMap } from './src/lib/storyLibrary';

const SPEED_READER_FONT_SIZE = {
  min: 40,
  max: 60,
  step: 5,
  defaultValue: 50,
};

const GrimmMarchenApp = () => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  // Feature flags
  const flags = useFeatureFlags();
  const {
    maxFontSize,
    showWordCount, showReadingDuration, showFontSizeControls, showPinchFontSize, showEinkFlash,
    showTapZones, showTapMiddleToggle, showAdaptionSwitcher, showTypographyPanel, showAttribution,
    showFavorites, showFavoritesOnlyToggle, showAudioPlayer, showHighContrastTheme,
    showSimplifiedUi, showTextToSpeech,
    showSpeedReader, showSpeedreaderOrp, showWordBlacklist, showDeepSearch, showStoryDirectories, showDebugBadges, showSubscriberFonts, showErrorPageSimulator, showAppAnimation,
    showAbTesting, showAbTestingAdmin,
    _rawFlagValues,
    userFeatureOverrides, setUserFeatureOverrides, _o,
    flagTheme, bigFontsVariant,
  } = flags;

  // Role management
  const {
    role, setRole, isAdmin, visibleFeatureKeys, isFeatureAssignedToRole, toggleFeatureForRole,
  } = useRole();

  // A/B testing
  const ab = useABTesting({ role, isAdmin });
  const sidebarVariant = ab.getVariant('sidebar');
  const profileAccessVariant = ab.getVariant('profile-access');

  // Typography
  const typo = useTypography({ maxFontSize, subscriberFonts: showSubscriberFonts });
  const { fontSize, setFontSize, lineHeightIdx, setLineHeightIdx, textWidthIdx, setTextWidthIdx, wordSpacingIdx, setWordSpacingIdx, fontFamilyIdx, setFontFamilyIdx, lineHeight, textWidth, hPadding, wordSpacing, fontFamily } = typo;

  const [searchTerm, setSearchTerm] = useState('');
  const [typoPanelOpen, setTypoPanelOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [docsAnchor, setDocsAnchor] = useState(null);
  const [personasDocsOpen, setPersonasDocsOpen] = useState(false);
  const [activeSource, setActiveSource] = useState(() => localStorage.getItem('wr-last-source') || null);
  const [activeDirectory, setActiveDirectory] = useState(null);
  const [stories, setStories] = useState([]);
  const [adaptionsByParent, setAdaptionsByParent] = useState({});
  const [storyAudioFiles, setStoryAudioFiles] = useState({});
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);
  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [loadedMetadataIds, setLoadedMetadataIds] = useState(new Set());
  const [simulatedErrorType, setSimulatedErrorType] = useState(null);

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
      const loadedAudio = await loadStoryAudioMap();
      const indexedStories = getStoryIndex();

      if (!mounted) return;
      setStoryAudioFiles(loadedAudio);
      setStories(indexedStories);
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

  const mergeStoryMetadata = useCallback((metadata) => {
    if (!metadata) return;
    setStories((prev) => prev.map((story) => (
      story.id === metadata.id ? { ...story, ...metadata } : story
    )));
  }, []);

  const handleSelectStory = useCallback(async (story) => {
    if (!story) return;
    setSelectedStory(null);
    setMenuOpen(false);
    setIsStoryLoading(true);
    try {
      const loadedStory = await loadStoryById(story.id);
      if (!loadedStory) return;
      setSelectedStory(loadedStory);
      mergeStoryMetadata({
        id: loadedStory.id,
        title: loadedStory.title,
        source: loadedStory.source,
        directory: loadedStory.directory,
        sourceLabel: loadedStory.sourceLabel,
        wordCount: loadedStory.wordCount,
      });
    } finally {
      setIsStoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeSource || stories.length === 0) return;
    const sourceStories = stories.filter((story) => story.source === activeSource);
    const storiesToLoad = sourceStories.filter((story) => !loadedMetadataIds.has(story.id));

    if (storiesToLoad.length === 0) return;

    storiesToLoad.forEach((story) => {
      loadStoryMetadataById(story.id)
        .then((metadata) => {
          mergeStoryMetadata(metadata);
          setLoadedMetadataIds((prev) => new Set([...prev, story.id]));
        })
        .catch(() => {
          setLoadedMetadataIds((prev) => new Set([...prev, story.id]));
        });
    });
  }, [activeSource, stories.length, loadedMetadataIds, mergeStoryMetadata]);

  useEffect(() => {
    if (!selectedStory) return;
    if (adaptionsByParent[selectedStory.id]) return;

    loadAdaptionsByStoryId(selectedStory.id)
      .then((loaded) => {
        setAdaptionsByParent((prev) => ({ ...prev, [selectedStory.id]: loaded }));
      })
      .catch(() => {
        setAdaptionsByParent((prev) => ({ ...prev, [selectedStory.id]: [] }));
      });
  }, [selectedStory]);

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
      !words.some(w => s.title.toLowerCase().includes(w))
    );
  }, [stories, blacklist]);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const titleMatchedStoryIds = React.useMemo(() => {
    if (!normalizedSearchTerm) return new Set();
    return new Set(
      visibleStories
        .filter((story) => story.title.toLowerCase().includes(normalizedSearchTerm))
        .map((story) => story.id),
    );
  }, [visibleStories, normalizedSearchTerm]);

  const [deepMatchedStoryIds, setDeepMatchedStoryIds] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;

    async function runDeepSearch() {
      if (!showDeepSearch || !normalizedSearchTerm) {
        setDeepMatchedStoryIds(new Set());
        return;
      }

      const candidates = visibleStories.filter((story) => !titleMatchedStoryIds.has(story.id));
      const matches = await Promise.all(
        candidates.map(async (story) => {
          const loaded = await loadStoryById(story.id);
          if (!loaded) return null;
          return loaded.content.toLowerCase().includes(normalizedSearchTerm) ? story.id : null;
        }),
      );

      if (cancelled) return;
      setDeepMatchedStoryIds(new Set(matches.filter(Boolean)));
    }

    runDeepSearch().catch(() => {
      if (cancelled) return;
      setDeepMatchedStoryIds(new Set());
    });

    return () => {
      cancelled = true;
    };
  }, [showDeepSearch, normalizedSearchTerm, visibleStories, titleMatchedStoryIds]);

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

  const filteredStories = normalizedSearchTerm
    ? visibleStories.filter((story) =>
      titleMatchedStoryIds.has(story.id) || (showDeepSearch && deepMatchedStoryIds.has(story.id)))
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

  // Text-to-speech - reads the current page aloud and auto-advances.
  const tts = useTextToSpeech({ enabled: showTextToSpeech });
  const {
    supported: ttsSupported, voices: ttsVoices, voiceURI: ttsVoiceURI, setVoiceURI: setTtsVoiceURI,
    rateIdx: ttsRateIdx, setRateIdx: setTtsRateIdx,
    playing: ttsPlaying, paused: ttsPaused,
    speak: ttsSpeak, pause: ttsPause, resume: ttsResume, stop: ttsStop,
  } = tts;

  const pageText = React.useMemo(() => {
    const page = pages[currentPage];
    if (!page) return '';
    const text = page.tokens.map(t => t.word).join(' ');
    if (page.hasTitle && selectedStory) {
      const title = selectedVariant?.title ?? selectedStory.title;
      return `${title}. ${text}`;
    }
    return text;
  }, [pages, currentPage, selectedStory, selectedVariant]);

  // Continuous read-session flag: true while the user wants TTS to keep
  // auto-advancing page by page. Cleared on pause, stop, or last-page finish.
  const ttsSessionRef = useRef(false);

  const speakCurrentPage = useCallback(() => {
    if (!pageText) return;
    const isLast = currentPage >= totalPages - 1;
    ttsSpeak(pageText, {
      onFinish: () => {
        if (!ttsSessionRef.current) return;
        if (isLast) { ttsSessionRef.current = false; return; }
        goToPage(currentPage + 1);
      },
    });
  }, [pageText, currentPage, totalPages, ttsSpeak, goToPage]);

  const handleToggleTts = useCallback(() => {
    if (!ttsSupported) return;
    if (ttsPlaying && !ttsPaused) { ttsSessionRef.current = false; ttsPause(); return; }
    if (ttsPlaying && ttsPaused) { ttsSessionRef.current = true; ttsResume(); return; }
    ttsSessionRef.current = true;
    speakCurrentPage();
  }, [ttsSupported, ttsPlaying, ttsPaused, ttsPause, ttsResume, speakCurrentPage]);

  const handleStopTts = useCallback(() => {
    ttsSessionRef.current = false;
    ttsStop();
  }, [ttsStop]);

  // When the page changes during an active read-session (auto-advance), speak the new page.
  const prevPageRef = useRef(currentPage);
  useEffect(() => {
    if (prevPageRef.current === currentPage) return;
    prevPageRef.current = currentPage;
    if (ttsSessionRef.current) speakCurrentPage();
  }, [currentPage, speakCurrentPage]);

  // Stop TTS when leaving the story or entering speed-reader mode.
  useEffect(() => {
    if (!selectedStory || speedReaderMode) {
      ttsSessionRef.current = false;
      ttsStop();
    }
  }, [selectedStory, speedReaderMode, ttsStop]);

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
    if (showAppAnimation) {
      window.dispatchEvent(new CustomEvent('app:request-close'));
    } else {
      window.location.assign('/');
    }
  }, [showAppAnimation]);

  // Throwing inside the render body is caught by the nearest ErrorBoundary.
  // The error-page-simulator uses this to preview the 500 page.
  if (simulatedErrorType === 'unexpected') {
    throw new Error('Simulated 500 error (error-page-simulator)');
  }

  return (
    <ThemeContext.Provider value={{ dark: darkMode, hc: highContrast }}>
    <div className={`fixed inset-0 flex flex-col overflow-hidden transition-colors duration-300 ${
      highContrast
        ? (darkMode ? 'bg-black' : 'bg-white')
        : darkMode
        ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950'
        : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50'
    }`}>
      {/* Dev Mode Indicator */}
      {import.meta.env.DEV && (
        <div className="flex-shrink-0 px-4 py-2 bg-red-500 text-white text-sm font-medium text-center">
          🔴 DEVELOPMENT MODE
        </div>
      )}

      {/* Header */}
      {controlsVisible && (
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
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (A/B variant selection via useABTesting) */}
        {(() => {
          const SidebarComponent = sidebarVariant === 'v2' ? SidebarV2 : Sidebar;
          return (
        <SidebarComponent
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen(false)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showDeepSearch={showDeepSearch}
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
          onSelectStory={handleSelectStory}
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
          onCloseProfile={() => setProfileOpen(false)}
          onCloseApp={handleCloseApp}
          simplifiedUi={showSimplifiedUi}
          profileAccessVariant={profileAccessVariant}
        />
          );
        })()}

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
          {personasDocsOpen ? (
            <PersonasDocsView
              onBack={() => { setPersonasDocsOpen(false); setProfileOpen(true); }}
            />
          ) : docsOpen ? (
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
              onOpenPersonasDocs={() => { setPersonasDocsOpen(true); setProfileOpen(false); }}
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
              showErrorPageSimulator={showErrorPageSimulator}
              showAbTesting={showAbTesting}
              showAbTestingAdmin={showAbTestingAdmin}
              ab={ab}
              simplifiedUi={showSimplifiedUi}
              onSimulateError={(type) => {
                if (type === 'not-found') {
                  window.location.assign('/does-not-exist');
                } else {
                  setSimulatedErrorType(type);
                }
              }}
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
              showTapMiddleToggle={showTapMiddleToggle}
              controlsVisible={controlsVisible}
              onToggleControls={setControlsVisible}
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
              subscriberFonts={showSubscriberFonts}
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
              showTextToSpeech={showTextToSpeech}
              ttsSupported={ttsSupported}
              ttsPlaying={ttsPlaying}
              ttsPaused={ttsPaused}
              ttsVoices={ttsVoices}
              ttsVoiceURI={ttsVoiceURI}
              onTtsVoiceChange={setTtsVoiceURI}
              ttsRateIdx={ttsRateIdx}
              onTtsRateChange={setTtsRateIdx}
              onToggleTts={handleToggleTts}
              onStopTts={handleStopTts}
              simplifiedUi={showSimplifiedUi}
            />
          ) : isStoryLoading ? (
            <div className={`h-full w-full grid place-items-center ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>
              Loading story...
            </div>
          ) : isLibraryLoading ? (
            <div className={`h-full w-full grid place-items-center ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>
              Loading library...
            </div>
          ) : (
            <HomeView
              resumeSession={resumeSession}
              onResume={(story, page) => {
                pendingResumePageRef.current = page;
                handleSelectStory(story);
              }}
              onDismissResume={() => setResumeSession(null)}
              favoriteStories={favoriteStories}
              completedStories={completedStories}
              showFavorites={showFavorites}
              showWordCount={showWordCount}
              onSelectStory={handleSelectStory}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </main>
      </div>

      {/* Thumb-reachable profile FAB — mobile/tablet only, hidden while any
          overlay is open so the reader view isn't cluttered.
          A/B: `profile-access=fab` keeps the FAB; `sidebar-top` hides it and
          surfaces profile access at the top of the sidebar instead. */}
      {profileAccessVariant === 'fab' && !profileOpen && !docsOpen && !personasDocsOpen && !menuOpen && (
        <button
          onClick={() => setProfileOpen(true)}
          data-testid="profile-fab"
          aria-label="Mein Profil"
          className={`lg:hidden fixed bottom-5 right-5 z-20 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 ${
            darkMode
              ? 'bg-amber-700 text-white hover:bg-amber-600'
              : 'bg-amber-900 text-white hover:bg-amber-800'
          }`}
        >
          <User size={22} />
        </button>
      )}
    </div>

    {showDebugBadges && <DebugOverlay flagValues={_rawFlagValues} />}
    </ThemeContext.Provider>
  );
};

export default GrimmMarchenApp;
