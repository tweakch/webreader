# Graph Report - .  (2026-04-08)

## Corpus Check
- 28 files · ~10,333 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 99 nodes · 91 edges · 30 communities detected
- Extraction: 77% EXTRACTED · 23% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.66)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `writeStory()` - 5 edges
2. `Story Pipeline Architecture` - 5 edges
3. `Reader Pagination (DOM Word-Packing)` - 5 edges
4. `buildPages Algorithm` - 5 edges
5. `stories/ Content Directory` - 5 edges
6. `runSource()` - 4 edges
7. `assertAllPages()` - 4 edges
8. `Story Directory Structure` - 4 edges
9. `Playwright data-testid Attributes` - 4 edges
10. `nextDelay()` - 3 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Hyperedges (group relationships)
- **Two-depth story loading via Vite import.meta.glob** - claudemd_vite_glob, claudemd_story_directory_structure, claudemd_stories_dir [EXTRACTED 1.00]
- **Feature Flags Set (story-directories, speed-reader, speedreader-orp)** - claudemd_feature_flag_story_directories, claudemd_feature_flag_speed_reader, claudemd_feature_flag_speedreader_orp, claudemd_openfeature [INFERRED 0.80]
- **Pagination Algorithm Components (buildPages, measureRef, readerAreaRef)** - claudemd_buildpages, claudemd_measureref, claudemd_readerarearef, claudemd_grimm_reader [EXTRACTED 1.00]
- **Crawler Pipeline Components** - claudemd_source_adapter, claudemd_crawlers_core, claudemd_crawlers_index, claudemd_stories_dir [EXTRACTED 1.00]

## Communities

### Community 0 - "Crawler Core Utilities"
Cohesion: 0.26
Nodes (10): buildFrontmatter(), buildHeaders(), countWords(), fetchHtml(), nextDelay(), normalizeBody(), randInt(), runSource() (+2 more)

### Community 1 - "Story Pipeline & Content Sources"
Cohesion: 0.25
Nodes (11): crawlers/core.ts, crawlers/index.ts, Rationale: content not hardcoded, lives in stories/ dir, SourceAdapter Interface, Source: Andersen (2-level), Source: Grimm (2-level), Source: Swiss (3-level, canton as directory), stories/ Content Directory (+3 more)

### Community 2 - "Reader Pagination Engine"
Cohesion: 0.39
Nodes (8): buildPages Algorithm, grimm-reader.jsx, measureRef (hidden off-screen div), NavBar Component, Rationale: DOM word-packing over scroll/CSS columns, Rationale: nav bar as flex sibling (not absolute), Reader Pagination (DOM Word-Packing), readerAreaRef (reading viewport)

### Community 3 - "Pagination Tests"
Cohesion: 0.43
Nodes (4): assertAllPages(), assertDeadSpaceWithinOneLine(), assertNoParagraphBehindHeader(), assertNoParagraphBehindNavBar()

### Community 4 - "Persistence Tests"
Cohesion: 0.29
Nodes (0): 

### Community 5 - "Feature Flags & Test IDs"
Cohesion: 0.43
Nodes (7): Feature Flag: speed-reader, Feature Flag: speedreader-orp, Feature Flag: story-directories, OpenFeature SDK, Playwright E2E Tests, Sidebar Navigation Architecture, Playwright data-testid Attributes

### Community 6 - "Normalize & Word Count"
Cohesion: 0.33
Nodes (0): 

### Community 7 - "Flags E2E Tests"
Cohesion: 0.5
Nodes (0): 

### Community 8 - "usePersistence Hook"
Cohesion: 0.5
Nodes (0): 

### Community 9 - "Story Close Tests"
Cohesion: 0.67
Nodes (0): 

### Community 10 - "App Icon & Branding"
Cohesion: 0.67
Nodes (3): Book / Open Book Visual Concept, Reading Application, Webreader App Icon (SVG)

### Community 11 - "Backfill Word Count"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "App Entry Point"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "useFeatureFlags Hook"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "useReader Hook"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "useTypography Hook"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "CSS Class Utility"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Tailwind Config Rationale"
Cohesion: 1.0
Nodes (2): Rationale: @config required in Tailwind v4 for config file, Tailwind v4 CSS Setup

### Community 18 - "Playwright Config"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Tailwind Config"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Vite Design Config"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Crawler Types"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Andersen Source Adapter"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Grimm Source Adapter"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Sagen Source Adapter"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Service Worker"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Test Setup"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Project Documentation"
Cohesion: 1.0
Nodes (1): webreader CLAUDE.md

## Knowledge Gaps
- **10 isolated node(s):** `webreader CLAUDE.md`, `Sidebar Navigation Architecture`, `Tailwind v4 CSS Setup`, `crawlers/core.ts`, `Rationale: DOM word-packing over scroll/CSS columns` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Backfill Word Count`** (2 nodes): `backfill-wordcount.ts`, `countWords()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Entry Point`** (2 nodes): `index.ts`, `main()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `useFeatureFlags Hook`** (2 nodes): `useFeatureFlags.js`, `useFeatureFlags()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `useReader Hook`** (2 nodes): `useReader.js`, `useReader()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `useTypography Hook`** (2 nodes): `useTypography.js`, `useTypography()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CSS Class Utility`** (2 nodes): `cn.js`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind Config Rationale`** (2 nodes): `Rationale: @config required in Tailwind v4 for config file`, `Tailwind v4 CSS Setup`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Playwright Config`** (1 nodes): `playwright.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind Config`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Design Config`** (1 nodes): `vite.design.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Crawler Types`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Andersen Source Adapter`** (1 nodes): `andersen.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Grimm Source Adapter`** (1 nodes): `grimm.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sagen Source Adapter`** (1 nodes): `sagen.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Service Worker`** (1 nodes): `sw.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Test Setup`** (1 nodes): `setup.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Documentation`** (1 nodes): `webreader CLAUDE.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 4 inferred relationships involving `writeStory()` (e.g. with `normalizeBody()` and `buildFrontmatter()`) actually correct?**
  _`writeStory()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `stories/ Content Directory` (e.g. with `Source: Grimm (2-level)` and `Source: Andersen (2-level)`) actually correct?**
  _`stories/ Content Directory` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `webreader CLAUDE.md`, `Sidebar Navigation Architecture`, `Tailwind v4 CSS Setup` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._