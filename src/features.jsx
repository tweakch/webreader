/**
 * Feature Registry & Documentation
 *
 * This file documents all feature flags with their lifecycle status and use cases.
 * Reference: .claude/feature-flags.instructions.md
 *
 * Lifecycle:
 * - EXPERIMENT: newly launched, testing with users
 * - ROLLOUT: gradually rolling out to all users
 * - STABLE: fully rolled out, considered core
 * - DEPRECATE: scheduled for removal, migration needed
 */

export const featureRegistry = {
  // Reader Core Features
  'favorites': {
    status: 'STABLE',
    category: 'reader-core',
    description: 'Save and manage favorite stories',
  },
  'favorites-only-toggle': {
    status: 'STABLE',
    category: 'reader-core',
    description: 'Toggle to view only favorited stories',
  },
  'word-count': {
    status: 'STABLE',
    category: 'reader-stats',
    description: 'Display word count in story metadata',
  },
  'reading-duration': {
    status: 'STABLE',
    category: 'reader-stats',
    description: 'Display estimated reading duration',
  },

  // Reader UI & Controls
  'font-size-controls': {
    status: 'STABLE',
    category: 'reader-ui',
    description: 'Font size increase/decrease buttons in navbar',
  },
  'pinch-font-size': {
    status: 'EXPERIMENT',
    category: 'reader-ui',
    description: 'Pinch-to-zoom font size on mobile',
  },
  'eink-flash': {
    status: 'STABLE',
    category: 'reader-ui',
    description: 'Flash page transitions for e-ink displays',
  },
  'tap-zones': {
    status: 'STABLE',
    category: 'reader-ui',
    description: 'Left/right tap zones for page navigation',
  },
  'tap-middle-toggle': {
    status: 'STABLE',
    category: 'reader-ui',
    description: 'Tap middle zone to toggle UI',
  },

  // Theme & Appearance
  'theme': {
    status: 'STABLE',
    category: 'appearance',
    description: 'Theme selection (light, dark, system, light-hc, dark-hc)',
  },
  'theme-toggle': {
    status: 'STABLE',
    category: 'appearance',
    description: 'Theme toggle button in navbar',
  },
  'high-contrast-theme': {
    status: 'STABLE',
    category: 'appearance',
    description: 'High contrast theme variant',
  },
  'big-fonts': {
    status: 'EXPERIMENT',
    category: 'appearance',
    description: 'Big font size variants (off, big, bigger, biggest)',
  },

  // Typography & Adaptation
  'adaption-switcher': {
    status: 'STABLE',
    category: 'typography',
    description: 'Reader adaptation mode switcher',
  },
  'typography-panel': {
    status: 'STABLE',
    category: 'typography',
    description: 'Typography panel with font and spacing controls',
  },
  'subscriber-fonts': {
    status: 'EXPERIMENT',
    category: 'typography',
    description: 'Extended font library: more fonts per family (serif, sans, cursive) plus mono family',
  },

  // Search & Navigation
  'deep-search': {
    status: 'EXPERIMENT',
    category: 'search',
    description: 'Full-text search across all stories',
  },
  'story-directories': {
    status: 'EXPERIMENT',
    category: 'navigation',
    description: 'Multi-level directory support (source → directory → story)',
  },

  // Advanced Reader Features
  'speed-reader': {
    status: 'EXPERIMENT',
    category: 'advanced-reading',
    description: 'RSVP (Rapid Serial Visual Presentation) speed reading mode',
  },
  'speedreader-orp': {
    status: 'EXPERIMENT',
    category: 'advanced-reading',
    description: 'ORP (Optimal Recognition Point) enhancement for speed reader',
  },
  'audio-player': {
    status: 'EXPERIMENT',
    category: 'advanced-reading',
    description: 'Audio narration playback',
  },

  // Text Processing
  'word-blacklist': {
    status: 'EXPERIMENT',
    category: 'text-processing',
    description: 'Filter words by custom blacklist',
  },

  // UI & Attribution
  'attribution': {
    status: 'STABLE',
    category: 'ui',
    description: 'Display source attribution in reader footer',
  },

  // Debug & Development
  'debug-badges': {
    status: 'EXPERIMENT',
    category: 'debug',
    description: 'Show data-testid badges on UI elements',
  },

  // Marketing & Landing Pages
  'hero-tagline': {
    status: 'EXPERIMENT',
    category: 'marketing',
    description: 'Toggle hero tagline visibility on different viewports',
  },
};

/**
 * Get feature by key
 */
export function getFeature(key) {
  return featureRegistry[key];
}

/**
 * Get features by status
 */
export function getFeaturesByStatus(status) {
  return Object.entries(featureRegistry).filter(
    ([, feature]) => feature.status === status
  );
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(category) {
  return Object.entries(featureRegistry).filter(
    ([, feature]) => feature.category === category
  );
}
