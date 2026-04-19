
/**
 * Unified feature registry — the single source of truth for:
 *   - OpenFeature flag config (→ flags.json derivation)
 *   - Toggleable FEATURES list for the profile panel
 *   - Default role → feature mapping for useRole
 *   - Release-readiness gating (status field)
 *
 * Shape per entry:
 *   key         stable identifier, used as the OpenFeature flag key
 *   kind        'boolean' → on/off toggle; 'variant' → multi-value picker
 *   label       short German label (what the user sees)
 *   description one-line purpose
 *   Icon        lucide-react icon component (may be null for hidden entries)
 *   flag        { defaultVariant, variants } — same shape as flags.json
 *   status      'released' | 'beta' | 'experimental' — drives release gating
 *   roles       roles that see this feature by default (admin always sees all)
 *   hidden      true → excluded from profile toggles UI (kept in flag config)
 *
 * Adding a feature: add one entry here. flags.json, FEATURES, and the role
 * defaults are derived automatically; consistency tests catch drift.
 */

const bool = (defaultVariant = 'off') => ({
  defaultVariant,
  variants: { on: true, off: false },
});

const ALL_USERS = ['guest', 'subscriber', 'tester', 'sales'];

export const RELEASE_STATUSES = ['released', 'beta', 'experimental'];
export const TOGGLEABLE_KINDS = ['boolean', 'variant'];

