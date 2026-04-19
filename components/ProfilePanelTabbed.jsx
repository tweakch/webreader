import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft, X, User, Shield, FlameKindling, Users,
  BadgeCheck, BookOpen, SlidersHorizontal, Bug, CreditCard,
  Mic, Sparkles, Lock, Search,
} from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';
import Toggle from '../ui/Toggle';
import { ROLES, ROLE_LABELS } from '../hooks/useRole';
import ABTestingPanel from './ABTestingPanel';

/**
 * Tabbed profile panel — left-rail on desktop, top tab bar on mobile.
 * Taxonomy: Profil / Lesen (+ Voice subsection) / Einstellungen / Abo / Entwicklung.
 * Entwicklung is gated to admins, testers, and users with dev-only flags.
 * Abo shows an upsell card to guests; full toggles to everyone else.
 */

// Feature partitioning — each key appears in exactly one tab.
const READING_KEYS = new Set([
  'favorites', 'favorites-only-toggle', 'word-count', 'reading-duration',
  'font-size-controls', 'pinch-font-size', 'typography-panel', 'subscriber-fonts',
  'eink-flash', 'tap-zones', 'tap-middle-toggle', 'adaption-switcher', 'app-animation',
  'attribution', 'illustrations', 'read-along', 'story-quiz',
  'audio-player', 'text-to-speech',
  'speed-reader', 'speedreader-orp',
  'word-blacklist', 'child-profile', 'age-filter',
]);

const VOICE_KEYS = new Set([
  'voice-control', 'voice-resume', 'voice-navigation',
  'voice-reading-control', 'voice-discovery', 'voice-hands-free',
]);

const SETTINGS_KEYS = new Set([
  'simplified-ui', 'high-contrast-theme', 'story-directories', 'deep-search',
]);

const SUBSCRIPTION_KEYS = new Set([
  'tier-badge', 'paywall', 'upgrade-cta', 'trial-banner', 'pricing-page',
  'promo-code', 'referral-program', 'sales-mode', 'conversion-analytics',
  'billing-portal-stub',
]);

const DEVELOPER_KEYS = new Set([
  'debug-badges', 'error-page-simulator', 'ab-testing', 'ab-testing-admin',
]);

const ACTIVE_TAB_STORAGE = 'wr-profile-active-tab';
const DEFAULT_TAB = 'profile';

// Keys hidden in simplified-ui mode for non-admins. Matches legacy behaviour.
const SIMPLIFIED_HIDDEN = new Set([
  'debug-badges', 'error-page-simulator', 'ab-testing', 'ab-testing-admin',
  'app-animation', 'word-blacklist', 'speed-reader', 'speedreader-orp',
  'subscriber-fonts', 'story-directories', 'deep-search', 'pinch-font-size',
  'read-along', 'illustrations', 'story-quiz',
]);

