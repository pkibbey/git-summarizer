import { generateObject } from 'ai';
import { OpenAICompatibleChatLanguageModel } from '@ai-sdk/openai-compatible';
import { analysisResultSchema, buildPrompt, type PromptVersion } from './ai-shared';
import type { Commit } from './types';
import type { AnalysisResult } from './ai-shared';

export interface StructuredAIConfig {
  modelId: string;
  baseUrl?: string;
  temperature?: number;
}

/**
 * Creates a model instance for structured output support
 * @param config Configuration for the model
 * @returns OpenAI-compatible model with structured output enabled
 */
export function createStructuredModel(config: StructuredAIConfig): OpenAICompatibleChatLanguageModel {
  const baseUrl = config.baseUrl || 'http://localhost:1234/v1';

  return new OpenAICompatibleChatLanguageModel(config.modelId, {
    provider: 'lmstudio',
    url: ({ path }) => {
      const url = new URL(`${baseUrl}${path}`);
      return url.toString();
    },
    headers: () => ({}),
    supportsStructuredOutputs: true,
  });
}

/**
 * Analyzes a day of commits using a model with structured output support
 * @param modelId The model ID to use
 * @param commits Array of commits to analyze
 * @param date The date of the commits
 * @param promptVersion Which prompt version to use (v1, v2, v3, etc.)
 * @param baseUrl Optional base URL for the API (default: http://localhost:1234/v1)
 * @param temperature Optional temperature for generation (default: 0.7)
 * @returns Analysis result
 */
export async function analyzeCommitDay(
  modelId: string,
  commits: Commit[],
  date: string,
  promptVersion: PromptVersion = 'v1',
  baseUrl?: string,
  temperature: number = 0.7
): Promise<AnalysisResult> {
  const prompt = buildPrompt(commits, date, promptVersion);

  try {
    const model = createStructuredModel({
      modelId,
      baseUrl,
      temperature,
    });

    const { object } = await generateObject({
      model,
      schema: analysisResultSchema,
      prompt,
      temperature,
    });

    return object;
  } catch (error) {
    console.error(`Error analyzing commits for ${date}:`, error);

    // Return a fallback analysis if model is unavailable
    return {
      summary: `Day with ${commits.length} commits. See individual commits for details.`,
      keyDecisions: [],
      learnings: [],
      architecturalCallouts: [],
    };
  }
}
