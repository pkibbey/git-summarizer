# 🏗️ Peak Blooms Blog - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER VISITS SITE                                  │
│                                  ↓                                          │
│                        Vercel CDN (Static)                                  │
│                          next.build.html                                    │
└──────────────────────────────────────────────────────────────────────────────┘
                                  ↑
                          ┌─────────┴──────────┐
                          │                    │
                    ┌─────────────┐     ┌─────────────┐
                    │ HTML Files  │     │ JSON Data   │
                    │ CSS Bundle  │     │ blog-data   │
                    │ JS Bundle   │     │ .json       │
                    └─────────────┘     └─────────────┘
                          ↑                    ↑
                          └────────┬───────────┘
                                   │
                         ┌─────────────────────┐
                         │  Next.js Build      │
                         │  (npm run build)    │
                         └────────────┬────────┘
                                      ↑
                        ┌─────────────────────────┐
                        │  public/blog-data.json  │
                        │  (pre-processed)        │
                        └────────────┬────────────┘
                                     │
                    ┌────────────────┴─────────────────┐
                    │                                  │
        ┌──────────────────────────────┐  ┌──────────────────────────┐
        │  LOCAL: Blog Generation      │  │  Git Repository          │
        │  (npm run process-blog)       │  │  public/blog-data.json   │
        │                              │  │  (committed to git)      │
        │  1. Clone Peak Blooms repo   │  └──────────────────────────┘
        │  2. Extract commits          │            ↑
        │  3. Group by date            │            │
        │  4. Analyze with Gemma3      │      ┌─────┴──────────┐
        │  5. Generate JSON            │      │                │
        └──────────────┬───────────────┘      │                │
                       ↓                      │                │
        ┌──────────────────────────────┐      │                │
        │  LM Studio (Local LLM)       │      │                │
        │  - Gemma3 Model              │      │                │
        │  - OpenAI API Format         │      │                │
        │  - http://localhost:1234/v1  │      │                │
        └──────────────────────────────┘  ┌───┴────┐      ┌────┴─────┐
                                          │ GitHub │      │ Vercel   │
                                          │ Repo   │      │ Deploy   │
                                          └────────┘      └──────────┘
```

## Data Structure Hierarchy

```
BlogData
├── generatedAt: ISO timestamp
├── sourceRepo: GitHub URL
└── days: DayPost[]
    ├── date: YYYY-MM-DD
    ├── dayOfWeek: string
    ├── commits: Commit[]
    │   ├── hash: string
    │   ├── message: string
    │   ├── author: string
    │   ├── email: string
    │   ├── date: ISO timestamp
    │   ├── files: FileChange[]
    │   │   ├── path: string
    │   │   ├── status: 'added'|'modified'|'deleted'|'renamed'
    │   │   ├── additions: number
    │   │   └── deletions: number
    │   ├── stats: {filesChanged, additions, deletions}
    │   └── shortDiff: string
    ├── aiSummary: string
    ├── keyDecisions: string[]
    ├── learnings: string[]
    ├── architecturalCallouts: ArchitecturalCallout[]
    │   ├── type: 'design-decision'|'pattern-used'|'performance-insight'|'learning'
    │   ├── title: string
    │   └── description: string
    └── stats: {totalCommits, filesChanged, additions, deletions}
```

## Component Hierarchy

```
HTML Document
  ├── <head>
  │   ├── Meta tags
  │   ├── Open Graph
  │   └── Twitter Card
  └── <body>
      └── RootLayout
          ├── <header> (sticky)
          │   ├── Title: "Peak Blooms"
          │   └── Description
          ├── <main>
          │   └── Home Component
          │       ├── Loading State (if data missing)
          │       ├── Error State (if load fails)
          │       └── BlogTimeline
          │           └── DayPost[] (map over days)
          │               ├── Daily Summary Box
          │               ├── Key Decisions List
          │               ├── Architectural Callouts[]
          │               │   └── ArchitecturalCalloutComponent
          │               │       ├── Icon (✦, ◈, ⚡, 💡)
          │               │       ├── Title
          │               │       └── Description
          │               ├── Key Learnings List
          │               └── CommitCard[] (map over commits)
          │                   ├── Hash link to GitHub
          │                   ├── Message
          │                   ├── Author
          │                   ├── Stats display
          │                   └── Expandable content
          │                       ├── Files Changed List
          │                       └── CommitDiff
          │                           └── Syntax highlighted code
          └── <footer>
              ├── Built with message
              └── GitHub links
