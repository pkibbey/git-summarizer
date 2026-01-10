**peak-blooms-blog**

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
cd peak-blooms-blog
npm install
```

2. Run the dev server

```bash
npm run dev
```

3. Useful scripts
- `npm run fetch-commits` — pull commit history used to build posts
- `npm run analyze:structured` — run structured AI analysis pipeline
- `npm run analyze:unstructured` — run unstructured AI analysis pipeline
- `npm run build` / `npm run start` — build and run production server

Project Structure
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

Tech Stack
- **Next.js 16.0.7** — app framework and routing
- **React 19.2.1** — UI library
- **TypeScript 5.9.3** — static typing
- **Tailwind CSS 4.1.17** — utility-first styling
- **Radix UI / Lucide** — accessible primitives and icons
- **motion** — UI motion library used by components
- **ai, @ai-sdk/openai-compatible** — AI SDK and compatible client used by analysis scripts
- **simple-git** — git helpers for extracting commit history
- **zod** — runtime validation for structured data

Notes
- Data-driven pages depend on commit extraction scripts; run `npm run fetch-commits` if posts appear empty.
- Analysis scripts use `.env.local` for model credentials and settings where applicable.

Files
- See `app/`, `components/`, `lib/`, and `scripts/` for the main implementation areas.
## Peak Blooms Blog

A portfolio website showcasing the development of a fully-featured website built in 2 weeks. This site automatically transforms git commits from the Peak Blooms project into a narrative-driven development journal, powered by AI analysis and thoughtful design.

### Vision

This is an **alternative resume** that demonstrates:
- **Architectural Thinking**: How thoughtful decisions compound into a complete product
- **User-Centric Design**: Decades of experience reflected in every detail
- **Software Quality**: Conscious choices about scalability, maintainability, and performance
- **Problem-Solving**: Real challenges faced and elegant solutions implemented
- **Full-Stack Capability**: From concept through deployment

### Key Features

✨ **AI-Powered Summaries** - Gemma3 generates daily summaries and extracts insights
📊 **Commit Analytics** - File changes, statistics, and code diffs for each commit
🎯 **Architectural Callouts** - Highlights design decisions and key learnings
📅 **Chronological Timeline** - See the project evolution day by day
🌙 **Dark Mode Support** - Comfortable reading experience
⚡ **Fast & Static** - Built at deploy time, served instantly

### Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vercel AI SDK** - LLM integration
- **Gemma3 (Local LLM)** - AI analysis without cloud dependency
- **Shiki** - Syntax highlighting for code
- **Vercel** - Deployment platform

### Getting Started

**For Setup & Development**: See [SETUP.md](./SETUP.md)

Quick start:
```bash
npm install
npm run process-blog    # Generate blog data (requires LM Studio + GitHub token)
npm run dev             # Start dev server
npm run build           # Build for production
```

### Project Structure

```
peak-blooms-blog/
├── app/                  # Next.js App Router pages
├── components/           # React components
├── lib/                  # Utilities and types
├── scripts/              # Blog generation scripts
├── public/               # Static files and blog-data.json
└── SETUP.md             # Detailed setup guide
```

### Development Workflow

1. Peak Blooms project gets commits
2. Run `npm run process-blog` locally
3. AI analyzes commits and generates insights
4. Push results to GitHub
5. Vercel deploys automatically

### Who Is This For?

**Hiring Managers & Recruiters**: Explore the full development journey and witness thoughtful engineering at every level.

**Other Engineers**: Learn how to balance speed with quality, and how to document your work in a meaningful way.

**Future Self**: Reflect on decisions made during rapid development and appreciate the learning journey.

### Design Philosophy

Every detail matters. This site demonstrates that care and attention extend beyond the code:
- Accessible color contrasts and typography
- Responsive layout that works everywhere
- Semantic HTML and performance-first decisions
- Clear information hierarchy
- Delightful micro-interactions

### About Peak Blooms

The original Peak Blooms project is a fully-featured website built in just over 2 weeks. It showcases rapid development, architectural decision-making, and the ability to deliver a complete product with thoughtful design.

See the source: [github.com/pkibbey/peak-blooms](https://github.com/pkibbey/peak-blooms)

### Deployment

Deployed on Vercel for reliability, speed, and simplicity: [peak-blooms-blog.vercel.app](https://peak-blooms-blog.vercel.app)

---

Built with ❤️ by [Phineas Kibbey](https://github.com/pkibbey)
