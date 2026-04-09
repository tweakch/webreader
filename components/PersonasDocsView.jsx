import { useState, useEffect } from 'react';
import { ChevronLeft, ExternalLink, Users } from 'lucide-react';
import { useTheme } from '../ui/ThemeContext';

const BRANCH = 'claude/extended-user-personas-ZD1hR';
const RAW_BASE = `https://raw.githubusercontent.com/tweakch/webreader/${BRANCH}/`;
const WEB_BASE = `https://github.com/tweakch/webreader/blob/${BRANCH}/`;

const PERSONAS = [
  { id: '01-pre-readers',       label: 'Pre-Readers',        emoji: '👶', path: 'docs/personas/01-pre-readers.md' },
  { id: '02-parents',           label: 'Parents',            emoji: '👨‍👩‍👧', path: 'docs/personas/02-parents.md' },
  { id: '03-teachers',          label: 'Teachers',           emoji: '🧑‍🏫', path: 'docs/personas/03-teachers.md' },
  { id: '04-culture-explorers', label: 'Culture Explorers',  emoji: '🌍', path: 'docs/personas/04-culture-explorers.md' },
  { id: '05-therapeutic',       label: 'Therapeutic',        emoji: '🧘', path: 'docs/personas/05-therapeutic.md' },
  { id: '06-creatives',         label: 'Creatives',          emoji: '🎭', path: 'docs/personas/06-creatives.md' },
  { id: '07-passive-consumers', label: 'Passive Consumers',  emoji: '🎧', path: 'docs/personas/07-passive-consumers.md' },
  { id: '08-developers',        label: 'Developers',         emoji: '🧑‍💻', path: 'docs/personas/08-developers.md' },
  { id: '09-seniors',           label: 'Seniors',            emoji: '🧓', path: 'docs/personas/09-seniors.md' },
  { id: '10-gamified-explorers',label: 'Gamified Explorers', emoji: '🧩', path: 'docs/personas/10-gamified-explorers.md' },
];

const FEATURES = [
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

// persona id sets per feature
const MATRIX = {
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

const STATUS_LABELS = { mvp: 'MVP', 'near-term': 'Near-term', vision: 'Vision' };
const STATUS_COLORS = {
  mvp:        { light: 'bg-emerald-100 text-emerald-800', dark: 'bg-emerald-900/40 text-emerald-300' },
  'near-term':{ light: 'bg-amber-100 text-amber-800',     dark: 'bg-amber-900/40 text-amber-300' },
  vision:     { light: 'bg-violet-100 text-violet-800',   dark: 'bg-violet-900/40 text-violet-300' },
};

// Resolve a relative .md link from a current doc path to an absolute repo path
function resolvePath(currentPath, relativePath) {
  const base = currentPath.split('/').slice(0, -1);
  for (const part of relativePath.split('/')) {
    if (part === '..') base.pop();
    else base.push(part);
  }
  return base.join('/');
}

// ── Inline markdown parser ──────────────────────────────────────────────────
function parseInline(text, onDocLink, dark) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[.+?\]\([^)]+\)|`[^`]+`)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**'))
      return <strong key={i}>{tok.slice(2, -2)}</strong>;
    if (tok.startsWith('*') && tok.endsWith('*'))
      return <em key={i}>{tok.slice(1, -1)}</em>;
    if (tok.startsWith('`') && tok.endsWith('`'))
      return (
        <code key={i} className={`text-xs font-mono px-1 py-0.5 rounded ${dark ? 'bg-slate-700 text-amber-300' : 'bg-amber-50 text-amber-800'}`}>
          {tok.slice(1, -1)}
        </code>
      );
    const lm = tok.match(/^\[(.+?)\]\((.+?)\)$/);
    if (lm) {
      const [, linkText, href] = lm;
      if (!href.startsWith('http') && href.endsWith('.md') && onDocLink) {
        return (
          <button
            key={i}
            onClick={() => onDocLink(href)}
            className={`underline underline-offset-2 hover:no-underline transition-colors ${dark ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'}`}
          >
            {linkText}
          </button>
        );
      }
      return (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer"
          className={`underline underline-offset-2 hover:no-underline transition-colors ${dark ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'}`}>
          {linkText}
        </a>
      );
    }
    return tok;
  });
}

