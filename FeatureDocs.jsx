import React, { useEffect, useRef } from 'react';
import { ChevronLeft, BookOpen } from 'lucide-react';
import { FEATURES } from './features';

// ── Detailed German documentation for each feature ──────────────────────────

const DOCS = {
  'favorites': {
    lead: 'Die Favoriten-Funktion ermöglicht es, Märchen mit einem Herzklick als persönliche Favoriten zu markieren und dauerhaft zu speichern.',
    on: [
      'Neben jedem Märchentitel in der Seitenleiste erscheint ein Herz-Symbol.',
      'Ein Klick oder Tipp auf das Herz speichert das Märchen als Favorit — das Herz färbt sich und bleibt markiert.',
      'Favoriten werden im Browser gespeichert (localStorage) und stehen auch nach dem Schließen und erneuten Öffnen der App zur Verfügung.',
      'Im Profil wird die Gesamtanzahl der gespeicherten Favoriten angezeigt.',
      'Favorisierte Märchen lassen sich optional über die Funktion „Nur Favoriten anzeigen" gefiltert aufrufen.',
    ],
    off: [
      'Das Herz-Symbol wird in der Seitenleiste vollständig ausgeblendet.',
      'Es ist nicht möglich, neue Favoriten hinzuzufügen oder bestehende zu entfernen.',
      'Bereits gespeicherte Favoriten bleiben im Hintergrund erhalten — sie gehen nicht verloren.',
      'Wird die Funktion wieder eingeschaltet, sind alle vorherigen Favoriten sofort wieder sichtbar und aktiv.',
    ],
  },

  'favorites-only-toggle': {
    lead: 'Der Favoriten-Filter blendet in der Seitenleiste alle nicht markierten Märchen aus und zeigt nur noch die eigene Favoritenliste.',
    on: [
      'In der Suchleiste der Seitenleiste erscheint ein Herz-Schaltknopf.',
      'Ist der Schalter aktiv (Herz ausgefüllt), zeigt die Seitenleiste ausschließlich als Favorit markierte Märchen.',
      'Ist der Schalter inaktiv, werden wie gewohnt alle Märchen angezeigt.',
      'Der Filterzustand wird beim Wechseln von Quellen oder beim Schließen der App nicht gespeichert — er beginnt immer im inaktiven Zustand.',
    ],
    off: [
      'Der Herz-Schaltknopf in der Suchleiste ist nicht sichtbar.',
      'Die Seitenleiste zeigt stets alle verfügbaren Märchen an.',
    ],
    tip: 'Diese Funktion ist nur sinnvoll, wenn auch „Favoriten" eingeschaltet ist. Ohne gespeicherte Favoriten würde der Filter eine leere Liste anzeigen.',
  },

  'word-count': {
    lead: 'Die Wörteranzahl zeigt direkt in der Seitenleiste an, wie viele Wörter ein Märchen enthält — noch bevor man es aufschlägt.',
    on: [
      'Unterhalb jedes Märchentitels in der Seitenleiste erscheint die Wörteranzahl als kompakte Zahl (z. B. „2.341 Wörter").',
      'Die Zahl wird aus dem gecrawlten Textinhalt berechnet und im Frontmatter der Story-Datei gespeichert.',
      'Ist für ein Märchen keine Wörteranzahl bekannt (z. B. bei älteren Einträgen ohne Metadaten), wird kein Wert angezeigt.',
      'Die Anzeige ist rein informativ — sie hat keinen Einfluss auf die Sortierung oder Filterung.',
    ],
    off: [
      'Die Wörteranzahl wird in der Seitenleiste nicht angezeigt.',
      'Die gespeicherten Metadaten bleiben unverändert erhalten — die Information ist nur ausgeblendet.',
    ],
  },

  'reading-duration': {
    lead: 'Die Lesezeit gibt eine Schätzung aus, wie lange das Lesen eines Märchens dauert — praktisch zum Einschätzen, ob es für einen kurzen Lesemoment oder einen längeren Leseabend geeignet ist.',
    on: [
      'Neben dem Märchentitel in der Seitenleiste erscheint die geschätzte Lesezeit (z. B. „~12 min").',
      'Die Berechnung basiert auf einem Durchschnittswert von 200 Wörtern pro Minute — einem realistischen Wert für entspanntes, genussorientiertes Lesen.',
      'Die Lesezeit wird immer auf volle Minuten aufgerundet (Math.ceil), sodass auch sehr kurze Märchen mindestens „~1 min" anzeigen.',
      'Ist keine Wörteranzahl für ein Märchen bekannt, wird auch keine Lesezeit angezeigt.',
    ],
    off: [
      'Die Lesezeit-Anzeige ist in der Seitenleiste nicht sichtbar.',
      'Die zugrunde liegende Wörteranzahl bleibt gespeichert — nur die Darstellung ist deaktiviert.',
    ],
    tip: 'Wörteranzahl und Lesezeit können unabhängig voneinander aktiviert werden. Wer nur die Lesezeit sehen möchte, muss die Wörteranzahl nicht separat einschalten.',
  },

  'font-size-controls': {
    lead: 'Die Schriftgrößen-Steuerung fügt zwei Schaltflächen in die Kopfzeile ein, mit denen die Textgröße im Lesebereich jederzeit angepasst werden kann.',
    on: [
      'In der Kopfzeile erscheinen zwei Schaltknöpfe: „+" zum Vergrößern und „−" zum Verkleinern der Schrift.',
      'Die Schriftgröße lässt sich in Schritten von 2 Punkt anpassen — von 14 px (sehr kompakt) bis 28 px (groß und augenschonend).',
      'Die gewählte Einstellung wird im Browser gespeichert und beim nächsten Besuch automatisch wiederhergestellt.',
      'Schriftgröße und Typografie-Panel (Zeilenhöhe, Textbreite usw.) ergänzen sich und können gleichzeitig aktiv sein.',
    ],
    off: [
      'Die Plus- und Minus-Schaltflächen werden aus der Kopfzeile entfernt.',
      'Die zuletzt gewählte Schriftgröße bleibt weiterhin aktiv — sie kann nur nicht mehr über die App verändert werden.',
      'Der gespeicherte Wert bleibt erhalten; wird die Funktion erneut eingeschaltet, ist die zuletzt eingestellte Größe sofort wieder verfügbar.',
    ],
  },

  'eink-flash': {
    lead: 'Der Seitenumblättern-Effekt lässt den Bildschirm beim Blättern kurz aufleuchten — eine bewusste Anlehnung an das charakteristische Blinken eines E-Ink-Lesegeräts.',
    on: [
      'Beim Wechsel zur nächsten oder vorherigen Seite erscheint für ca. 80 Millisekunden ein kurzer heller (hell) bzw. dunkler (dunkel) Aufblitz über dem gesamten Lesebereich.',
      'Der Effekt dauert so kurz, dass er nicht störend wirkt — er gibt dem Seitenwechsel aber ein spürbares, vertrautes Feedback.',
      'Im Dunkelmodus ist der Aufblitz dunkel (Slate-Ton), im Hellmodus weiß, damit er zur jeweiligen Oberfläche passt.',
      'Der Effekt verhindert, dass während des Aufblitzens die nächste Seite vorzeitig bedient werden kann (kurze Eingabesperre).',
    ],
    off: [
      'Beim Blättern gibt es keinerlei visuellen Übergang — die neue Seite erscheint sofort und ohne Effekt.',
      'Für schnelles, ablenkungsfreies Lesen ohne jede Animation ist diese Einstellung empfehlenswert.',
    ],
  },

  'tap-zones': {
    lead: 'Tipp-Zonen verwandeln den gesamten Lesebereich in eine unsichtbare Blätter-Schnittstelle — passend für Touchscreens und Einhand-Bedienung.',
    on: [
      'Der Lesebereich ist horizontal in drei unsichtbare Zonen unterteilt: links (30 %), Mitte (40 %), rechts (30 %).',
      'Ein Klick oder Tipp in die linke Zone blättert zur vorherigen Seite.',
      'Ein Klick oder Tipp in die rechte Zone blättert zur nächsten Seite.',
      'Die mittlere Zone ist bewusst inaktiv — dort lässt sich Text markieren oder eine Pause einlegen, ohne versehentlich zu blättern.',
      'Die Zonen sind vollständig unsichtbar und verändern das Layout oder Aussehen des Lesebereichs nicht.',
    ],
    off: [
      'Die unsichtbaren Tipp-Zonen werden entfernt.',
      'Blättern ist dann ausschließlich über die Navigationspfeile in der unteren Leiste oder die Tastatur möglich (← → Pfeiltasten oder Leertaste für vorwärts).',
    ],
    tip: 'Auf Desktops mit Maus ist diese Funktion weniger relevant — wer hauptsächlich die Tastatur nutzt, kann sie ausschalten, ohne etwas zu verlieren.',
  },

  'adaption-switcher': {
    lead: 'Der Varianten-Schalter ermöglicht es, zwischen verschiedenen Fassungen desselben Märchens zu wechseln — zum Beispiel zwischen dem Original und einer humorvollen Parodie.',
    on: [
      'Wenn für ein geöffnetes Märchen alternative Fassungen vorliegen, erscheint über der unteren Navigationsleiste ein Auswahlmenü.',
      'Das Menü listet die verfügbaren Varianten mit ihrem jeweiligen Namen auf (z. B. „Original", „Parodie – Bruderchen und Schwesterchen").',
      'Beim Wechsel zu einer anderen Variante wird der Lesefortschritt zurückgesetzt — die neue Fassung beginnt auf Seite 1.',
      'Märchen ohne alternative Fassungen zeigen das Auswahlmenü nicht an — der Schalter bleibt in diesem Fall ohne sichtbare Wirkung.',
    ],
    off: [
      'Das Auswahlmenü wird vollständig ausgeblendet.',
      'Märchen werden immer in ihrer Standardfassung (der zuerst gecrawlten Version) angezeigt.',
      'Die Inhalte der alternativen Fassungen sind weiterhin vorhanden — nur der Zugang über die Oberfläche ist deaktiviert.',
    ],
  },

  'typography-panel': {
    lead: 'Das Typografie-Panel öffnet einen aufklappbaren Einstellbereich, in dem Zeilenhöhe, Textbreite, Zeichenabstand und Schriftart fein abgestimmt werden können.',
    on: [
      'Über der unteren Navigationsleiste erscheint eine Schaltfläche zum Ein- und Ausklappen des Typografie-Panels.',
      'Das Panel enthält vier Einstellgruppen, jeweils mit drei wählbaren Stufen:',
      'Zeilenhöhe: Eng (1,5×), Normal (1,8×), Weit (2,2×) — beeinflusst den Abstand zwischen den Zeilen und damit die Lesbarkeit bei unterschiedlichen Sehgewohnheiten.',
      'Textbreite: Schmal (max. 560 px), Mittel (max. 768 px), Breit (max. 1.200 px) — bestimmt, wie weit der Fließtext die Seitenbreite ausfüllt.',
      'Zeichenabstand: Normal, Locker (0,06 em), Weit (0,15 em) — vergrößert den Abstand zwischen Wörtern, was für manche Leser die Erkennbarkeit verbessert.',
      'Schriftart: Serif (Georgia), Sans-Serif (Systemschrift) oder Comic Sans — für persönliche Vorlieben oder verbesserte Lesbarkeit bei Legasthenie.',
      'Alle Einstellungen werden im Browser gespeichert und bei jedem Besuch automatisch wiederhergestellt.',
    ],
    off: [
      'Die Schaltfläche zum Öffnen des Panels und das Panel selbst werden ausgeblendet.',
      'Bereits vorgenommene Einstellungen (Zeilenhöhe, Textbreite usw.) bleiben weiterhin aktiv und gespeichert — nur die Möglichkeit zur Änderung ist verborgen.',
      'Die Einstellungen können erst wieder verändert werden, wenn das Panel erneut eingeschaltet wird.',
    ],
    tip: 'Comic Sans ist keine Spielerei: Für Menschen mit Legasthenie kann diese Schriftart die Lesbarkeit deutlich verbessern, da die Buchstaben weniger symmetrisch und dadurch leichter unterscheidbar sind.',
  },

  'attribution': {
    lead: 'Die Quellenangabe zeigt auf der letzten Seite eines Märchens kursiv den Namen der Autoren — als stilles Dankeschön an die Erzähler, die die Geschichten gesammelt und aufgeschrieben haben.',
    on: [
      'Auf der allerletzten Seite eines Märchens erscheint unterhalb des letzten Absatzes eine kursive Quellenangabe.',
      'Bei Grimm-Märchen lautet sie: „— Jacob und Wilhelm Grimm".',
      'Bei Andersen-Märchen erscheint: „— Hans Christian Andersen".',
      'Die Quellenangabe wird nur auf der letzten Seite eingeblendet — auf allen anderen Seiten bleibt sie verborgen.',
      'Sie ist Teil des paginierten Textflusses und beeinflusst die Seitenaufteilung (sie kann also dazu führen, dass der letzte Absatz auf eine neue Seite rutscht).',
    ],
    off: [
      'Keine Quellenangabe wird angezeigt — das Märchen endet mit dem letzten Satz des Textes.',
      'Die Seitenaufteilung wird nicht durch die Quellenangabe beeinflusst.',
    ],
  },

  'audio-player': {
    lead: 'Der Audio-Player blendet oberhalb der Navigationsleiste eine kompakte Abspielleiste ein, wenn zum geöffneten Märchen eine Audiodatei hinterlegt ist — etwa eine Vorlesung oder eine Vertonung.',
    on: [
      'Ist für das aktuell geöffnete Märchen eine Audiodatei vorhanden, erscheint über der Navigationsleiste ein schmaler Player-Streifen.',
      'Der Streifen enthält einen Fortschrittsbalken, der den aktuellen Abspielstand im Verhältnis zur Gesamtlänge anzeigt.',
      'Zwei Schaltflächen stehen zur Verfügung: Abspielen/Pausieren sowie Zurücksetzen (springt an den Anfang und hält an).',
      'Neben den Schaltflächen wird die verstrichene Zeit und — sobald die Metadaten geladen sind — die Gesamtdauer angezeigt.',
      'Beim Wechsel zu einem anderen Märchen wird der Player automatisch gestoppt und zurückgesetzt.',
      'Hat ein Märchen keine zugehörige Audiodatei, bleibt der Player-Streifen vollständig ausgeblendet — die Funktion ist eingeschaltet, aber unauffällig.',
    ],
    off: [
      'Der Player-Streifen wird nicht angezeigt, auch wenn für ein Märchen eine Audiodatei vorhanden ist.',
      'Die Audiodatei ist weiterhin im Build enthalten, wird aber nicht geladen oder abgespielt.',
    ],
    tip: 'Audiodateien werden pro Märchen als audio.mp3 im jeweiligen Story-Verzeichnis abgelegt (z. B. stories/hohler/es_baernduetsches_gschichtli/audio.mp3). Der Crawler legt sie nicht an — sie müssen manuell hinzugefügt werden.',
  },

  'high-contrast-theme': {
    lead: 'Der Hochkontrastmodus ersetzt die normalen Themen durch zwei kontraststarke Varianten: Hell-HC (weißer Hintergrund, schwarzer Text) und Dunkel-HC (schwarzer Hintergrund, weißer Text) — ohne Farbverläufe, ohne Amber-Töne.',
    on: [
      'Der Themenkreis-Knopf wechselt nur noch zwischen zwei Stufen: Hell-HC ↔ Dunkel-HC.',
      'Beim Einschalten wird das aktuelle Thema automatisch übertragen: Hell und System werden zu Hell-HC, Dunkel wird zu Dunkel-HC.',
      'Hell-HC: reinweißer Hintergrund, schwarzer Text, schwarze Ränder — maximaler Kontrast wie ein gedrucktes Dokument.',
      'Dunkel-HC: reinschwarzer Hintergrund, weißer Text, weiße Ränder — für Dunkelheit und OLED-Displays ohne Amber-Ablenkung.',
      'Alle anderen Funktionen (Typografie, Schriftgröße usw.) bleiben unverändert aktiv.',
    ],
    off: [
      'Der Themenkreis kehrt zum normalen Ablauf zurück: Hell → Dunkel → System → Hell.',
      'Beim Ausschalten wird das HC-Thema automatisch zurückgeführt: Hell-HC → Hell, Dunkel-HC → Dunkel.',
      'Die App sieht sofort wieder aus wie gewohnt — kein manuelles Umschalten nötig.',
    ],
    tip: 'Hochkontrast eignet sich besonders für E-Ink-Displays, starkes Umgebungslicht oder Nutzer mit Sehbeeinträchtigungen, die eine ablenkungsfreie Schwarz-Weiß-Darstellung bevorzugen.',
  },

  'speed-reader': {
    lead: 'Der Schnellleser blendet den normalen Lesebereich aus und zeigt stattdessen Wörter des Märchens einzeln, nacheinander und in hohem Tempo mittig auf dem Bildschirm an — eine Technik aus dem sogenannten RSVP-Lesen (Rapid Serial Visual Presentation).',
    steps: [
      {
        label: 'Einschalten',
        body: 'Die Funktion ist standardmäßig ausgeschaltet. Aktiviere sie hier im Profil über den Schalter „Schnellleser". Danach erscheint im Lesebereich ein neuer Knopf zum Wechseln in den Schnellleser-Modus.',
        widget: function SpeedReaderActivateDemo({ darkMode }) {
          const [on, setOn] = React.useState(false);
          const [clicking, setClicking] = React.useState(false);
          React.useEffect(() => {
            const tids = [];
            const schedule = () => {
              tids.push(setTimeout(() => {
                setClicking(true);
                tids.push(setTimeout(() => {
                  setClicking(false);
                  setOn(true);
                  tids.push(setTimeout(() => {
                    setOn(false);
                    tids.push(setTimeout(schedule, 200));
                  }, 1200));
                }, 150));
              }, 600));
            };
            schedule();
            return () => tids.forEach(clearTimeout);
          }, []);
          return (
            <div className="mt-3 inline-flex items-center gap-2.5 select-none">
              <span className={`text-xs font-medium ${darkMode ? 'text-amber-600' : 'text-amber-500'}`}>
                Schnellleser
              </span>
              <div className="relative">
                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${
                  on
                    ? darkMode ? 'bg-amber-500' : 'bg-amber-600'
                    : darkMode ? 'bg-slate-600' : 'bg-amber-200'
                }`}>
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    on ? 'translate-x-[18px]' : 'translate-x-[2px]'
                  }`} />
                </div>
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: '-14px',
                    left: '18px',
                    transform: clicking ? 'translateY(3px) scale(0.82)' : 'translateY(0) scale(1)',
                    transition: 'transform 0.12s ease',
                  }}
                >
                  <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                    <path
                      d="M1 1L1 13.5L4.2 9.8L6.5 15.5L8.2 14.8L5.9 9H10.5Z"
                      fill={darkMode ? '#fde68a' : '#78350f'}
                      stroke={darkMode ? '#92400e' : 'white'}
                      strokeWidth="0.75"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        label: 'In den Schnellleser wechseln',
        body: 'Öffne ein Märchen und tippe unten auf den Schnellleser-Knopf. Der paginierte Text verschwindet sofort — an seiner Stelle erscheint ein einzelnes großes Wort mittig auf dem Bildschirm, darüber eine schmale Fortschrittsleiste.',
        widget: function SpeedReaderSwitchDemo({ darkMode }) {
          const [active, setActive] = React.useState(false);
          const [clicking, setClicking] = React.useState(false);
          React.useEffect(() => {
            const tids = [];
            const schedule = () => {
              tids.push(setTimeout(() => {
                setClicking(true);
                tids.push(setTimeout(() => {
                  setClicking(false);
                  setActive(true);
                  tids.push(setTimeout(() => {
                    setActive(false);
                    tids.push(setTimeout(schedule, 200));
                  }, 1200));
                }, 150));
              }, 600));
            };
            schedule();
            return () => tids.forEach(clearTimeout);
          }, []);
          return (
            <div className="mt-3 inline-flex items-center gap-3 select-none">
              <div className="relative">
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-300 ${
                  active
                    ? darkMode ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-700'
                    : darkMode ? 'bg-slate-700/60 text-amber-700' : 'bg-amber-50/80 text-amber-400'
                }`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="12" x2="15" y2="10" />
                    <path d="M5 3.5A9.97 9.97 0 0 1 12 2c2.76 0 5.26 1.12 7.07 2.93" strokeLinecap="round" />
                    <path d="M3.5 5A9.97 9.97 0 0 0 2 12" strokeLinecap="round" />
                  </svg>
                </div>
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: '-14px',
                    left: '18px',
                    transform: clicking ? 'translateY(3px) scale(0.82)' : 'translateY(0) scale(1)',
                    transition: 'transform 0.12s ease',
                  }}
                >
                  <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                    <path
                      d="M1 1L1 13.5L4.2 9.8L6.5 15.5L8.2 14.8L5.9 9H10.5Z"
                      fill={darkMode ? '#fde68a' : '#78350f'}
                      stroke={darkMode ? '#92400e' : 'white'}
                      strokeWidth="0.75"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div className={`transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}>
                <span className={`font-serif font-bold ${
                  darkMode ? 'text-amber-200' : 'text-amber-900'
                }`} style={{ fontSize: '22px' }}>
                  Wald
                </span>
              </div>
            </div>
          );
        },
      },
      {
        label: 'Lesen starten & pausieren',
        body: 'Tippe auf Abspielen. Die Wörter laufen automatisch durch, eines nach dem anderen. Tippe auf Pause — oder direkt auf das angezeigte Wort — um anzuhalten. Ein erneuter Tipp auf Abspielen setzt an genau derselben Stelle fort. Satzenden werden kurz automatisch pausiert, damit der Sinn nicht verloren geht.',
        widget: function SpeedReaderPlayDemo({ darkMode }) {
          const words = ['Im', 'tiefen', 'Wald', 'lebte', 'einst'];
          const [playing, setPlaying] = React.useState(false);
          const [clicking, setClicking] = React.useState(false);
          const [wordIdx, setWordIdx] = React.useState(0);
          React.useEffect(() => {
            if (!playing) return;
            const id = setInterval(() => setWordIdx(i => (i + 1) % words.length), 380);
            return () => clearInterval(id);
          }, [playing]);
          React.useEffect(() => {
            const tids = [];
            const schedule = () => {
              tids.push(setTimeout(() => {
                setClicking(true);
                tids.push(setTimeout(() => {
                  setClicking(false);
                  setPlaying(true);
                  tids.push(setTimeout(() => {
                    setPlaying(false);
                    tids.push(setTimeout(schedule, 400));
                  }, 1600));
                }, 150));
              }, 700));
            };
            schedule();
            return () => tids.forEach(clearTimeout);
          }, []);
          return (
            <div className="mt-3 inline-flex items-center gap-3 select-none">
              <div className="relative">
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-200 ${
                  playing
                    ? darkMode ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-700'
                    : darkMode ? 'bg-slate-700/60 text-amber-700' : 'bg-amber-50/80 text-amber-400'
                }`}>
                  {playing ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </div>
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: '-14px',
                    left: '18px',
                    opacity: playing ? 0 : 1,
                    transform: clicking ? 'translateY(3px) scale(0.82)' : 'translateY(0) scale(1)',
                    transition: 'transform 0.12s ease, opacity 0.2s ease',
                  }}
                >
                  <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                    <path
                      d="M1 1L1 13.5L4.2 9.8L6.5 15.5L8.2 14.8L5.9 9H10.5Z"
                      fill={darkMode ? '#fde68a' : '#78350f'}
                      stroke={darkMode ? '#92400e' : 'white'}
                      strokeWidth="0.75"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <span
                className={`font-serif font-bold transition-colors duration-200 ${
                  playing
                    ? darkMode ? 'text-amber-200' : 'text-amber-900'
                    : darkMode ? 'text-amber-800' : 'text-amber-300'
                }`}
                style={{ fontSize: '22px', minWidth: '64px', display: 'inline-block' }}
              >
                {words[wordIdx]}
              </span>
            </div>
          );
        },
      },
      {
        label: 'Geschwindigkeit anpassen',
        body: 'Unter dem Wort befinden sich zwei Schaltflächen zum Anpassen der Geschwindigkeit — wie die Schriftgröße im Lesebereich. Die Geschwindigkeit lässt sich in Schritten von 10 WpM einstellen, von 10 bis 1000 WpM. Du kannst jederzeit wechseln — auch mitten im Lesen. Die gewählte Geschwindigkeit wird gespeichert und beim nächsten Start vorausgewählt.',
        widget: function SpeedReaderSpeedDemo({ darkMode }) {
          const INITIAL = 200;
          const [wpm, setWpm] = React.useState(INITIAL);
          const [hovering, setHovering] = React.useState(null);
          const [pressing, setPressing] = React.useState(false);
          React.useEffect(() => {
            const tids = [];
            const doClick = (btn, cb) => {
              setHovering(btn);
              tids.push(setTimeout(() => {
                setPressing(true);
                tids.push(setTimeout(() => {
                  setPressing(false);
                  setWpm(w => btn === 'plus' ? Math.min(1000, w + 10) : Math.max(10, w - 10));
                  tids.push(setTimeout(cb, 280));
                }, 130));
              }, 250));
            };
            const sequence = () => {
              doClick('plus', () =>
              doClick('plus', () =>
              doClick('plus', () => {
                tids.push(setTimeout(() =>
                  doClick('minus', () =>
                  doClick('minus', () =>
                  doClick('minus', () => {
                    tids.push(setTimeout(() => {
                      setHovering(null);
                      setWpm(INITIAL);
                      tids.push(setTimeout(sequence, 300));
                    }, 600));
                  }))),
                500));
              })));
            };
            tids.push(setTimeout(sequence, 400));
            return () => tids.forEach(clearTimeout);
          }, []);
          const cursorEl = (
            <div
              className="absolute pointer-events-none"
              style={{
                top: '-16px', left: '10px',
                transform: pressing ? 'translateY(3px) scale(0.82)' : 'translateY(0) scale(1)',
                transition: 'transform 0.12s ease',
              }}
            >
              <svg width="12" height="15" viewBox="0 0 14 18" fill="none">
                <path d="M1 1L1 13.5L4.2 9.8L6.5 15.5L8.2 14.8L5.9 9H10.5Z"
                  fill={darkMode ? '#fde68a' : '#78350f'}
                  stroke={darkMode ? '#92400e' : 'white'}
                  strokeWidth="0.75" strokeLinejoin="round" />
              </svg>
            </div>
          );
          return (
            <div className="mt-3 inline-flex items-center gap-2 select-none">
              {/* Minus */}
              <div className="relative">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150 ${
                  hovering === 'minus'
                    ? darkMode ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-700'
                    : darkMode ? 'bg-slate-700/60 text-amber-600' : 'bg-amber-50 text-amber-500'
                }`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                {hovering === 'minus' && cursorEl}
              </div>
              {/* WpM value */}
              <span className={`text-sm font-mono font-bold tabular-nums text-center ${
                darkMode ? 'text-amber-300' : 'text-amber-800'
              }`} style={{ minWidth: '4.5rem' }}>
                {wpm} WpM
              </span>
              {/* Plus */}
              <div className="relative">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150 ${
                  hovering === 'plus'
                    ? darkMode ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-700'
                    : darkMode ? 'bg-slate-700/60 text-amber-600' : 'bg-amber-50 text-amber-500'
                }`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                {hovering === 'plus' && cursorEl}
              </div>
            </div>
          );
        },
      },
      {
        label: 'Zurück zum Seiten-Leser',
        body: 'Tippe erneut auf den Schnellleser-Knopf, um in die normale Seitenansicht zurückzukehren. Das Märchen öffnet sich wieder auf Seite 1 — der Schnellleser-Fortschritt wird nicht gespeichert.',
      },
    ],
    on: [
      'Im Lesebereich erscheint anstelle des paginierten Textes ein Schnellleser-Modus mit einem einzelnen Wort in großer Schrift mittig auf dem Bildschirm.',
      'Über der Wortanzeige befindet sich eine Fortschrittsleiste, die den Leseverlauf im gesamten Text anzeigt.',
      'Unter der Wortanzeige befinden sich Steuerelemente: Abspielen / Pausieren, Zurückspringen um einen Satz sowie die Einstellung der Lesegeschwindigkeit in Wörtern pro Minute (WpM).',
      'Die Geschwindigkeit lässt sich in Schritten von 10 WpM stufenlos zwischen 10 und 1000 WpM einstellen — über zwei Schaltflächen (+ und −) unterhalb der Wortanzeige. Die gewählte Geschwindigkeit wird gespeichert.',
      'Das Lesen kann jederzeit pausiert werden — nach dem Pausieren springt ein erneutes Drücken auf „Abspielen" an der exakt gleichen Stelle weiter.',
      'Satzenden werden kurz mit einer Pause hervorgehoben, damit der Lesefluss natürlich bleibt und keine Sinnzusammenhänge verloren gehen.',
      'Der Schnellleser arbeitet auf dem vollständigen Märchentext — er ist nicht an die seitenbasierte Paginierung des normalen Lesemodus gebunden.',
      'Der Fortschritt im Schnellleser wird beim Wechseln des Märchens oder Schließen der App nicht gespeichert.',
    ],
    off: [
      'Der Schnellleser-Modus ist nicht zugänglich.',
      'Märchen werden wie gewohnt paginiert im normalen Lesebereich angezeigt.',
      'Alle anderen Lese- und Typografieeinstellungen bleiben unberührt.',
    ],
    tip: 'RSVP-Lesen kann die Lesegeschwindigkeit deutlich steigern, da Augenbewegungen (Sakkaden) entfallen. Es ist jedoch weniger geeignet für Texte, die Reflexion oder Rückblättern erfordern — für Märchen mit linearer Handlung funktioniert es gut.',
  },

  'word-blacklist': {
    lead: 'Die Wort-Blacklist blendet Märchen, die bestimmte Wörter enthalten, automatisch aus der Seitenleiste aus — nützlich, wenn du bestimmte Themen oder Begriffe vermeiden möchtest.',
    on: [
      'Im Profil erscheint ein neuer Bereich „Wort-Blacklist" mit einem Eingabefeld.',
      'Trage ein Wort ein und bestätige mit „Hinzufügen" oder der Eingabetaste — das Wort wird sofort gespeichert.',
      'Märchen, deren Titel oder Inhalt dieses Wort enthält (Groß-/Kleinschreibung egal), verschwinden aus der Seitenleiste.',
      'Die gefilterten Märchen sind nicht gelöscht — sie werden nur ausgeblendet. Entferne das Wort aus der Liste, um sie wieder zu sehen.',
      'Alle eingetragenen Wörter werden im Browser gespeichert und bleiben beim nächsten Besuch aktiv.',
    ],
    off: [
      'Der Bereich „Wort-Blacklist" ist im Profil nicht sichtbar.',
      'Alle Märchen werden wie gewohnt angezeigt, unabhängig davon, ob Wörter eingetragen sind.',
      'Bereits eingetragene Wörter bleiben gespeichert und werden sofort wieder wirksam, sobald die Funktion erneut eingeschaltet wird.',
    ],
    tip: 'Die Filterung prüft den gesamten Märchentext, nicht nur den Titel. Ein Wort wie „Blut" blendet also auch Märchen aus, in denen das Wort nur einmal vorkommt.',
  },

  'speedreader-orp': {
    lead: 'Die ORP-Lesemarke (Optimal Recognition Point) hebt einen bestimmten Buchstaben jedes Worts farblich hervor und richtet ihn an einem festen Bildschirmpunkt aus — optionale Führungslinien helfen dem Auge, den Fixationspunkt zu halten.',
    steps: [
      {
        label: 'Was ist ORP?',
        body: 'Jedes Wort hat einen optimalen Erkennungspunkt — meist den zweiten Buchstaben. Wird dieser Punkt immer an derselben Stelle auf dem Bildschirm angezeigt, muss das Auge nicht suchen und das Lesen wird schneller und ermüdungsärmer.',
        widget: function SpeedReaderOrpExplainDemo({ darkMode }) {
          const examples = [
            { word: 'Märchen', idx: 1 },
            { word: 'Wald',    idx: 1 },
            { word: 'die',     idx: 1 },
          ];
          const [i, setI] = React.useState(0);
          React.useEffect(() => {
            const id = setInterval(() => setI(n => (n + 1) % examples.length), 900);
            return () => clearInterval(id);
          }, []);
          const { word, idx } = examples[i];
          const before = word.slice(0, idx);
          const letter = word[idx];
          const after  = word.slice(idx + 1);
          return (
            <div className="mt-3 inline-flex items-baseline gap-0 select-none text-2xl font-bold" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              <span className={darkMode ? 'text-amber-200' : 'text-amber-900'}>{before}</span>
              <span style={{ color: '#ef4444', fontWeight: '700' }}>{letter}</span>
              <span className={darkMode ? 'text-amber-200' : 'text-amber-900'}>{after}</span>
            </div>
          );
        },
      },
      {
        label: 'ORP-Methode wählen',
        body: 'Drei Methoden stehen zur Auswahl: „2. Buchstabe" nimmt immer den zweiten Buchstaben, „Mitte" den Mittelbuchstaben des Worts, und „Fester Index" einen frei wählbaren Index. Die Einstellung wird sofort in der Vorschau und im Lesebereich sichtbar.',
        widget: function SpeedReaderOrpMethodDemo({ darkMode }) {
          const methods = ['2. Buchstabe', 'Mitte', 'Fester Index'];
          const idxFor = (word, m) => {
            if (m === 'Mitte')       return Math.floor((word.length - 1) / 2);
            if (m === 'Fester Index') return Math.min(2, word.length - 1);
            return Math.min(1, word.length - 1);
          };
          const [m, setM] = React.useState(0);
          React.useEffect(() => {
            const id = setInterval(() => setM(n => (n + 1) % methods.length), 1400);
            return () => clearInterval(id);
          }, []);
          const word  = 'Abend';
          const idx   = idxFor(word, methods[m]);
          return (
            <div className="mt-3 flex flex-col gap-2 select-none">
              <div className="inline-flex gap-1">
                {methods.map((label, n) => (
                  <button
                    key={label}
                    onClick={() => setM(n)}
                    className={`px-2 py-0.5 text-xs rounded-lg transition-colors ${
                      m === n
                        ? darkMode ? 'bg-amber-600 text-white' : 'bg-amber-200 text-amber-900'
                        : darkMode ? 'text-amber-500 hover:bg-slate-700' : 'text-amber-600 hover:bg-amber-100'
                    }`}
                  >{label}</button>
                ))}
              </div>
              <div className="inline-flex items-baseline gap-0 text-2xl font-bold" style={{ fontFamily: "'Roboto Mono', monospace" }}>
                <span className={darkMode ? 'text-amber-200' : 'text-amber-900'}>{word.slice(0, idx)}</span>
                <span style={{ color: '#ef4444', fontWeight: '700' }}>{word[idx]}</span>
                <span className={darkMode ? 'text-amber-200' : 'text-amber-900'}>{word.slice(idx + 1)}</span>
              </div>
            </div>
          );
        },
      },
      {
        label: 'Führungslinien & Markierung',
        body: 'Zwei horizontale Balken oberhalb und unterhalb des Worts sowie eine vertikale Markierung rahmen den Fixationspunkt ein. Farbe, Dicke und Länge sind frei einstellbar. Die Linien können auch einzeln ausgeschaltet werden.',
        widget: function SpeedReaderOrpGuideDemo({ darkMode }) {
          const [on, setOn] = React.useState(true);
          React.useEffect(() => {
            const id = setInterval(() => setOn(v => !v), 1200);
            return () => clearInterval(id);
          }, []);
          const barColor    = darkMode ? '#475569' : '#94a3b8';
          const markerColor = '#ef4444';
          return (
            <div className="mt-3 relative inline-flex items-center justify-center select-none" style={{ width: '180px', height: '52px' }}>
              {on && (
                <>
                  <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '6px', width: '140px', height: '2px', backgroundColor: barColor, borderRadius: '9999px' }} />
                  <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '6px', width: '140px', height: '2px', backgroundColor: barColor, borderRadius: '9999px' }} />
                  <div style={{ position: 'absolute', left: 'calc(50% - 1px)', top: '50%', transform: 'translateY(-50%)', width: '3px', height: '20px', backgroundColor: markerColor, borderRadius: '1px' }} />
                </>
              )}
              <div className="inline-flex items-baseline gap-0 text-2xl font-bold" style={{ fontFamily: "'Roboto Mono', monospace" }}>
                <span className={darkMode ? 'text-amber-200' : 'text-amber-900'}>W</span>
                <span style={{ color: '#ef4444', fontWeight: '700' }}>a</span>
                <span className={darkMode ? 'text-amber-200' : 'text-amber-900'}>ld</span>
              </div>
            </div>
          );
        },
      },
      {
        label: 'Einstellungen in Echtzeit anpassen',
        body: 'Tippe im Schnellleser auf das Zahnrad-Symbol in der Steuerleiste, um das ORP-Einstellungspanel zu öffnen. Jede Änderung — Methode, Farbe, Führungslinien, Fixationspunkt — wird sofort in der Vorschau und im laufenden Schnellleser sichtbar, ohne das Lesen zu unterbrechen.',
      },
    ],
    on: [
      'Im Schnellleser erscheint in der Steuerleiste ein Zahnrad-Symbol. Ein Tipp darauf öffnet das ORP-Einstellungspanel unterhalb der Wortanzeige.',
      'Das ORP-Einstellungspanel zeigt oben eine Live-Vorschau des aktuell angezeigten Worts mit den gewählten ORP-Einstellungen.',
      'Darunter befinden sich Regler und Schalter für: ORP-Methode (2. Buchstabe / Mitte / Fester Index), Hervorhebungsfarbe und -stärke, horizontale Führungslinien (Farbe, Dicke, Länge) sowie die vertikale Markierung.',
      'Zwei Schieberegler für „Horizontal" (0–100 %) und „Vertikal" (0–100 %) steuern die genaue Position des Fixationspunkts auf dem Bildschirm.',
      'Alle Einstellungen werden automatisch gespeichert und beim nächsten Öffnen wiederhergestellt.',
    ],
    off: [
      'Das Zahnrad-Symbol und das ORP-Einstellungspanel sind nicht sichtbar.',
      'Der Schnellleser zeigt Wörter wie bisher ohne ORP-Hervorhebung an — der zweite Buchstabe ist leicht farbig betont (klassisches Verhalten).',
      'Gespeicherte ORP-Einstellungen bleiben erhalten und werden wiederhergestellt, wenn das Feature wieder eingeschaltet wird.',
    ],
    tip: 'ORP-Lesemarke erfordert den aktivierten Schnellleser. Aktiviere zuerst den Schnellleser im Profil und wechsle dann in den Schnellleser-Modus.',
  },
};

// ── Component ────────────────────────────────────────────────────────────────

const OnBadge = ({ darkMode }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
    darkMode ? 'bg-amber-700/40 text-amber-300' : 'bg-amber-100 text-amber-700'
  }`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
    Eingeschaltet
  </span>
);

const OffBadge = ({ darkMode }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
    darkMode ? 'bg-slate-700 text-amber-600' : 'bg-amber-50 text-amber-500'
  }`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current inline-block opacity-50" />
    Ausgeschaltet
  </span>
);

const FeatureDocs = ({ darkMode, onBack, initialAnchor, featureState, onToggle }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    if (initialAnchor) {
      // Slight delay so the DOM is fully painted before scrolling
      const id = setTimeout(() => {
        const el = scrollRef.current?.querySelector(`[data-anchor="${initialAnchor}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return () => clearTimeout(id);
    } else {
      scrollRef.current.scrollTop = 0;
    }
  }, [initialAnchor]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-12 pb-20">

        {/* Back button */}
        <button
          onClick={onBack}
          className={`flex items-center gap-2 mb-10 text-sm font-medium transition-colors ${
            darkMode ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'
          }`}
        >
          <ChevronLeft size={16} />
          Zurück zum Profil
        </button>

        {/* Page header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
            darkMode ? 'bg-amber-700/30 text-amber-400' : 'bg-amber-100 text-amber-700'
          }`}>
            <BookOpen size={22} />
          </div>
          <div>
            <h1 className={`text-2xl font-serif font-bold leading-tight ${
              darkMode ? 'text-amber-200' : 'text-amber-900'
            }`}>
              Funktionen
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-amber-500' : 'text-amber-600'}`}>
              Alle optionalen Funktionen erklärt — was sie tun, was du erwartest, und wann du sie einschalten solltest.
            </p>
          </div>
        </div>

        {/* Table of contents */}
        <nav className={`mt-8 mb-12 rounded-2xl border px-5 py-4 ${
          darkMode ? 'border-amber-700/30' : 'border-amber-200'
        }`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
            darkMode ? 'text-amber-500' : 'text-amber-600'
          }`}>Inhalt</p>
          <ol className="space-y-1">
            {FEATURES.map(({ key, label }, i) => (
              <li key={key}>
                <button
                  onClick={() => {
                    const el = scrollRef.current?.querySelector(`[data-anchor="${key}"]`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`text-sm text-left transition-colors hover:underline ${
                    darkMode ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'
                  }`}
                >
                  <span className={`tabular-nums mr-2 ${darkMode ? 'text-amber-700' : 'text-amber-400'}`}>{i + 1}.</span>
                  {label}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* Feature sections */}
        <div className="space-y-16">
          {FEATURES.map(({ key, label, Icon }, sectionIndex) => {
            const doc = DOCS[key];
            if (!doc) return null;
            return (
              <section key={key} data-anchor={key}>

                {/* Section heading */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    featureState?.[key]
                      ? darkMode ? 'bg-amber-700/40 text-amber-300' : 'bg-amber-100 text-amber-700'
                      : darkMode ? 'bg-slate-700/60 text-amber-700' : 'bg-amber-50/80 text-amber-400'
                  }`}>
                    <div className="w-5 h-5"><Icon /></div>
                  </div>
                  <div className="flex-1 flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <h2 className={`text-lg font-serif font-semibold transition-opacity ${
                        featureState?.[key] ? '' : 'opacity-40'
                      } ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>{label}</h2>
                      <span className={`text-xs font-mono ${darkMode ? 'text-amber-700' : 'text-amber-400'}`}>
                        #{sectionIndex + 1}
                      </span>
                    </div>
                    {onToggle && featureState && (
                      <button
                        role="switch"
                        aria-checked={featureState[key]}
                        aria-label={label}
                        onClick={() => onToggle(key)}
                        className={`flex-shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                          featureState[key]
                            ? darkMode ? 'bg-amber-500' : 'bg-amber-600'
                            : darkMode ? 'bg-slate-600' : 'bg-amber-200'
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                          featureState[key] ? 'translate-x-[18px]' : 'translate-x-[2px]'
                        }`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lead paragraph */}
                <p className={`text-sm leading-relaxed mb-6 ${
                  darkMode ? 'text-amber-300' : 'text-amber-800'
                }`}>{doc.lead}</p>

                {/* Step-by-step walkthrough */}
                {doc.steps && (
                  <div className="mb-6">
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                      darkMode ? 'text-amber-500' : 'text-amber-600'
                    }`}>So funktioniert es</p>
                    <ol className="space-y-0">
                      {doc.steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          {/* Connector column */}
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              darkMode ? 'bg-amber-700/50 text-amber-300' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {i + 1}
                            </div>
                            {i < doc.steps.length - 1 && (
                              <div className={`w-px flex-1 my-1 ${
                                darkMode ? 'bg-amber-700/30' : 'bg-amber-200'
                              }`} />
                            )}
                          </div>
                          {/* Content */}
                          <div className={`pb-4 ${i === doc.steps.length - 1 ? 'pb-0' : ''}`}>
                            <p className={`text-xs font-semibold mb-0.5 ${
                              darkMode ? 'text-amber-400' : 'text-amber-700'
                            }`}>{step.label}</p>
                            {step.body && (
                              <p className={`text-sm leading-relaxed ${
                                darkMode ? 'text-amber-300' : 'text-amber-800'
                              }`}>{step.body}</p>
                            )}
                            {step.widget && <step.widget darkMode={darkMode} />}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* On / Off grid */}
                <div className={`rounded-2xl border overflow-hidden divide-y ${
                  darkMode ? 'border-amber-700/30 divide-amber-700/30' : 'border-amber-200 divide-amber-200'
                }`}>
                  {/* Eingeschaltet */}
                  <div className="px-5 py-4">
                    <div className="mb-3">
                      <OnBadge darkMode={darkMode} />
                    </div>
                    <ul className="space-y-2">
                      {doc.on.map((item, i) => (
                        <li key={i} className={`flex gap-2.5 text-sm leading-relaxed ${
                          darkMode ? 'text-amber-300' : 'text-amber-800'
                        }`}>
                          <span className={`flex-shrink-0 mt-1.5 w-1 h-1 rounded-full ${
                            darkMode ? 'bg-amber-500' : 'bg-amber-500'
                          }`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ausgeschaltet */}
                  <div className="px-5 py-4">
                    <div className="mb-3">
                      <OffBadge darkMode={darkMode} />
                    </div>
                    <ul className="space-y-2">
                      {doc.off.map((item, i) => (
                        <li key={i} className={`flex gap-2.5 text-sm leading-relaxed ${
                          darkMode ? 'text-amber-500' : 'text-amber-600'
                        }`}>
                          <span className={`flex-shrink-0 mt-1.5 w-1 h-1 rounded-full opacity-40 ${
                            darkMode ? 'bg-amber-400' : 'bg-amber-500'
                          }`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Optional tip */}
                  {doc.tip && (
                    <div className={`px-5 py-4 ${
                      darkMode ? 'bg-amber-700/10' : 'bg-amber-50/60'
                    }`}>
                      <p className={`text-xs leading-relaxed ${
                        darkMode ? 'text-amber-500' : 'text-amber-600'
                      }`}>
                        <span className={`font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                          Hinweis:{' '}
                        </span>
                        {doc.tip}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeatureDocs;
