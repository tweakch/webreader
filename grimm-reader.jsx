import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Menu, X, Plus, Minus, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const GrimmMarchenApp = () => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pages, setPages] = useState([]); // [{paragraphs: string[], hasTitle: bool}]
  const [isFlashing, setIsFlashing] = useState(false);

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

        // Strip frontmatter and the # heading line, leaving only paragraphs
        const afterFm = fmMatch ? raw.slice(fmMatch[0].length) : raw;
        const content = afterFm.replace(/^#[^\n]*\n\n/, '').trimEnd();

        return { id: `${source}/${slug}`, title, content, source, sourceLabel };
      })
      .sort((a, b) => a.title.localeCompare(b.title, 'de'));
  }, []);

  const [activeSource, setActiveSource] = useState(null);

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

  const buildPages = useCallback(() => {
    if (!readerAreaRef.current || !measureRef.current || !selectedStory) return;

    const viewportH = readerAreaRef.current.clientHeight;
    const viewportW = readerAreaRef.current.clientWidth;
    if (viewportH === 0) return;

    const PADDING = 32; // 2rem on each side
    const contentW = Math.min(viewportW - PADDING * 2, 768); // max-w-3xl
    const availableH = viewportH - PADDING * 2; // subtract top+bottom padding

    const m = measureRef.current;
    m.style.width = contentW + 'px'; // exact same width as the rendered text
    m.style.padding = '0';

    // Split content into tokens: words and paragraph markers
    const paragraphs = selectedStory.content.split('\n\n');
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
        h2.style.cssText = `font-size:2.25rem;font-weight:bold;margin:0 0 0.5rem;font-family:Georgia,serif;line-height:1.25;`;
        h2.textContent = selectedStory.title;
        m.appendChild(h2);
        const divider = document.createElement('div');
        divider.style.cssText = 'height:4px;width:5rem;margin-bottom:2rem;';
        m.appendChild(divider);
      }

      // Add a placeholder paragraph container for text
      const contentDiv = document.createElement('div');
      contentDiv.style.cssText = `font-size:${fontSize}px;line-height:1.8;font-family:Georgia,serif;`;
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
    setCurrentPage(0);
  }, [selectedStory, fontSize]);

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

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className={`fixed inset-0 flex flex-col overflow-hidden transition-colors duration-300 ${
      darkMode
        ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950'
        : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50'
    }`}>
      {/* Header */}
      <header className={`flex-shrink-0 backdrop-blur-md transition-colors duration-300 z-40 ${
        darkMode
          ? 'bg-slate-900/80 border-amber-700/30'
          : 'bg-white/80 border-amber-200/50'
      } border-b`}>
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              {selectedStory ? selectedStory.title : 'Märchenschatz'}
            </h1>
          </div>

          {selectedStory && (
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
                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
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
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              darkMode
                ? 'bg-amber-200 text-slate-900 hover:bg-amber-300'
                : 'bg-amber-900 text-white hover:bg-amber-800'
            }`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed lg:static top-16 bottom-0 left-0 w-80 lg:w-72 z-30 transform transition-transform duration-300 overflow-y-auto ${
          menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          darkMode
            ? 'bg-slate-950/95 border-amber-700/30'
            : 'bg-white/95 border-amber-200/50'
        } border-r backdrop-blur-sm`}>

          {/* Search — always visible */}
          <div className="p-4">
            <div className={`relative ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>
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
          </div>

          {searchTerm ? (
            /* Search results — global, with source badge */
            <div className="px-3 pb-4 space-y-1">
              {filteredStories.length === 0 && (
                <p className={`px-2 py-3 text-sm ${darkMode ? 'text-amber-600' : 'text-amber-700'}`}>
                  Keine Ergebnisse
                </p>
              )}
              {filteredStories.map(story => (
                <button
                  key={story.id}
                  onClick={() => { setSelectedStory(story); setMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
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
                </button>
              ))}
            </div>
          ) : activeSource ? (
            /* Drilled into a source — back button + story list */
            <>
              <div className="px-3 pb-2">
                <button
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
                  <button
                    key={story.id}
                    data-testid="story-button"
                    onClick={() => { setSelectedStory(story); setMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all font-serif text-base line-clamp-2 ${
                      selectedStory?.id === story.id
                        ? darkMode ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
                        : darkMode ? 'text-amber-100 hover:bg-slate-800' : 'text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    {story.title}
                  </button>
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
          {selectedStory ? (
            <>
              {/* Reading viewport */}
              <div
                ref={readerAreaRef}
                data-testid="reader-viewport"
                className="flex-1 overflow-hidden relative"
              >
                {/* E-ink flash overlay */}
                <div
                  className={`absolute inset-0 z-20 pointer-events-none ${
                    darkMode ? 'bg-slate-800' : 'bg-white'
                  }`}
                  style={{
                    opacity: isFlashing ? 1 : 0,
                    transition: isFlashing ? 'none' : 'opacity 0.05s',
                  }}
                />

                {/* Current page content — rendered statically, no translateY */}
                {pages[currentPage] && (
                  <div
                    data-testid="page-content"
                    className={`h-full transition-colors duration-300 ${
                      darkMode ? 'bg-slate-800/50' : 'bg-white/70'
                    }`}
                    style={{ padding: '2rem' }}
                  >
                    <div className="max-w-3xl mx-auto w-full">
                      {pages[currentPage].hasTitle && (
                        <>
                          <h2 className={`text-4xl font-serif font-bold mb-2 ${
                            darkMode ? 'text-amber-200' : 'text-amber-900'
                          }`}>
                            {selectedStory.title}
                          </h2>
                          <div className={`h-1 w-20 rounded-full mb-8 ${
                            darkMode ? 'bg-amber-700' : 'bg-amber-300'
                          }`} />
                        </>
                      )}

                      <div
                        style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                        className={`font-serif ${darkMode ? 'text-amber-50' : 'text-amber-950'}`}
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

                      {currentPage === totalPages - 1 && (
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
                <div
                  className="absolute left-0 top-0 bottom-0 z-10 cursor-pointer"
                  style={{ width: '30%' }}
                  onClick={() => goToPage(currentPage - 1)}
                />

                {/* Right tap zone — next page */}
                <div
                  className="absolute right-0 top-0 bottom-0 z-10 cursor-pointer"
                  style={{ width: '30%' }}
                  onClick={() => goToPage(currentPage + 1)}
                />
              </div>

              {/* Page navigation bar — flex sibling, not overlapping */}
              <div data-testid="nav-bar" className={`flex-shrink-0 h-12 flex items-center justify-between px-6 backdrop-blur-sm border-t transition-colors ${
                darkMode
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

                <span data-testid="page-counter" className="text-sm font-medium tabular-nums">
                  {currentPage + 1} / {totalPages}
                </span>

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
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">📚</div>
              <p className={`text-2xl font-serif font-bold mb-2 ${
                darkMode ? 'text-amber-200' : 'text-amber-900'
              }`}>
                Wähle ein Märchen
              </p>
              <p className={`${
                darkMode ? 'text-amber-600' : 'text-amber-700'
              }`}>
                Klicke auf einen Titel in der Seitenleiste
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GrimmMarchenApp;
