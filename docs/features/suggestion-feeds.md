---
id: "suggestion-feeds"
name: "Suggestion Feeds"
type: "strategic"
status: "vision"
category: "discovery"
personas:
  - "02-parents"
  - "04-culture-explorers"
  - "05-therapeutic"
  - "07-passive-consumers"
  - "09-seniors"
  - "10-gamified-explorers"
related_features:
  - "mood-recommendations"
  - "age-filter"
  - "story-directories"
  - "favorites"
  - "deep-search"
parent: null
children: []
---

# Suggestion Feeds — Search-Term Landscape

Configurable daily feeds that surface stories matching the user's current
season, region, mood, preferred motifs, or moral focus. Each feed is a
**search-term bundle** scored against the story index (slug, title,
frontmatter, body) and rendered as a horizontal carousel on the home screen.

This document maps the **landscape of search terms** that can source those
feeds. Treat each axis as an independent generator: a user can enable any
combination of feeds; the runtime picks today's matches.

## Corpus inventory (term-search target)

| Source | Stories | Depth | Locale | Notes |
|---|---:|---|---|---|
| `grimm` | 224 | 2-level | de-DE | Hochdeutsch, ageMin/ageMax populated |
| `andersen` | ~50 | 2-level | de-DE | Hochdeutsch translation |
| `swiss` | varies | 3-level (canton) | de-CH | Cantonal Sagen, regional axis built-in |
| `hohler` | small | 2-level | gsw (Bärndütsch) | Dialect axis |
| `maerchenstiftung` | small | 2-level | de-DE | Curated, includes calendar tales |
| `idiotikon` | small | 2-level | gsw / archaic | Dialect / linguistic axis |
| `@tweakch/collection-grimm-klassiker` | 15 | collection | de | "Canon" affinity |
| `@tweakch/collection-grimm-tiere` | 12 | collection | de | "Animal tales" affinity |
| `@tweakch/collection-grimm-top5` | 5 | collection | de | "Quick start" affinity |

## Axes

Six independent axes drive feed selection. Each axis exposes one or more
**feed configs**, each config a `{ id, label, terms[], activeWhen() }` tuple.

1. **Seasonal** — calendar-driven (month, holiday, weather)
2. **Regional** — geography-driven (canton, landscape feature, country)
3. **Moral / Tugend** — virtue / vice / archetype-of-conduct
4. **Motif (preference)** — characters, animals, objects, settings
5. **Mood** — emotional state (per `mood-recommendations.md`)
6. **Reading context** — length, age, dialect, time-of-day

Search terms are matched **case-insensitively** with German diacritic
folding (ä→ae, ö→oe, ü→ue, ß→ss) against `slug + " " + title` for v1.
A v2 pass adds body-token matching once frontmatter tags are enriched.

---

## 1. Seasonal feeds

| Feed id | Active window | Search terms (slug/title substrings) |
|---|---|---|
| `winter-weihnachten` | Nov 15 – Jan 6 | `schnee`, `eis`, `frost`, `weihn`, `christ`, `tann`, `stern`, `engel`, `nikol`, `advent`, `krippe`, `koenig` (drei) |
| `silvester-neujahr` | Dec 28 – Jan 2 | `jahr`, `neujahr`, `silvester`, `wunsch`, `glueck` |
| `fasnacht-karneval` | Jan 6 – Ash Wed | `narr`, `maske`, `verkleid`, `lustig`, `bruder lustig`, `tanz` |
| `fruehling-ostern` | Mar 1 – Apr 30 | `oster`, `lamm`, `hase`, `ei`, `frueh`, `bluete`, `knosp`, `auferstehung`, `gaensebluemchen` |
| `mai-pfingsten` | May | `mai`, `wiese`, `blume`, `pfingst`, `taube` |
| `sommer-licht` | Jun – Aug | `sommer`, `sonne`, `wald`, `see`, `meer`, `quelle`, `aussersten meer` |
| `erntezeit` | Aug – Sep | `ernte`, `korn`, `muhl`, `mueller`, `brot`, `garbe` |
| `herbst-nebel` | Oct | `herbst`, `nebel`, `blatt`, `kuerbis` |
| `martinstag` | Nov 5 – 15 | `martin`, `latern`, `gans`, `bettler`, `mantel` |
| `allerheiligen-tod` | Oct 28 – Nov 5 | `tod`, `gevatter`, `bote`, `friedhof`, `grab`, `geist`, `gespenst` |
| `nationalfeiertag-ch` | Aug 1 ± 3 | every story under `swiss/`, plus `eidg`, `tell`, `bund` |
| `valentinstag` | Feb 10 – 16 | `lieb`, `treu`, `braut`, `hochzeit`, `frosch`, `rapunzel`, `kuess` |
| `muttertag` | 2nd Sun May ± 3 | `mutter`, `stiefmutter`, `kind`, `wiege`, `frau holle` |

## 2. Regional feeds

