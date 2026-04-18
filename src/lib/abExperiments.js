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
    id: 'profile-access',
    label: 'Profil-Zugang',
    description: 'Wo der Zugang zum Profil auf Mobilgeräten platziert ist.',
    defaultVariant: 'fab',
    variants: [
      { id: 'fab',         label: 'FAB-Button',    description: 'Floating-Button unten rechts auf Mobile/Tablet (bisheriges Verhalten).' },
      { id: 'sidebar-top', label: 'Seitenleiste oben', description: 'Profil-Schaltfläche oben in der Seitenleiste, ohne FAB.' },
    ],
  },
];

export const AB_DEFAULT_CONFIG = {
  sidebar: {
    active: true,
    allowedRoles: ['tester', 'admin'],
  },
  'profile-access': {
    active: true,
    allowedRoles: ['tester', 'admin'],
  },
};

export function getExperiment(id) {
  return AB_EXPERIMENTS.find((e) => e.id === id) ?? null;
}
