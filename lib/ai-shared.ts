import { z } from 'zod';
import type { Commit } from './types';

// Define the output schema using Zod for type-safe structured output
export const analysisResultSchema = z.object({
  summary: z.string().describe('A 2-3 sentence summary of the day\'s work'),
  keyDecisions: z.array(z.string()).describe('Key decisions made during the day'),
  learnings: z.array(z.string()).describe('Important learnings from the day'),
  architecturalCallouts: z.array(
    z.object({
      type: z.enum(['design-decision', 'pattern-used', 'performance-insight', 'learning']),
      title: z.string(),
      description: z.string(),
    })
  ).describe('Architectural decisions and insights'),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

const PROMPT_TEMPLATE = `You are an expert software architect and technical writer reviewing a day's worth of development commits for a website project (Peak Blooms) built over 2 weeks.

Date: {date}
Total Commits: {commitCount}

{commitDetails}

Please provide a comprehensive analysis in the following JSON format:
{
  "summary": "A 2-3 sentence summary of the day's work and its significance to the project",
  "keyDecisions": ["Decision 1", "Decision 2", "Decision 3"],
  "learnings": ["Learning 1", "Learning 2", "Learning 3"],
  "architecturalCallouts": [
    {
      "type": "design-decision|pattern-used|performance-insight|learning",
      "title": "Brief title",
      "description": "One sentence description of the architectural decision or insight"
    }
  ]
}

Focus on:
1. How decisions demonstrate user-centric design and deep thinking
2. What architectural patterns or principles are being applied
3. Performance considerations and optimization choices
4. Learning moments that show problem-solving ability
5. How the code demonstrates software quality principles

Be specific and insightful - this is a portfolio demonstration of engineering excellence.`;

export function buildPrompt(commits: Commit[], date: string): string {
  const commitDetails = commits
    .map(
      (c) => `
Commit: ${c.hash.slice(0, 7)}
Author: ${c.author}
Message: ${c.message}
Files Changed: ${c.stats.filesChanged} (+${c.stats.additions}/-${c.stats.deletions})
${c.shortDiff ? `Diff Preview:\n${c.shortDiff}` : ''}
    `
    )
    .join('\n---\n');

  return PROMPT_TEMPLATE.replace('{date}', date)
    .replace('{commitCount}', String(commits.length))
    .replace('{commitDetails}', commitDetails);
}

export function normalizeArchitecturalCallouts(
  callouts: Record<string, unknown>[]
): Record<string, unknown>[] {
  return callouts.map((callout) => {
    const typeValue = String(callout.type || '').toLowerCase().trim();

    // Normalize common variations to valid enum values
    let normalizedType = typeValue;
    if (typeValue.includes('design') || typeValue.includes('decision')) {
      normalizedType = 'design-decision';
    } else if (typeValue.includes('pattern') || typeValue.includes('used')) {
      normalizedType = 'pattern-used';
    } else if (typeValue.includes('performance') || typeValue.includes('insight')) {
      normalizedType = 'performance-insight';
    } else if (typeValue === 'learning' || typeValue === 'learnings') {
      normalizedType = 'learning';
    } else {
      // Default to 'learning' if we can't determine
      normalizedType = 'learning';
    }

    return {
      ...callout,
      type: normalizedType,
    };
  });
}
