import { useState, useEffect } from 'react';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';

const BRANCH = 'claude/extended-user-personas-ZD1hR';
const RAW_BASE = `https://raw.githubusercontent.com/tweakch/webreader/${BRANCH}/`;
const WEB_BASE = `https://github.com/tweakch/webreader/blob/${BRANCH}/`;

// ── Manifests ──────────────────────────────────────────────────────────────

const PERSONAS = [
  { id: '01-pre-readers',        label: 'Pre-Readers',        emoji: '👶', path: 'docs/personas/01-pre-readers.md' },
  { id: '02-parents',            label: 'Parents',            emoji: '👨‍👩‍👧', path: 'docs/personas/02-parents.md' },
  { id: '03-teachers',           label: 'Teachers',           emoji: '🧑‍🏫', path: 'docs/personas/03-teachers.md' },
  { id: '04-culture-explorers',  label: 'Culture Explorers',  emoji: '🌍', path: 'docs/personas/04-culture-explorers.md' },
  { id: '05-therapeutic',        label: 'Therapeutic',        emoji: '🧘', path: 'docs/personas/05-therapeutic.md' },
  { id: '06-creatives',          label: 'Creatives',          emoji: '🎭', path: 'docs/personas/06-creatives.md' },
  { id: '07-passive-consumers',  label: 'Passive Consumers',  emoji: '🎧', path: 'docs/personas/07-passive-consumers.md' },
  { id: '08-developers',         label: 'Developers',         emoji: '🧑‍💻', path: 'docs/personas/08-developers.md' },
  { id: '09-seniors',            label: 'Seniors',            emoji: '🧓', path: 'docs/personas/09-seniors.md' },
  { id: '10-gamified-explorers', label: 'Gamified Explorers', emoji: '🧩', path: 'docs/personas/10-gamified-explorers.md' },
];

const STRATEGIC_FEATURES = [
  { id: 'word-highlighting',    label: 'Word Highlighting',    status: 'vision',    path: 'docs/features/word-highlighting.md' },
  { id: 'audio-narration',      label: 'Audio Narration',      status: 'near-term', path: 'docs/features/audio-narration.md' },
  { id: 'bedtime-mode',         label: 'Bedtime Mode',         status: 'mvp',       path: 'docs/features/bedtime-mode.md' },
  { id: 'age-filter',           label: 'Age Filter',           status: 'mvp',       path: 'docs/features/age-filter.md' },
  { id: 'discussion-questions', label: 'Discussion Questions', status: 'near-term', path: 'docs/features/discussion-questions.md' },
  { id: 'parallel-texts',       label: 'Parallel Texts',       status: 'near-term', path: 'docs/features/parallel-texts.md' },
  { id: 'cultural-annotations', label: 'Cultural Annotations', status: 'near-term', path: 'docs/features/cultural-annotations.md' },
  { id: 'symbol-analysis',      label: 'Symbol Analysis',      status: 'vision',    path: 'docs/features/symbol-analysis.md' },
  { id: 'journaling-prompts',   label: 'Journaling Prompts',   status: 'near-term', path: 'docs/features/journaling-prompts.md' },
  { id: 'mood-recommendations', label: 'Mood Recommendations', status: 'vision',    path: 'docs/features/mood-recommendations.md' },
  { id: 'story-remix',          label: 'Story Remix',          status: 'vision',    path: 'docs/features/story-remix.md' },
  { id: 'sleep-timer',          label: 'Sleep Timer',          status: 'mvp',       path: 'docs/features/sleep-timer.md' },
  { id: 'story-api',            label: 'Story API',            status: 'vision',    path: 'docs/features/story-api.md' },
  { id: 'story-map',            label: 'Story Map',            status: 'vision',    path: 'docs/features/story-map.md' },
  { id: 'achievements',         label: 'Achievements',         status: 'near-term', path: 'docs/features/achievements.md' },
  { id: 'choice-narratives',    label: 'Choice Narratives',    status: 'vision',    path: 'docs/features/choice-narratives.md' },
];

