# Quick Reference Guide - Two-Step Workflow

## Command Quick Reference

### Phase 1: Fetch Commits (Do Once)
```bash
npm run fetch-commits
```
**Output**: `.commits-cache.json` (local)  
**Time**: ~2-3 minutes  
**Requires**: `GITHUB_TOKEN` in `.env.local`

### Phase 2: Analyze with Different Models

#### Option A: Complete Pipeline (Fetch + Gemma)
```bash
npm run process-blog
```
**Equivalent to**: `npm run fetch-commits && npm run analyze:gemma`  
**Time**: ~5-10 minutes  
**Output**: `public/blog-data-gemma.json`

#### Option B: Gemma Only (uses cached commits)
```bash
npm run analyze:gemma
```
**Time**: ~3-5 minutes  
**Output**: `public/blog-data-gemma.json`  
**Requires**: Cache from `npm run fetch-commits`

#### Option C: Ministral Only (uses cached commits)
```bash
npm run analyze:ministral
```
**Time**: ~3-5 minutes  
**Output**: `public/blog-data-ministral.json`  
**Requires**: Cache from `npm run fetch-commits`

#### Option D: Ollama Only (uses cached commits)
```bash
npm run analyze:ollama
```
**Time**: ~3-5 minutes  
**Output**: `public/blog-data-ollama.json`  
**Requires**: Cache from `npm run fetch-commits`

---

## Common Workflows

### Scenario 1: First Time Setup
```bash
npm run process-blog
# Fetches commits and analyzes with Gemma
```

### Scenario 2: Compare All Three Models
```bash
npm run fetch-commits
npm run analyze:gemma
npm run analyze:ministral
npm run analyze:ollama
# All three results in public/
```

### Scenario 3: Test Analysis Changes
```bash
npm run fetch-commits
npm run analyze:gemma     # Test 1
npm run analyze:gemma     # Test 2 (cache still valid)
npm run analyze:gemma     # Test 3 (cache still valid)
# No re-cloning needed!
```

### Scenario 4: Update After Peak Blooms Changes
```bash
npm run fetch-commits     # Get latest commits
npm run analyze:gemma     # Re-analyze
```

---

## File Reference

### Input Files
| File | Purpose | Location | Required |
|------|---------|----------|----------|
| `.env.local` | GitHub token | Project root | Yes (for fetch) |

### Generated Files (Local Cache)
| File | Purpose | Location | Committed |
|------|---------|----------|-----------|
| `.commits-cache.json` | Cached commits | Project root | ❌ No |
| `.temp-peak-blooms-repo/` | Temp clone | Project root | ❌ No (auto-cleaned) |

### Output Files (Committed)
| File | Purpose | Location | Committed |
|------|---------|----------|-----------|
| `public/blog-data-gemma.json` | Gemma analysis | public/ | ✅ Yes |
| `public/blog-data-ministral.json` | Ministral analysis | public/ | ✅ Yes |
| `public/blog-data-ollama.json` | Ollama analysis | public/ | ✅ Yes |

---

## Troubleshooting

### Error: "Failed to load commits cache"
```
Solution: npm run fetch-commits
```
Cache file missing - run fetch step first.

### Error: "GITHUB_TOKEN environment variable is required"
```
Solution: Add to .env.local
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
```

### Error: Connection refused (Ollama/LM Studio)
```
Solution: Start the service
- LM Studio: Open LM Studio app
- Ollama: ollama serve
```

### Cache Stale?
```
Solution: npm run fetch-commits
Refresh cache anytime to get latest commits from Peak Blooms.
```

---

## Architecture at a Glance

```
┌─────────────────────────────────────────┐
│      npm run fetch-commits              │
│   (Clone, extract, cache)               │
└────────────────┬────────────────────────┘
                 │
                 ▼
         [.commits-cache.json]
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
 Gemma      Ministral     Ollama
 Analyze     Analyze      Analyze
    │            │            │
    └────────────┼────────────┘
                 │
    ┌────────────▼────────────┐
    │  Three JSON outputs     │
    │  (pick one or all)      │
    └─────────────────────────┘
```

---

## Performance Comparison

