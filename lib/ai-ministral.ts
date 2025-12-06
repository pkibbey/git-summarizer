import { generateObject } from 'ai';
import { OpenAICompatibleChatLanguageModel } from '@ai-sdk/openai-compatible';
import { analysisResultSchema, buildPrompt, type PromptVersion } from './ai-shared';
import type { Commit } from './types';
import type { AnalysisResult } from './ai-shared';

// Initialize LM Studio client for Ministral with native structured output support
const baseUrl = 'http://localhost:1234/v1';
const modelId = 'mistralai/ministral-3-3b';

const model = new OpenAICompatibleChatLanguageModel(modelId, {
  provider: 'lmstudio',
  url: ({ path }) => {
    const url = new URL(`${baseUrl}${path}`);
    return url.toString();
  },
  headers: () => ({}),
  supportsStructuredOutputs: true,
});

export async function analyzeCommitDay(commits: Commit[], date: string, promptVersion: PromptVersion = 'v1'): Promise<AnalysisResult> {
  const prompt = buildPrompt(commits, date, promptVersion);

  try {
    const { object } = await generateObject({
      model,
      schema: analysisResultSchema,
      prompt,
      temperature: 0.7,
    });

    return object;
  } catch (error) {
    console.error(`Error analyzing commits for ${date}:`, error);

    // Return a fallback analysis if LM Studio is unavailable
    return {
      summary: `Day with ${commits.length} commits. See individual commits for details.`,
      keyDecisions: [],
      learnings: [],
      architecturalCallouts: [],
    };
  }
}
