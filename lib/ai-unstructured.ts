import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { analysisResultSchema, buildPrompt, normalizeArchitecturalCallouts, type PromptVersion } from './ai-shared';
import type { Commit } from './types';
import type { AnalysisResult } from './ai-shared';

export interface UnstructuredAIConfig {
  modelId: string;
  baseUrl?: string;
  temperature?: number;
}

/**
 * Creates a provider instance for unstructured output (text-based)
 * @param config Configuration for the model
 * @returns OpenAI-compatible provider
 */
export function createUnstructuredProvider(config: UnstructuredAIConfig) {
  const baseUrl = config.baseUrl || 'http://localhost:1234/v1';

  return createOpenAICompatible({
    name: 'lmstudio',
    baseURL: baseUrl,
  });
}

/**
 * Analyzes a day of commits using a model without native structured output support
 * Falls back to text generation with JSON parsing and validation
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
    const provider = createUnstructuredProvider({
      modelId,
      baseUrl,
      temperature,
    });

    const { text } = await generateText({
      model: provider(modelId),
      prompt,
      temperature,
      maxRetries: 0,
    });

    // Extract JSON from the response and parse it
    const jsonMatch = text.match(/\{[\s\S]*\}(?![\s\S]*\{)/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Clean up architectural callouts: normalize enum values that might be slightly off
    if (parsed.architecturalCallouts && Array.isArray(parsed.architecturalCallouts)) {
      parsed.architecturalCallouts = normalizeArchitecturalCallouts(parsed.architecturalCallouts);
    }

    const result = analysisResultSchema.parse(parsed);

    return result;
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