```

## File Organization

```
peak-blooms-blog/
│
├── 📄 DOCUMENTATION (for you)
│   ├── README.md              ← Project overview
│   ├── SUMMARY.md             ← This implementation summary
│   ├── QUICKSTART.md          ← 5-minute setup
│   ├── SETUP.md               ← Detailed guide
│   ├── DEPLOYMENT.md          ← Deployment checklist
│   ├── IMPLEMENTATION.md      ← Technical details
│   └── DOCS.md                ← Documentation index
│
├── 🎨 APP (Next.js App Router)
│   └── app/
│       ├── page.tsx           ← Home page with BlogTimeline
│       ├── layout.tsx         ← Root layout + metadata
│       └── globals.css        ← Tailwind CSS config
│
├── 🧩 COMPONENTS (React)
│   └── components/
│       ├── BlogTimeline.tsx          ← Container for all days
│       ├── DayPost.tsx               ← Single day's content
│       ├── CommitCard.tsx            ← Individual commit (expandable)
│       ├── CommitDiff.tsx            ← Diff preview display
│       └── ArchitecturalCallout.tsx  ← Design insight box
│
├── 📚 LIBRARY (Utilities & Types)
│   └── lib/
│       ├── types.ts           ← TypeScript interfaces
│       ├── ai.ts              ← LM Studio integration
│       └── syntax-highlight.ts ← Shiki utilities
│
├── ⚙️ SCRIPTS (Processing)
│   └── scripts/
│       ├── extract-commits.ts      ← Git extraction logic
│       └── process-blog-data.ts    ← Blog generation (main entry)
│
├── 📦 CONFIG (Build & Dependencies)
│   ├── package.json           ← Dependencies + scripts
│   ├── package-lock.json      ← Locked versions
│   ├── tsconfig.json          ← TypeScript config
│   ├── next.config.ts         ← Next.js config
│   ├── postcss.config.mjs     ← PostCSS (Tailwind)
│   ├── eslint.config.mjs      ← ESLint rules
│   └── .env.local.example     ← Environment template
│
└── 📊 PUBLIC (Generated Content)
    └── public/
        └── blog-data.json     ← Pre-generated blog (created by npm run process-blog)
```

## Data Flow: Blog Generation

```
Step 1: Extract Commits
├─ Input: GitHub private repo URL + token
├─ Process: simple-git clones & reads commit history
└─ Output: Commit[] with metadata

Step 2: Group by Date
├─ Input: Commit[]
├─ Process: Group by ISO date (YYYY-MM-DD)
└─ Output: Map<date, Commit[]>

Step 3: AI Analysis (Per Day)
├─ Input: Commits for one day
├─ Process:
│  ├─ Build detailed prompt with commit messages and diffs
│  ├─ Send to Gemma3 via LM Studio API
│  ├─ Parse JSON response
│  └─ Extract summary, decisions, learnings, callouts
└─ Output: AnalysisResult

Step 4: Aggregate
├─ Input: All daily analyses
├─ Process: Combine with original commits & metadata
└─ Output: DayPost[] with full content

Step 5: Serialize
├─ Input: DayPost[]
├─ Process: Convert to JSON, add metadata
└─ Output: public/blog-data.json

Step 6: Git Commit
├─ Input: blog-data.json
├─ Process: git add, git commit, git push
└─ Output: Changes in GitHub

Step 7: Vercel Build
├─ Input: Updated repo on GitHub
├─ Process: npm run build reads blog-data.json
└─ Output: Static HTML + CSS + JS

