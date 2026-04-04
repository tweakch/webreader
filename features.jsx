import React from 'react';

export const FEATURES = [
  {
    key: 'favorites',
    label: 'Favoriten',
    description: 'Märchen mit einem Herz markieren und als Favoriten speichern.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    key: 'favorites-only-toggle',
    label: 'Nur Favoriten anzeigen',
    description: 'Schalter in der Seitenleiste, um die Liste auf gespeicherte Favoriten einzuschränken.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        <circle cx="17.5" cy="18.5" r="2.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'word-count',
    label: 'Wörteranzahl',
    description: 'Zeigt die Anzahl der Wörter eines Märchens in der Seitenleiste an.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    key: 'reading-duration',
    label: 'Lesezeit',
    description: 'Schätzt die Lesezeit basierend auf 200 Wörtern pro Minute und zeigt sie als „~X min" an.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    key: 'font-size-controls',
    label: 'Schriftgrößen-Steuerung',
    description: 'Plus- und Minus-Schaltflächen in der Kopfzeile zum Anpassen der Schriftgröße.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="12" y1="4" x2="12" y2="20" />
        <line x1="9" y1="20" x2="15" y2="20" />
      </svg>
    ),
  },
  {
    key: 'eink-flash',
    label: 'Seitenumblättern-Effekt',
    description: 'Kurzer Aufblitz beim Blättern — nachempfunden dem Bildschirm eines E-Ink-Lesegeräts.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    key: 'tap-zones',
    label: 'Tipp-Zonen',
    description: 'Unsichtbare Bereiche links und rechts auf der Seite zum Blättern per Fingertipp oder Klick.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11V6a2 2 0 0 1 4 0v5" />
        <path d="M13 11V8a2 2 0 0 1 4 0v3" />
        <path d="M5 11V9a2 2 0 0 1 4 0v2" />
        <path d="M17 11a2 2 0 0 1 4 0v3a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-1a2 2 0 0 1 2-2h12z" />
      </svg>
    ),
  },
  {
    key: 'adaption-switcher',
    label: 'Varianten',
    description: 'Dropdown zum Wechseln zwischen der Originalfassung und alternativen Versionen eines Märchens.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="7" height="9" rx="1" />
        <rect x="13" y="12" width="7" height="9" rx="1" />
        <path d="M11 7.5h2.5a1 1 0 0 1 1 1V12" />
        <path d="M13 16.5h-2.5a1 1 0 0 1-1-1V12" />
        <polyline points="11.5 5.5 13 7.5 11.5 9.5" />
        <polyline points="12.5 14.5 11 16.5 12.5 18.5" />
      </svg>
    ),
  },
  {
    key: 'typography-panel',
    label: 'Typografie-Panel',
    description: 'Einstellbereich für Zeilenhöhe, Textbreite, Zeichenabstand und Schriftart.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6" />
        <circle cx="18" cy="6" r="2" fill="currentColor" stroke="none" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <circle cx="8" cy="12" r="2" fill="currentColor" stroke="none" />
        <line x1="4" y1="18" x2="20" y2="18" />
        <circle cx="14" cy="18" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'attribution',
    label: 'Quellenangabe',
    description: 'Zeigt auf der letzten Seite eines Märchens den Autorennamen als Quellenangabe.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
      </svg>
    ),
  },
  {
    key: 'audio-player',
    label: 'Audio-Player',
    description: 'Zeigt einen eingebetteten Audioplayer an, wenn zum Märchen eine Audiodatei vorhanden ist.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    ),
  },
  // Gen Alpha
  {
    key: 'read-along',
    label: 'Vorlesen mit Markierung',
    description: 'Liest den Text vor und markiert dabei das aktuelle Wort — ideal für Kinder beim Lesenlernen.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        <rect x="14" y="8" width="4" height="2" rx="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'illustrations',
    label: 'Illustrationen',
    description: 'Zeigt zum Märchen passende Illustrationen an, sofern vorhanden.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    key: 'child-profile',
    label: 'Kinderprofil',
    description: 'Separates Leseprofil für Kinder mit vereinfachter Oberfläche und altersgerechten Einstellungen.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="9" r="4" />
        <path d="M2 21c0-3.9 3.6-7 8-7" />
        <polygon points="18 2 19.3 6 23.5 6 20 8.7 21.3 12.8 18 10.1 14.7 12.8 16 8.7 12.5 6 16.7 6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'story-quiz',
    label: 'Geschichten-Quiz',
    description: 'Einfache Verständnisfragen am Ende eines Märchens — macht das Lesen interaktiv für Kinder.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  // Boomers
  {
    key: 'text-to-speech',
    label: 'Text-zu-Sprache',
    description: 'Liest den Märchentext mit synthetischer Stimme vor — unabhängig von einer aufgenommenen Audiodatei.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    key: 'simplified-ui',
    label: 'Vereinfachte Ansicht',
    description: 'Blendet erweiterte Einstellungen aus und vergrößert Schaltflächen — für eine übersichtlichere, zugänglichere Bedienung.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="7" y1="9" x2="17" y2="9" />
        <line x1="7" y1="15" x2="17" y2="15" />
      </svg>
    ),
  },
  // status: Umgesetzt
  {
    key: 'high-contrast-theme',
    label: 'Hochkontrast-Thema',
    description: 'Fügt dem Themenkreis einen Hochkontrastmodus hinzu — schwarzer Hintergrund mit weißem Text und weißen Rändern für maximale Lesbarkeit.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'speed-reader',
    label: 'Schnellleser',
    description: 'Zeigt Wörter einzeln nacheinander in hoher Geschwindigkeit an — zum Training oder für schnelles Erfassen langer Texte.',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="12" x2="15" y2="10" />
        <path d="M5 3.5A9.97 9.97 0 0 1 12 2c2.76 0 5.26 1.12 7.07 2.93" strokeLinecap="round" />
        <path d="M3.5 5A9.97 9.97 0 0 0 2 12" strokeLinecap="round" />
      </svg>
    ),
  },
];
