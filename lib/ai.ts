import { BaseArgs, InferenceClient } from "@huggingface/inference";
import { ChatCompletionInput } from "@huggingface/tasks";
import { z } from "zod";
import type {
	ArchitecturalCallout,
	Commit,
	FileEvolution,
	Prompt,
	RepositoryEvolutionAnalysis,
	TokenUsage,
} from "./types";

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

export const evolutionAnalysisSchema = z.object({
	summary: z
		.string()
		.describe("A high-level summary of the repository evolution"),
	namedPieces: z
		.array(
			z.object({
				name: z.string(),
				description: z.string(),
				files: z.array(z.string()),
			}),
		)
		.describe("Logical pieces/modules of the code with their descriptions"),
	architecturalLessons: z
		.array(
			z.object({
				title: z.string(),
				lesson: z.string(),
				impact: z.enum(["high", "medium", "low"]),
				affectedFiles: z.array(z.string()),
			}),
		)
		.describe("Lessons and architectural improvements identified from history"),
});

export async function analyzeRepoEvolutionChat(
	repoUrl: string,
	fileEvolutions: FileEvolution[],
	modelId: string,
	modelProvider: string,
	namedPiecesCount: number = 10,
	architecturalLessonsCount: number = 8,
): Promise<
	Partial<RepositoryEvolutionAnalysis> & {
		tokens?: TokenUsage;
		modelId: string;
	}
> {
	const client = createHuggingFaceClient({ modelId });

	// Filter down to the most active files to avoid hitting context limits
	const topFiles = fileEvolutions.slice(0, 50).map((f) => ({
		path: f.path,
		changes: f.changeCount,
		lastMessage: f.commits[0]?.message,
		summaryOfChanges: f.commits.slice(0, 5).map((c) => c.message),
	}));

	const systemPrompt = `You are an expert software architect and repository forensic analyst.
Your task is to analyze the evolution of a codebase based on its file history.
You will be provided with a list of files, how many times they changed, and summaries of those changes.

Context to consider:
- This is a Next.js application. Mention framework-specific architecture where relevant (app/routes, client vs server components, data fetching patterns, routing, layouts, etc.).
- No formal designs were produced for the sites on purpose: the project evolved from a small core idea under time constraints, so emphasize pragmatic, evolutionary decisions and trade-offs.

Goals:
1. Dissect the repository into logical "named pieces" (modules/components) and describe what they do.
2. Identify "architectural lessons": patterns where frequent changes to certain files suggest that better architectural decisions earlier on could have minimized rework.
3. Provide a high-level summary of the repo's development story.

Output requirements:
- Return EXACTLY ${namedPiecesCount} items in "namedPieces" (no more, no less).
- Return EXACTLY ${architecturalLessonsCount} items in "architecturalLessons" (no more, no less).

Output MUST be valid JSON matching this schema:
{
	"summary": "string",
	"namedPieces": [{ "name": "string", "description": "string", "files": ["string"] }],
	"architecturalLessons": [{ "title": "string", "lesson": "string", "impact": "high"|"medium"|"low", "affectedFiles": ["string"] }]
}`;

	const userPrompt = `Analyze the evolution of this repository: ${repoUrl}
Most active files and their change history:
${JSON.stringify(topFiles, null, 2)}`;

	try {
		const requestOptions: BaseArgs & ChatCompletionInput = {
			model: modelId,
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			max_tokens: 2000,
			response_format: { type: "json_object" },
		};

		if (modelProvider) {
			requestOptions.provider = modelProvider as BaseArgs["provider"];
		}

		const response = (await client.chatCompletion(
			requestOptions,
		)) as HuggingFaceChatResponse;

		const content = response.choices?.[0]?.message?.content || "{}";
		const parsed = JSON.parse(content);
		const validated = evolutionAnalysisSchema.parse(parsed);

		// Enforce the requested counts: trim to the requested number of items.
		if (Array.isArray(validated.namedPieces)) {
			validated.namedPieces = validated.namedPieces.slice(0, namedPiecesCount);
		}

		if (Array.isArray(validated.architecturalLessons)) {
			validated.architecturalLessons = validated.architecturalLessons.slice(
				0,
				architecturalLessonsCount,
			);
		}

		const tokens = response.usage
			? {
					inputTokens: response.usage.prompt_tokens || 0,
					outputTokens: response.usage.completion_tokens || 0,
					totalTokens: response.usage.total_tokens || 0,
				}
			: undefined;

		return {
			...validated,
			tokens,
			modelId,
		};
	} catch (error) {
		console.error("Evolution analysis failed:", error);
		throw error;
	}
}
function createHuggingFaceClient(config: AIConfig): InferenceClient {
	const apiToken = config.apiToken || process.env.HUGGINGFACE_API_TOKEN || "";

	if (!apiToken) {
		console.warn("HUGGINGFACE_API_TOKEN not set - requests may fail");
	}

	return new InferenceClient(apiToken);
}

/**
 * Parses a model string in the format "modelId:provider"
 */
function parseModelId(modelId: string): { id: string; provider?: string } {
	if (modelId.includes(":")) {
		const [id, provider] = modelId.split(":");
		return { id, provider: provider as BaseArgs["provider"] };
	}
	return { id: modelId };
}

/**
 * Analyzes the journey of a single file through architectural evolution
 */
