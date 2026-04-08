import React from 'react';
import PageContent from './PageContent';
import EInkFlashOverlay from './EInkFlashOverlay';
import TapZones from './TapZones';
import VariantSwitcher from './VariantSwitcher';
import NavBar from './NavBar';
import SpeedReaderView from '../ui/SpeedReaderView';
import TypographyPanel from '../ui/TypographyPanel';
import AudioPlayer from '../ui/AudioPlayer';

/**
 * Reader view compositor - manages the entire reading interface.
 * Conditionally renders speed reader mode or normal page view with all controls.
 */
export default function ReaderView({
  readerAreaRef,
  selectedStory,
  selectedVariant,
  pages,
  currentPage,
  totalPages,
  isFlashing,
  srWords,
  speedReaderMode,
  onSetSpeedReaderMode,
  onGoToPage,
  showEinkFlash,
  showTapZones,
  showTapMiddleToggle,
  controlsVisible,
  onToggleControls,
  showAdaptionSwitcher,
  adaptionsByParent,
  onSelectVariant,
  showTypographyPanel,
  typoPanelOpen,
  onToggleTypoPanel,
  lineHeightIdx,
  onLineHeightChange,
  textWidthIdx,
  onTextWidthChange,
  wordSpacingIdx,
  onWordSpacingChange,
  fontFamilyIdx,
  onFontFamilyChange,
  showAudioPlayer,
  storyAudioFiles,
  showSpeedReader,
  showSpeedreaderOrp,
  darkMode,
  highContrast,
  fontSize,
  lineHeight,
  wordSpacing,
  fontFamily,
  textWidth,
  hPadding,
  showAttribution,
  showFavorites,
  favorites,
  onShare,
  onToggleFavorite,
  onClose,
  srFontSizeMin,
  srFontSizeMax,
  srFontSizeStep,
  srFontSizeDefault,
}) {
  return (
    <>
      {/* Reading viewport */}
      <div
        ref={readerAreaRef}
        data-testid="reader-viewport"
        className="flex-1 overflow-hidden relative"
      >
        {speedReaderMode ? (
          <SpeedReaderView
            key={`${selectedStory?.id ?? ''}-${selectedVariant?.adaptionName ?? ''}`}
            srWords={srWords}
            darkMode={darkMode}
            highContrast={highContrast}
            showSpeedreaderOrp={showSpeedreaderOrp}
            story={selectedStory}
            isFavorite={favorites.has(selectedStory.id)}
            onToggleFavorite={() => onToggleFavorite(selectedStory.id)}
            onClose={onClose}
            showFavorites={showFavorites}
            onShare={onShare}
            srFontSizeMin={srFontSizeMin}
            srFontSizeMax={srFontSizeMax}
            srFontSizeStep={srFontSizeStep}
            srFontSizeDefault={srFontSizeDefault}
          />
        ) : (
          <>
            {/* E-ink flash overlay */}
            {showEinkFlash && <EInkFlashOverlay isFlashing={isFlashing} />}

            {/* Current page content */}
            <PageContent
              pages={pages}
              currentPage={currentPage}
              totalPages={totalPages}
              selectedStory={selectedStory}
              selectedVariant={selectedVariant}
              fontSize={fontSize}
              lineHeight={lineHeight}
              wordSpacing={wordSpacing}
              fontFamily={fontFamily}
              textWidth={textWidth}
              hPadding={hPadding}
              showAttribution={showAttribution}
              showFavorites={showFavorites}
              favorites={favorites}
              onShare={onShare}
              onToggleFavorite={onToggleFavorite}
              onClose={onClose}
            />

            {/* Tap zones */}
            {showTapZones && (
              <TapZones
                onPrev={() => onGoToPage(currentPage - 1)}
                onClick={() => showTapMiddleToggle && onToggleControls(v => !v)}
                onNext={() => onGoToPage(currentPage + 1)}
              />
            )}
          </>
        )}
      </div>

      {/* Variant switcher - shown only when adaptions exist */}
      {showAdaptionSwitcher && (adaptionsByParent[selectedStory.id] ?? []).length > 0 && (
        <VariantSwitcher
          adaptions={adaptionsByParent[selectedStory.id]}
          selectedVariant={selectedVariant}
          onSelect={onSelectVariant}
        />
      )}

      {/* Typography panel - slides open above nav bar */}
      {showTypographyPanel && typoPanelOpen && (
        <TypographyPanel
          lineHeightIdx={lineHeightIdx}
          onLineHeightChange={onLineHeightChange}
          textWidthIdx={textWidthIdx}
          onTextWidthChange={onTextWidthChange}
          wordSpacingIdx={wordSpacingIdx}
          onWordSpacingChange={onWordSpacingChange}
          fontFamilyIdx={fontFamilyIdx}
          onFontFamilyChange={onFontFamilyChange}
        />
      )}

      {/* Audio player - only when flag is on and the story has an audio file */}
      {showAudioPlayer && (
        <AudioPlayer
          key={selectedStory?.id}
          src={storyAudioFiles[`/stories/${selectedStory?.id}/audio.mp3`] ?? null}
        />
      )}

      {/* Page navigation bar - flex sibling, not overlapping */}
      {controlsVisible && (
        <NavBar
          currentPage={currentPage}
          totalPages={totalPages}
          storyTitle={selectedStory.title}
          onPrev={() => onGoToPage(currentPage - 1)}
          onNext={() => onGoToPage(currentPage + 1)}
          showSpeedReader={showSpeedReader}
          speedReaderMode={speedReaderMode}
          onToggleSpeedReader={() => onSetSpeedReaderMode(v => !v)}
          showTypographyPanel={showTypographyPanel}
          typoPanelOpen={typoPanelOpen}
          onToggleTypoPanel={onToggleTypoPanel}
          srWordCount={srWords.length}
        />
      )}
    </>
  );
}