// lifecycle → display badge
const APP_FEATURES = [
  // reader-core
  { id: 'favorites',             label: 'Favorites',            lifecycle: 'STABLE',     group: 'Reader Core',     path: 'docs/features/favorites.md' },
  { id: 'favorites-only-toggle', label: 'Favorites-Only Toggle',lifecycle: 'STABLE',     group: 'Reader Core',     path: 'docs/features/favorites-only-toggle.md' },
  // reader-stats
  { id: 'word-count',            label: 'Word Count',           lifecycle: 'STABLE',     group: 'Reader Stats',    path: 'docs/features/word-count.md' },
  { id: 'reading-duration',      label: 'Reading Duration',     lifecycle: 'STABLE',     group: 'Reader Stats',    path: 'docs/features/reading-duration.md' },
  // reader-ui
  { id: 'font-size-controls',    label: 'Font Size Controls',   lifecycle: 'STABLE',     group: 'Reader UI',       path: 'docs/features/font-size-controls.md' },
  { id: 'pinch-font-size',       label: 'Pinch Font Size',      lifecycle: 'EXPERIMENT', group: 'Reader UI',       path: 'docs/features/pinch-font-size.md' },
  { id: 'eink-flash',            label: 'E-Ink Flash',          lifecycle: 'STABLE',     group: 'Reader UI',       path: 'docs/features/eink-flash.md' },
  { id: 'tap-zones',             label: 'Tap Zones',            lifecycle: 'STABLE',     group: 'Reader UI',       path: 'docs/features/tap-zones.md' },
  { id: 'tap-middle-toggle',     label: 'Tap Middle Toggle',    lifecycle: 'STABLE',     group: 'Reader UI',       path: 'docs/features/tap-middle-toggle.md' },
  // appearance
  { id: 'theme',                 label: 'Theme',                lifecycle: 'STABLE',     group: 'Appearance',      path: 'docs/features/theme.md' },
  { id: 'high-contrast-theme',   label: 'High Contrast',        lifecycle: 'STABLE',     group: 'Appearance',      path: 'docs/features/high-contrast-theme.md' },
  { id: 'big-fonts',             label: 'Big Fonts',            lifecycle: 'EXPERIMENT', group: 'Appearance',      path: 'docs/features/big-fonts.md' },
  { id: 'simplified-ui',         label: 'Simplified UI',        lifecycle: 'EXPERIMENT', group: 'Appearance',      path: 'docs/features/simplified-ui.md' },
  // typography
  { id: 'adaption-switcher',     label: 'Adaption Switcher',    lifecycle: 'STABLE',     group: 'Typography',      path: 'docs/features/adaption-switcher.md' },
  { id: 'typography-panel',      label: 'Typography Panel',     lifecycle: 'STABLE',     group: 'Typography',      path: 'docs/features/typography-panel.md' },
  { id: 'subscriber-fonts',      label: 'Subscriber Fonts',     lifecycle: 'EXPERIMENT', group: 'Typography',      path: 'docs/features/subscriber-fonts.md' },
  // navigation & search
  { id: 'story-directories',     label: 'Story Directories',    lifecycle: 'EXPERIMENT', group: 'Navigation',      path: 'docs/features/story-directories.md' },
  { id: 'deep-search',           label: 'Deep Search',          lifecycle: 'EXPERIMENT', group: 'Navigation',      path: 'docs/features/deep-search.md' },
  // advanced reading
  { id: 'speed-reader',          label: 'Speed Reader',         lifecycle: 'EXPERIMENT', group: 'Advanced Reading',path: 'docs/features/speed-reader.md' },
  { id: 'speedreader-orp',       label: 'ORP Enhancement',      lifecycle: 'EXPERIMENT', group: 'Advanced Reading',path: 'docs/features/speedreader-orp.md' },
  { id: 'audio-player',          label: 'Audio Player',         lifecycle: 'EXPERIMENT', group: 'Advanced Reading',path: 'docs/features/audio-player.md' },
  { id: 'text-to-speech',        label: 'Text-to-Speech',       lifecycle: 'EXPERIMENT', group: 'Advanced Reading',path: 'docs/features/text-to-speech.md' },
  // gen-alpha
  { id: 'read-along',            label: 'Read-Along',           lifecycle: 'EXPERIMENT', group: 'Gen Alpha',       path: 'docs/features/read-along.md' },
  { id: 'illustrations',         label: 'Illustrations',        lifecycle: 'EXPERIMENT', group: 'Gen Alpha',       path: 'docs/features/illustrations.md' },
  { id: 'child-profile',         label: 'Child Profile',        lifecycle: 'EXPERIMENT', group: 'Gen Alpha',       path: 'docs/features/child-profile.md' },
  { id: 'story-quiz',            label: 'Story Quiz',           lifecycle: 'EXPERIMENT', group: 'Gen Alpha',       path: 'docs/features/story-quiz.md' },
  // misc
  { id: 'word-blacklist',        label: 'Word Blacklist',       lifecycle: 'EXPERIMENT', group: 'Tools',           path: 'docs/features/word-blacklist.md' },
  { id: 'attribution',           label: 'Attribution',          lifecycle: 'STABLE',     group: 'Tools',           path: 'docs/features/attribution.md' },
  // debug
  { id: 'debug-badges',          label: 'Debug Badges',         lifecycle: 'EXPERIMENT', group: 'Debug',           path: 'docs/features/debug-badges.md' },
  { id: 'error-page-simulator',  label: 'Error Page Simulator', lifecycle: 'EXPERIMENT', group: 'Debug',           path: 'docs/features/error-page-simulator.md' },
];

