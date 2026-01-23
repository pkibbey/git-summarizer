import { promises as fs } from 'fs';
import path from 'path';
import { format, parse } from 'date-fns';
import { loadStoredCommits } from '../lib/load-commits';
import { analyzeCommitDay } from '../lib/ai-unstructured';
import { type PromptVersion } from '../lib/ai-shared';
import type { BlogData, DayPost } from '../lib/types';

async function processBlogData(
  modelId: string,
  modelName: string,
  outputDir: string,
  testMode = false,
  promptVersion: PromptVersion = 'v1'
) {
  try {
    const modeLabel = testMode ? '(TEST MODE)' : '';
    console.log(`Starting blog data generation (${modelName}) - Unstructured Output... ${modeLabel}\n`);
    console.log(`Using model: ${modelId}`);
    console.log(`Using prompt version: ${promptVersion}\n`);

    if (testMode) {
      console.log('Test mode: Will process only 1 day or stop after 2 minutes\n');
    }

    // Step 1: Load commits from cache
    const groupedCommits = await loadStoredCommits();

    if (groupedCommits.size === 0) {
      throw new Error('No commits found in cache');
    }

    // Step 2: Process each day with AI analysis
    const days: DayPost[] = [];
    const sortedDates = Array.from(groupedCommits.keys()).sort();
    const startTime = Date.now();
    const timeoutMs = 2 * 60 * 1000; // 2 minutes

    for (const dateStr of sortedDates) {
      // Check timeout in test mode
      if (testMode) {
        const elapsedMs = Date.now() - startTime;
        if (elapsedMs > timeoutMs) {
          console.log(`\n⏱️  2-minute timeout reached in test mode. Stopping.`);
          break;
        }
        // Also stop after first day in test mode
        if (days.length > 0) {
          console.log(`\n✓ First day processed in test mode. Stopping.`);
          break;
        }
      }

      const commits = groupedCommits.get(dateStr)!;
      console.log(`Processing ${dateStr} (${commits.length} commits)...`);

      const analysis = await analyzeCommitDay(modelId, commits, dateStr, promptVersion);

      // Calculate stats
      const stats = commits.reduce(
        (acc, c) => ({
          totalCommits: acc.totalCommits + 1,
          filesChanged: acc.filesChanged + c.stats.filesChanged,
          additions: acc.additions + c.stats.additions,
          deletions: acc.deletions + c.stats.deletions,
        }),
        { totalCommits: 0, filesChanged: 0, additions: 0, deletions: 0 }
      );

      const dateObj = parse(dateStr, 'yyyy-MM-dd', new Date());
      const dayPost: DayPost = {
        date: dateStr,
        dayOfWeek: format(dateObj, 'EEEE'),
        commits,
        aiSummary: analysis.summary,
        keyDecisions: analysis.keyDecisions,
        architecturalCallouts: analysis.architecturalCallouts,
        stats,
      };

      days.push(dayPost);
      console.log(`  ✓ Generated summary and analysis`);

      // Add a small delay between API calls to be respectful to LM Studio
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Step 3: Create blog data structure
    const blogData: BlogData = {
      generatedAt: new Date().toISOString(),
      sourceRepo: process.env.NEXT_PUBLIC_REPO || "",
      days,
    };

    // Step 4: Write to versioned directory structure
    const outputPath = path.join(process.cwd(), 'public', 'blog-data', outputDir, `${promptVersion}.json`);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(blogData, null, 2), 'utf-8');

    console.log(`\n✅ Blog data generated successfully (${modelName})!`);
    console.log(`   Output: ${outputPath}`);
    console.log(`   Days processed: ${days.length}`);
    console.log(`   Total commits: ${days.reduce((acc, d) => acc + d.stats.totalCommits, 0)}`);

    if (testMode) {
      console.log(`\n📝 Test mode: Output saved to ${outputPath}`);
    } else {
      console.log(`\nNext steps:`);
      console.log(`   1. Review ${outputPath}`);
      console.log(`   2. Commit changes: git add public/blog-data/ && git commit -m "chore: update blog data"`);
      console.log(`   3. Deploy to Vercel with: git push`);
    }
  } catch (error) {
    console.error('Error processing blog data:', error);
    process.exit(1);
  }
}

(async () => {
  const testMode = process.argv.includes('--test');
  const modelIdArg = process.argv.find(arg => arg.startsWith('--model='))?.split('=')[1];
  const modelNameArg = process.argv.find(arg => arg.startsWith('--name='))?.split('=')[1];
  const outputDirArg = process.argv.find(arg => arg.startsWith('--output='))?.split('=')[1];
  const promptVersionArg = process.argv.find(arg => arg.startsWith('--version='))?.split('=')[1];
  const promptVersion = (promptVersionArg || 'v1') as PromptVersion;

  if (!modelIdArg) {
    console.error('Error: --model argument is required');
    console.error('Usage: tsx process-blog-data-unstructured.ts --model=<model_id> --name=<model_name> --output=<output_dir> [--version=v1|v2|v3] [--test]');
    process.exit(1);
  }

  if (!modelNameArg) {
    console.error('Error: --name argument is required');
    console.error('Usage: tsx process-blog-data-unstructured.ts --model=<model_id> --name=<model_name> --output=<output_dir> [--version=v1|v2|v3] [--test]');
    process.exit(1);
  }

  if (!outputDirArg) {
    console.error('Error: --output argument is required');
    console.error('Usage: tsx process-blog-data-unstructured.ts --model=<model_id> --name=<model_name> --output=<output_dir> [--version=v1|v2|v3] [--test]');
    process.exit(1);
  }

  if (!['v1', 'v2', 'v3'].includes(promptVersion)) {
    console.error(`Invalid prompt version: ${promptVersion}. Must be one of: v1, v2, v3`);
    process.exit(1);
  }

  await processBlogData(modelIdArg, modelNameArg, outputDirArg, testMode, promptVersion);
})();
