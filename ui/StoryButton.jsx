import { Heart } from 'lucide-react';
import { cn } from './cn';
import { useTheme } from './ThemeContext';
import StoryBadge from './StoryBadge';

/**
 * Story list item: title row + optional badges + optional favourite button.
 *
 * story            - { title, sourceLabel, wordCount }
 * isActive         - row is the currently-selected story
 * isCompleted      - story has been read to the last page
 * isFavorite       - story is in the favourites set
 * showSourceBadge  - show story.sourceLabel as a badge
 * showWordCount    - show story.wordCount (skipped when null)
 * showFavoriteButton - render the heart toggle
 * alwaysFilled     - heart is always filled (use in the favourites-only list)
 * inlineBadges     - badges sit on the same line as the title (search results layout)
 * onClick          - called when the title area is clicked
 * onFavoriteClick  - called when the heart is clicked, receives the click event
 * testId           - forwarded to data-testid on the main button
 * className        - applied to the outermost wrapper div
 */
export default function StoryButton({
  story,
  isActive = false,
  isCompleted = false,
  isFavorite = false,
  showSourceBadge = false,
  showWordCount = false,
  showFavoriteButton = false,
  alwaysFilled = false,
  inlineBadges = false,
  onClick,
  onFavoriteClick,
  testId,
  className = '',
}) {
  const { tc } = useTheme();

  const heartFilled = isFavorite || alwaysFilled;

  const badges = (
    <>
      {showSourceBadge && (
        <StoryBadge
          isActive={inlineBadges ? false : isActive}
          dim
          className={inlineBadges ? 'ml-2 font-sans align-middle' : ''}
        >
          {story.sourceLabel}
        </StoryBadge>
      )}
      {showWordCount && story.wordCount != null && (
        <StoryBadge
          isActive={inlineBadges ? false : isActive}
          className={`tabular-nums${inlineBadges ? ' ml-1 font-sans align-middle' : ' inline-block'}`}
        >
          {story.wordCount.toLocaleString('de')} W
        </StoryBadge>
      )}
      {isCompleted && (
        <StoryBadge
          isActive={inlineBadges ? false : isActive}
          testId="completed-indicator"
          className={inlineBadges ? 'ml-1 font-sans align-middle' : 'inline-block'}
        >
          ✓
        </StoryBadge>
      )}
    </>
  );

  const hasBadgeRow = !inlineBadges && (
    showSourceBadge ||
    (showWordCount && story.wordCount != null) ||
    isCompleted
  );

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        data-testid={testId}
        onClick={onClick}
        className={cn(
          'flex-1 min-w-0 text-left px-3 py-2.5 rounded-lg transition-all',
          isActive
            ? tc({
                light:   'bg-amber-200 text-amber-900',
                dark:    'bg-amber-700 text-white',
                hcLight: 'bg-black text-white',
                hcDark:  'bg-white text-black',
              })
            : tc({
                light:   'text-amber-900 hover:bg-amber-100',
                dark:    'text-amber-100 hover:bg-slate-800',
                hcLight: 'text-gray-900 hover:bg-gray-100',
                hcDark:  'text-white hover:bg-white/10',
              })
        )}
      >
        <span className={`font-serif text-base${inlineBadges ? ' leading-snug' : ' line-clamp-2 block'}`}>
          {story.title}
        </span>
        {inlineBadges ? badges : hasBadgeRow && (
          <div className="flex items-center gap-1 flex-wrap mt-0.5">{badges}</div>
        )}
      </button>

      {showFavoriteButton && (
        <button
          onClick={onFavoriteClick}
          className={cn(
            'flex-shrink-0 p-1.5 rounded-lg transition-colors',
            heartFilled
              ? tc({
                  light:   'text-amber-600 hover:bg-amber-100',
                  dark:    'text-amber-400 hover:bg-slate-800',
                  hcLight: 'text-gray-800 hover:bg-gray-100',
                  hcDark:  'text-white hover:bg-white/10',
                })
              : tc({
                  light:   'text-amber-300 hover:text-amber-600 hover:bg-amber-100',
                  dark:    'text-slate-600 hover:text-amber-400 hover:bg-slate-800',
                  hcLight: 'text-gray-300 hover:bg-gray-100',
                  hcDark:  'text-white/25 hover:bg-white/10',
                })
          )}
        >
          <Heart size={14} fill={heartFilled ? 'currentColor' : 'none'} />
        </button>
      )}
    </div>
  );
}