export default function ProfilePanelTabbed({
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
  role,
  setRole,
  isAdmin,
  visibleFeatureKeys,
  isFeatureAssignedToRole,
  toggleFeatureForRole,
  showErrorPageSimulator,
  onSimulateError,
  showAbTesting,
  showAbTestingAdmin,
  ab,
  simplifiedUi = false,
  variant = 'tabbed',
}) {
  const { dark } = useTheme();

  const hasDevAccess =
    isAdmin ||
    role === 'tester' ||
    showErrorPageSimulator ||
    (ab && (showAbTesting || showAbTestingAdmin));

  const tabs = [
    { id: 'profile',      label: 'Profil',        Icon: BadgeCheck,        visible: true },
    { id: 'reading',      label: 'Lesen',         Icon: BookOpen,          visible: true },
    { id: 'settings',     label: 'Einstellungen', Icon: SlidersHorizontal, visible: true },
    { id: 'subscription', label: 'Abo',           Icon: CreditCard,        visible: true },
    { id: 'developer',    label: 'Entwicklung',   Icon: Bug,               visible: hasDevAccess },
  ].filter((t) => t.visible);

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_TAB_STORAGE);
      if (stored && tabs.some((t) => t.id === stored)) return stored;
    } catch { /* ignore */ }
    return DEFAULT_TAB;
  });

  useEffect(() => {
    if (!tabs.some((t) => t.id === activeTab)) {
      setActiveTab(DEFAULT_TAB);
    }
  }, [tabs, activeTab]);

  useEffect(() => {
    try { localStorage.setItem(ACTIVE_TAB_STORAGE, activeTab); } catch { /* ignore */ }
  }, [activeTab]);

  const _o = (key, raw) => Object.hasOwn(userFeatureOverrides, key) ? userFeatureOverrides[key] : raw;

  // Admin sees all features; others see only role-assigned features.
  const roleVisibleFeatures = isAdmin
    ? features
    : features.filter((f) => visibleFeatureKeys.has(f.key));
  const visibleFeatures = simplifiedUi && !isAdmin
    ? roleVisibleFeatures.filter((f) => !SIMPLIFIED_HIDDEN.has(f.key))
    : roleVisibleFeatures;

  const pick = (keys) => visibleFeatures.filter((f) => keys.has(f.key));
  const readingFeatures      = pick(READING_KEYS).filter((f) => f.key !== 'word-blacklist');
  const voiceFeatures        = pick(VOICE_KEYS);
  const settingsFeatures     = pick(SETTINGS_KEYS);
  const developerFeatures    = pick(DEVELOPER_KEYS);

  // Subscription: render from ALL features (not role-gated) so guests see the upsell list.
  const allSubscriptionFeatures = features.filter((f) => SUBSCRIPTION_KEYS.has(f.key));

  const nonAdminRoles = ROLES.filter((r) => r !== 'admin');

  const renderFeatureRow = ({ key, label, description, Icon }, { locked = false } = {}) => {
    const effective = _o(key, _rawFlagValues[key] ?? false);
    const isUnreleased = !Object.hasOwn(_rawFlagValues, key);
    return (
      <div key={key} className={`px-5 py-4 flex items-start gap-4 ${
        dark ? 'text-amber-200' : 'text-amber-900'
      }`}>
        <div className={`flex-shrink-0 mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          effective && !locked
            ? dark ? 'bg-amber-700/40 text-amber-300' : 'bg-amber-100 text-amber-700'
            : dark ? 'bg-slate-700/60 text-amber-700' : 'bg-amber-50/80 text-amber-400'
        }`}>
          <div className="w-5 h-5"><Icon /></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <p className={`text-sm font-medium transition-opacity ${effective && !locked ? '' : 'opacity-40'}`}>{label}</p>
              {isUnreleased && (
                <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  dark ? 'bg-violet-900/60 text-violet-300' : 'bg-violet-100 text-violet-700'
                }`}>
                  unveröffentlicht
                </span>
              )}
            </div>
            {locked ? (
              <Lock size={14} className={dark ? 'text-amber-700' : 'text-amber-400'} />
            ) : (
              <Toggle checked={effective} onChange={() => onToggleFeature(key)} label={label} />
            )}
          </div>
          <p className={`text-xs mt-1 leading-relaxed ${dark ? 'text-amber-600' : 'text-amber-500'}`}>{description}</p>
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
  };

  const featureList = (items, emptyHint) => {
    if (items.length === 0) {
      return (
        <p className={`px-1 text-sm ${dark ? 'text-amber-700' : 'text-amber-500'}`}>
          {emptyHint}
        </p>
      );
    }
    return (
      <div className={`rounded-2xl border divide-y ${
        dark ? 'border-amber-700/30 divide-amber-700/30' : 'border-amber-200 divide-amber-200'
      }`}>
        {items.map(renderFeatureRow)}
      </div>
    );
  };

  const sectionHeading = (text, { extra = null } = {}) => (
    <div className="flex items-center justify-between mb-3 px-1">
      <h2 className={`text-xs font-semibold uppercase tracking-wider ${
        dark ? 'text-amber-500' : 'text-amber-600'
      }`}>{text}</h2>
      {extra}
    </div>
  );

  // ---- Profile tab ---------------------------------------------------------
  const profileTabBody = (
    <>
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

      <div className="mb-8">
        {sectionHeading('Rolle')}
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

      <div className="mb-8">
        {sectionHeading('Statistik')}
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
      </div>
    </>
  );

  // ---- Reading tab ---------------------------------------------------------
  const readingTabBody = (
    <>
      <div className="mb-8">
        {sectionHeading('Lese-Funktionen', {
          extra: (
            <button
              onClick={() => onOpenDocs()}
              className={`text-xs transition-colors hover:underline ${
                dark ? 'text-amber-400/70 hover:text-amber-400' : 'text-amber-600/70 hover:text-amber-700'
              }`}
            >
              Alle Funktionen erklärt →
            </button>
          ),
        })}
        {featureList(readingFeatures, 'Keine Lese-Funktionen für diese Rolle freigeschaltet.')}
      </div>

      {voiceFeatures.length > 0 && (
        <div className="mb-8">
          {sectionHeading('Sprachsteuerung')}
          <div className={`rounded-2xl border divide-y ${
            dark ? 'border-amber-700/30 divide-amber-700/30' : 'border-amber-200 divide-amber-200'
          }`}>
            {voiceFeatures.map(renderFeatureRow)}
          </div>
        </div>
      )}

      {showWordBlacklist && (
        <div className="mb-4">
          {sectionHeading('Wort-Blacklist')}
          <div className={`rounded-2xl border ${dark ? 'border-amber-700/30' : 'border-amber-200'}`}>
            <div className={`flex gap-2 px-4 py-3 ${
              blacklist.size > 0 ? `border-b ${dark ? 'border-amber-700/30' : 'border-amber-200'}` : ''
            }`}>
              <input
                data-testid="blacklist-input"
                type="text"
                value={blacklistInput}
                onChange={(e) => onBlacklistInputChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') onAddBlacklistWord(); }}
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
            {[...blacklist].map((word) => (
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
    </>
  );

  // ---- Settings tab --------------------------------------------------------
  const settingsTabBody = (
    <>
      <div className="mb-8">
        {sectionHeading('Einstellungen')}
        {featureList(settingsFeatures, 'Keine Einstellungen für diese Rolle freigeschaltet.')}
      </div>

      {onOpenPersonasDocs && (
        <button
          onClick={onOpenPersonasDocs}
          className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-colors ${
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
    </>
  );

  // ---- Subscription tab ----------------------------------------------------
  const guestUpsell = (
    <>
      <div className={`rounded-2xl border p-6 mb-6 ${
        dark ? 'border-violet-700/40 bg-violet-900/10' : 'border-violet-200 bg-violet-50/50'
      }`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            dark ? 'bg-violet-800/60 text-violet-200' : 'bg-violet-100 text-violet-700'
          }`}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className={`text-base font-serif font-bold ${dark ? 'text-violet-200' : 'text-violet-900'}`}>
              Abonnement freischalten
            </h3>
            <p className={`text-xs ${dark ? 'text-violet-400' : 'text-violet-700/80'}`}>
              Zugriff auf alle Premium-Funktionen
            </p>
          </div>
        </div>
        <button
          type="button"
          data-testid="subscription-upgrade-cta"
          onClick={() => { /* TODO: wire to real upgrade flow */ }}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
            dark ? 'bg-violet-700 text-white hover:bg-violet-600' : 'bg-violet-600 text-white hover:bg-violet-700'
          }`}
        >
          Upgrade starten
        </button>
      </div>
      <p className={`px-1 mb-3 text-xs ${dark ? 'text-amber-600' : 'text-amber-500'}`}>
        Das bekommst du mit dem Abo:
      </p>
      <div className={`rounded-2xl border divide-y ${
        dark ? 'border-amber-700/30 divide-amber-700/30' : 'border-amber-200 divide-amber-200'
      }`}>
        {allSubscriptionFeatures.map((f) => renderFeatureRow(f, { locked: true }))}
      </div>
    </>
  );

  const subscriptionTabBody = role === 'guest' && !isAdmin
    ? guestUpsell
    : (
      <div>
        {sectionHeading('Abo-Funktionen')}
        {(() => {
          const items = allSubscriptionFeatures.filter(
            (f) => isAdmin || visibleFeatureKeys.has(f.key),
          );
          return featureList(items, 'Noch keine Abo-Funktionen für diese Rolle freigeschaltet.');
        })()}
      </div>
    );

  // ---- Developer tab -------------------------------------------------------
  const [roleMatrixFilter, setRoleMatrixFilter] = useState('');
  const filteredMatrixFeatures = useMemo(() => {
    const q = roleMatrixFilter.trim().toLowerCase();
    if (!q) return features;
    return features.filter((f) =>
      f.key.toLowerCase().includes(q) || f.label.toLowerCase().includes(q),
    );
  }, [features, roleMatrixFilter]);

  const developerTabBody = (
    <>
      {developerFeatures.length > 0 && (
        <div className="mb-8">
          {sectionHeading('Entwickler-Funktionen')}
          {featureList(developerFeatures, 'Keine Entwickler-Funktionen freigeschaltet.')}
        </div>
      )}

      {showErrorPageSimulator && (
        <div className="mb-8">
          {sectionHeading('Fehlerseiten-Simulator', {
            extra: <FlameKindling size={12} className={dark ? 'text-amber-500' : 'text-amber-600'} />,
          })}
          <div className={`rounded-2xl border divide-y ${
            dark ? 'border-amber-700/30 divide-amber-700/30' : 'border-amber-200 divide-amber-200'
          }`}>
            {[
              { type: 'not-found',  label: '404 – Seite nicht gefunden', desc: 'Navigiert zu einer nicht vorhandenen URL.' },
              { type: 'unexpected', label: '500 – Unerwarteter Fehler',  desc: 'Wirft eine Exception und löst die Error Boundary aus.' },
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

      {ab && (
        <div className="mb-8">
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
        </div>
      )}

      {isAdmin && (
        <div className="mb-8">
          {sectionHeading('Rollenzuweisung')}
          <div className={`relative mb-3 ${dark ? 'text-amber-300' : 'text-amber-800'}`}>
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              dark ? 'text-amber-600' : 'text-amber-400'
            }`} />
            <input
              data-testid="role-matrix-filter"
              type="text"
              value={roleMatrixFilter}
              onChange={(e) => setRoleMatrixFilter(e.target.value)}
              placeholder="Funktion filtern…"
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border outline-none placeholder:opacity-40 ${
                dark
                  ? 'bg-slate-900/60 border-amber-700/30 text-amber-100'
                  : 'bg-white border-amber-200 text-amber-900'
              }`}
            />
          </div>
          <div className={`rounded-2xl border overflow-hidden ${
            dark ? 'border-amber-700/30' : 'border-amber-200'
          }`}>
            <div className={`grid grid-cols-[1fr_auto] gap-x-4 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider ${
              dark ? 'bg-slate-800/40 text-amber-500' : 'bg-amber-50/80 text-amber-600'
            }`}>
              <span>Funktion</span>
              <div className="flex gap-1.5">
                {nonAdminRoles.map((r) => (
                  <span key={r} className="w-14 text-center">{ROLE_LABELS[r]}</span>
                ))}
              </div>
            </div>
            <div className={`divide-y ${dark ? 'divide-amber-700/20' : 'divide-amber-100'}`}>
              {filteredMatrixFeatures.map((f) => (
                <div key={f.key} className={`grid grid-cols-[1fr_auto] gap-x-4 items-center px-4 py-2 ${
                  dark ? 'text-amber-200' : 'text-amber-900'
                }`}>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{f.label}</p>
                    <p className={`text-[10px] truncate ${dark ? 'text-amber-700' : 'text-amber-500'}`}>{f.key}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {nonAdminRoles.map((r) => {
                      const assigned = isFeatureAssignedToRole(f.key, r);
                      return (
                        <button
                          key={r}
                          data-testid={`role-assign-${f.key}-${r}`}
                          onClick={() => toggleFeatureForRole(f.key, r)}
                          aria-label={`${f.label} fuer ${ROLE_LABELS[r]}`}
                          className={`w-14 h-6 rounded-md text-[10px] font-semibold transition-colors ${
                            assigned
                              ? dark ? 'bg-violet-700/60 text-violet-200' : 'bg-violet-100 text-violet-800'
                              : dark ? 'bg-slate-800/40 text-amber-700 hover:text-amber-500' : 'bg-amber-50 text-amber-300 hover:text-amber-600'
                          }`}
                        >
                          {assigned ? '●' : '○'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {filteredMatrixFeatures.length === 0 && (
                <div className={`px-4 py-6 text-center text-xs ${dark ? 'text-amber-700' : 'text-amber-500'}`}>
                  Keine Funktion entspricht dem Filter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ---- Layout --------------------------------------------------------------
  const currentBody =
    activeTab === 'profile'      ? profileTabBody      :
    activeTab === 'reading'      ? readingTabBody      :
    activeTab === 'settings'     ? settingsTabBody     :
    activeTab === 'subscription' ? subscriptionTabBody :
    activeTab === 'developer'    ? developerTabBody    : null;

  return (
    <div
      className="flex-1 flex flex-col min-h-0 lg:flex-row"
      data-testid="profile-panel-tabbed"
      data-variant={variant}
      data-active-tab={activeTab}
    >
      <nav
        role="tablist"
        aria-label="Profil-Navigation"
        className={`flex-shrink-0 border-b lg:border-b-0 lg:border-r lg:w-56 lg:pt-10 lg:px-3 ${
          dark ? 'border-amber-700/30 bg-slate-950/40' : 'border-amber-200 bg-amber-50/30'
        }`}
      >
        <button
          onClick={onBack}
          data-testid="profile-back-top"
          className={`hidden lg:flex items-center gap-2 px-3 mb-4 text-sm font-medium transition-colors ${
            dark ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'
          }`}
        >
          <ChevronLeft size={16} />
          Zurück
        </button>
        <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible">
          {tabs.map((tab) => {
            const Icon = tab.Icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                data-testid={`profile-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 lg:w-full flex items-center justify-center lg:justify-start gap-2 px-4 lg:px-3 py-3 lg:py-2.5 lg:mb-1 lg:rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? dark
                      ? 'text-amber-100 bg-amber-700/30 border-b-2 lg:border-b-0 border-amber-500'
                      : 'text-amber-900 bg-amber-100 border-b-2 lg:border-b-0 border-amber-600'
                    : dark
                      ? 'text-amber-500 hover:text-amber-300 border-b-2 lg:border-b-0 border-transparent'
                      : 'text-amber-600 hover:text-amber-800 border-b-2 lg:border-b-0 border-transparent'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto">
        <div
          role="tabpanel"
          data-testid={`profile-tab-panel-${activeTab}`}
          className="max-w-lg mx-auto px-6 pt-10 pb-28 lg:pb-12"
        >
          {currentBody}
        </div>
      </div>

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
