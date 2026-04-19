import React from 'react';
import {
  Heart,
  Filter,
  FileText,
  Clock,
  Type,
  Zap,
  Hand,
  ArrowLeftRight,
  SlidersHorizontal,
  Quote,
  Volume2,
  BookOpen,
  Image,
  User,
  CircleHelp,
  Mic,
  Ban,
  Search,
  Folder,
  LayoutGrid,
  Contrast,
  ClockFading,
  Bug,
  Crosshair,
  FlameKindling,
  Lock,
  FlaskConical,
  Beaker,
  BadgeCheck,
  DoorClosed,
  Sparkles,
  BellRing,
  Tag,
  Ticket,
  Gift,
  Megaphone,
  LineChart,
  CreditCard,
  Palette,
  SunMoon,
} from 'lucide-react';
import {
  FEATURE_REGISTRY_DATA,
  RELEASE_STATUSES,
  TOGGLEABLE_KINDS,
  getFlagConfig,
  getDefaultRoleFeatures,
  getFeaturesByStatus,
} from './featureRegistryData';

/**
 * View wrapper around the pure-data registry in ./featureRegistryData.
 *
 * Serverless code (Vercel Flags Explorer endpoint) imports the data module
 * directly to avoid pulling in React/JSX. This file re-attaches lucide-react
 * icons so React callers keep the same shape they had before the split.
 */

export { RELEASE_STATUSES, TOGGLEABLE_KINDS, getFlagConfig, getDefaultRoleFeatures, getFeaturesByStatus };

const makeIcon = (IconComponent) => () =>
  <IconComponent size={20} strokeWidth={1.75} />;

const ICONS = {
  'favorites': makeIcon(Heart),
  'favorites-only-toggle': makeIcon(Filter),
  'word-count': makeIcon(FileText),
  'reading-duration': makeIcon(Clock),
  'font-size-controls': makeIcon(Type),
  'pinch-font-size': makeIcon(Type),
  'eink-flash': makeIcon(Zap),
  'tap-zones': makeIcon(Hand),
  'tap-middle-toggle': makeIcon(Hand),
  'adaption-switcher': makeIcon(ArrowLeftRight),
  'typography-panel': makeIcon(SlidersHorizontal),
  'subscriber-fonts': makeIcon(Type),
  'attribution': makeIcon(Quote),
  'audio-player': makeIcon(Volume2),
  'high-contrast-theme': makeIcon(Contrast),
  'story-directories': makeIcon(Folder),
  'theme': makeIcon(Palette),
  'theme-toggle': makeIcon(SunMoon),
  'speed-reader': makeIcon(ClockFading),
  'speedreader-orp': makeIcon(Crosshair),
  'word-blacklist': makeIcon(Ban),
  'deep-search': makeIcon(Search),
  'simplified-ui': makeIcon(LayoutGrid),
  'text-to-speech': makeIcon(Mic),
  'big-fonts': makeIcon(Type),
  'app-animation': makeIcon(Lock),
  'ab-testing': makeIcon(Beaker),
  'tier-badge': makeIcon(BadgeCheck),
  'paywall': makeIcon(DoorClosed),
  'upgrade-cta': makeIcon(Sparkles),
  'trial-banner': makeIcon(BellRing),
  'pricing-page': makeIcon(Tag),
  'promo-code': makeIcon(Ticket),
  'referral-program': makeIcon(Gift),
  'sales-mode': makeIcon(Megaphone),
  'conversion-analytics': makeIcon(LineChart),
  'billing-portal-stub': makeIcon(CreditCard),
  'read-along': makeIcon(BookOpen),
  'illustrations': makeIcon(Image),
  'child-profile': makeIcon(User),
  'story-quiz': makeIcon(CircleHelp),
  'voice-control': makeIcon(Mic),
  'voice-resume': makeIcon(Mic),
  'voice-navigation': makeIcon(Mic),
  'voice-reading-control': makeIcon(Mic),
  'voice-discovery': makeIcon(Mic),
  'voice-hands-free': makeIcon(Mic),
  'debug-badges': makeIcon(Bug),
  'error-page-simulator': makeIcon(FlameKindling),
  'ab-testing-admin': makeIcon(FlaskConical),
  'hero-tagline': null,
};

export const FEATURE_REGISTRY = FEATURE_REGISTRY_DATA.map((entry) => ({
  ...entry,
  Icon: ICONS[entry.key] ?? null,
}));

const REGISTRY_MAP = Object.freeze(
  Object.fromEntries(FEATURE_REGISTRY.map((e) => [e.key, e])),
);

export function getRegistryMap() {
  return REGISTRY_MAP;
}

/**
 * FEATURES — profile-visible subset used by the toggle UI and docs views.
 * Excludes hidden infra/variant flags (theme, theme-toggle, big-fonts,
 * hero-tagline) which are toggled elsewhere or not user-facing.
 */
export const FEATURES = FEATURE_REGISTRY.filter((e) => !e.hidden);
