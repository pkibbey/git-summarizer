# Refactoring Summary: Two-Step Processing Workflow

## What Was Done

The Peak Blooms Blog application has been refactored to **separate commit fetching from analysis processing**. This creates a cleaner, more flexible architecture.

## Key Changes

### 1. New Script: `scripts/fetch-commits.ts`
- **Purpose**: Extract and cache commits from the Peak Blooms repository
- **Output**: `.commits-cache.json` (local, not committed to git)
- **Command**: `npm run fetch-commits`
- **Execution time**: ~1-2 minutes (depending on repo size)

### 2. New Utility: `lib/load-commits.ts`
- **Purpose**: Shared utility to load cached commits
- **Exports**: `loadStoredCommits()` function
- **Usage**: All analysis scripts use this instead of directly calling git operations

### 3. Updated Scripts
All three analysis scripts were updated:
- `scripts/process-blog-data.ts` (Gemma)
- `scripts/process-blog-data-ollama.ts` (Ollama)
- `scripts/process-blog-data-ministral.ts` (Ministral)

**Changes**:
- Removed direct git clone/extraction logic
- Removed `GITHUB_TOKEN` requirement (only needed in `fetch-commits`)
- Now calls `loadStoredCommits()` to load cached commits
- Focus purely on AI analysis

### 4. Updated package.json
**New scripts**:
```json
{
  "fetch-commits": "dotenv -e .env.local -- tsx scripts/fetch-commits.ts",
  "process-blog": "npm run fetch-commits && npm run analyze:gemma"
}
```

## Workflow Comparison

### Before
```
npm run process-blog
  ↓ (in each script)
  ├─ Clone Peak Blooms repo (requires GITHUB_TOKEN)
  ├─ Extract commits
  ├─ Analyze with AI
  └─ Output blog-data.json
```

### After
```
npm run fetch-commits
  ├─ Clone Peak Blooms repo (requires GITHUB_TOKEN)
  ├─ Extract commits
  └─ Cache to .commits-cache.json
        ↓
npm run analyze:gemma    (uses cached commits, no GITHUB_TOKEN needed)
npm run analyze:ministral (uses cached commits, no GITHUB_TOKEN needed)
npm run analyze:ollama   (uses cached commits, no GITHUB_TOKEN needed)
```

## Benefits

| Benefit | Description |
|---------|-------------|
| **Reusability** | Commits are fetched once, analyzed multiple ways |
| **Speed** | No need to re-clone repo when testing different AI models |
| **Separation** | Git operations separated from AI analysis |
| **Flexibility** | Easy to add new analysis approaches without git dependencies |
| **Testability** | Can test analysis without network calls |
| **Clarity** | Clear two-step process with distinct responsibilities |

## File Structure

```
scripts/
  ├── fetch-commits.ts          (NEW - Step 1: Fetch commits)
  ├── process-blog-data.ts      (UPDATED - Step 2A: Gemma analysis)
  ├── process-blog-data-ollama.ts (UPDATED - Step 2B: Ollama analysis)
  ├── process-blog-data-ministral.ts (UPDATED - Step 2C: Ministral analysis)
  ├── extract-commits.ts        (DEPRECATED - functionality moved to fetch-commits)
  └── revalidate-blog-days.ts   (Unchanged)

lib/
  ├── load-commits.ts           (NEW - Shared utility to load cached commits)
  ├── ai-gemma.ts               (Unchanged)
  ├── ai-ministral.ts           (Unchanged)
  ├── ai-ollama.ts              (Unchanged)
  ├── types.ts                  (Unchanged)
  └── syntax-highlight.ts       (Unchanged)

Root:
  ├── .commits-cache.json       (NEW LOCAL FILE - auto-generated)
  └── TWO_STEP_WORKFLOW.md      (NEW - Detailed workflow documentation)
```

## Usage Examples

### Complete Generation (Gemma)
```bash
npm run process-blog
# Equivalent to: npm run fetch-commits && npm run analyze:gemma
```

### Fetch and Test Multiple Models
```bash
npm run fetch-commits
npm run analyze:gemma
npm run analyze:ministral
npm run analyze:ollama
```

### Update with Fresh Commits (after Peak Blooms updates)
```bash
npm run fetch-commits
npm run analyze:gemma  # Re-analyze with fresh commits
```

### Iterate on Analysis Only
```bash
# Previous fetch-commits still valid
npm run analyze:gemma
npm run analyze:gemma  # Test again without re-fetching
```

## Migration Notes

- **No breaking changes** to the public API or output format
- `npm run process-blog` still works exactly as before (now runs both steps)
- Existing `public/blog-data-*.json` files are still used by the site
- The `.commits-cache.json` file should NOT be committed to git (local only)
- The `extract-commits.ts` file can be deprecated (kept for reference)

## Next Steps

1. **Test the workflow** by running:
   ```bash
   npm run fetch-commits
   npm run analyze:gemma
   ```

2. **Verify output** in `public/blog-data-gemma.json`

3. **Update documentation** in `QUICKSTART.md` to reflect new two-step process

4. **Consider deprecating** `scripts/extract-commits.ts` (keep code for reference)

5. **Add to .gitignore**:
   ```
   .commits-cache.json
   .temp-peak-blooms-repo/
   ```

## Architecture Improvements

### Before
- Tight coupling between git operations and AI analysis
- Each script duplicated git logic
- Required GITHUB_TOKEN in every analysis script

### After
- Clear separation of concerns
- Single source of truth for commit extraction
- Reusable `loadStoredCommits()` utility
- Easy to add new analysis approaches
- Token only needed once per commit batch

This refactoring sets up the foundation for easily adding new analysis models, comparison features, and experimental approaches!
