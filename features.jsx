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
} from 'lucide-react';

export const FEATURES = [
  {
    key: 'favorites',
    label: 'Favoriten',
    description: 'Märchen mit einem Herz markieren und als Favoriten speichern.',
    Icon: () => <Heart size={20} strokeWidth={1.75} />,
  },
  {
    key: 'favorites-only-toggle',
    label: 'Nur Favoriten anzeigen',
    description: 'Schalter in der Seitenleiste, um die Liste auf gespeicherte Favoriten einzuschränken.',
    Icon: () => <Filter size={20} strokeWidth={1.75} />,
  },
  {
    key: 'word-count',
    label: 'Wörteranzahl',
    description: 'Zeigt die Anzahl der Wörter eines Märchens in der Seitenleiste an.',
    Icon: () => <FileText size={20} strokeWidth={1.75} />,
  },
  {
    key: 'reading-duration',
    label: 'Lesezeit',
    description: 'Schätzt die Lesezeit basierend auf 200 Wörtern pro Minute und zeigt sie als „~X min" an.',
    Icon: () => <Clock size={20} strokeWidth={1.75} />,
  },
  {
    key: 'font-size-controls',
    label: 'Schriftgrößen-Steuerung',
    description: 'Plus- und Minus-Schaltflächen in der Kopfzeile zum Anpassen der Schriftgröße.',
    Icon: () => <Type size={20} strokeWidth={1.75} />,
  },
  {
    key: 'pinch-font-size',
    label: 'Pinch-Zoom Schriftgröße',
    description: 'Passt die Schriftgröße per Zwei-Finger-Pinch-Geste im Lesebereich an.',
    Icon: () => <Type size={20} strokeWidth={1.75} />,
  },
  {
    key: 'eink-flash',
    label: 'Seitenumblättern-Effekt',
    description: 'Kurzer Aufblitz beim Blättern - nachempfunden dem Bildschirm eines E-Ink-Lesegeräts.',
    Icon: () => <Zap size={20} strokeWidth={1.75} />,
  },
  {
    key: 'tap-zones',
    label: 'Tipp-Zonen',
    description: 'Unsichtbare Bereiche links und rechts auf der Seite zum Blättern per Fingertipp oder Klick.',
    Icon: () => <Hand size={20} strokeWidth={1.75} />,
  },
  {
    key: 'tap-middle-toggle',
    label: 'Mittige Tipp-Zone zum Ausblenden',
    description: 'Tippen auf die Mitte der Seite blendet die Kopf- und Fußzeile aus (setzt „Tipp-Zonen" voraus).',
    Icon: () => <Hand size={20} strokeWidth={1.75} />,
  },
  {
    key: 'adaption-switcher',
    label: 'Varianten',
    description: 'Dropdown zum Wechseln zwischen der Originalfassung und alternativen Versionen eines Märchens.',
    Icon: () => <ArrowLeftRight size={20} strokeWidth={1.75} />,
  },
  {
    key: 'typography-panel',
    label: 'Typografie-Panel',
    description: 'Einstellbereich für Zeilenhöhe, Textbreite, Zeichenabstand und Schriftart.',
    Icon: () => <SlidersHorizontal size={20} strokeWidth={1.75} />,
  },
  {
    key: 'subscriber-fonts',
    label: 'Erweiterte Schriftarten',
    description: 'Erweitert das Typografie-Panel mit mehr Schriften pro Familie (Serif, Sans, Kursiv) und fügt eine neue Mono-Familie hinzu.',
    Icon: () => <Type size={20} strokeWidth={1.75} />,
  },
  {
    key: 'attribution',
    label: 'Quellenangabe',
    description: 'Zeigt auf der letzten Seite eines Märchens den Autorennamen als Quellenangabe.',
    Icon: () => <Quote size={20} strokeWidth={1.75} />,
  },
  {
    key: 'audio-player',
    label: 'Audio-Player',
    description: 'Zeigt einen eingebetteten Audioplayer an, wenn zum Märchen eine Audiodatei vorhanden ist.',
    Icon: () => <Volume2 size={20} strokeWidth={1.75} />,
  },
  // Gen Alpha
  {
    key: 'read-along',
    label: 'Vorlesen mit Markierung',
    description: 'Liest den Text vor und markiert dabei das aktuelle Wort - ideal für Kinder beim Lesenlernen.',
    Icon: () => <BookOpen size={20} strokeWidth={1.75} />,
  },
  {
    key: 'illustrations',
    label: 'Illustrationen',
    description: 'Zeigt zum Märchen passende Illustrationen an, sofern vorhanden.',
    Icon: () => <Image size={20} strokeWidth={1.75} />,
  },
  {
    key: 'child-profile',
    label: 'Kinderprofil',
    description: 'Separates Leseprofil für Kinder mit vereinfachter Oberfläche und altersgerechten Einstellungen.',
    Icon: () => <User size={20} strokeWidth={1.75} />,
  },
  {
    key: 'story-quiz',
    label: 'Geschichten-Quiz',
    description: 'Einfache Verständnisfragen am Ende eines Märchens - macht das Lesen interaktiv für Kinder.',
    Icon: () => <CircleHelp size={20} strokeWidth={1.75} />,
  },
  // Boomers
  {
    key: 'text-to-speech',
    label: 'Text-zu-Sprache',
    description: 'Liest den Märchentext mit synthetischer Stimme vor - unabhängig von einer aufgenommenen Audiodatei.',
    Icon: () => <Mic size={20} strokeWidth={1.75} />,
  },
  // Voice control epic
  {
    key: 'voice-control',
    label: 'Sprachsteuerung',
    description: 'Grundlage für alle Sprachbefehle - Mikrofon-Knopf, Push-to-talk und Transkript-Anzeige.',
    Icon: () => <Mic size={20} strokeWidth={1.75} />,
  },
  {
    key: 'voice-resume',
    label: 'Sprachbefehl: Weiterlesen',
    description: 'Öffnet per Sprachbefehl („Weiterlesen", „Continue") das zuletzt gelesene Märchen auf der zuletzt gelesenen Seite.',
    Icon: () => <Mic size={20} strokeWidth={1.75} />,
  },
  {
    key: 'voice-navigation',
    label: 'Sprachbefehl: Navigation',
    description: 'Öffnet Geschichten nach Titel, blättert Seiten vor und zurück und kehrt zur Übersicht zurück - alles per Sprache.',
    Icon: () => <Mic size={20} strokeWidth={1.75} />,
  },
  {
    key: 'voice-reading-control',
    label: 'Sprachbefehl: Vorlesen',
    description: 'Startet, pausiert und beschleunigt das Vorlesen per Sprache (benötigt Text-zu-Sprache).',
    Icon: () => <Mic size={20} strokeWidth={1.75} />,
  },
  {
    key: 'voice-discovery',
    label: 'Sprachbefehl: Entdecken',
    description: 'Findet Geschichten nach Schlagwort oder wählt eine Überraschung per Sprachbefehl.',
    Icon: () => <Mic size={20} strokeWidth={1.75} />,
  },
  {
    key: 'voice-hands-free',
    label: 'Sprachbefehl: Hände frei',
    description: 'Durchgehendes Zuhören statt Push-to-talk - für Barrierefreiheit und Vorlesen ohne Eingreifen.',
    Icon: () => <Mic size={20} strokeWidth={1.75} />,
  },
  {
    key: 'word-blacklist',
    label: 'Wort-Blacklist',
    description: 'Wörter eintragen, die du nicht lesen möchtest - Märchen mit diesen Wörtern werden in der Seitenleiste ausgeblendet.',
    Icon: () => <Ban size={20} strokeWidth={1.75} />,
  },
  {
    key: 'deep-search',
    label: 'Tiefensuche',
    description: 'Erweitert die Suche von Titeln auf den vollständigen Märchentext (langsamer bei großen Bibliotheken).',
    Icon: () => <Search size={20} strokeWidth={1.75} />,
  },
  // status: Umgesetzt
  {
    key: 'story-directories',
    label: 'Verzeichnisstruktur',
    description: 'Zeigt Geschichten in ihrer Ordnerstruktur an - für Quellen mit regionalen oder thematischen Unterordnern.',
    Icon: () => <Folder size={20} strokeWidth={1.75} />,
  },
  {
    key: 'simplified-ui',
    label: 'Vereinfachte Ansicht',
    description: 'Blendet erweiterte Einstellungen aus und vergrößert Schaltflächen - für eine übersichtlichere, zugänglichere Bedienung.',
    Icon: () => <LayoutGrid size={20} strokeWidth={1.75} />,
  },
  // status: Umgesetzt
  {
    key: 'high-contrast-theme',
    label: 'Hochkontrast-Thema',
    description: 'Fügt dem Themenkreis einen Hochkontrastmodus hinzu - schwarzer Hintergrund mit weißem Text und weißen Rändern für maximale Lesbarkeit.',
    Icon: () => <Contrast size={20} strokeWidth={1.75} />,
  },
  {
    key: 'speed-reader',
    label: 'Schnellleser',
    description: 'Zeigt Wörter einzeln nacheinander in hoher Geschwindigkeit an - zum Training oder für schnelles Erfassen langer Texte.',
    Icon: () => <ClockFading size={20} strokeWidth={1.75} />,
  },
  {
    key: 'debug-badges',
    label: 'Debug-Badges',
    description: 'Zeigt auf jeder Komponente ein Badge mit dem technischen Namen an - für Tester, damit sie immer den richtigen data-testid-Namen kennen.',
    Icon: () => <Bug size={20} strokeWidth={1.75} />,
  },
  {
    key: 'error-page-simulator',
    label: 'Fehlerseiten-Simulator',
    description: 'Zeigt im Profil-Panel Schaltflächen zum absichtlichen Auslösen von 404- und 500-Fehlerseiten.',
    Icon: () => <FlameKindling size={20} strokeWidth={1.75} />,
  },
  // status: Umgesetzt
  {
    key: 'speedreader-orp',
    label: 'ORP-Lesemarke',
    description: 'Hebt den optimalen Erkennungspunkt eines Worts farblich hervor und richtet ihn am Fixationspunkt aus - mit konfigurierbaren Führungslinien.',
    Icon: () => <Crosshair size={20} strokeWidth={1.75} />,
  },
  {
    key: 'app-animation',
    label: 'App-Animation',
    description: 'Einführungs- und Abschluss-Animation mit „Swipe to Unlock" und „Swipe to Close".',
    Icon: () => <Lock size={20} strokeWidth={1.75} />,
  },
  {
    key: 'ab-testing',
    label: 'UI-Varianten (A/B)',
    description: 'Ermöglicht das Wechseln zwischen Original- und Testvarianten der Oberfläche im Profil.',
    Icon: () => <Beaker size={20} strokeWidth={1.75} />,
  },
  {
    key: 'ab-testing-admin',
    label: 'A/B-Verwaltung',
    description: 'Admin-Werkzeug zum Aktivieren, Deaktivieren und Zuteilen von UI-Varianten an Rollen.',
    Icon: () => <FlaskConical size={20} strokeWidth={1.75} />,
  },
  // Commerce / Sales
  {
    key: 'tier-badge',
    label: 'Tarif-Abzeichen',
    description: 'Zeigt das aktuelle Abo (Free, Plus, Pro, Family, Edu) im Profil-Panel an.',
    Icon: () => <BadgeCheck size={20} strokeWidth={1.75} />,
  },
  {
    key: 'paywall',
    label: 'Zahlschranke',
    description: 'Zeigt eine Zahlschranke vor kostenpflichtigen Features - Varianten: Hard-Gate, Soft-Gate, Teaser.',
    Icon: () => <DoorClosed size={20} strokeWidth={1.75} />,
  },
  {
    key: 'upgrade-cta',
    label: 'Upgrade-Hinweis',
    description: 'Kontextabhängiger Hinweis zum Upgrade auf den nächsthöheren Tarif.',
    Icon: () => <Sparkles size={20} strokeWidth={1.75} />,
  },
  {
    key: 'trial-banner',
    label: 'Testzeitraum-Banner',
    description: 'Banner, der einen 7-, 14- oder 30-tägigen Testzeitraum startet und den verbleibenden Zeitraum anzeigt.',
    Icon: () => <BellRing size={20} strokeWidth={1.75} />,
  },
  {
    key: 'pricing-page',
    label: 'Preisseite',
    description: 'Dedizierte Preisseite mit Tarif-Vergleich - Layout-Varianten: 3-Tarife, 4-Tarife, interaktiver Slider.',
    Icon: () => <Tag size={20} strokeWidth={1.75} />,
  },
  {
    key: 'promo-code',
    label: 'Promo-Code',
    description: 'Promo-Code-Eingabe fuer Endnutzer; Sales und Admin koennen Codes erzeugen.',
    Icon: () => <Ticket size={20} strokeWidth={1.75} />,
  },
  {
    key: 'referral-program',
    label: 'Empfehlungsprogramm',
    description: 'Persoenlicher Empfehlungslink - Freund erhaelt 30 Tage gratis, Empfehler einen Gratismonat.',
    Icon: () => <Gift size={20} strokeWidth={1.75} />,
  },
  {
    key: 'sales-mode',
    label: 'Vertriebs-Modus',
    description: 'Demo-Overlay fuer die Sales-Rolle - schaltet simulierte Tarife fuer Live-Praesentationen um.',
    Icon: () => <Megaphone size={20} strokeWidth={1.75} />,
  },
  {
    key: 'conversion-analytics',
    label: 'Conversion-Analyse',
    description: 'Einblendung des aktuellen Funnel-Schritts, der Paywall-Variante und des A/B-Variant-Zustands.',
    Icon: () => <LineChart size={20} strokeWidth={1.75} />,
  },
  {
    key: 'billing-portal-stub',
    label: 'Abrechnungs-Portal (Mock)',
    description: 'Gemocktes Abrechnungs-Portal fuer Demos - keine echte Zahlungsabwicklung.',
    Icon: () => <CreditCard size={20} strokeWidth={1.75} />,
  },
];

