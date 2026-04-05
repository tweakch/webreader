import { ChevronLeft, X, User } from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';
import Toggle from '../ui/Toggle';

/**
 * Profile panel — user stats, word blacklist, and feature toggles.
 * Displayed as a full-screen scrollable overlay.
 */
export default function ProfilePanel({
  onBack,
  onOpenDocs,
  favorites,
  completedStories,
  totalStories,
  showWordBlacklist,
  blacklist,
  blacklistInput,
  onBlacklistInputChange,
  onAddBlacklistWord,
  onRemoveBlacklistWord,
  features,
  _rawFlagValues,
  userFeatureOverrides,
  onToggleFeature,
}) {
  const { dark, hc, tc } = useTheme();

  const _o = (key, raw) => Object.hasOwn(userFeatureOverrides, key) ? userFeatureOverrides[key] : raw;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-6 py-12">
        {/* Back button */}
        <button
          onClick={onBack}
          className={`flex items-center gap-2 mb-8 text-sm font-medium transition-colors ${
            dark ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'
          }`}
        >
          <ChevronLeft size={16} />
          Zurück
        </button>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            dark ? 'bg-slate-700 text-amber-300' : 'bg-amber-100 text-amber-700'
          }`}>
            <User size={36} />
          </div>
          <div className="text-center">
            <p className={`text-xl font-serif font-bold ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
              Leser
            </p>
            <p className={`text-sm mt-0.5 ${dark ? 'text-amber-600' : 'text-amber-600'}`}>
              Gast-Konto
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className={`rounded-2xl border divide-y ${
          dark ? 'border-amber-700/30 divide-amber-700/30' : 'border-amber-200 divide-amber-200'
        }`}>
          {[
            { label: 'Favoriten', value: favorites.size },
            { label: 'Gelesen', value: completedStories.size },
            { label: 'Verfügbare Märchen', value: totalStories.toLocaleString('de') },
          ].map(({ label, value }) => (
            <div key={label} className={`flex items-center justify-between px-5 py-4 ${
              dark ? 'text-amber-200' : 'text-amber-900'
            }`}>
              <span className="text-sm">{label}</span>
              <span className="text-sm font-medium tabular-nums">{value}</span>
            </div>
          ))}
        </div>

        {/* Word Blacklist */}
        {showWordBlacklist && (
          <div className="mt-8">
            <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-1 ${
              dark ? 'text-amber-500' : 'text-amber-600'
            }`}>
              Wort-Blacklist
            </h2>
            <div className={`rounded-2xl border ${
              dark ? 'border-amber-700/30' : 'border-amber-200'
            }`}>
              <div className={`flex gap-2 px-4 py-3 ${
                blacklist.size > 0 ? `border-b ${dark ? 'border-amber-700/30' : 'border-amber-200'}` : ''
              }`}>
                <input
                  data-testid="blacklist-input"
                  type="text"
                  value={blacklistInput}
                  onChange={e => onBlacklistInputChange(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') onAddBlacklistWord(); }}
                  placeholder="Wort hinzufügen…"
                  className={`flex-1 bg-transparent text-sm outline-none placeholder:opacity-40 ${
                    dark ? 'text-amber-100' : 'text-amber-900'
                  }`}
                />
                <button
                  data-testid="blacklist-add"
                  onClick={onAddBlacklistWord}
                  disabled={!blacklistInput.trim()}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 ${
                    dark ? 'bg-amber-700/40 text-amber-200 hover:bg-amber-700/60' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  Hinzufügen
                </button>
              </div>
              {[...blacklist].map(word => (
                <div key={word} className={`flex items-center justify-between px-4 py-2.5 border-b last:border-b-0 ${
                  dark ? 'border-amber-700/30 text-amber-200' : 'border-amber-200 text-amber-900'
                }`}>
                  <span className="text-sm">{word}</span>
                  <button
                    data-testid="blacklist-remove"
                    onClick={() => onRemoveBlacklistWord(word)}
                    className={`p-1 rounded transition-colors ${
                      dark ? 'text-amber-600 hover:text-amber-400' : 'text-amber-400 hover:text-amber-700'
                    }`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <p className={`mt-2 px-1 text-xs ${dark ? 'text-amber-700' : 'text-amber-500'}`}>
              Märchen, die eines dieser Wörter enthalten, werden in der Seitenleiste ausgeblendet.
            </p>
          </div>
        )}

        {/* Feature toggles */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className={`text-xs font-semibold uppercase tracking-wider ${
              dark ? 'text-amber-500' : 'text-amber-600'
            }`}>
              Funktionen
            </h2>
            <button
              onClick={onOpenDocs}
              className={`text-xs transition-colors hover:underline ${
                dark ? 'text-amber-400/70 hover:text-amber-400' : 'text-amber-600/70 hover:text-amber-700'
              }`}
            >
              Alle Funktionen erklärt →
            </button>
          </div>
          <div className={`rounded-2xl border divide-y ${
            dark ? 'border-amber-700/30 divide-amber-700/30' : 'border-amber-200 divide-amber-200'
          }`}>
            {features.map(({ key, label, description, Icon }) => {
              const effective = _o(key, _rawFlagValues[key] ?? false);
              return (
                <div key={key} className={`px-5 py-4 flex items-start gap-4 ${
                  dark ? 'text-amber-200' : 'text-amber-900'
                }`}>
                  <div className={`flex-shrink-0 mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    effective
                      ? dark ? 'bg-amber-700/40 text-amber-300' : 'bg-amber-100 text-amber-700'
                      : dark ? 'bg-slate-700/60 text-amber-700' : 'bg-amber-50/80 text-amber-400'
                  }`}>
                    <div className="w-5 h-5"><Icon /></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-sm font-medium transition-opacity ${
                        effective ? '' : 'opacity-40'
                      }`}>{label}</p>
                      <Toggle
                        checked={effective}
                        onChange={() => onToggleFeature(key)}
                        label={label}
                      />
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      dark ? 'text-amber-600' : 'text-amber-500'
                    }`}>{description}</p>
                    <button
                      onClick={() => onOpenDocs(key)}
                      className={`text-xs mt-1 inline-block transition-colors hover:underline ${
                        dark ? 'text-amber-400/70 hover:text-amber-400' : 'text-amber-600/70 hover:text-amber-700'
                      }`}
                    >
                      Mehr erfahren →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
