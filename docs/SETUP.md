# Peak Blooms Blog - Setup & Deployment Guide

This is an AI-powered development journal that transforms git commits from the Peak Blooms project into a narrative-driven blog showcasing architectural decisions, learnings, and engineering excellence.

## Project Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI**: Vercel AI SDK + Gemma3 (via LM Studio)
- **Git Processing**: simple-git
- **Code Highlighting**: Shiki

### Data Flow

```
Peak Blooms Repo (GitHub)
  ↓
Git Commit Extraction (simple-git)
  ↓
Commit Grouping by Date
  ↓
AI Analysis with Gemma3 (LM Studio)
  ↓
Blog Data JSON Generation
  ↓
Static Site Rendering (Next.js)
  ↓
Vercel Deployment
```

## Local Development

### Prerequisites

1. **GitHub Token** - For accessing the private Peak Blooms repository
   - Create at: https://github.com/settings/tokens
   - Required scopes: `repo` (full control of private repositories)
   - Expiration: 90 days recommended

2. **LM Studio** - For local AI processing
   - Download: https://lmstudio.ai
   - Start LM Studio and load the Gemma3 model
   - Model should be available at `http://localhost:1234`

3. **Node.js** - Version 18+ required

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Environment File**
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your GitHub token:
   ```
   GITHUB_TOKEN=ghp_your_token_here
   LM_STUDIO_BASE_URL=http://localhost:1234/v1
   ```

3. **Start Development Server** (optional, for testing UI)
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

### Generating Blog Data

**Important**: This step must be run locally with LM Studio running.

1. **Start LM Studio**
   - Launch the LM Studio application
   - Load the Gemma3 model
   - Verify it's running on `http://localhost:1234`

2. **Run Blog Generation**
   ```bash
   npm run process-blog
   ```

   This will:
   - Clone the Peak Blooms repository
   - Extract all git commits
   - Group commits by date
   - Analyze each day with Gemma3
   - Generate `public/blog-data.json`
   - Clean up temporary files

3. **Expected Output**
   ```
   Starting blog data generation...
   Processing 2025-12-06 (8 commits)...
     ✓ Generated summary and analysis
   ...
   ✅ Blog data generated successfully!
      Output: public/blog-data.json
      Days processed: 14
      Total commits: 127
   ```

4. **Commit Results**
   ```bash
   git add public/blog-data.json
   git commit -m "chore: update blog data with latest commits"
   git push
   ```

## Deployment to Vercel

### Configuration

1. **Connect Repository**
   - Go to https://vercel.com/dashboard
   - Import this GitHub repository

2. **Environment Variables**
   In Vercel project settings, add:
   ```
   GITHUB_TOKEN=your_github_token
   LM_STUDIO_BASE_URL=http://localhost:1234/v1 (optional, only needed if running build script)
   ```

3. **Build Configuration**
   - Framework Preset: Next.js
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

### Deployment Workflow

1. **Local**: Run `npm run process-blog` with LM Studio running
2. **Local**: Commit the generated `public/blog-data.json`
3. **GitHub**: Push to main branch
4. **Vercel**: Automatically builds and deploys

The blog will be available at your Vercel project URL (e.g., `https://peak-blooms-blog.vercel.app`)

## Daily Workflow

### When Peak Blooms Project Gets New Commits

1. Ensure Peak Blooms repository is updated with latest commits
2. Run locally:
   ```bash
   npm run process-blog
   ```
3. Review generated changes in `public/blog-data.json`
4. Commit to git:
   ```bash
   git add public/blog-data.json
   git commit -m "chore: update blog data"
   ```
5. Push to GitHub - Vercel will auto-deploy

## Component Structure

### Pages
- **`app/page.tsx`** - Homepage with loading states and error handling

### Components
- **`components/BlogTimeline.tsx`** - Main timeline container
- **`components/DayPost.tsx`** - Individual day's post with summary, decisions, learnings
- **`components/CommitCard.tsx`** - Individual commit card with expandable details
- **`components/CommitDiff.tsx`** - Syntax-highlighted diff display
- **`components/ArchitecturalCallout.tsx`** - Design decision/insight highlights

### Libraries
- **`lib/types.ts`** - TypeScript interfaces for all data structures
- **`lib/ai.ts`** - LM Studio integration and Gemma3 prompts
- **`lib/syntax-highlight.ts`** - Shiki integration for code highlighting

### Scripts
- **`scripts/extract-commits.ts`** - Git extraction logic
- **`scripts/process-blog-data.ts`** - Orchestration and JSON generation

## Key Features

### User-Centric Design
- Clean, minimal interface focusing on content
- Dark mode support for comfortable reading
- Responsive design for all devices
- Intuitive navigation and visual hierarchy

### Technical Features
- AI-generated summaries of daily work
- Commit grouping and analysis
- Architectural callouts highlighting design thinking
- File-level statistics and diff preview
- Expandable commit details
- GitHub links to view full commits

### Architecture Highlights
- Build-time static generation (no runtime dependencies)
- Pre-processed data for optimal performance
- Type-safe data flow with TypeScript
- Serverless deployment on Vercel
- Privacy-preserving local AI processing (during data generation)

## Troubleshooting

### LM Studio Connection Issues
```
Error: Failed to connect to LM Studio
- Verify LM Studio is running
- Check that Gemma3 model is loaded
- Verify http://localhost:1234/v1 is accessible
- Check firewall settings
```

### GitHub Token Issues
```
Error: Authentication failed
- Verify token is created with 'repo' scope
- Ensure token hasn't expired
- Check token is correctly set in .env.local
- Regenerate token if needed
```

### Missing Blog Data
```
Error: Blog data not found
- Run: npm run process-blog
- Ensure public/blog-data.json was generated
- Commit and push the file
- Trigger Vercel rebuild if needed
```

## Performance Considerations

- **Static Generation**: Blog is built at deploy time, not at runtime
- **No Runtime Dependencies**: Vercel doesn't need LM Studio running
- **JSON-Based Data**: Fast loading and rendering
- **Image Optimization**: Next.js automatically optimizes any images

## Privacy & Security

- GitHub token stored only in `.env.local` (not committed)
- Peak Blooms repository access limited to local development
- No user data collection or tracking
- Deployed data is read-only on Vercel

## Future Enhancements

- Real-time updates when new commits are pushed
- Search functionality across commits and learnings
- Timeline visualization/progress bar
- Export blog as PDF or markdown
- Social sharing with OpenGraph preview
- Related commits linking by theme/file