// =============================================================================
// FEATURE GAPS — registry audit
// =============================================================================
// The features below are documented in docs/features/ but NOT yet registered
// here. Each CTC describes what to add to ship the feature end-to-end.
//
// CTC convention:
//   - "CTC:" marks a Call-To-Claude action item.
//   - Once the feature is implemented (FEATURES entry + flag in flags.json +
//     wiring at the listed anchor file), DELETE the corresponding CTC block.
//   - The matching anchor-site CTC comments in the integration files must be
//     removed in the same change. Search for "CTC:" across the repo.
//
// Sorted by implementation readiness (MVP first, then near-term).
//
// --- MVP -------------------------------------------------------------------
//
// CTC: Implement `age-filter` — see docs/features/age-filter.md
//   Add a FEATURES entry (Icon: Filter or BabyIcon), add a `age-filter` flag
//   to flags.json, store age range in localStorage, and filter the story
//   index in grimm-reader.jsx (anchor CTC in components/Sidebar.jsx).
// TODO(CTC): remove this block once `age-filter` is registered above.
//
// CTC: Implement `bedtime-mode` — see docs/features/bedtime-mode.md
//   Add a FEATURES entry (Icon: Moon), add a `bedtime-mode` flag, expose a
//   nav-bar toggle that dims the screen, picks a curated story queue, and
//   stops audio at session end. Pairs with sleep-timer.
// TODO(CTC): remove this block once `bedtime-mode` is registered above.
//
// CTC: Implement `sleep-timer` — see docs/features/sleep-timer.md
//   Add a FEATURES entry (Icon: TimerOff), add a `sleep-timer` flag. Anchor
//   CTC lives in ui/AudioPlayer.jsx where the fade-out hook into the audio
//   element belongs.
// TODO(CTC): remove this block once `sleep-timer` is registered above.
//
// --- Near-term -------------------------------------------------------------
//
// CTC: Implement `audio-narration` — see docs/features/audio-narration.md
//   Distinct from `audio-player` (which plays pre-recorded files): this is
//   full-story narration with optional AI character voices. Add FEATURES
//   entry (Icon: AudioLines), flag `audio-narration`, and a narration source
//   field on stories.
// TODO(CTC): remove this block once `audio-narration` is registered above.
//
// CTC: Implement `achievements` — see docs/features/achievements.md
//   Streaks, breadth, depth, discovery, completion badges. Add FEATURES
//   entry (Icon: Trophy), flag `achievements`, and a stats slot in the
//   profile panel (anchor CTC in components/ProfilePanel.jsx near the stats
//   block).
// TODO(CTC): remove this block once `achievements` is registered above.
//
// CTC: Implement `cultural-annotations` — see docs/features/cultural-annotations.md
//   Inline footnotes for idioms, history, regional context. Add FEATURES
//   entry (Icon: Languages), flag `cultural-annotations`, render annotation
//   spans in components/ReaderView.jsx.
// TODO(CTC): remove this block once `cultural-annotations` is registered above.
//
// CTC: Implement `discussion-questions` — see docs/features/discussion-questions.md
//   Socratic prompts after the last page. Add FEATURES entry (Icon:
//   MessageCircleQuestion), flag `discussion-questions`, store prompts in a
//   `questions.json` per story; render after the attribution slot.
// TODO(CTC): remove this block once `discussion-questions` is registered above.
//
// CTC: Implement `journaling-prompts` — see docs/features/journaling-prompts.md
//   Personal reflection prompts. Reuse the discussion-questions storage
//   (type: journal) and add an in-app text area persisted in localStorage.
//   Add FEATURES entry (Icon: NotebookPen), flag `journaling-prompts`.
// TODO(CTC): remove this block once `journaling-prompts` is registered above.
//
// CTC: Implement `parallel-texts` — see docs/features/parallel-texts.md
//   Two-column source/target reading. Add FEATURES entry (Icon: Columns2),
//   flag `parallel-texts`, requires `content.<lang>.md` files. Reader must
//   call `buildPages` per column with shared height constraints.
// TODO(CTC): remove this block once `parallel-texts` is registered above.
//
// --- Vision (do not implement yet — listed for awareness) -----------------
// choice-narratives, mood-recommendations, story-map, story-remix,
// symbol-analysis, word-highlighting, story-api — see docs/features/.
// =============================================================================