// strategic feature → persona id set
const STRATEGIC_MATRIX = {
  'word-highlighting':    ['01-pre-readers'],
  'audio-narration':      ['01-pre-readers','02-parents','04-culture-explorers','07-passive-consumers','09-seniors'],
  'bedtime-mode':         ['02-parents','07-passive-consumers'],
  'age-filter':           ['01-pre-readers','02-parents'],
  'discussion-questions': ['03-teachers','05-therapeutic'],
  'parallel-texts':       ['03-teachers','04-culture-explorers'],
  'cultural-annotations': ['03-teachers','04-culture-explorers'],
  'symbol-analysis':      ['03-teachers','05-therapeutic','06-creatives'],
  'journaling-prompts':   ['05-therapeutic'],
  'mood-recommendations': ['05-therapeutic'],
  'story-remix':          ['06-creatives','08-developers'],
  'sleep-timer':          ['02-parents','07-passive-consumers','09-seniors'],
  'story-api':            ['08-developers'],
  'story-map':            ['04-culture-explorers','10-gamified-explorers'],
  'achievements':         ['10-gamified-explorers'],
  'choice-narratives':    ['01-pre-readers','06-creatives','10-gamified-explorers'],
};

// app feature → persona id set
const APP_MATRIX = {
  'favorites':             ['05-therapeutic','07-passive-consumers','09-seniors','10-gamified-explorers'],
  'favorites-only-toggle': ['07-passive-consumers','09-seniors','10-gamified-explorers'],
  'word-count':            ['03-teachers','10-gamified-explorers'],
  'reading-duration':      ['02-parents','03-teachers','09-seniors','10-gamified-explorers'],
  'font-size-controls':    ['09-seniors'],
  'pinch-font-size':       ['01-pre-readers','09-seniors'],
  'eink-flash':            ['09-seniors'],
  'tap-zones':             ['01-pre-readers','07-passive-consumers','09-seniors'],
  'tap-middle-toggle':     ['07-passive-consumers'],
  'theme':                 ['05-therapeutic','07-passive-consumers','09-seniors'],
  'high-contrast-theme':   ['09-seniors'],
  'big-fonts':             ['01-pre-readers','02-parents','09-seniors'],
  'simplified-ui':         ['02-parents','09-seniors'],
  'adaption-switcher':     ['03-teachers','04-culture-explorers','06-creatives','10-gamified-explorers'],
  'typography-panel':      ['05-therapeutic','06-creatives','09-seniors'],
  'subscriber-fonts':      ['05-therapeutic','06-creatives'],
  'story-directories':     ['04-culture-explorers','08-developers','10-gamified-explorers'],
  'deep-search':           ['03-teachers','04-culture-explorers','06-creatives','08-developers'],
  'speed-reader':          ['06-creatives','07-passive-consumers'],
  'speedreader-orp':       ['06-creatives','07-passive-consumers'],
  'audio-player':          ['01-pre-readers','02-parents','07-passive-consumers','09-seniors'],
  'text-to-speech':        ['07-passive-consumers','09-seniors'],
  'read-along':            ['01-pre-readers','02-parents'],
  'illustrations':         ['01-pre-readers','02-parents'],
  'child-profile':         ['01-pre-readers','02-parents'],
  'story-quiz':            ['01-pre-readers','03-teachers'],
  'word-blacklist':        [],
  'attribution':           ['03-teachers','04-culture-explorers','08-developers'],
  'debug-badges':          ['08-developers'],
  'error-page-simulator':  ['08-developers'],
};