The `swiss/` source is already organised by canton. Each canton can be
exposed as a feed without further enrichment:

| Feed id | Source filter |
|---|---|
| `region-bern` | `swiss/bern/*` |
| `region-zuerich` | `swiss/zuerich/*` |
| `region-graubuenden` | `swiss/graubuenden/*` |
| ...one per canton |  |

**Cross-source landscape feeds** (search terms across all sources):

| Feed id | Terms |
|---|---|
| `landschaft-berge` | `berg`, `alp`, `gipfel`, `gletsch`, `pass`, `fels`, `drachenloch` |
| `landschaft-wasser` | `see`, `bach`, `fluss`, `quell`, `meer`, `brunnen`, `aar` |
| `landschaft-wald` | `wald`, `forst`, `tann`, `lichtung`, `holz` |
| `landschaft-burg` | `burg`, `schloss`, `turm`, `kapell`, `kloster`, `kirch` |
| `dialekt-schweiz` | source ∈ {`hohler`, `swiss`, `idiotikon`} |
| `dialekt-baerndeutsch` | source = `hohler` |

## 3. Moral / Tugend feeds

| Feed id | Label | Terms |
|---|---|---|
| `tugend-fleiss` | Fleiß belohnt | `fleiss`, `arbeit`, `frau holle`, `sterntal`, `aschen`, `brave` |
| `tugend-mut` | Mut & Tapferkeit | `tapfer`, `furcht`, `mutig`, `kuehn`, `held`, `nichts fuerchtet` |
| `tugend-demut` | Demut & Bescheidenheit | `demut`, `bescheid`, `armut`, `arm`, `bettler` |
| `tugend-treue` | Treue & Freundschaft | `treu`, `freund`, `bruder`, `gefaehrt`, `kamerad`, `reisekamerad` |
| `tugend-mitleid` | Mitleid & Barmherzigkeit | `mitleid`, `barm`, `helf`, `teil`, `geben`, `gans` (Sterntaler-Motiv) |
| `tugend-klugheit` | List & Klugheit | `klug`, `list`, `schlau`, `raetsel`, `aufgabe`, `kluges grethel` |
| `warnung-habgier` | Habgier bestraft | `gier`, `geiz`, `gold`, `goldene gans`, `fischer und seine frau` |
| `warnung-hochmut` | Hochmut kommt vor dem Fall | `stolz`, `hochmut`, `eitel`, `koenig drosselbart`, `spiegel` |
| `warnung-luege` | Lüge & Verrat | `luege`, `betrug`, `verrat`, `stiefmutter`, `falsche braut` |
| `warnung-faulheit` | Faulheit | `faul`, `traeg`, `siebenschlaefer` |
| `motiv-erloesung` | Erlösung | `erloesung`, `verwunsch`, `verzaubert`, `frosch`, `dornroes`, `schwan` |
| `motiv-gerechtigkeit` | Gerechte Strafe | `strafe`, `gericht`, `gerechtig`, `teufel` |
| `motiv-vergebung` | Vergebung & Versöhnung | `vergeb`, `versoehn`, `reue`, `bereu` |

## 4. Motif (preference) feeds

User picks favourite motifs in onboarding; each becomes a feed.

### Characters / archetypes
- `chars-koenigshaus` — `koenig`, `koenigin`, `prinz`, `prinzess`
- `chars-handwerk` — `schneider`, `schuster`, `mueller`, `schmied`, `tischler`
- `chars-bauer-hirte` — `bauer`, `hirte`, `magd`, `knecht`
- `chars-uebernatuerlich` — `hexe`, `zauber`, `fee`, `riese`, `zwerg`, `drache`, `kobold`, `unhold`, `teufel`, `engel`, `tod`, `geist`
- `chars-familie` — `mutter`, `vater`, `bruder`, `schwester`, `kind`, `waise`, `stiefmutter`, `juengster`, `sieben`

### Animals (maps to `grimm-tiere` collection)
- `tiere-wolf-fuchs` — `wolf`, `fuchs`
- `tiere-vogel` — `vogel`, `gans`, `huhn`, `sperling`, `eule`, `nachtigall`, `zaunkoenig`, `taube`, `rohrdommel`
- `tiere-haustier` — `katze`, `hund`, `pferd`, `esel`, `ziege`, `schaf`
- `tiere-wild` — `baer`, `hase`, `igel`, `loewe`, `hirsch`, `reh`, `wild`
- `tiere-klein` — `frosch`, `maus`, `biene`, `fisch`, `scholle`, `schlange`
- `bremer-stadtmusikanten` — explicit slug match

### Objects / magic items
- `obj-magisch` — `ring`, `spiegel`, `spinn`, `apfel`, `goldener`, `silber`, `mantel`, `kappe`, `horn`, `harfe`, `topf`, `tisch deck`, `lebenswasser`
- `obj-kleidung` — `schuh`, `kleid`, `hut`, `mantel`, `pantoffel`
- `obj-essen` — `brot`, `apfel`, `kuchen`, `suppe`, `wein`