// ── Block markdown renderer ─────────────────────────────────────────────────
function MarkdownRenderer({ src, currentPath, onDocLink, dark }) {
  const lines = src.split('\n');
  const elements = [];
  let i = 0;

  const inline = (text) => parseInline(text, (rel) => onDocLink(resolvePath(currentPath, rel)), dark);

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className={`text-2xl font-serif font-bold mt-6 mb-3 ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
          {inline(line.slice(2))}
        </h1>
      );
      i++; continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className={`text-lg font-semibold mt-6 mb-2 ${dark ? 'text-amber-300' : 'text-amber-800'}`}>
          {inline(line.slice(3))}
        </h2>
      );
      i++; continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className={`text-base font-semibold mt-4 mb-1.5 ${dark ? 'text-amber-400' : 'text-amber-700'}`}>
          {inline(line.slice(4))}
        </h3>
      );
      i++; continue;
    }

    // Table
    if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(lines[i]);
        i++;
      }
      const isSep = (row) => row.replace(/[|\s:-]/g, '') === '';
      const cells = (row) => row.split('|').slice(1, -1).map((c) => c.trim());
      const header = cells(rows[0]);
      const body = rows.slice(2).filter((r) => !isSep(r));
      elements.push(
        <div key={`t-${i}`} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className={`border-b ${dark ? 'border-amber-700/40' : 'border-amber-200'}`}>
                {header.map((h, j) => (
                  <th key={j} className={`text-left py-2 pr-4 font-medium ${dark ? 'text-amber-400' : 'text-amber-700'}`}>
                    {inline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className={`border-b last:border-0 ${dark ? 'border-amber-800/30' : 'border-amber-100'}`}>
                  {cells(row).map((c, ci) => (
                    <td key={ci} className={`py-2 pr-4 align-top ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
                      {inline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Bullet list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-3 space-y-1 pl-4">
          {items.map((item, j) => (
            <li key={j} className={`text-sm flex gap-2 ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
              <span className={`mt-1.5 flex-shrink-0 w-1 h-1 rounded-full ${dark ? 'bg-amber-500' : 'bg-amber-600'}`} />
              <span>{inline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---') {
      elements.push(<hr key={i} className={`my-6 ${dark ? 'border-amber-800/40' : 'border-amber-200'}`} />);
      i++; continue;
    }

    // Empty line
    if (line.trim() === '') { i++; continue; }

    // Paragraph
    elements.push(
      <p key={i} className={`text-sm leading-relaxed my-2 ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
        {inline(line)}
      </p>
    );
    i++;
  }

  return <div>{elements}</div>;
}

// ── Doc detail view ──────────────────────────────────────────────────────────
function DocDetail({ path, onBack, onNavTo, dark, tc }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setContent('');
    fetch(RAW_BASE + path)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then((text) => { setContent(text); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [path]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${dark ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'}`}
          >
            <ChevronLeft size={16} />
            Feature Matrix
          </button>
          <a
            href={WEB_BASE + path}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-xs transition-colors ${dark ? 'text-amber-600 hover:text-amber-400' : 'text-amber-500 hover:text-amber-700'}`}
          >
            <ExternalLink size={12} />
            View on GitHub
          </a>
        </div>

        {loading && (
          <div className={`text-sm ${dark ? 'text-amber-600' : 'text-amber-500'}`}>Loading…</div>
        )}
        {error && (
          <div className={`text-sm ${dark ? 'text-red-400' : 'text-red-600'}`}>
            Could not load <code className="font-mono">{path}</code>: {error}
          </div>
        )}
        {!loading && !error && (
          <MarkdownRenderer
            src={content}
            currentPath={path}
            onDocLink={onNavTo}
            dark={dark}
          />
        )}
      </div>
    </div>
  );
}

// ── Landing: feature matrix ─────────────────────────────────────────────────
function MatrixLanding({ onOpenDoc, onBack, dark }) {
  const matrixSets = Object.fromEntries(
    Object.entries(MATRIX).map(([fid, pids]) => [fid, new Set(pids)])
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${dark ? 'text-amber-400 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'}`}
          >
            <ChevronLeft size={16} />
            Zurück
          </button>
          <a
            href={`${WEB_BASE}docs/personas.md`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-xs transition-colors ${dark ? 'text-amber-600 hover:text-amber-400' : 'text-amber-500 hover:text-amber-700'}`}
          >
            <ExternalLink size={12} />
            View on GitHub
          </a>
        </div>

        <div className="mb-6">
          <h1 className={`text-2xl font-serif font-bold ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
            Product Vision
          </h1>
          <p className={`mt-1 text-sm ${dark ? 'text-amber-600' : 'text-amber-500'}`}>
            10 personas · 16 features — click any name to read the full doc
          </p>
        </div>

        {/* Persona quick-links */}
        <div className="flex flex-wrap gap-2 mb-8">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenDoc(p.path)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                dark
                  ? 'bg-amber-800/30 text-amber-300 hover:bg-amber-700/40'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>

        {/* Feature matrix table */}
        <div className={`rounded-2xl border overflow-hidden ${dark ? 'border-amber-700/30' : 'border-amber-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className={`border-b ${dark ? 'border-amber-700/30 bg-amber-900/20' : 'border-amber-200 bg-amber-50'}`}>
                  <th className={`text-left py-3 px-4 font-semibold whitespace-nowrap ${dark ? 'text-amber-400' : 'text-amber-700'}`}>
                    Feature
                  </th>
                  <th className={`py-3 px-2 text-center font-medium ${dark ? 'text-amber-500' : 'text-amber-600'}`}>
                    Status
                  </th>
                  {PERSONAS.map((p) => (
                    <th key={p.id} className="py-3 px-2 text-center">
                      <button
                        onClick={() => onOpenDoc(p.path)}
                        title={p.label}
                        className={`text-base hover:scale-110 transition-transform block mx-auto`}
                      >
                        {p.emoji}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, fi) => {
                  const personas = matrixSets[f.id] ?? new Set();
                  const sc = STATUS_COLORS[f.status];
                  return (
                    <tr
                      key={f.id}
                      className={`border-b last:border-0 ${
                        dark ? 'border-amber-800/30 hover:bg-amber-900/10' : 'border-amber-100 hover:bg-amber-50/50'
                      }`}
                    >
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => onOpenDoc(f.path)}
                          className={`text-xs font-medium hover:underline underline-offset-2 transition-colors ${dark ? 'text-amber-300 hover:text-amber-100' : 'text-amber-800 hover:text-amber-600'}`}
                        >
                          {f.label}
                        </button>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${dark ? sc.dark : sc.light}`}>
                          {STATUS_LABELS[f.status]}
                        </span>
                      </td>
                      {PERSONAS.map((p) => (
                        <td key={p.id} className="py-2.5 px-2 text-center">
                          {personas.has(p.id) ? (
                            <button
                              onClick={() => onOpenDoc(f.path)}
                              title={`${f.label} × ${p.label}`}
                              className={`text-base hover:scale-110 transition-transform ${dark ? 'text-amber-500' : 'text-amber-600'}`}
                            >
                              ✓
                            </button>
                          ) : (
                            <span className={`${dark ? 'text-amber-900' : 'text-amber-200'}`}>·</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategy link */}
        <div className="mt-6">
          <button
            onClick={() => onOpenDoc('docs/product-strategy.md')}
            className={`text-sm underline underline-offset-2 hover:no-underline transition-colors ${dark ? 'text-amber-500 hover:text-amber-300' : 'text-amber-600 hover:text-amber-800'}`}
          >
            Product Strategy →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Root export ──────────────────────────────────────────────────────────────
export default function PersonasDocsView({ onBack }) {
  const { dark, tc } = useTheme();
  const [currentPath, setCurrentPath] = useState(null);

  if (currentPath) {
    return (
      <DocDetail
        path={currentPath}
        onBack={() => setCurrentPath(null)}
        onNavTo={setCurrentPath}
        dark={dark}
        tc={tc}
      />
    );
  }

  return (
    <MatrixLanding
      onOpenDoc={setCurrentPath}
      onBack={onBack}
      dark={dark}
    />
  );
}