// ── Status / lifecycle badge styles ────────────────────────────────────────

const STRATEGIC_STATUS = { mvp: 'MVP', 'near-term': 'Near-term', vision: 'Vision' };
const STRATEGIC_COLORS = {
  mvp:        { l: 'bg-emerald-100 text-emerald-800', d: 'bg-emerald-900/40 text-emerald-300' },
  'near-term':{ l: 'bg-amber-100 text-amber-800',     d: 'bg-amber-900/40 text-amber-300' },
  vision:     { l: 'bg-violet-100 text-violet-800',   d: 'bg-violet-900/40 text-violet-300' },
};
const LIFECYCLE_COLORS = {
  STABLE:     { l: 'bg-blue-100 text-blue-800',      d: 'bg-blue-900/40 text-blue-300' },
  EXPERIMENT: { l: 'bg-orange-100 text-orange-800',  d: 'bg-orange-900/40 text-orange-300' },
  ROLLOUT:    { l: 'bg-teal-100 text-teal-800',      d: 'bg-teal-900/40 text-teal-300' },
  DEPRECATE:  { l: 'bg-red-100 text-red-800',        d: 'bg-red-900/40 text-red-300' },
};

// ── Frontmatter parser ─────────────────────────────────────────────────────

function parseFrontmatter(src) {
  if (!src.startsWith('---\n')) return { meta: {}, body: src };
  const end = src.indexOf('\n---', 4);
  if (end === -1) return { meta: {}, body: src };
  const yaml = src.slice(4, end);
  const body = src.slice(end + 4).trimStart();
  const meta = {};
  const lines = yaml.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.startsWith('#')) { i++; continue; }
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (m) {
      const [, key, val] = m;
      const trimmed = val.trim().replace(/^["']|["']$/g, '');
      if (trimmed === '' || trimmed === 'null') {
        const arr = [];
        let j = i + 1;
        while (j < lines.length && /^\s+-\s+/.test(lines[j])) {
          arr.push(lines[j].replace(/^\s+-\s+"?|"?$/g, '').replace(/^["']|["']$/g, '').trim());
          j++;
        }
        meta[key] = arr.length > 0 ? arr : null;
        i = arr.length > 0 ? j : i + 1;
      } else {
        meta[key] = trimmed;
        i++;
      }
    } else { i++; }
  }
  return { meta, body };
}

// ── Path resolver ──────────────────────────────────────────────────────────

function resolvePath(currentPath, rel) {
  if (rel.startsWith('http')) return null; // external
  const base = currentPath.split('/').slice(0, -1);
  for (const part of rel.split('/')) {
    if (part === '..') base.pop();
    else if (part !== '.') base.push(part);
  }
  return base.join('/');
}

// ── Inline markdown ────────────────────────────────────────────────────────

function parseInline(text, onDocLink, dark) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[.+?\]\([^)]+\)|`[^`]+`)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**'))
      return <strong key={i}>{tok.slice(2, -2)}</strong>;
    if (tok.startsWith('*') && tok.endsWith('*'))
      return <em key={i}>{tok.slice(1, -1)}</em>;
    if (tok.startsWith('`') && tok.endsWith('`'))
      return <code key={i} className={`text-xs font-mono px-1 py-0.5 rounded ${dark ? 'bg-slate-700 text-amber-300' : 'bg-amber-50 text-amber-800'}`}>{tok.slice(1, -1)}</code>;
    const lm = tok.match(/^\[(.+?)\]\((.+?)\)$/);
    if (lm) {
      const [, linkText, href] = lm;
      if (!href.startsWith('http') && href.endsWith('.md') && onDocLink) {
        return <button key={i} onClick={() => onDocLink(href)} className={`underline underline-offset-2 transition-colors ${dark ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'}`}>{linkText}</button>;
      }
      return <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={`underline underline-offset-2 transition-colors ${dark ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'}`}>{linkText}</a>;
    }
    return tok;
  });
}

