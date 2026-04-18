import { useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from './cn';
import { useTheme } from './ThemeContext';

// CTC: Wire `sleep-timer` here — see docs/features/sleep-timer.md
//   Accept a `sleepAfterMs` prop (or read from a sleep-timer hook). When set,
//   start a countdown; in the final 60 s tween `audioRef.current.volume`
//   from 1 → 0 via requestAnimationFrame; on expiry call `pause()`. Surface
//   timer chips (15 / 30 / 45 min · end of story) in the controls row.
// TODO(CTC): remove this comment once sleep-timer drives playback here and
//   the FEATURES gap entry is removed.

/**
 * Self-contained audio player bar with progress, reset, play/pause, and time display.
 * Manages its own audio element and playback state.
 * Returns null when src is not provided.
 *
 * Use key={story.id} on this component to reset playback when the story changes.
 */
export default function AudioPlayer({ src }) {
  const { tc } = useTheme();
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
      <div className={cn(
        'flex-shrink-0 border-t transition-colors',
        tc({
          light:   'bg-white/95 border-amber-200/50',
          dark:    'bg-slate-900/95 border-amber-700/30',
          hcLight: 'bg-white border-black/20',
          hcDark:  'bg-black border-white/40',
        })
      )}>
        <div className={cn(
          'h-0.5',
          tc({ light: 'bg-amber-100', dark: 'bg-slate-700', hcLight: 'bg-black/10', hcDark: 'bg-white/20' })
        )}>
          <div
            className={cn(
              'h-full transition-all duration-300',
              tc({ light: 'bg-amber-600', dark: 'bg-amber-500', hcLight: 'bg-black', hcDark: 'bg-white' })
            )}
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
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              tc({ light: 'text-amber-700 hover:bg-amber-100', dark: 'text-amber-400 hover:bg-slate-800', hcLight: 'text-gray-900 hover:bg-gray-100', hcDark: 'text-white hover:bg-white/10' })
            )}
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
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              tc({ light: 'text-amber-800 hover:bg-amber-100', dark: 'text-amber-300 hover:bg-slate-800', hcLight: 'text-gray-900 hover:bg-gray-100', hcDark: 'text-white hover:bg-white/10' })
            )}
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <span className={cn(
            'text-xs tabular-nums ml-1',
            tc({ light: 'text-amber-500', dark: 'text-amber-600', hcLight: 'text-gray-500', hcDark: 'text-white/60' })
          )}>
            {fmtTime(currentTime)}{duration > 0 && ` / ${fmtTime(duration)}`}
          </span>
        </div>
      </div>
    </>
  );
}
