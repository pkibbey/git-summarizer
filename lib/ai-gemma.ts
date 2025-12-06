import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { analysisResultSchema, buildPrompt, normalizeArchitecturalCallouts } from './ai-shared';
import type { Commit } from './types';
import type { AnalysisResult } from './ai-shared';

// Initialize LM Studio client (OpenAI-compatible API)
const baseUrl = 'http://localhost:1234/v1';
const modelId = 'google/gemma-3n-e4b';

const lmstudio = createOpenAICompatible({
  name: 'lmstudio',
  baseURL: baseUrl,
});

export async function analyzeCommitDay(commits: Commit[], date: string): Promise<AnalysisResult> {
  const prompt = buildPrompt(commits, date);

  try {
    const { text } = await generateText({
      model: lmstudio(modelId),
      prompt,
      temperature: 0.7,
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

    // Return a fallback analysis if LM Studio is unavailable
    return {
      summary: `Day with ${commits.length} commits. See individual commits for details.`,
      keyDecisions: [],
      learnings: [],
      architecturalCallouts: [],
    };
  }
}