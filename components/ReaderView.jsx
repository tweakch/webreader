import React from 'react';
import PageContent from './PageContent';
import EInkFlashOverlay from './EInkFlashOverlay';
import TapZones from './TapZones';
import EndOfStoryButtons from './EndOfStoryButtons';
import VariantSwitcher from './VariantSwitcher';
import ReaderBottomBar from './ReaderBottomBar';
import SpeedReaderView from '../ui/SpeedReaderView';
import TypographyPanel from '../ui/TypographyPanel';
import AudioPlayer from '../ui/AudioPlayer';
import ReaderRightDrawer from './gestureContent/ReaderRightDrawer';

// CTC: Wire post-story content slot — see:
//   - docs/features/discussion-questions.md (Socratic prompts)
//   - docs/features/journaling-prompts.md (reflection prompts + textarea)
//   - docs/features/cultural-annotations.md (inline footnotes during reading)
//   - docs/features/parallel-texts.md (two-column language reading)
// All four read story-side data (questions.json, annotation spans, content.<lang>.md)
// and render either inline (annotations, parallel) or after the last page
// (discussion, journaling) via this compositor.
// TODO(CTC): remove this comment once the four features are wired and their
//   FEATURES gap entries are removed.

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
  subscriberFonts,
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
  showTextToSpeech,
  ttsSupported,
  ttsPlaying,
  ttsPaused,
  ttsVoiceURI,
  onTtsVoiceChange,
  ttsVoices,
  ttsRateIdx,
  onTtsRateChange,
  onToggleTts,
  onStopTts,
  simplifiedUi,
  showIllustrations,
  showEnhancedGestures,
  onSetFontSize,
  maxFontSize,
  showFontSizeControls,
}) {
  const isLastPage = currentPage === totalPages - 1;
  const isFavoriteCurrent = !!(selectedStory && favorites?.has(selectedStory.id));

  return (
    <>
      {showEnhancedGestures && !speedReaderMode && (
        <ReaderRightDrawer
          pages={pages}
          currentPage={currentPage}
          onGoToPage={onGoToPage}
          storyTitle={selectedStory?.title}
        />
      )}
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
              showIllustrations={showIllustrations}
            />

            {/* Tap zones */}
            {showTapZones && (
              <TapZones
                onPrev={() => currentPage > 0 && onGoToPage(currentPage - 1)}
                onClick={() => showTapMiddleToggle && onToggleControls((v) => !v)}
                onNext={() => currentPage < totalPages - 1 && onGoToPage(currentPage + 1)}
              />
            )}

            {/* End-of-story buttons - rendered above tap zones so they're clickable */}
            <EndOfStoryButtons
              isVisible={isLastPage}
              selectedStory={selectedStory}
              isFavorite={favorites.has(selectedStory.id)}
              showFavorites={showFavorites}
              highContrast={highContrast}
              darkMode={darkMode}
              showAttribution={showAttribution}
              onShare={onShare}
              onToggleFavorite={onToggleFavorite}
              onClose={onClose}
            />
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
          subscriberFonts={subscriberFonts}
          showTextToSpeech={showTextToSpeech}
          ttsSupported={ttsSupported}
          ttsVoices={ttsVoices}
          ttsVoiceURI={ttsVoiceURI}
          onTtsVoiceChange={onTtsVoiceChange}
          ttsRateIdx={ttsRateIdx}
          onTtsRateChange={onTtsRateChange}
        />
      )}

      {/* Audio player - only when flag is on and the story has an audio file */}
      {showAudioPlayer && (
        <AudioPlayer
          key={selectedStory?.id}
          src={storyAudioFiles[`/stories/${selectedStory?.id}/audio.mp3`] ?? null}
        />
      )}

      {/* Bottom surface: persistent nav bar + complementary swipe-up drawer. */}
      <ReaderBottomBar
        visible={controlsVisible}
        currentPage={currentPage}
        totalPages={totalPages}
        storyTitle={selectedStory.title}
        onPrev={() => onGoToPage(currentPage - 1)}
        onNext={() => onGoToPage(currentPage + 1)}
        onGoToPage={onGoToPage}
        showSpeedReader={showSpeedReader}
        speedReaderMode={speedReaderMode}
        onToggleSpeedReader={() => onSetSpeedReaderMode((v) => !v)}
        showTypographyPanel={showTypographyPanel}
        typoPanelOpen={typoPanelOpen}
        onToggleTypoPanel={onToggleTypoPanel}
        srWordCount={srWords.length}
        showTextToSpeech={showTextToSpeech}
        ttsSupported={ttsSupported}
        ttsPlaying={ttsPlaying}
        ttsPaused={ttsPaused}
        onToggleTts={onToggleTts}
        onStopTts={onStopTts}
        simplifiedUi={simplifiedUi}
        showEnhancedGestures={showEnhancedGestures}
        fontSize={fontSize}
        maxFontSize={maxFontSize}
        onFontSizeChange={onSetFontSize}
        showFontSizeControls={showFontSizeControls}
        onShare={onShare}
        onToggleFavorite={onToggleFavorite}
        isFavorite={isFavoriteCurrent}
        showFavorites={showFavorites}
      />
    </>
  );
}