Step 8: Deploy
├─ Input: Built artifacts
├─ Process: Upload to Vercel CDN
└─ Output: Live site at your Vercel URL
```

## Technology Stack Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL (Deployment)                        │
├─────────────────────────────────────────────────────────────────┤
│                   NEXT.JS 16 (Framework)                        │
├────────────────────────┬──────────────────────────────────────┤
│ React 19 (Frontend)    │ Node.js (Build Scripts)              │
│ ├── Components         │ ├── simple-git (extraction)          │
│ ├── Hooks              │ ├── fs/promises (file I/O)           │
│ └── State Management   │ └── child_process (git commands)     │
├────────────────────────┼──────────────────────────────────────┤
│ Tailwind CSS 4         │ Vercel AI SDK                        │
│ ├── Utilities          │ ├── LM Studio (OpenAI API)           │
│ ├── Dark Mode          │ └── Gemma3 Model                     │
│ └── Responsive Design  │                                      │
├────────────────────────┼──────────────────────────────────────┤
│ TypeScript 5           │ Shiki (Syntax Highlighting)          │
│ ├── Type Safety        │ ├── Code colorization                │
│ ├── Interfaces         │ └── Multiple language support        │
│ └── IDE Support        │                                      │
└────────────────────────┴──────────────────────────────────────┘
```

## User Interactions Flow

```
User visits blog URL
  ↓
Vercel CDN returns cached static HTML
  ↓
Browser renders page with React
  ↓
User can:
  ├─→ Scroll through timeline
  ├─→ Read daily summaries
  ├─→ View architectural insights (colored boxes)
  ├─→ Expand/collapse commit cards
  │   └─→ See file changes
  │   └─→ View diff preview
  │   └─→ Click GitHub link
  ├─→ Toggle dark mode
  ├─→ View on mobile (responsive)
  └─→ Share URL
```

## Performance Characteristics

```
Metric                    Target    How Achieved
─────────────────────────────────────────────────
Page Load Time            <1s       Static HTML (no server)
Time to Interactive       <2s       Minimal JavaScript
Lighthouse Score          >90       Optimized bundle
Bundle Size               <100KB    Client components only
Image Optimization        Automatic Next.js Image
CSS Optimization          Automatic Tailwind + Vercel
Database Queries          0         No backend
API Calls (runtime)       0         All data static
Time to Generate Blog     10-15min  AI processing + disk I/O
```

## Security & Privacy Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Public Information                       │
│              (Visible on deployed site)                    │
├─────────────────────────────────────────────────────────────┤
│ • Commit messages                                           │
│ • File paths & changes                                      │
│ • Author names                                              │
│ • AI-generated summaries                                    │
└─────────────────────────────────────────────────────────────┘
                          ↑
                    Encrypted in git
                          ↑
┌─────────────────────────────────────────────────────────────┐
│                   Protected Information                     │
│            (Only on your machine during generation)        │
├─────────────────────────────────────────────────────────────┤
│ • GitHub Token (.env.local - never committed)              │
│ • Full code diffs (processed locally)                       │
│ • Temporary cloned repository (deleted after)              │
│ • LM Studio API communication (local network only)          │
└─────────────────────────────────────────────────────────────┘
```

## Scalability Notes

```
This architecture scales to:
├─ Unlimited commits (processing time increases linearly)
├─ Unlimited days (just adds entries to array)
├─ Unlimited viewers (static HTML = infinite capacity)
├─ Multiple deployments (same repo = same blog)
└─ Years of history (static JSON grows linearly)

Performance remains constant for users regardless of:
├─ Number of commits
├─ Repository size
├─ Complexity of diffs
└─ Number of changes per day
```

---

## Key Insights

1. **Separation of Concerns**: Processing (local) vs Presentation (web)
2. **Static First**: Pre-computed content for performance
3. **Privacy Preserving**: No cloud calls during public access
4. **Build-Time Optimization**: Heavy lifting done once, not repeated
5. **Type Safety**: TypeScript throughout prevents runtime errors
6. **Accessibility**: Semantic HTML, dark mode, responsive design
7. **User Experience**: Every detail considered and designed

This architecture is production-ready and follows Next.js/Vercel best practices. 🚀
