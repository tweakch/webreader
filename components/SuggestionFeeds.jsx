import React from 'react';
import { useTheme } from '../ui/ThemeContext';
import { buildDailyFeeds } from '../src/lib/suggestionFeeds';

const AXIS_LABELS = {
  seasonal: 'Saison',
  regional: 'Region',
  moral: 'Moral',
  motif: 'Motiv',
  mood: 'Stimmung',
  context: 'Lesekontext',
};

function FeedCard({ story, dark, onSelect, showWordCount }) {
  return (
    <button
      type="button"
      data-testid="feed-card"
      onClick={() => onSelect(story)}
      className={`shrink-0 w-44 sm:w-52 text-left rounded-xl border p-3 transition-colors ${
        dark
          ? 'bg-slate-800/60 border-amber-700/20 hover:bg-slate-800'
          : 'bg-white/80 border-amber-200/60 hover:bg-white'
      }`}
    >
      <p
        className={`font-serif text-sm font-medium leading-snug mb-2 line-clamp-3 ${
          dark ? 'text-amber-100' : 'text-amber-950'
        }`}
      >
        {story.title}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${
            dark ? 'bg-slate-700 text-amber-400' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {story.sourceLabel}
        </span>
        {showWordCount && story.wordCount != null && (
          <span className={`text-xs tabular-nums ${dark ? 'text-amber-600' : 'text-amber-500'}`}>
            {story.wordCount.toLocaleString('de')} W
          </span>
        )}
      </div>
    </button>
  );
}

function FeedRow({ feed, dark, onSelect, showWordCount }) {
  return (
    <section data-testid="feed-row" data-feed-id={feed.id} className="mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <h3
          data-testid="feed-label"
          className={`font-serif text-lg font-bold ${
            dark ? 'text-amber-200' : 'text-amber-900'
          }`}
        >
          {feed.label}
        </h3>
        <span
          className={`text-xs uppercase tracking-wide ${
            dark ? 'text-amber-600' : 'text-amber-500'
          }`}
        >
          {AXIS_LABELS[feed.axis] || feed.axis} · {feed.total}
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {feed.stories.map((story) => (
          <div key={story.id} className="snap-start">
            <FeedCard
              story={story}
              dark={dark}
              onSelect={onSelect}
              showWordCount={showWordCount}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Renders a list of daily suggestion-feed carousels on the home view.
 * Feeds are computed from the full story index via buildDailyFeeds(); only
 * feeds whose calendar window is active today and that yield at least one
 * match are rendered.
 */
export default function SuggestionFeeds({
  storyIndex,
  onSelectStory,
  showWordCount,
  limitPerFeed = 12,
  maxRows = 10,
}) {
  const { dark } = useTheme();
  const rows = React.useMemo(
    () => buildDailyFeeds(storyIndex || [], { limitPerFeed }).slice(0, maxRows),
    [storyIndex, limitPerFeed, maxRows],
  );
  if (rows.length === 0) return null;
  return (
    <div data-testid="suggestion-feeds" className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <h2
          className={`font-serif text-xl font-bold ${
            dark ? 'text-amber-200' : 'text-amber-900'
          }`}
        >
          Für dich heute
        </h2>
      </div>
      {rows.map((feed) => (
        <FeedRow
          key={feed.id}
          feed={feed}
          dark={dark}
          onSelect={onSelectStory}
          showWordCount={showWordCount}
        />
      ))}
    </div>
  );
}
