<p align="center">
  <img src="./public/logo.png" alt="MultiCam logo" width="400" />
</p>

A lightweight blog interface that analyzes git commit history and surfaces AI-driven summaries, commit diffs, and daily insights. Visually it presents posts organized by date with commit timelines, diffs, and a compact calendar for navigation.

<!-- [Live Demo](https://...) -->

Features
- **AI Analysis:** Structured and unstructured analysis pipelines that summarize commit data into readable post content.
- **Commit-based Posts:** Posts generated from commit history with diffs and per-commit context.
- **Daily Summaries:** Condensed view of changes and key learnings per day.
- **Mini Calendar:** Quick navigation to posts by date via a compact calendar component.
- **Configurable Models:** Scripts support switching models and outputs for different analysis runs.

Getting Started

Prerequisites
- **Node:** 18 or newer
- **Package manager:** `npm` (or compatible)
- **Environment:** `.env.local` is used by analysis scripts when present

Installation & Development
1. Clone the repo

```bash
git clone <repo-url>
cd git-summarizer
npm install
```

2. Run the dev server

```bash
npm run dev
```

### Useful scripts

- `npm run fetch-commits` — pull commit history used to build posts
- `npm run analyze:structured` — run structured AI analysis pipeline
- `npm run analyze:unstructured` — run unstructured AI analysis pipeline
- `npm run build` / `npm run start` — build and run production server

## Project Structure

- **app/** — Next.js app routes and pages. Main entrypoints:
  - `app/page.tsx` — homepage
  - `app/post/[date]/page.tsx` — per-post page by date
- **components/** — UI components used across the site:
  - `CommitCard.tsx` — compact commit display
  - `CommitDiff.tsx` — visual diff for a commit
  - `CommitSidebar.tsx` — commit navigation and metadata
  - `DailySummary.tsx` — daily condensed summary component
  - `DayPost.tsx` — layout for a single day's post
  - `InsightsAndLearnings.tsx` — highlights and takeaways
  - `VersionModelSelector.tsx` — UI to choose analysis models
  - `kibo-ui/mini-calendar/index.tsx` — mini calendar component
- **lib/** — core utilities and AI integration:
  - `load-commits.ts` — helpers to load and format commit data
  - `ai-structured.ts` / `ai-unstructured.ts` — AI analysis wrappers
  - `utils.ts` / `types.ts` — shared helpers and types
- **scripts/** — data extraction and processing scripts:
  - `fetch-commits.ts`, `process-blog-data-structured.ts`, `process-blog-data-unstructured.ts`

## Tech Stack

- **Next.js 16.0.7** — app framework and routing
- **React 19.2.1** — UI library
- **TypeScript 5.9.3** — static typing
- **Tailwind CSS 4.1.17** — utility-first styling
- **Radix UI / Lucide** — accessible primitives and icons
- **motion** — UI motion library used by components
- **ai, @ai-sdk/openai-compatible** — AI SDK and compatible client used by analysis scripts
- **simple-git** — git helpers for extracting commit history
- **zod** — runtime validation for structured data

## Notes

- Data-driven pages depend on commit extraction scripts; run `npm run fetch-commits` if posts appear empty.
- Analysis scripts use `.env.local` for model credentials and settings where applicable.

## Files

- See `app/`, `components/`, `lib/`, and `scripts/` for the main implementation areas.