export const FEATURE_REGISTRY_DATA = [
  // -------- Released foundations --------
  {
    key: 'favorites',
    kind: 'boolean',
    label: 'Favoriten',
    description: 'Märchen mit einem Herz markieren und als Favoriten speichern.',
    flag: bool('on'),
    status: 'released',
    roles: ALL_USERS,
  },
  {
    key: 'favorites-only-toggle',
    kind: 'boolean',
    label: 'Nur Favoriten anzeigen',
    description: 'Schalter in der Seitenleiste, um die Liste auf gespeicherte Favoriten einzuschränken.',
    flag: bool('on'),
    status: 'released',
    roles: ALL_USERS,
  },
  {
    key: 'word-count',
    kind: 'boolean',
    label: 'Wörteranzahl',
    description: 'Zeigt die Anzahl der Wörter eines Märchens in der Seitenleiste an.',
    flag: bool('off'),
    status: 'released',
    roles: ['subscriber', 'tester', 'sales'],
  },
  {
    key: 'reading-duration',
    kind: 'boolean',
    label: 'Lesezeit',
    description: 'Schätzt die Lesezeit basierend auf 200 Wörtern pro Minute und zeigt sie als „~X min" an.',
    flag: bool('on'),
    status: 'released',
    roles: ['subscriber', 'tester', 'sales'],
  },
  {
    key: 'font-size-controls',
    kind: 'boolean',
    label: 'Schriftgrößen-Steuerung',
    description: 'Plus- und Minus-Schaltflächen in der Kopfzeile zum Anpassen der Schriftgröße.',
    flag: bool('on'),
    status: 'released',
    roles: ALL_USERS,
  },
  {
    key: 'pinch-font-size',
    kind: 'boolean',
    label: 'Pinch-Zoom Schriftgröße',
    description: 'Passt die Schriftgröße per Zwei-Finger-Pinch-Geste im Lesebereich an.',
    flag: bool('off'),
    status: 'released',
    roles: ALL_USERS,
  },
  {
    key: 'eink-flash',
    kind: 'boolean',
    label: 'Seitenumblättern-Effekt',
    description: 'Kurzer Aufblitz beim Blättern - nachempfunden dem Bildschirm eines E-Ink-Lesegeräts.',
    flag: bool('on'),
    status: 'released',
    roles: ALL_USERS,
  },
  {
    key: 'tap-zones',
    kind: 'boolean',
    label: 'Tipp-Zonen',
    description: 'Unsichtbare Bereiche links und rechts auf der Seite zum Blättern per Fingertipp oder Klick.',
    flag: bool('on'),
    status: 'released',
    roles: ALL_USERS,
  },
  {
    key: 'tap-middle-toggle',
    kind: 'boolean',
    label: 'Mittige Tipp-Zone zum Ausblenden',
    description: 'Tippen auf die Mitte der Seite blendet die Kopf- und Fußzeile aus (setzt „Tipp-Zonen" voraus).',
    flag: bool('on'),
    status: 'released',
    roles: ALL_USERS,
  },
  {
    key: 'adaption-switcher',
    kind: 'boolean',
    label: 'Varianten',
    description: 'Dropdown zum Wechseln zwischen der Originalfassung und alternativen Versionen eines Märchens.',
    flag: bool('on'),
    status: 'released',
    roles: ['subscriber', 'tester', 'sales'],
  },
  {
    key: 'typography-panel',
    kind: 'boolean',
    label: 'Typografie-Panel',
    description: 'Einstellbereich für Zeilenhöhe, Textbreite, Zeichenabstand und Schriftart.',
    flag: bool('on'),
    status: 'released',
    roles: ALL_USERS,
  },
  {
    key: 'subscriber-fonts',
    kind: 'boolean',
    label: 'Erweiterte Schriftarten',
    description: 'Erweitert das Typografie-Panel mit mehr Schriften pro Familie (Serif, Sans, Kursiv) und fügt eine neue Mono-Familie hinzu.',
    flag: bool('off'),
    status: 'released',
    roles: ['subscriber', 'tester', 'sales'],
  },
  {
    key: 'attribution',
    kind: 'boolean',
    label: 'Quellenangabe',
    description: 'Zeigt auf der letzten Seite eines Märchens den Autorennamen als Quellenangabe.',
    flag: bool('on'),
    status: 'released',
    roles: ALL_USERS,
  },
  {
    key: 'audio-player',
    kind: 'boolean',
    label: 'Audio-Player',
    description: 'Zeigt einen eingebetteten Audioplayer an, wenn zum Märchen eine Audiodatei vorhanden ist.',
    flag: bool('off'),
    status: 'released',
    roles: ALL_USERS,
  },
  {
    key: 'high-contrast-theme',
    kind: 'boolean',
    label: 'Hochkontrast-Thema',
    description: 'Fügt dem Themenkreis einen Hochkontrastmodus hinzu - schwarzer Hintergrund mit weißem Text und weißen Rändern für maximale Lesbarkeit.',
    flag: bool('off'),
    status: 'released',
    roles: ALL_USERS,
  },
  {
    key: 'story-directories',
    kind: 'boolean',
    label: 'Verzeichnisstruktur',
    description: 'Zeigt Geschichten in ihrer Ordnerstruktur an - für Quellen mit regionalen oder thematischen Unterordnern.',
    flag: bool('off'),
    status: 'released',
    roles: ['subscriber', 'tester', 'sales'],
  },

  // -------- Released but hidden (variant / infra flags) --------
  {
    key: 'theme',
    kind: 'variant',
    label: 'Thema',
    description: 'Farbschema der Benutzeroberfläche.',
    flag: {
      defaultVariant: 'light',
      variants: { light: 'light', dark: 'dark', system: 'system', 'light-hc': 'light-hc', 'dark-hc': 'dark-hc' },
    },
    status: 'released',
    roles: ALL_USERS,
    hidden: true,
  },
  {
    key: 'theme-toggle',
    kind: 'boolean',
    label: 'Thema-Umschalter',
    description: 'Zeigt den Themen-Umschalter in der Navigationsleiste.',
    flag: bool('on'),
    status: 'released',
    roles: ALL_USERS,
    hidden: true,
  },

  // -------- Beta: works, opt-in --------
  {
    key: 'speed-reader',
    kind: 'boolean',
    label: 'Schnellleser',
    description: 'Zeigt Wörter einzeln nacheinander in hoher Geschwindigkeit an - zum Training oder für schnelles Erfassen langer Texte.',
    flag: bool('off'),
    status: 'beta',
    roles: ['subscriber', 'tester'],
  },
  {
    key: 'speedreader-orp',
    kind: 'boolean',
    label: 'ORP-Lesemarke',
    description: 'Hebt den optimalen Erkennungspunkt eines Worts farblich hervor und richtet ihn am Fixationspunkt aus - mit konfigurierbaren Führungslinien.',
    flag: bool('off'),
    status: 'beta',
    roles: ['subscriber', 'tester'],
  },
  {
    key: 'word-blacklist',
    kind: 'boolean',
    label: 'Wort-Blacklist',
    description: 'Wörter eintragen, die du nicht lesen möchtest - Märchen mit diesen Wörtern werden in der Seitenleiste ausgeblendet.',
    flag: bool('off'),
    status: 'beta',
    roles: ['subscriber', 'tester'],
  },
  {
    key: 'deep-search',
    kind: 'boolean',
    label: 'Tiefensuche',
    description: 'Erweitert die Suche von Titeln auf den vollständigen Märchentext (langsamer bei großen Bibliotheken).',
    flag: bool('off'),
    status: 'beta',
    roles: ['subscriber', 'tester'],
  },
  {
    key: 'simplified-ui',
    kind: 'boolean',
    label: 'Vereinfachte Ansicht',
    description: 'Blendet erweiterte Einstellungen aus und vergrößert Schaltflächen - für eine übersichtlichere, zugänglichere Bedienung.',
    flag: bool('off'),
    status: 'beta',
    roles: ['tester'],
  },
  {
    key: 'text-to-speech',
    kind: 'boolean',
    label: 'Text-zu-Sprache',
    description: 'Liest den Märchentext mit synthetischer Stimme vor - unabhängig von einer aufgenommenen Audiodatei.',
    flag: bool('off'),
    status: 'beta',
    roles: ['tester'],
  },
  {
    key: 'big-fonts',
    kind: 'variant',
    label: 'Größere Schriftgrenzen',
    description: 'Erweitert die maximale Schriftgröße für Nutzer, die besonders große Schrift bevorzugen.',
    flag: {
      defaultVariant: 'off',
      variants: { off: 'off', big: 'big', bigger: 'bigger', biggest: 'biggest' },
    },
    status: 'beta',
    roles: ALL_USERS,
    hidden: true,
  },
  {
    key: 'app-animation',
    kind: 'boolean',
    label: 'App-Animation',
    description: 'Einführungs- und Abschluss-Animation mit „Swipe to Unlock" und „Swipe to Close".',
    flag: bool('off'),
    status: 'beta',
    roles: [],
  },
  {
    key: 'ab-testing',
    kind: 'boolean',
    label: 'UI-Varianten (A/B)',
    description: 'Ermöglicht das Wechseln zwischen Original- und Testvarianten der Oberfläche im Profil.',
    flag: bool('off'),
    status: 'beta',
    roles: ['subscriber', 'tester', 'sales'],
  },

  // -------- Beta: commerce / sales --------
  {
    key: 'tier-badge',
    kind: 'boolean',
    label: 'Tarif-Abzeichen',
    description: 'Zeigt das aktuelle Abo (Free, Plus, Pro, Family, Edu) im Profil-Panel an.',
    flag: bool('off'),
    status: 'beta',
    roles: ['sales'],
  },
  {
    key: 'paywall',
    kind: 'boolean',
    label: 'Zahlschranke',
    description: 'Zeigt eine Zahlschranke vor kostenpflichtigen Features - Varianten: Hard-Gate, Soft-Gate, Teaser.',
    flag: bool('off'),
    status: 'beta',
    roles: ['sales'],
  },
  {
    key: 'upgrade-cta',
    kind: 'boolean',
    label: 'Upgrade-Hinweis',
    description: 'Kontextabhängiger Hinweis zum Upgrade auf den nächsthöheren Tarif.',
    flag: bool('off'),
    status: 'beta',
    roles: ['sales'],
  },
  {
    key: 'trial-banner',
    kind: 'boolean',
    label: 'Testzeitraum-Banner',
    description: 'Banner, der einen 7-, 14- oder 30-tägigen Testzeitraum startet und den verbleibenden Zeitraum anzeigt.',
    flag: bool('off'),
    status: 'beta',
    roles: ['sales'],
  },
  {
    key: 'pricing-page',
    kind: 'boolean',
    label: 'Preisseite',
    description: 'Dedizierte Preisseite mit Tarif-Vergleich - Layout-Varianten: 3-Tarife, 4-Tarife, interaktiver Slider.',
    flag: bool('off'),
    status: 'beta',
    roles: ['sales'],
  },
  {
    key: 'promo-code',
    kind: 'boolean',
    label: 'Promo-Code',
    description: 'Promo-Code-Eingabe fuer Endnutzer; Sales und Admin koennen Codes erzeugen.',
    flag: bool('off'),
    status: 'beta',
    roles: ['sales'],
  },
  {
    key: 'referral-program',
    kind: 'boolean',
    label: 'Empfehlungsprogramm',
    description: 'Persoenlicher Empfehlungslink - Freund erhaelt 30 Tage gratis, Empfehler einen Gratismonat.',
    flag: bool('off'),
    status: 'beta',
    roles: ['sales'],
  },
  {
    key: 'sales-mode',
    kind: 'boolean',
    label: 'Vertriebs-Modus',
    description: 'Demo-Overlay fuer die Sales-Rolle - schaltet simulierte Tarife fuer Live-Praesentationen um.',
    flag: bool('off'),
    status: 'beta',
    roles: ['sales'],
  },
  {
    key: 'conversion-analytics',
    kind: 'boolean',
    label: 'Conversion-Analyse',
    description: 'Einblendung des aktuellen Funnel-Schritts, der Paywall-Variante und des A/B-Variant-Zustands.',
    flag: bool('off'),
    status: 'beta',
    roles: ['sales'],
  },
  {
    key: 'billing-portal-stub',
    kind: 'boolean',
    label: 'Abrechnungs-Portal (Mock)',
    description: 'Gemocktes Abrechnungs-Portal fuer Demos - keine echte Zahlungsabwicklung.',
    flag: bool('off'),
    status: 'beta',
    roles: ['sales'],
  },

  // -------- Experimental: admin / tester only --------
  {
    key: 'read-along',
    kind: 'boolean',
    label: 'Vorlesen mit Markierung',
    description: 'Liest den Text vor und markiert dabei das aktuelle Wort - ideal für Kinder beim Lesenlernen.',
    flag: bool('off'),
    status: 'experimental',
    roles: ['tester'],
  },
  {
    key: 'illustrations',
    kind: 'boolean',
    label: 'Illustrationen',
    description: 'Zeigt zum Märchen passende Illustrationen an, sofern vorhanden.',
    flag: bool('off'),
    status: 'experimental',
    roles: ['tester'],
  },
  {
    key: 'child-profile',
    kind: 'boolean',
    label: 'Kinderprofil',
    description: 'Separates Leseprofil für Kinder mit vereinfachter Oberfläche und altersgerechten Einstellungen.',
    flag: bool('off'),
    status: 'experimental',
    roles: ['tester'],
  },
  {
    key: 'story-quiz',
    kind: 'boolean',
    label: 'Geschichten-Quiz',
    description: 'Einfache Verständnisfragen am Ende eines Märchens - macht das Lesen interaktiv für Kinder.',
    flag: bool('off'),
    status: 'experimental',
    roles: ['tester'],
  },
  {
    key: 'voice-control',
    kind: 'boolean',
    label: 'Sprachsteuerung',
    description: 'Grundlage für alle Sprachbefehle - Mikrofon-Knopf, Push-to-talk und Transkript-Anzeige.',
    flag: bool('off'),
    status: 'experimental',
    roles: [],
  },
  {
    key: 'voice-resume',
    kind: 'boolean',
    label: 'Sprachbefehl: Weiterlesen',
    description: 'Öffnet per Sprachbefehl („Weiterlesen", „Continue") das zuletzt gelesene Märchen auf der zuletzt gelesenen Seite.',
    flag: bool('off'),
    status: 'experimental',
    roles: [],
  },
  {
    key: 'voice-navigation',
    kind: 'boolean',
    label: 'Sprachbefehl: Navigation',
    description: 'Öffnet Geschichten nach Titel, blättert Seiten vor und zurück und kehrt zur Übersicht zurück - alles per Sprache.',
    flag: bool('off'),
    status: 'experimental',
    roles: [],
  },
  {
    key: 'voice-reading-control',
    kind: 'boolean',
    label: 'Sprachbefehl: Vorlesen',
    description: 'Startet, pausiert und beschleunigt das Vorlesen per Sprache (benötigt Text-zu-Sprache).',
    flag: bool('off'),
    status: 'experimental',
    roles: [],
  },
  {
    key: 'voice-discovery',
    kind: 'boolean',
    label: 'Sprachbefehl: Entdecken',
    description: 'Findet Geschichten nach Schlagwort oder wählt eine Überraschung per Sprachbefehl.',
    flag: bool('off'),
    status: 'experimental',
    roles: [],
  },
  {
    key: 'voice-hands-free',
    kind: 'boolean',
    label: 'Sprachbefehl: Hände frei',
    description: 'Durchgehendes Zuhören statt Push-to-talk - für Barrierefreiheit und Vorlesen ohne Eingreifen.',
    flag: bool('off'),
    status: 'experimental',
    roles: [],
  },
  {
    key: 'debug-badges',
    kind: 'boolean',
    label: 'Debug-Badges',
    description: 'Zeigt auf jeder Komponente ein Badge mit dem technischen Namen an - für Tester, damit sie immer den richtigen data-testid-Namen kennen.',
    flag: bool('off'),
    status: 'experimental',
    roles: ['tester'],
  },
  {
    key: 'error-page-simulator',
    kind: 'boolean',
    label: 'Fehlerseiten-Simulator',
    description: 'Zeigt im Profil-Panel Schaltflächen zum absichtlichen Auslösen von 404- und 500-Fehlerseiten.',
    flag: bool('off'),
    status: 'experimental',
    roles: ['tester'],
  },
  {
    key: 'ab-testing-admin',
    kind: 'boolean',
    label: 'A/B-Verwaltung',
    description: 'Admin-Werkzeug zum Aktivieren, Deaktivieren und Zuteilen von UI-Varianten an Rollen.',
    flag: bool('off'),
    status: 'experimental',
    roles: [],
  },
  {
    key: 'hero-tagline',
    kind: 'boolean',
    label: 'Hero-Tagline',
    description: 'Alternative Hero-Positionierung auf der Startseite.',
    flag: bool('off'),
    status: 'experimental',
    roles: [],
    hidden: true,
  },
];


const REGISTRY_DATA_MAP = Object.freeze(
  Object.fromEntries(FEATURE_REGISTRY_DATA.map((e) => [e.key, e])),
);

export function getRegistryDataMap() {
  return REGISTRY_DATA_MAP;
}

export function getFlagConfig() {
  return Object.fromEntries(
    FEATURE_REGISTRY_DATA.map((e) => [e.key, e.flag]),
  );
}

export function getDefaultRoleFeatures() {
  const roles = {};
  for (const entry of FEATURE_REGISTRY_DATA) {
    for (const role of entry.roles) {
      roles[role] ??= [];
      roles[role].push(entry.key);
    }
  }
  return roles;
}

export function getFeaturesByStatus(status) {
  return FEATURE_REGISTRY_DATA.filter((e) => e.status === status).map((e) => e.key);
}
