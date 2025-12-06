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

export type PromptVersion = 'v1' | 'v2' | 'v3';

export interface PromptConfig {
  name: string;
  description: string;
  template: string;
}

const PROMPT_TEMPLATES: Record<PromptVersion, PromptConfig> = {
  v1: {
    name: 'Original Prompt (v1)',
    description: 'Initial architecture-focused analysis',
    template: `You are an expert software architect and technical writer reviewing a day's worth of development commits for a website project (Peak Blooms) built over 2 weeks.

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

Be specific and insightful - this is a portfolio demonstration of engineering excellence.`,
  },
  v2: {
    name: 'Refined Prompt (v2)',
    description: 'Human voice - conversational, confident, personal',
    template: `You are a seasoned, confident software engineer sharing the story of your day's development work on Peak Blooms. You're talking to peers and potential collaborators—be genuine, smart, and unpretentious.

Date: {date}
Total Commits: {commitCount}

{commitDetails}

Please provide your analysis in this JSON format:
{
  "summary": "What you accomplished today in 2-3 sentences. Make it personal—what did this day mean for the project?",
  "keyDecisions": ["Decision 1", "Decision 2", "Decision 3"],
  "learnings": ["Learning 1", "Learning 2", "Learning 3"],
  "architecturalCallouts": [
    {
      "type": "design-decision|pattern-used|performance-insight|learning",
      "title": "Brief title",
      "description": "One sentence—why this matters and what you're thinking"
    }
  ]
}

Write like you're explaining this to a smart friend:
1. **Key Decisions** - Why did you choose this approach? Keep it short and human. ("I went with ShadCN for accessible components—saves us time and headaches" instead of technical jargon)
2. **Learnings** - What surprised you? What did you figure out?
3. **Callouts** - Highlight smart choices, patterns you noticed, or things you're proud of
4. **Keep it punchy** - Use short sentences. Avoid walls of text. Think "conversational blog post," not technical documentation

Be specific, be honest, and let your expertise show naturally through your choices—not through complex language.`,
  },
  v3: {
    name: 'Latest Prompt (v3)',
    description: 'Fun, casual, and engaging - humorous and snappy',
    template: `You're a developer who just finished a solid day of work on Peak Blooms, and you're telling your friends what went down. Be fun, be real, be quick. No corporate speak. Just genuine reactions and insights.

Date: {date}
Total Commits: {commitCount}

{commitDetails}

Gimme your take in this format:
{
  "summary": "What happened today? Keep it real—did you ship something cool? Hit a wall then break through? Just tell it straight in 2-3 sentences.",
  "keyDecisions": ["Decision 1", "Decision 2", "Decision 3"],
  "learnings": ["Learning 1", "Learning 2", "Learning 3"],
  "architecturalCallouts": [
    {
      "type": "design-decision|pattern-used|performance-insight|learning",
      "title": "Quick title",
      "description": "One sentence that actually explains why you think this is cool"
    }
  ]
}

Rules:
1. **Keep it snappy** - Short, punchy sentences. No fluff. If it takes more than one line to explain, you're overthinking it.
2. **Have fun with it** - Humor is allowed. Sarcasm is allowed. ("Turned out precompiling routes saves a ton of headaches" is better than any technical explanation)
3. **Be real** - What actually surprised you? What made you go "aha"? That's the stuff people want to hear.
4. **Skip the jargon** - Would you use that word explaining this to a friend over coffee? If not, say it differently.
5. **Celebrate the wins** - Shipping is hard. Call out what worked, what you're proud of, what just clicked.

Make it readable. Make it honest. Make it memorable.`,
  },
};

export function getPromptTemplate(version: PromptVersion): string {
  return PROMPT_TEMPLATES[version].template;
}

export function getAvailablePrompts(): Array<{ version: PromptVersion; name: string; description: string }> {
  return Object.entries(PROMPT_TEMPLATES).map(([version, config]) => ({
    version: version as PromptVersion,
    name: config.name,
    description: config.description,
  }));
}

export function buildPrompt(commits: Commit[], date: string, version: PromptVersion = 'v1'): string {
  const template = getPromptTemplate(version);
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

  return template.replace('{date}', date)
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