### Settings
- `setting-schloss` — `schloss`, `burg`, `turm`, `palast`
- `setting-wald-huette` — `wald`, `huette`, `hexenhaus`, `lichtung`
- `setting-jenseits` — `himmel`, `hoelle`, `unterwelt`, `paradies`, `engel`

### Story patterns
- `pattern-aufgabe` — `aufgabe`, `pruefung`, `wette`, `raetsel`
- `pattern-wunsch` — `wunsch`, `drei wuensche`, `fee`
- `pattern-fluch` — `fluch`, `verwunsch`, `verzaubert`, `bann`

## 5. Mood feeds (per `mood-recommendations.md`)

| Mood | Search direction |
|---|---|
| `mood-anxious` | "calming, resolved endings": `aschenputtel`, `dornroes`, `sterntal`, `frau holle` |
| `mood-sad` | "transformative, hopeful": `haessl`, `entlein`, `frosch`, `sterntal`, `aschen` |
| `mood-angry` | "trickster satisfaction": `rumpel`, `tapfere schneider`, `kluges grethel`, `bremer` |
| `mood-curious` | "adventure, discovery": `reisekamerad`, `abenteuer`, `nichts fuerchtet`, `tell` |
| `mood-nostalgic` | "canon": `collection-grimm-klassiker` membership |
| `mood-cosy` | "kurze warme Geschichten": short word count + `winter`, `tee`, `kachel`, `huette` |
| `mood-thrill` | "düstere Stoffe": `blaubart`, `hexe`, `teufel`, `tod`, `geist`, `gespenst` |

## 6. Reading-context feeds

Filter on existing frontmatter (no enrichment needed for v1).

| Feed id | Filter |
|---|---|
| `dauer-3min` | `wordCount < 500` |
| `dauer-mittag` | `500 ≤ wordCount < 2000` |
| `dauer-wochenend` | `wordCount ≥ 2000` |
| `bedtime-kurz` | `wordCount < 800` AND `ageMax ≤ 8` |
| `alter-3-6` | `ageMin ≤ 6 AND (ageMax == null OR ageMax ≥ 4)` |
| `alter-6-9` | overlap with [6,9] |
| `alter-9-12` | overlap with [9,12] |
| `alter-erwachsen` | `ageMax == null OR ageMax ≥ 14`; or known dark slugs (`blaubart`, `gevatter_tod`, `boten_des_todes`) |
| `dialekt-schweiz` | sources `hohler`, `swiss`, `idiotikon` |
| `kanon-grimm` | collection `grimm-klassiker` |
| `tier-collection` | collection `grimm-tiere` |
| `quickstart` | collection `grimm-top5` |

## Composition: today's daily feed

The runtime composes the daily feed as an ordered list of feed bundles:

1. **Always-on personal feeds** — user-toggled motif / mood / region selections
2. **Calendar feeds** active today (window check)
3. **Surprise feed** — a random low-frequency motif feed (cycled daily by date seed)
4. **Quickstart fallback** — if any feed yields fewer than `N` matches, fall back to `grimm-klassiker`

Within each feed, stories are ranked by:
- term-match score (number of terms hit, weighted by slug > title > body)
- novelty boost (not in user's `readHistory`)
- favourites affinity (sources with prior favourites get +1)
- a stable per-day seed so the same date returns the same order

## Data-enrichment gaps (blocking v2)

Current frontmatter exposes only `title`, `source`, `wordCount`,
`ageMin`, `ageMax`. To reach v2 quality, add per-story sidecar:

```yaml
# stories/{source}/{slug}/tags.json
motifs: [wolf, wald, list, juengster_sohn]
virtues: [klugheit, mut]
warnings: [habgier]
seasons: [herbst]
moods: [angry, curious]
landscape: [wald]
characters: [koenig, prinz, fuchs]
objects: [goldener_apfel]
patterns: [aufgabe, drei_wuensche]
darkness: 2  # 0=heiter, 5=dunkel
ageBand: 6-12
```

Generation strategy: AI tagging pass via the Claude API over each
`content.md`, written by a new `npm run enrich` task that parallels
`npm run crawl`. Tags become the primary feed-matching surface; raw
search terms remain as a fallback.

## Implementation hooks

- **Module:** `src/lib/suggestionFeeds.js` — feed configs, matcher, builder
- **Glue:** consume `getStoryIndex()` from `src/lib/storyLibrary.js`
- **UI:** new home screen in `AppLayout` with one carousel per active feed
- **Flag:** `suggestion-feeds` (off by default)
- **Test ids:** `feed-row`, `feed-label`, `feed-card`, `feed-empty`

## Links

- [Mood Recommendations](mood-recommendations.md) — mood axis source
- [Age Filter](age-filter.md) — context-axis precedent
- [Story Directories](story-directories.md) — regional axis precedent
- [Deep Search](deep-search.md) — body-text matching engine for v2
- [Favorites](favorites.md) — affinity signal for ranking
