# Two-Step Processing Workflow

## Overview

The Peak Blooms Blog now uses a **two-step workflow** that separates **commit fetching** from **analysis processing**. This allows:

- ✅ Fetching commits once and reusing them across multiple analyses
- ✅ Testing different AI models (Gemma, Ministral, Ollama) without re-fetching commits
- ✅ Faster iteration when experimenting with different approaches
- ✅ Cleaner separation of concerns

## Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│                   Step 1: Fetch Commits                          │
│                   npm run fetch-commits                          │
│                                                                   │
│  • Clones Peak Blooms repository                                │
│  • Extracts all commits with file changes and diffs             │
│  • Groups commits by date                                        │
│  • Stores to .commits-cache.json (local, not committed)          │
│                                                                   │
│  ✓ Done - Commits are now cached locally                        │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                    ┌───────▼────────────────────────────────┐
                    │  .commits-cache.json (local cache)     │
                    └────────────────────────────────────────┘
                            │
                ┌───────────┼───────────┬──────────────┐
                │           │           │              │
    ┌───────────▼──┐ ┌──────▼───┐ ┌───▼────────┐     │
    │  Step 2A:    │ │ Step 2B: │ │ Step 2C:   │     │
    │  Gemma       │ │ Ministral│ │ Ollama     │     │
    │  Analyze     │ │ Analyze  │ │ Analyze    │     │
    │              │ │          │ │            │     │
    │ npm run      │ │ npm run  │ │ npm run    │     │
    │ analyze:gemma│ │ analyze: │ │ analyze:   │     │
    │              │ │ ministral│ │ ollama     │     │
    └──────┬───────┘ └────┬─────┘ └────┬───────┘     │
           │               │             │             │
           ▼               ▼             ▼             │
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
    │blog-data-    │ │blog-data-    │ │blog-data-    ││
    │gemma.json    │ │ministral.json│ │ollama.json   ││
    └──────────────┘ └──────────────┘ └──────────────┘│
                                                       │
    Optional: Run multiple analyses in parallel ──────┘
```

## Step 1: Fetch Commits

### Command
```bash
npm run fetch-commits
```

### What It Does
1. **Clones** the Peak Blooms repository (requires `GITHUB_TOKEN`)
2. **Extracts** commit metadata:
   - Hash, message, author, date
   - Files changed (with additions/deletions)
   - Short diff (first 2000 chars)
3. **Groups** commits by date (YYYY-MM-DD)
4. **Stores** to `.commits-cache.json` locally

### Output
```
✅ Commits fetched and stored successfully!
   Output: .commits-cache.json
   Total commits: 245
   Days: 32

Next step: Run one of the analysis scripts:
   npm run analyze:gemma
   npm run analyze:ministral
   npm run analyze:ollama
```

### Why Separate?
- **Time Saving**: Git operations are slow; cache commits locally
- **Reusability**: Use the same commits across different AI models
- **Flexibility**: Can test analysis approaches without waiting for git clones

## Step 2: Analyze Commits

### Available Models

#### Gemma (LM Studio)
```bash
npm run analyze:gemma
```
- Uses Gemma3 model via LM Studio
- Generates `public/blog-data-gemma.json`
- Requires LM Studio running locally on `http://localhost:1234/v1`

#### Ministral (LM Studio)
```bash
npm run analyze:ministral
```
- Uses Mistral model via LM Studio
- Generates `public/blog-data-ministral.json`
- Requires LM Studio running locally

#### Ollama
```bash
npm run analyze:ollama
```
- Uses Ollama API
- Generates `public/blog-data-ollama.json`
- Requires Ollama running (default: `http://localhost:11434`)

### What Analysis Does
1. **Loads** cached commits from `.commits-cache.json`
2. **Processes** each day:
   - Sends commits to AI model for analysis
   - Generates summary, key decisions, learnings
   - Extracts architectural callouts
3. **Structures** data as `BlogData` with all analysis
4. **Outputs** to `public/blog-data-{model}.json`

### Output Example
```
✅ Blog data generated successfully!
   Output: public/blog-data-gemma.json
   Days processed: 32
   Total commits: 245

Next steps:
   1. Review public/blog-data-gemma.json
   2. Commit changes: git add public/blog-data-gemma.json && git commit -m "chore: update blog data"
   3. Deploy to Vercel with: git push
```

## Quick Workflows

### Fresh Full Generation (Gemma)
```bash
npm run process-blog
```
Equivalent to: `npm run fetch-commits && npm run analyze:gemma`

### Generate with Multiple Models
```bash
npm run fetch-commits
npm run analyze:gemma
npm run analyze:ministral
npm run analyze:ollama
```

### Iterate on Analysis Only
```bash
# Commits already cached from previous fetch
npm run analyze:gemma
# Edit and refine, then run again
npm run analyze:gemma
```

## Files

### Committed to Git
- `public/blog-data-gemma.json` - Gemma analysis results
- `public/blog-data-ministral.json` - Ministral analysis results
- `public/blog-data-ollama.json` - Ollama analysis results

### Local Only (Not Committed)
- `.commits-cache.json` - Raw commits cache (regenerate anytime with `npm run fetch-commits`)
- `.temp-peak-blooms-repo/` - Temporary clone (cleaned up automatically)

## Troubleshooting

### Error: "Failed to load commits cache. Have you run 'npm run fetch-commits' yet?"
**Solution**: Run `npm run fetch-commits` first to generate the cache.

### Error: "GITHUB_TOKEN environment variable is required"
**Solution**: Add your GitHub token to `.env.local`:
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
```

### Error: Connection refused to LM Studio
**Solution**: 
- Ensure LM Studio is running
- Check it's on `http://localhost:1234/v1`
- Verify the model is loaded

### Stale commits cache
To refresh the cache (e.g., after new commits in Peak Blooms):
```bash
npm run fetch-commits
```

## Architecture Benefits

1. **Modularity**: Commit fetching is completely decoupled from analysis
2. **Reusability**: Any new analysis script can use `loadStoredCommits()`
3. **Performance**: Cache reduces repeated git operations
4. **Testability**: Can test analysis without network calls
5. **Flexibility**: Easy to add new AI models or analysis approaches

## Adding a New Analysis Script

1. Create `scripts/process-blog-data-newmodel.ts`
2. Import `loadStoredCommits` from `lib/load-commits`
3. Create your `analyzeCommitDay` function
4. Process and output to `public/blog-data-newmodel.json`
5. Add npm script: `"analyze:newmodel": "dotenv -e .env.local -- tsx scripts/process-blog-data-newmodel.ts"`

Example:
```typescript
import { loadStoredCommits } from '../lib/load-commits';

async function processBlogData() {
  const groupedCommits = await loadStoredCommits();
  // Your analysis logic here
}
```
