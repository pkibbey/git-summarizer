import { BaseArgs, InferenceClient } from "@huggingface/inference";
import { ChatCompletionInput, SummarizationInput } from "@huggingface/tasks";
import { z } from "zod";
import type { ArchitecturalCallout, Commit, Prompt, TokenUsage } from "./types";

interface AIConfig {
	apiToken?: string;
	provider?: string;
	modelId: string;
	temperature?: number;
}

// Typed response from HuggingFace chatCompletion
interface HuggingFaceChatResponse {
	choices?: Array<{
		index?: number;
		message?: {
			role?: string;
			content?: string;
		};
		finish_reason?: string;
	}>;
	usage?: {
		prompt_tokens?: number;
		completion_tokens?: number;
		total_tokens?: number;
	};
	[k: string]: unknown;
}

// Schema for analysis results
export const analysisResultSchema = z.object({
	aiSummary: z.string().describe("A comprehensive summary of the commit"),
	keyDecisions: z
		.array(z.string())
		.describe("Key decisions made in this commit"),
	architecturalCallouts: z
		.array(
			z.object({
				type: z.enum([
					"design-decision",
					"pattern-used",
					"performance-insight",
					"learning",
				]),
				title: z.string(),
				description: z.string(),
			}),
		)
		.describe("Architectural decisions and insights"),
	duration: z.number().describe("Duration in milliseconds"),
	tokens: z
		.object({
			inputTokens: z.number(),
			outputTokens: z.number(),
			totalTokens: z.number(),
		})
		.optional()
		.describe("Token usage information"),
});

export type AnalysisResultType = z.infer<typeof analysisResultSchema>;

/**
 * Creates a HuggingFace Inference client
 */
function createHuggingFaceClient(config: AIConfig): InferenceClient {
	const apiToken = config.apiToken || process.env.HUGGINGFACE_API_TOKEN || "";

	if (!apiToken) {
		console.warn("HUGGINGFACE_API_TOKEN not set - requests may fail");
	}

	return new InferenceClient(apiToken);
}

/**
 * Normalizes architectural callout types from various string formats
 */
function normalizeArchitecturalCallouts(
	callouts: Record<string, unknown>[],
): ArchitecturalCallout[] {
	return callouts.map((callout) => {
		const typeValue = String(callout.type || "")
			.toLowerCase()
			.trim();

		let normalizedType:
			| "design-decision"
			| "pattern-used"
			| "performance-insight"
			| "learning" = "learning";

		if (typeValue.includes("design") || typeValue.includes("decision")) {
			normalizedType = "design-decision";
		} else if (typeValue.includes("pattern") || typeValue.includes("used")) {
			normalizedType = "pattern-used";
		} else if (
			typeValue.includes("performance") ||
			typeValue.includes("insight")
		) {
			normalizedType = "performance-insight";
		} else if (typeValue === "learning" || typeValue === "learnings") {
			normalizedType = "learning";
		}

		return {
			type: normalizedType,
			title: String(callout.title || "Untitled"),
			description: String(callout.description || ""),
		};
	});
}

/**
 * Analyzes a single commit using HuggingFace Inference with JSON output
 */
export async function analyzeCommitChat(
	commit: Commit,
	modelName: string,
	prompt: Prompt,
	provider?: BaseArgs["provider"],
	temperature: number = 0.7,
): Promise<{
	aiSummary: string;
	keyDecisions: string[];
	architecturalCallouts: ArchitecturalCallout[];
	duration: number;
	tokens?: TokenUsage;
}> {
	const startTime = Date.now();

	// Intelligently truncate diff to fit within token limits
	// Rough estimate: ~4 chars per token, leave ~500 tokens for other content
	const maxDiffLength = 8000; // ~2000 tokens
	let diffContent = "";

	if (commit.fullDiff) {
		if (commit.fullDiff.length > maxDiffLength) {
			diffContent =
				commit.fullDiff.substring(0, maxDiffLength) + "\n... (diff truncated)";
		} else {
			diffContent = commit.fullDiff;
		}
	}

	// Build commit details for the prompt
	const commitDetails = `
Commit: ${commit.hash.slice(0, 7)}
Author: ${commit.author}
Date: ${commit.date}
Message: ${commit.message}
Files changed: ${commit.stats.filesChanged}, +${commit.stats.additions} -${commit.stats.deletions}
${diffContent ? `Diff:\n${diffContent}` : ""}
`;

	// Create the combined analysis prompt
	const fullPrompt = `You are a code analysis expert. Analyze the following commit and respond with valid JSON.

${prompt.summaryPrompt}

${prompt.decisionsPrompt}

${prompt.insightsPrompt}

Commit Details:
${commitDetails}

Respond with valid JSON in this exact format:
{
  "aiSummary": "A comprehensive summary of the commit",
  "keyDecisions": ["decision1", "decision2"],
  "architecturalCallouts": [
    {
      "type": "design-decision|pattern-used|performance-insight|learning",
      "title": "Title of insight",
      "description": "Detailed description"
    }
  ]
}`;

	try {
		const client = createHuggingFaceClient({
			modelId: modelName,
			provider,
			temperature,
		});

		const requestOptions: BaseArgs & ChatCompletionInput = {
			model: modelName,
			messages: [
				{
					role: "user",
					content: fullPrompt,
				},
			],
			temperature,
			max_tokens: 2048,
		};

		// Only add provider if specified
		if (provider) {
			requestOptions.provider = provider;
		}

		// Use chatCompletion for JSON output

		const response = await client.chatCompletion(requestOptions);
		console.log("response: ", response);

		// Extract the response content
		const responseText = response.choices[0]?.message?.content || "";

		// Parse JSON from response
		const jsonMatch = responseText.match(/\{[\s\S]*\}(?![\s\S]*\{)/);
		if (!jsonMatch) {
			throw new Error("No JSON object found in response");
		}

		const parsed = JSON.parse(jsonMatch[0]);

		// Normalize the callouts
		if (
			parsed.architecturalCallouts &&
			Array.isArray(parsed.architecturalCallouts)
		) {
			parsed.architecturalCallouts = normalizeArchitecturalCallouts(
				parsed.architecturalCallouts,
			);
		} else {
			parsed.architecturalCallouts = [];
		}

		const duration = Date.now() - startTime;

		const responseData = response as HuggingFaceChatResponse;
		const tokens: TokenUsage | undefined = responseData.usage
			? {
					inputTokens: responseData.usage.prompt_tokens || 0,
					outputTokens: responseData.usage.completion_tokens || 0,
					totalTokens:
						(responseData.usage.prompt_tokens || 0) +
						(responseData.usage.completion_tokens || 0),
				}
			: undefined;

		return {
			aiSummary: parsed.aiSummary || "",
			keyDecisions: Array.isArray(parsed.keyDecisions)
				? parsed.keyDecisions
				: [],
			architecturalCallouts: parsed.architecturalCallouts,
			duration,
			tokens,
		};
	} catch (error) {
		console.error(`Error analyzing commit ${commit.hash}:`, error);

		const duration = Date.now() - startTime;

		// Return a fallback analysis
		return {
			aiSummary: `Commit ${commit.hash.slice(0, 7)}: ${commit.message}`,
			keyDecisions: [],
			architecturalCallouts: [],
			duration,
			tokens: {
				inputTokens: 0,
				outputTokens: 0,
				totalTokens: 0,
			},
		};
	}
}
