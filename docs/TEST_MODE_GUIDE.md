# Test Mode Guide - Analyze Scripts

## Overview

All analyze scripts now support a `--test` argument for quick testing. In test mode, the script will:

- ✅ Process only the **first day** of commits, OR
- ✅ Stop after **2 minutes**, whichever comes first
- ✅ Save output to the same location as normal mode
- ✅ Show clear indicators that it's in test mode

## Usage

### Test Mode - Gemma
```bash
npx tsx scripts/process-blog-data-gemma.ts --test
```

### Test Mode - Ollama
```bash
npx tsx scripts/process-blog-data-ollama.ts --test
```

### Test Mode - Ministral
```bash
npx tsx scripts/process-blog-data-ministral.ts --test
```

### Normal Mode (Default)
All scripts work normally without the `--test` flag:
```bash
npm run analyze:gemma
npm run analyze:ollama
npm run analyze:ministral
```

Or via direct tsx execution:
```bash
npx tsx scripts/process-blog-data.ts
```

## What Test Mode Does

### Behavior
```
Start processing commits
  ↓
Process first day completely
  ↓
Check if 2 minutes have passed
  ├─ YES → Stop and save
  └─ NO  → Stop after first day anyway
  ↓
Save results to public/blog-data-{model}.json
```

### Example Output (Test Mode)

```
Starting blog data generation... (TEST MODE)

Test mode: Will process only 1 day or stop after 2 minutes

Processing 2024-12-01 (5 commits)...
  ✓ Generated summary and analysis

✓ First day processed in test mode. Stopping.

✅ Blog data generated successfully!
   Output: /Users/phineas/Sites/peak-blooms-blog/public/blog-data-gemma.json
   Days processed: 1
   Total commits: 5

📝 Test mode: Output saved to /Users/phineas/Sites/peak-blooms-blog/public/blog-data-gemma.json
```

### Example Output (Normal Mode)

```
Starting blog data generation...

Processing 2024-12-01 (5 commits)...
  ✓ Generated summary and analysis
Processing 2024-12-02 (3 commits)...
  ✓ Generated summary and analysis
Processing 2024-12-03 (7 commits)...
  ✓ Generated summary and analysis
... (continues for all dates)

✅ Blog data generated successfully!
   Output: /Users/phineas/Sites/peak-blooms-blog/public/blog-data-gemma.json
   Days processed: 32
   Total commits: 245

Next steps:
   1. Review public/blog-data-gemma.json
   2. Commit changes: git add public/blog-data-gemma.json && git commit -m "chore: update blog data"
   3. Deploy to Vercel with: git push
```

## Common Test Workflows

### Quick Test of Gemma
```bash
npm run fetch-commits  # Fetch commits once
npx tsx scripts/process-blog-data.ts --test  # Test gemma
```

### Compare Models (Quick Test)
```bash
npm run fetch-commits
npx tsx scripts/process-blog-data.ts --test           # Test Gemma
npx tsx scripts/process-blog-data-ollama.ts --test    # Test Ollama
npx tsx scripts/process-blog-data-ministral.ts --test # Test Ministral
```

### Verify AI Connection
```bash
npx tsx scripts/process-blog-data.ts --test
```
If it completes successfully, your AI backend is working!

### Debug Analysis Logic
```bash
npx tsx scripts/process-blog-data.ts --test
# Modify analysis code
npx tsx scripts/process-blog-data.ts --test
# Iterate quickly without full processing
```

## Test Mode Features

### Stop Conditions
The script stops processing when:
1. **First day completes** (primary condition in test mode), OR
2. **2 minutes elapse** (whichever comes first)

### Output
- Same JSON format as normal mode
- Saves to `public/blog-data-{model}.json`
- Only contains 1 day worth of data
- Can be used for testing display/deployment

### Timing Savings
| Mode | First Day Only | Multi-day |
|------|---|---|
| Test | ~10-30 seconds | ~2 minutes |
| Normal | ~10-30 seconds | ~5-10 minutes |
| Savings | 0 | **3-8 minutes** |

## Troubleshooting Test Mode

### Error: "Failed to load commits cache"
```bash
npm run fetch-commits
npx tsx scripts/process-blog-data.ts --test
```
You must fetch commits first.

### Test took longer than 2 minutes
This only happens if the first day's analysis itself takes >2 minutes. The timeout check happens between days, not during a single day's analysis. This is intentional - we want to complete the day once started.

### Output file empty or minimal
This is normal! Test mode processes only 1 day, so you'll see minimal output. Example:
```json
{
  "generatedAt": "2024-12-06T...",
  "sourceRepo": "https://github.com/pkibbey/peak-blooms",
  "days": [
    {
      "date": "2024-12-01",
      "dayOfWeek": "Friday",
      "commits": [ ... 5 commits ... ],
      ...
    }
  ]
}
```

### Test output looks good, now run full generation
```bash
npm run analyze:gemma    # Normal mode (no --test flag)
# This will process all days
```

## Implementation Details

### How It Works

Each analyze script now:
1. Accepts optional `--test` command-line argument
2. Passes `testMode` boolean to processing function
3. During main loop:
   ```typescript
   if (testMode) {
     // Check 2-minute timeout
     if (elapsedMs > 2min) break;
     // Stop after first day
     if (days.length > 0) break;
   }
   ```
4. Adjusts output messages based on mode
5. Saves results to same location regardless of mode

### Code Changes
- All three analyze scripts updated identically
- Single boolean parameter: `processBlogData(testMode)`
- Loop-level checks for maximum efficiency
- Clear console feedback on mode

## Scripts Updated

✅ `scripts/process-blog-data.ts` (Gemma)
✅ `scripts/process-blog-data-ollama.ts` (Ollama)
✅ `scripts/process-blog-data-ministral.ts` (Ministral)

## Quick Reference

| Command | Mode | Output |
|---------|------|--------|
| `npm run analyze:gemma` | Normal | Full data (all days) |
| `npx tsx scripts/process-blog-data.ts --test` | Test | 1 day only |
| `npx tsx scripts/process-blog-data.ts` | Normal | Full data (all days) |

---

**Last Updated**: December 6, 2025  
**Feature Status**: ✅ Complete  
**Available in**: All analyze scripts
