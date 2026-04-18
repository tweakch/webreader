import React, { useCallback, useMemo, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { parseVoiceCommand, findStoryByVoice } from '../src/lib/voiceCommands';
import { useTheme } from '../ui/ThemeContext';

/**
 * Voice Control orchestrator.
 *
 * Owns the mic hook, runs final transcripts through the parser, dispatches
 * intents to the parent's handlers, and renders the mic button + transcript
 * toast. Child voice features are gated by their own flag at the intent
 * level, so toggling a single child off immediately disables its commands
 * without needing to re-render the hook.
 */
export default function VoiceControl({
  showVoiceControl,
  showVoiceResume,
  showVoiceNavigation,
  showVoiceReadingControl,
  showVoiceDiscovery,
  showVoiceHandsFree,
  showTextToSpeech,
  ttsSupported,
  stories,
  selectedStory,
  currentPage,
  totalPages,
  resumeSession,
  favorites,
  completedStories,
  onSelectStory,
  onResume,
  onGoToPage,
  onGoHome,
  onShowFavorites,
  onSearch,
  onToggleTts,
  onStopTts,
  ttsRateIdx,
  onSetTtsRateIdx,
  ttsRatesLength,
}) {
  const { dark } = useTheme();
  const lastPickRef = useRef(null);

  const handsFree = !!(showVoiceControl && showVoiceHandsFree);

  const lang = useMemo(() => {
    // Heuristic: de-CH stories -> de-DE grammar (browsers rarely carry CH voices),
    // andersen english -> en-US, else de-DE.
    if (!selectedStory) return 'de-DE';
    const src = (selectedStory.source || '').toLowerCase();
    if (src.includes('andersen')) return 'en-US';
    return 'de-DE';
  }, [selectedStory]);

  const dispatchIntent = useCallback((intent) => {
    if (!intent) return;

    switch (intent.type) {
      case 'stop-listening':
        // Handled by the hook via the stop() we call below.
        voice.stop();
        return;

      case 'resume':
        if (showVoiceResume && resumeSession) {
          onResume?.(resumeSession.story, resumeSession.page);
        }
        return;

      case 'next-page':
        if (showVoiceNavigation && selectedStory && currentPage < totalPages - 1) {
          onGoToPage?.(currentPage + 1);
        }
        return;

      case 'prev-page':
        if (showVoiceNavigation && selectedStory && currentPage > 0) {
          onGoToPage?.(currentPage - 1);
        }
        return;

      case 'goto-page':
        if (showVoiceNavigation && selectedStory && intent.page) {
          const target = Math.max(0, Math.min(totalPages - 1, intent.page - 1));
          onGoToPage?.(target);
        }
        return;

      case 'home':
        if (showVoiceNavigation) onGoHome?.();
        return;

      case 'favorites':
        if (showVoiceNavigation) onShowFavorites?.();
        return;

      case 'close':
        if (showVoiceNavigation) onGoHome?.();
        return;

      case 'open-story':
        if (showVoiceNavigation) {
          const match = findStoryByVoice(intent.title, stories);
          if (match && !match.ambiguous) onSelectStory?.(match.story);
        }
        return;

      case 'read':
        if (showVoiceReadingControl && showTextToSpeech && ttsSupported) {
          if (selectedStory) onToggleTts?.();
          else if (showVoiceResume && resumeSession) onResume?.(resumeSession.story, resumeSession.page);
        }
        return;

      case 'pause':
        if (showVoiceReadingControl && showTextToSpeech && ttsSupported) onToggleTts?.();
        return;

      case 'stop':
        if (showVoiceReadingControl && showTextToSpeech && ttsSupported) onStopTts?.();
        return;

      case 'faster':
        if (showVoiceReadingControl && showTextToSpeech && ttsSupported && typeof ttsRateIdx === 'number') {
          onSetTtsRateIdx?.(Math.min((ttsRatesLength ?? 5) - 1, ttsRateIdx + 1));
        }
        return;

      case 'slower':
        if (showVoiceReadingControl && showTextToSpeech && ttsSupported && typeof ttsRateIdx === 'number') {
          onSetTtsRateIdx?.(Math.max(0, ttsRateIdx - 1));
        }
        return;

      case 'find':
        if (showVoiceDiscovery) onSearch?.(intent.query);
        return;

      case 'surprise':
        if (showVoiceDiscovery && stories.length) {
          const pool = stories.filter((s) => s.id !== lastPickRef.current);
          const candidates = pool.length ? pool : stories;
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          lastPickRef.current = pick.id;
          onSelectStory?.(pick);
        }
        return;

      case 'short-story':
        if (showVoiceDiscovery && stories.length) {
          const pool = stories.filter((s) => Number.isFinite(s.wordCount) && !completedStories?.has?.(s.id));
          const chosen = (pool.length ? pool : stories).slice().sort(
            (a, b) => (a.wordCount ?? Infinity) - (b.wordCount ?? Infinity),
          )[0];
          if (chosen) onSelectStory?.(chosen);
        }
        return;

      case 'long-story':
        if (showVoiceDiscovery && stories.length) {
          const pool = stories.filter((s) => Number.isFinite(s.wordCount) && !completedStories?.has?.(s.id));
          const chosen = (pool.length ? pool : stories).slice().sort(
            (a, b) => (b.wordCount ?? -Infinity) - (a.wordCount ?? -Infinity),
          )[0];
          if (chosen) onSelectStory?.(chosen);
        }
        return;

      default:
        return;
    }
  }, [
    showVoiceResume, showVoiceNavigation, showVoiceReadingControl, showVoiceDiscovery,
    showTextToSpeech, ttsSupported, resumeSession, selectedStory, currentPage, totalPages,
    stories, favorites, completedStories, ttsRateIdx, ttsRatesLength,
    onSelectStory, onResume, onGoToPage, onGoHome, onShowFavorites, onSearch,
    onToggleTts, onStopTts, onSetTtsRateIdx,
  ]);

  const voice = useVoiceControl({
    enabled: showVoiceControl,
    lang,
    continuous: handsFree,
    onFinalTranscript: useCallback((text) => {
      const intent = parseVoiceCommand(text);
      dispatchIntent(intent);
    }, [dispatchIntent]),
  });

  if (!showVoiceControl || !voice.supported) return null;

  const Icon = voice.listening ? Mic : MicOff;

  return (
    <>
      <button
        data-testid="voice-mic-toggle"
        onClick={voice.toggle}
        aria-label={voice.listening ? 'Stop listening' : 'Start voice command'}
        aria-pressed={voice.listening}
        title={voice.listening ? 'Zuhören beenden' : 'Sprachbefehl'}
        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
          voice.listening
            ? (dark ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-700')
            : (dark ? 'bg-slate-700/60 text-amber-700' : 'bg-amber-50/80 text-amber-400')
        }`}
      >
        <Icon size={18} />
      </button>

      {handsFree && voice.listening && (
        <span
          data-testid="voice-hands-free-indicator"
          aria-hidden="true"
          className={`inline-block w-2 h-2 rounded-full ml-1 animate-pulse ${
            dark ? 'bg-amber-300' : 'bg-amber-600'
          }`}
        />
      )}

      {voice.listening && voice.transcript && (
        <div
          data-testid="voice-transcript"
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl max-w-[90%] text-sm shadow-lg pointer-events-none ${
            dark ? 'bg-slate-800/95 text-amber-100' : 'bg-white/95 text-amber-900'
          }`}
        >
          {voice.transcript}
        </div>
      )}
    </>
  );
}