export async function analyzeFileJourney(
	filePath: string,
	snapshots: { message: string; diff: string; date: string }[],
	worldView: string,
	modelId: string,
): Promise<{
	evolutionaryLessons?: string[];
	description: string;
	reinforcement?: string;
	isHotspot: boolean;
	tokens?: TokenUsage;
	modelId: string;
}> {
	const parsedModel = parseModelId(modelId);
	const client = createHuggingFaceClient({ modelId });

	const systemPrompt = `You are an expert repository forensic analyst. You are analyzing the evolution journey of a SINGLE file.
Based on the provided chronological snapshots (including commit messages and diffs), extract architectural lessons.
Focus on the technical evolution and design decisions reflected in the code changes.

Respond with valid JSON:
{
  "description": "Brief summary of what this file is and how it evolved",
  "evolutionaryLessons": ["Lesson 1", "Lesson 2"], // Only if it changed significantly
  "reinforcement": "What stable pattern does this file consistently reinforce?", // Only if it changed very little
  "isHotspot": true/false // True if it's a source of frequent architectural churn/learning
}`;

	const snapshotsContext = snapshots
		.map((s) => `[${s.date}] ${s.message}\nDiff:\n${s.diff}`)
		.join("\n\n---\n\n");

	const userPrompt = `
File: ${filePath}
Context (Global repository context):
${worldView}

Chronological Snapshots of Changes:
${snapshotsContext}
`;

	try {
		const response = (await client.chatCompletion({
			model: parsedModel.id,
			provider: parsedModel.provider as BaseArgs["provider"],
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			max_tokens: 1000,
		})) as HuggingFaceChatResponse;

		const content = response.choices?.[0]?.message?.content || "{}";
		const jsonMatch = content.match(/\{[\s\S]*\}/);
		const result = JSON.parse(jsonMatch ? jsonMatch[0] : content);

		const tokens = response.usage
			? {
					inputTokens: response.usage.prompt_tokens || 0,
					outputTokens: response.usage.completion_tokens || 0,
					totalTokens: response.usage.total_tokens || 0,
				}
			: undefined;

		return {
			description: result.description || "Core file component",
			evolutionaryLessons: result.evolutionaryLessons,
			reinforcement: result.reinforcement,
			isHotspot: !!result.isHotspot,
			tokens,
			modelId,
		};
	} catch (error) {
		console.error(`Error analyzing journey for ${filePath}:`, error);

		// If it's a context window error (often 413 or mentions tokens/length)
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (
			errorMessage.includes("too many tokens") ||
			errorMessage.includes("context length") ||
			errorMessage.includes("maximum context length") ||
			errorMessage.includes("too long")
		) {
			throw new Error(
				`Context window exceeded for ${filePath}. This file has too much history for the current model.`,
			);
		}

		throw error;
	}
}

/**
 * Synthesizes multiple file journeys into a repository-wide evolution analysis
 */
export async function synthesizeEvolution(
	repoUrl: string,
	journeys: Array<{
		path: string;
		description: string;
		evolutionaryLessons?: string[];
		reinforcement?: string;
		isHotspot: boolean;
	}>,
	modelId: string,
): Promise<Partial<RepositoryEvolutionAnalysis>> {
	const parsedModel = parseModelId(modelId);
	const client = createHuggingFaceClient({ modelId });

	const systemPrompt = `You are a strategic software architect. You have analyzed several individual file journeys in a repository.
Your task is to synthesize these into a coherent repository-wide evolution analysis.
Identify shared architectural lessons that appear across different files.
Respond with valid JSON:
{
  "summary": "High-level summary of the entire repository's evolution",
  "architecturalLessons": [
    { "title": "...", "lesson": "...", "impact": "high/medium/low", "affectedFiles": ["..."] }
  ],
  "namedPieces": [
    { "name": "...", "description": "...", "files": ["..."] }
  ]
}`;

	const userPrompt = `
Repo: ${repoUrl}

Analyzed File Journeys:
${journeys
	.map(
		(j) => `
File: ${j.path}
Is Hotspot: ${j.isHotspot}
Description: ${j.description}
${j.evolutionaryLessons ? `Lessons: ${j.evolutionaryLessons.join(", ")}` : ""}
${j.reinforcement ? `Reinforcing: ${j.reinforcement}` : ""}
`,
	)
	.join("\n---\n")}
`;

	try {
		const response = (await client.chatCompletion({
			model: parsedModel.id,
			provider: parsedModel.provider as BaseArgs["provider"],
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			max_tokens: 1500,
		})) as HuggingFaceChatResponse;

		const content = response.choices?.[0]?.message?.content || "{}";
		const jsonMatch = content.match(/\{[\s\S]*\}/);
		const result = JSON.parse(jsonMatch ? jsonMatch[0] : content);

		const tokens = response.usage
			? {
					inputTokens: response.usage.prompt_tokens || 0,
					outputTokens: response.usage.completion_tokens || 0,
					totalTokens: response.usage.total_tokens || 0,
				}
			: undefined;

		return {
			summary: result.summary || "Evolutionary architecture analysis",
			architecturalLessons: result.architecturalLessons || [],
			namedPieces: result.namedPieces || [],
			tokens,
			modelId,
		};
	} catch (error) {
		console.error("Error synthesizing evolution:", error);
		return {
			summary: "Repository evolution analysis",
			modelId,
		};
	}
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
	modelId: string;
}> {
	const startTime = Date.now();
	const parsedModel = parseModelId(modelName);
	const targetModel = parsedModel.id;
	const targetProvider = provider || parsedModel.provider;

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
			modelId: targetModel,
			provider: targetProvider as BaseArgs["provider"],
			temperature,
		});

		const requestOptions: BaseArgs & ChatCompletionInput = {
			model: targetModel,
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
		if (targetProvider) {
			requestOptions.provider = targetProvider as BaseArgs["provider"];
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
			modelId: modelName,
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
			modelId: modelName,
		};
	}
}