// ── Block markdown renderer ────────────────────────────────────────────────

function MarkdownBody({ src, currentPath, onDocLink, dark }) {
  const lines = src.split('\n');
  const out = [];
  let i = 0;
  const inline = (t) => parseInline(t, (rel) => onDocLink(resolvePath(currentPath, rel)), dark);

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('# '))  { out.push(<h1 key={i} className={`text-2xl font-serif font-bold mt-4 mb-3 ${dark ? 'text-amber-200' : 'text-amber-900'}`}>{inline(line.slice(2))}</h1>); i++; continue; }
    if (line.startsWith('## ')) { out.push(<h2 key={i} className={`text-base font-semibold mt-6 mb-2 ${dark ? 'text-amber-300' : 'text-amber-800'}`}>{inline(line.slice(3))}</h2>); i++; continue; }
    if (line.startsWith('### ')){ out.push(<h3 key={i} className={`text-sm font-semibold mt-4 mb-1.5 ${dark ? 'text-amber-400' : 'text-amber-700'}`}>{inline(line.slice(4))}</h3>); i++; continue; }

    // Table
    if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) { rows.push(lines[i]); i++; }
      const cells = (r) => r.split('|').slice(1, -1).map(c => c.trim());
      const isSep = (r) => r.replace(/[|\s:-]/g, '') === '';
      const hdr = cells(rows[0]);
      const body = rows.slice(2).filter(r => !isSep(r));
      out.push(
        <div key={`t${i}`} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <thead><tr className={`border-b ${dark ? 'border-amber-700/40' : 'border-amber-200'}`}>
              {hdr.map((h, j) => <th key={j} className={`text-left py-2 pr-4 font-medium ${dark ? 'text-amber-400' : 'text-amber-700'}`}>{inline(h)}</th>)}
            </tr></thead>
            <tbody>{body.map((row, ri) => (
              <tr key={ri} className={`border-b last:border-0 ${dark ? 'border-amber-800/30' : 'border-amber-100'}`}>
                {cells(row).map((c, ci) => <td key={ci} className={`py-2 pr-4 align-top ${dark ? 'text-amber-200' : 'text-amber-900'}`}>{inline(c)}</td>)}
              </tr>
            ))}</tbody>
          </table>
        </div>
      );
      continue;
    }

    // List
    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) { items.push(lines[i].slice(2)); i++; }
      out.push(
        <ul key={`ul${i}`} className="my-3 space-y-1 pl-4">
          {items.map((item, j) => (
            <li key={j} className={`text-sm flex gap-2 ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
              <span className={`mt-2 flex-shrink-0 w-1 h-1 rounded-full ${dark ? 'bg-amber-500' : 'bg-amber-600'}`} />
              <span>{inline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.trim() === '---') { out.push(<hr key={i} className={`my-6 ${dark ? 'border-amber-800/40' : 'border-amber-200'}`} />); i++; continue; }
    if (line.trim() === '') { i++; continue; }
    out.push(<p key={i} className={`text-sm leading-relaxed my-2 ${dark ? 'text-amber-200' : 'text-amber-900'}`}>{inline(line)}</p>);
    i++;
  }
  return <div>{out}</div>;
}

// ── Frontmatter metadata panel ─────────────────────────────────────────────

function MetaPanel({ meta, onDocLink, dark }) {
  if (!meta || Object.keys(meta).length === 0) return null;

  const pill = (text, color) => (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${color}`}>{text}</span>
  );

  const linkList = (ids, pathPrefix) => {
    if (!ids || ids.length === 0) return <span className={`text-xs ${dark ? 'text-amber-700' : 'text-amber-400'}`}>—</span>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {ids.map((id) => {
          const path = `${pathPrefix}/${id}.md`;
          return (
            <button key={id} onClick={() => onDocLink(path)}
              className={`text-[11px] underline underline-offset-2 transition-colors ${dark ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'}`}>
              {id}
            </button>
          );
        })}
      </div>
    );
  };

  const rows = [];

  if (meta.type) {
    const isApp = meta.type === 'app';
    rows.push(['Type', pill(meta.type, isApp
      ? (dark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-800')
      : (dark ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-100 text-violet-800'))]);
  }
  if (meta.lifecycle) {
    const lc = LIFECYCLE_COLORS[meta.lifecycle] ?? LIFECYCLE_COLORS.EXPERIMENT;
    rows.push(['Lifecycle', pill(meta.lifecycle, dark ? lc.d : lc.l)]);
  }
  if (meta.status) {
    const sc = STRATEGIC_COLORS[meta.status] ?? STRATEGIC_COLORS.vision;
    rows.push(['Status', pill(STRATEGIC_STATUS[meta.status] ?? meta.status, dark ? sc.d : sc.l)]);
  }
  if (meta.flag_key) rows.push(['Flag key', <code key="fk" className={`text-xs font-mono px-1 py-0.5 rounded ${dark ? 'bg-slate-700 text-amber-300' : 'bg-amber-50 text-amber-800'}`}>{meta.flag_key}</code>]);
  if (meta.flag_default) rows.push(['Default', <code key="fd" className={`text-xs font-mono px-1 py-0.5 rounded ${dark ? 'bg-slate-700 text-amber-300' : 'bg-amber-50 text-amber-800'}`}>{meta.flag_default}</code>]);
  if (meta.category) rows.push(['Category', <span key="cat" className={`text-xs ${dark ? 'text-amber-300' : 'text-amber-800'}`}>{meta.category}</span>]);
  if (meta.job) rows.push(['Job-to-be-done', <span key="job" className={`text-xs italic ${dark ? 'text-amber-300' : 'text-amber-800'}`}>"{meta.job}"</span>]);
  if (meta.opportunity) rows.push(['Opportunity', <span key="opp" className={`text-xs ${dark ? 'text-amber-400' : 'text-amber-700'}`}>{meta.opportunity}</span>]);
  if (meta.personas?.length > 0) rows.push(['Personas', linkList(meta.personas, 'docs/personas')]);
  if (meta.strategic_features?.length > 0) rows.push(['Strategic features', linkList(meta.strategic_features, 'docs/features')]);
  if (meta.app_features?.length > 0) rows.push(['App features', linkList(meta.app_features, 'docs/features')]);
  if (meta.related_personas?.length > 0) rows.push(['Related personas', linkList(meta.related_personas, 'docs/personas')]);
  if (meta.related_features?.length > 0) rows.push(['Related features', linkList(meta.related_features, 'docs/features')]);
  if (meta.parent) rows.push(['Parent', linkList([meta.parent], 'docs/features')]);
  if (meta.children?.length > 0) rows.push(['Children', linkList(meta.children, 'docs/features')]);

  if (rows.length === 0) return null;

  return (
    <div className={`rounded-xl border divide-y mb-6 ${dark ? 'border-amber-700/30 divide-amber-800/30' : 'border-amber-200 divide-amber-100'}`}>
      {rows.map(([label, value], idx) => (
        <div key={idx} className={`flex gap-3 px-4 py-2.5 ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
          <span className={`flex-shrink-0 w-36 text-xs pt-0.5 ${dark ? 'text-amber-600' : 'text-amber-500'}`}>{label}</span>
          <div className="flex-1 min-w-0">{value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Doc detail view ────────────────────────────────────────────────────────

function DocDetail({ path, onBack, onNavTo, dark }) {
  const [rawContent, setRawContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true); setError(null); setRawContent('');
    fetch(RAW_BASE + path)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(text => { setRawContent(text); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [path]);

  const { meta, body } = rawContent ? parseFrontmatter(rawContent) : { meta: {}, body: '' };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className={`flex items-center gap-2 text-sm font-medium transition-colors ${dark ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'}`}>
            <ChevronLeft size={16} />Feature Matrix
          </button>
          <a href={WEB_BASE + path} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-xs transition-colors ${dark ? 'text-amber-600 hover:text-amber-400' : 'text-amber-500 hover:text-amber-700'}`}>
            <ExternalLink size={12} />View on GitHub
          </a>
        </div>
        {loading && <p className={`text-sm ${dark ? 'text-amber-600' : 'text-amber-500'}`}>Loading…</p>}
        {error && <p className={`text-sm ${dark ? 'text-red-400' : 'text-red-600'}`}>Could not load <code>{path}</code>: {error}</p>}
        {!loading && !error && (
          <>
            <MetaPanel meta={meta} onDocLink={onNavTo} dark={dark} />
            <MarkdownBody src={body} currentPath={path} onDocLink={onNavTo} dark={dark} />
          </>
        )}
      </div>
    </div>
  );
}

// ── Matrix row ─────────────────────────────────────────────────────────────

function MatrixRow({ feature, personaSet, badge, onOpenDoc, dark, isLast }) {
  return (
    <tr className={`${!isLast ? `border-b ${dark ? 'border-amber-800/30' : 'border-amber-100'}` : ''} ${dark ? 'hover:bg-amber-900/10' : 'hover:bg-amber-50/50'}`}>
      <td className="py-2 px-4 whitespace-nowrap">
        <button onClick={() => onOpenDoc(feature.path)}
          className={`text-xs font-medium hover:underline underline-offset-2 transition-colors ${dark ? 'text-amber-300 hover:text-amber-100' : 'text-amber-800 hover:text-amber-600'}`}>
          {feature.label}
        </button>
      </td>
      <td className="py-2 px-2 text-center">{badge}</td>
      {PERSONAS.map(p => (
        <td key={p.id} className="py-2 px-2 text-center">
          {personaSet.has(p.id)
            ? <button onClick={() => onOpenDoc(feature.path)} title={`${feature.label} × ${p.label}`}
                className={`text-sm leading-none hover:scale-125 transition-transform ${dark ? 'text-amber-500' : 'text-amber-600'}`}>✓</button>
            : <span className={`text-xs ${dark ? 'text-amber-900' : 'text-amber-200'}`}>·</span>}
        </td>
      ))}
    </tr>
  );
}

// ── Landing: full matrix ───────────────────────────────────────────────────

function MatrixLanding({ onOpenDoc, onBack, dark }) {
  const appGroups = [...new Set(APP_FEATURES.map(f => f.group))];

  const tableHeader = (
    <thead>
      <tr className={`border-b ${dark ? 'border-amber-700/30 bg-amber-900/20' : 'border-amber-200 bg-amber-50'}`}>
        <th className={`text-left py-3 px-4 font-semibold text-xs ${dark ? 'text-amber-400' : 'text-amber-700'}`}>Feature</th>
        <th className={`py-3 px-2 text-center text-xs font-medium ${dark ? 'text-amber-500' : 'text-amber-600'}`}>Status</th>
        {PERSONAS.map(p => (
          <th key={p.id} className="py-3 px-2 text-center">
            <button onClick={() => onOpenDoc(p.path)} title={p.label} className="text-base hover:scale-110 transition-transform block mx-auto">{p.emoji}</button>
          </th>
        ))}
      </tr>
    </thead>
  );

  const sectionHeader = (label, colspan) => (
    <tr key={`sec-${label}`}>
      <td colSpan={colspan} className={`py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest ${dark ? 'bg-amber-950/40 text-amber-600' : 'bg-amber-100/70 text-amber-500'}`}>
        {label}
      </td>
    </tr>
  );

  const colSpan = 2 + PERSONAS.length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className={`flex items-center gap-2 text-sm font-medium transition-colors ${dark ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'}`}>
            <ChevronLeft size={16} />Zurück
          </button>
          <a href={`${WEB_BASE}docs/personas.md`} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-xs transition-colors ${dark ? 'text-amber-600 hover:text-amber-400' : 'text-amber-500 hover:text-amber-700'}`}>
            <ExternalLink size={12} />View on GitHub
          </a>
        </div>

        <div className="mb-2">
          <h1 className={`text-2xl font-serif font-bold ${dark ? 'text-amber-200' : 'text-amber-900'}`}>Product Vision</h1>
          <p className={`mt-1 text-sm ${dark ? 'text-amber-600' : 'text-amber-500'}`}>10 personas · 16 strategic features · 30 app features — click any name to read the full doc</p>
        </div>

        {/* Persona pills */}
        <div className="flex flex-wrap gap-2 my-6">
          {PERSONAS.map(p => (
            <button key={p.id} onClick={() => onOpenDoc(p.path)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dark ? 'bg-amber-800/30 text-amber-300 hover:bg-amber-700/40' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}>
              {p.emoji} {p.label}
            </button>
          ))}
        </div>

        {/* Matrix table */}
        <div className={`rounded-2xl border overflow-hidden ${dark ? 'border-amber-700/30' : 'border-amber-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              {tableHeader}
              <tbody>
                {/* Strategic features section */}
                {sectionHeader('Strategic Features — Roadmap', colSpan)}
                {STRATEGIC_FEATURES.map((f, idx) => {
                  const sc = STRATEGIC_COLORS[f.status] ?? STRATEGIC_COLORS.vision;
                  const badge = <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${dark ? sc.d : sc.l}`}>{STRATEGIC_STATUS[f.status]}</span>;
                  return <MatrixRow key={f.id} feature={f} personaSet={new Set(STRATEGIC_MATRIX[f.id] ?? [])} badge={badge} onOpenDoc={onOpenDoc} dark={dark} isLast={false} />;
                })}
                {/* App features — one section per group */}
                {appGroups.map(group => {
                  const groupFeatures = APP_FEATURES.filter(f => f.group === group);
                  return [
                    sectionHeader(`App Features — ${group}`, colSpan),
                    ...groupFeatures.map((f, idx) => {
                      const lc = LIFECYCLE_COLORS[f.lifecycle] ?? LIFECYCLE_COLORS.EXPERIMENT;
                      const badge = <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${dark ? lc.d : lc.l}`}>{f.lifecycle}</span>;
                      return <MatrixRow key={f.id} feature={f} personaSet={new Set(APP_MATRIX[f.id] ?? [])} badge={badge} onOpenDoc={onOpenDoc} dark={dark} isLast={idx === groupFeatures.length - 1} />;
                    }),
                  ];
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <button onClick={() => onOpenDoc('docs/product-strategy.md')}
            className={`text-sm underline underline-offset-2 hover:no-underline transition-colors ${dark ? 'text-amber-500 hover:text-amber-300' : 'text-amber-600 hover:text-amber-800'}`}>
            Product Strategy →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Root export ────────────────────────────────────────────────────────────

export default function PersonasDocsView({ onBack }) {
  const { dark } = useTheme();
  const [currentPath, setCurrentPath] = useState(null);

  if (currentPath) {
    return <DocDetail path={currentPath} onBack={() => setCurrentPath(null)} onNavTo={setCurrentPath} dark={dark} />;
  }
  return <MatrixLanding onOpenDoc={setCurrentPath} onBack={onBack} dark={dark} />;
}
