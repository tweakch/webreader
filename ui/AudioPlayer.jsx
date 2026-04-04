import { useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from './ThemeContext';

/**
 * Self-contained audio player bar with progress, reset, play/pause, and time display.
 * Manages its own audio element and playback state.
 * Returns null when src is not provided.
 *
 * Use key={story.id} on this component to reset playback when the story changes.
 */
export default function AudioPlayer({ src }) {
  const { dark, hc } = useTheme();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);

  if (!src) return null;

  const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setIsPlaying(false)}
      />
      <div className={`flex-shrink-0 border-t transition-colors ${
        hc && dark ? 'bg-black border-white/40' :
        hc         ? 'bg-white border-black/20' :
        dark       ? 'bg-slate-900/95 border-amber-700/30' :
                     'bg-white/95 border-amber-200/50'
      }`}>
        <div className={`h-0.5 ${
          hc && dark ? 'bg-white/20' : hc ? 'bg-black/10' : dark ? 'bg-slate-700' : 'bg-amber-100'
        }`}>
          <div
            className={`h-full transition-all duration-300 ${
              hc && dark ? 'bg-white' : hc ? 'bg-black' : dark ? 'bg-amber-500' : 'bg-amber-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-3 px-5 py-2">
          <button
            onClick={() => {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              hc && dark ? 'text-white hover:bg-white/10' :
              hc         ? 'text-gray-900 hover:bg-gray-100' :
              dark       ? 'text-amber-400 hover:bg-slate-800' :
                           'text-amber-700 hover:bg-amber-100'
            }`}
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => {
              if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
              } else {
                audioRef.current.play();
                setIsPlaying(true);
              }
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              hc && dark ? 'text-white hover:bg-white/10' :
              hc         ? 'text-gray-900 hover:bg-gray-100' :
              dark       ? 'text-amber-300 hover:bg-slate-800' :
                           'text-amber-800 hover:bg-amber-100'
            }`}
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <span className={`text-xs tabular-nums ml-1 ${
            hc && dark ? 'text-white/60' : hc ? 'text-gray-500' : dark ? 'text-amber-600' : 'text-amber-500'
          }`}>
            {fmtTime(currentTime)}{duration > 0 && ` / ${fmtTime(duration)}`}
          </span>
        </div>
      </div>
    </>
  );
}