### Before Refactoring
```
process-blog-gemma    (5-10 min)  [Clone + Extract + Analyze]
process-blog-ollama   (5-10 min)  [Clone + Extract + Analyze]
Total: 10-20 minutes
```

### After Refactoring
```
fetch-commits         (2-3 min)   [Clone + Extract once]
analyze:gemma         (3-5 min)   [Cache + Analyze]
analyze:ollama        (3-5 min)   [Cache + Analyze]
Total: 8-13 minutes
Savings: 2-7 minutes!
```

---

## Key Benefits

| Before | After |
|--------|-------|
| Git clone in every script | Clone once, cache reused |
| GITHUB_TOKEN required 3 places | GITHUB_TOKEN required 1 place |
| Can't run analysis without re-fetching | Iterate analysis with fresh commits |
| Code duplication across scripts | Shared `loadStoredCommits()` |
| Hard to add new models | Easy to add new models |

---

## Documentation Map

| Document | Purpose | Audience |
|----------|---------|----------|
| `TWO_STEP_WORKFLOW.md` | Complete usage guide | Users & Developers |
| `REFACTORING.md` | What changed, why | Developers |
| `ARCHITECTURE_REFACTORED.md` | System architecture | Developers |
| `REFACTORING_CHECKLIST.md` | Verification checklist | Project Team |
| This file | Quick reference | Everyone |

---

## Next Steps

1. ✅ **Review** this quick guide
2. ✅ **Read** `TWO_STEP_WORKFLOW.md` for details
3. ⬜ **Test** the workflow: `npm run process-blog`
4. ⬜ **Verify** output in `public/blog-data-gemma.json`
5. ⬜ **Commit** changes to git
6. ⬜ **Deploy** to Vercel as usual

---

## Code Example: How It Works

### Step 1: Fetch (fetch-commits.ts)
```typescript
// Clones repo, extracts commits, saves to cache
const commits = await extractCommits(git);
await fs.writeFile('.commits-cache.json', JSON.stringify(grouped));
```

### Step 2: Analyze (process-blog-data.ts)
```typescript
// Loads from cache, analyzes with AI
const groupedCommits = await loadStoredCommits();
for (const dateStr of sortedDates) {
  const analysis = await analyzeCommitDay(commits, dateStr);
}
```

---

## Environment Setup

### .env.local
```bash
# Required for fetch-commits step
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx

# Optional, depending on which AI backend you use
# OLLAMA_API_KEY=xxxx          # For Ollama
# LM_STUDIO_API_KEY=xxxx       # For LM Studio
```

---

## Dependencies Needed

### Already Installed ✅
- `simple-git` - Git operations
- `date-fns` - Date formatting
- `ai` SDK - AI interactions
- `tsx` - TypeScript execution
- `dotenv-cli` - Environment variables

### Nothing New Required! ✅
All dependencies already in your `package.json`.

---

## Quick Decision Tree

```
Do you have a cached commit file?
│
├─ NO  → Run: npm run fetch-commits
│        Then choose below
│
└─ YES → Which analysis do you want?
         │
         ├─ Gemma   → npm run analyze:gemma
         ├─ Ollama  → npm run analyze:ollama
         └─ Ministral → npm run analyze:ministral

Starting fresh?
└─ YES → npm run process-blog (does both steps)

Want all three analyses?
└─ YES → npm run fetch-commits && npm run analyze:gemma && npm run analyze:ministral && npm run analyze:ollama
```

---

## Support & Issues

### Issue with commit cache?
```bash
rm .commits-cache.json
npm run fetch-commits
```
Cache corrupted? Delete and regenerate.

### Wrong analysis output?
```bash
npm run fetch-commits
npm run analyze:gemma    # Re-run your analysis
```
Cache might be stale or analysis crashed.

### AI model not responding?
Check if your AI backend is running:
- **LM Studio**: Open the app, check status
- **Ollama**: Run `ollama serve`

### Need help?
- Check `TWO_STEP_WORKFLOW.md` Troubleshooting section
- Review error messages (usually helpful!)
- Check `.env.local` has correct token

---

**Last Updated**: December 6, 2025  
**Refactoring Status**: ✅ Complete  
**Backward Compatibility**: ✅ Maintained
