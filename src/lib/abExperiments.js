/**
 * A/B experiment registry.
 *
 * Each experiment defines a set of UI variants that can be swapped at runtime.
 * Admins activate/revoke experiments and grant role access via the A/B admin panel.
 * Users with the `ab-testing` feature flag can pick a variant at runtime.
 *
 * Experiment shape:
 *   id             - stable identifier, used as the key in variant and config storage
 *   label          - short human label (German, matches the app)
 *   description    - one-line purpose of the experiment
 *   defaultVariant - variant id used when no user selection exists
 *   variants       - array of { id, label, description? }
 *
 * Default admin config (active, allowedRoles) lives in abDefaultConfig and
 * seeds localStorage['wr-ab-experiments'] on first run. Admins mutate the
 * localStorage copy via the admin panel.
 */

export const AB_EXPERIMENTS = [
  {
    id: 'sidebar',
    label: 'Seitenleiste',
    description: 'Neue Seitenleiste mit hierarchischer Baumansicht, ohne Drill-Down.',
    defaultVariant: 'control',
    variants: [
      { id: 'control', label: 'Original', description: 'Die bestehende Drill-Down-Navigation.' },
      { id: 'v2',      label: 'Baum v2',  description: 'Alles auf einer Ebene, Quellen ein- und ausklappbar, Tastatur-Navigation.' },
    ],
  },
  {
    id: 'paywall-style',
    label: 'Zahlschranken-Stil',
    description: 'Wie stark blockieren Paywalls den Zugriff auf kostenpflichtige Features?',
    defaultVariant: 'soft-gate',
    variants: [
      { id: 'hard-gate', label: 'Harte Sperre',  description: 'Feature ist bis zum Upgrade komplett gesperrt.' },
      { id: 'soft-gate', label: 'Sanfte Sperre', description: 'Feature funktioniert einmal oder fuer N Sekunden, dann gesperrt.' },
      { id: 'teaser',    label: 'Teaser',        description: 'Feature zeigt Teilergebnisse mit Upgrade-Hinweis.' },
    ],
  },
  {
    id: 'upgrade-cta-copy',
    label: 'Upgrade-Hinweis-Text',
    description: 'Welcher Ton ueberzeugt mehr Nutzer zum Upgrade?',
    defaultVariant: 'feature-focused',
    variants: [
      { id: 'feature-focused', label: 'Feature-fokussiert', description: '„Schalte Schnellleser + ORP frei".' },
      { id: 'outcome-focused', label: 'Ergebnis-fokussiert', description: '„Lies 3x schneller".' },
      { id: 'price-anchor',    label: 'Preis-Anker',         description: '„Weniger als ein Kaffee pro Monat".' },
    ],
  },
  {
    id: 'pricing-page-layout',
    label: 'Preisseiten-Layout',
    description: 'Wie ist die Preisseite strukturiert?',
    defaultVariant: '4-tier',
    variants: [
      { id: '3-tier', label: '3 Tarife',            description: 'Free / Pro / Family - Plus und Edu versteckt.' },
      { id: '4-tier', label: '4 Tarife',            description: 'Free / Plus / Pro / Family.' },
      { id: 'slider', label: 'Interaktiver Slider', description: 'Slider empfiehlt Tarif basierend auf gewaehlten Features.' },
    ],
  },
  {
    id: 'trial-length',
    label: 'Testzeitraum-Laenge',
    description: 'Wie lange laeuft der kostenlose Testzeitraum?',
    defaultVariant: '14-days',
    variants: [
      { id: '5-min',  label: '5 Minuten', description: 'Mikro-Trial fuer speed-reader und ORP.' },
      { id: '7-days', label: '7 Tage',    description: 'Kurzer Trial - schnelle Entscheidung.' },
      { id: '14-days', label: '14 Tage',  description: 'Mittel - Industriestandard.' },
      { id: '30-days', label: '30 Tage',  description: 'Lang - maximale Aktivierungszeit.' },
    ],
  },
  {
    id: 'profile-layout',
    label: 'Profil-Layout',
    description: 'Gruppierte, ausklappbare Sektionen im Profil vs. heutige flache Liste.',
    defaultVariant: 'flat',
    variants: [
      { id: 'flat',     label: 'Heute (flach)',       description: 'Alle Bloecke untereinander, keine Ausklappen.' },
      { id: 'grouped',  label: 'Gruppiert',           description: 'Abschnitte sind ausklappbar und standardmaessig offen.' },
      { id: 'role-opt', label: 'Rollen-optimiert',    description: 'Abschnitte sind ausklappbar, pro Rolle sind andere Abschnitte standardmaessig offen.' },
    ],
  },
  {
    id: 'hero-pitch',
    label: 'Hero-Pitch',
    description: 'Welche Positionierung spricht welche Persona am staerksten an?',
    defaultVariant: 'story-os',
    variants: [
      { id: 'story-os',    label: 'Story OS',       description: 'Das Betriebssystem fuer Maerchen.' },
      { id: 'speed',       label: 'Schneller lesen', description: '3x schneller lesen mit ORP.' },
      { id: 'family',      label: 'Familien-Ritual', description: 'Eine Gute-Nacht-Geschichte, nur ein Tipp entfernt.' },
      { id: 'culture',     label: 'Kulturerbe',      description: 'Maerchen im Original und in jeder Sprache.' },
    ],
  },
];

export const AB_DEFAULT_CONFIG = {
  sidebar: {
    active: true,
    allowedRoles: ['tester', 'admin'],
  },
  'paywall-style': {
    active: false,
    allowedRoles: ['sales', 'tester', 'admin'],
  },
  'upgrade-cta-copy': {
    active: false,
    allowedRoles: ['sales', 'tester', 'admin'],
  },
  'pricing-page-layout': {
    active: false,
    allowedRoles: ['sales', 'tester', 'admin'],
  },
  'trial-length': {
    active: false,
    allowedRoles: ['sales', 'tester', 'admin'],
  },
  'hero-pitch': {
    active: false,
    allowedRoles: ['sales', 'tester', 'admin'],
  },
  'profile-layout': {
    active: true,
    allowedRoles: ['guest', 'subscriber', 'tester', 'sales', 'admin'],
  },
};

export function getExperiment(id) {
  return AB_EXPERIMENTS.find((e) => e.id === id) ?? null;
}
