import { ChevronLeft, X, User, Shield, FlameKindling, Users } from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';
import Toggle from '../ui/Toggle';
import { ROLES, ROLE_LABELS } from '../hooks/useRole';
import ABTestingPanel from './ABTestingPanel';

/**
 * Profile panel - user stats, word blacklist, feature toggles, and admin tools.
 * In admin mode shows all features (including unreleased) and role-assignment UI.
 */
export default function ProfilePanel({
  onBack,
  onOpenDocs,
  onOpenPersonasDocs,
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
  // Role props
  role,
  setRole,
  isAdmin,
  visibleFeatureKeys,
  isFeatureAssignedToRole,
  toggleFeatureForRole,
  // Error page simulator
  showErrorPageSimulator,
  onSimulateError,
  // A/B testing
  showAbTesting,
  showAbTestingAdmin,
  ab,
  simplifiedUi = false,
}) {
  // In simplified-ui mode, hide experimental/debug features from the toggle list
  // to keep the profile uncluttered for seniors. `simplified-ui` itself always
  // remains visible so it can be turned back off.
  const SIMPLIFIED_HIDDEN = new Set([
    'debug-badges', 'error-page-simulator', 'ab-testing', 'ab-testing-admin',
    'app-animation', 'word-blacklist', 'speed-reader', 'speedreader-orp',
    'subscriber-fonts', 'story-directories', 'deep-search', 'pinch-font-size',
    'read-along', 'illustrations', 'child-profile', 'story-quiz',
  ]);
  const { dark, hc, tc } = useTheme();

  const _o = (key, raw) => Object.hasOwn(userFeatureOverrides, key) ? userFeatureOverrides[key] : raw;

  // Admin sees all features; others see only role-assigned features
  let visibleFeatures = isAdmin
    ? features
    : features.filter((f) => visibleFeatureKeys.has(f.key));
  if (simplifiedUi && !isAdmin) {
    visibleFeatures = visibleFeatures.filter((f) => !SIMPLIFIED_HIDDEN.has(f.key));
  }

  const nonAdminRoles = ROLES.filter((r) => r !== 'admin');

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Scrollable content. pb leaves room for the sticky bottom bar on mobile/tablet. */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-6 pt-12 pb-28 lg:pb-12">
        {/* Back button — desktop only; mobile/tablet uses the sticky bottom bar */}
        <button
          onClick={onBack}
          data-testid="profile-back-top"
          className={`hidden lg:flex items-center gap-2 mb-8 text-sm font-medium transition-colors ${
            dark ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'
          }`}
        >
          <ChevronLeft size={16} />
          Zurück
        </button>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isAdmin
              ? dark ? 'bg-violet-800 text-violet-200' : 'bg-violet-100 text-violet-700'
              : dark ? 'bg-slate-700 text-amber-300' : 'bg-amber-100 text-amber-700'
          }`}>
            {isAdmin ? <Shield size={36} /> : <User size={36} />}
          </div>
          <div className="text-center">
            <p className={`text-xl font-serif font-bold ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
              {ROLE_LABELS[role] ?? role}
            </p>
            <p className={`text-sm mt-0.5 ${dark ? 'text-amber-600' : 'text-amber-600'}`}>
              {isAdmin ? 'Administrator' : 'Gast-Konto'}
            </p>
          </div>
        </div>

        {/* Role selector */}
        <div className="mb-8">
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-1 ${
            dark ? 'text-amber-500' : 'text-amber-600'
          }`}>
            Rolle
          </h2>
          <div className={`flex rounded-2xl border overflow-hidden ${
            dark ? 'border-amber-700/30' : 'border-amber-200'
          }`}>
            {ROLES.map((r) => (
              <button
                key={r}
                data-testid={`role-button-${r}`}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  role === r
                    ? isAdmin && r === 'admin'
                      ? dark ? 'bg-violet-700 text-white' : 'bg-violet-600 text-white'
                      : dark ? 'bg-amber-700/50 text-amber-100' : 'bg-amber-100 text-amber-900'
                    : dark ? 'text-amber-600 hover:text-amber-400' : 'text-amber-500 hover:text-amber-800'
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
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

        {/* Product Vision link */}
        {onOpenPersonasDocs && (
          <button
            onClick={onOpenPersonasDocs}
            className={`mt-6 w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-colors ${
              dark
                ? 'border-amber-700/30 text-amber-300 hover:bg-amber-900/20'
                : 'border-amber-200 text-amber-800 hover:bg-amber-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={16} className={dark ? 'text-amber-500' : 'text-amber-600'} />
              <span className="text-sm font-medium">Product Vision</span>
            </div>
            <span className={`text-xs ${dark ? 'text-amber-600' : 'text-amber-500'}`}>
              Personas & Feature Map →
            </span>
          </button>
        )}

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

        {/* Error page simulator */}
        {showErrorPageSimulator && (
          <div className="mt-8">
            <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5 ${
              dark ? 'text-amber-500' : 'text-amber-600'
            }`}>
              <FlameKindling size={12} />
              Fehlerseiten-Simulator
            </h2>
            <div className={`rounded-2xl border divide-y ${
              dark ? 'border-amber-700/30 divide-amber-700/30' : 'border-amber-200 divide-amber-200'
            }`}>
              {[
                { type: 'not-found', label: '404 – Seite nicht gefunden', desc: 'Navigiert zu einer nicht vorhandenen URL.' },
                { type: 'unexpected', label: '500 – Unerwarteter Fehler', desc: 'Wirft eine Exception und löst die Error Boundary aus.' },
              ].map(({ type, label, desc }) => (
                <div key={type} className={`px-5 py-3.5 flex items-center justify-between gap-4 ${
                  dark ? 'text-amber-200' : 'text-amber-900'
                }`}>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className={`text-xs mt-0.5 ${dark ? 'text-amber-600' : 'text-amber-500'}`}>{desc}</p>
                  </div>
                  <button
                    onClick={() => onSimulateError(type)}
                    className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      dark
                        ? 'bg-amber-700/30 text-amber-300 hover:bg-amber-700/50'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    Auslösen
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature toggles */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className={`text-xs font-semibold uppercase tracking-wider ${
              dark ? 'text-amber-500' : 'text-amber-600'
            }`}>
              Funktionen
              {isAdmin && (
                <span className={`ml-2 normal-case font-normal ${dark ? 'text-violet-400' : 'text-violet-600'}`}>
                  - alle sichtbar (Admin)
                </span>
              )}
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

          {visibleFeatures.length === 0 && (
            <p className={`px-1 text-sm ${dark ? 'text-amber-700' : 'text-amber-500'}`}>
              Keine Funktionen für diese Rolle freigeschaltet.
            </p>
          )}

          <div className={`rounded-2xl border divide-y ${
            dark ? 'border-amber-700/30 divide-amber-700/30' : 'border-amber-200 divide-amber-200'
          }`}>
            {visibleFeatures.map(({ key, label, description, Icon }) => {
              const effective = _o(key, _rawFlagValues[key] ?? false);
              const isUnreleased = !Object.hasOwn(_rawFlagValues, key);

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
                      <div className="flex items-center gap-2 min-w-0">
                        <p className={`text-sm font-medium transition-opacity ${
                          effective ? '' : 'opacity-40'
                        }`}>{label}</p>
                        {isUnreleased && (
                          <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            dark ? 'bg-violet-900/60 text-violet-300' : 'bg-violet-100 text-violet-700'
                          }`}>
                            unveröffentlicht
                          </span>
                        )}
                      </div>
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

                    {/* Admin: role-assignment row */}
                    {isAdmin && (
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-[10px] uppercase tracking-wider ${
                          dark ? 'text-amber-700' : 'text-amber-400'
                        }`}>Rollen:</span>
                        {nonAdminRoles.map((r) => {
                          const assigned = isFeatureAssignedToRole(key, r);
                          return (
                            <button
                              key={r}
                              data-testid={`role-assign-${key}-${r}`}
                              onClick={() => toggleFeatureForRole(key, r)}
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                                assigned
                                  ? dark
                                    ? 'bg-violet-700/60 border-violet-500 text-violet-200'
                                    : 'bg-violet-100 border-violet-400 text-violet-800'
                                  : dark
                                    ? 'border-amber-800/50 text-amber-800 hover:text-amber-600'
                                    : 'border-amber-300 text-amber-400 hover:text-amber-600'
                              }`}
                            >
                              {ROLE_LABELS[r]}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* A/B testing panel */}
        {ab && (
          <ABTestingPanel
            showAbTesting={showAbTesting}
            showAbTestingAdmin={showAbTestingAdmin}
            isAdmin={isAdmin}
            experiments={ab.experiments}
            accessibleExperiments={ab.accessibleExperiments}
            getExperimentConfig={ab.getExperimentConfig}
            getVariant={ab.getVariant}
            setExperimentActive={ab.setExperimentActive}
            toggleRoleAccess={ab.toggleRoleAccess}
            revokeExperiment={ab.revokeExperiment}
            selectVariant={ab.selectVariant}
          />
        )}
        </div>
      </div>

      {/* Sticky bottom bar — thumb-reachable Zurück on mobile/tablet */}
      <div className={`flex-shrink-0 lg:hidden border-t backdrop-blur-sm ${
        dark ? 'border-amber-700/30 bg-slate-950/90' : 'border-amber-200 bg-white/90'
      }`}>
        <button
          onClick={onBack}
          data-testid="profile-back-bottom"
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-medium transition-colors ${
            dark ? 'text-amber-300 hover:bg-slate-800 active:bg-slate-800' : 'text-amber-800 hover:bg-amber-50 active:bg-amber-100'
          }`}
        >
          <ChevronLeft size={20} />
          Zurück
        </button>
      </div>
    </div>
  );
}
