import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResultType } from "@/lib/ai";
import { analyzeCommitChat } from "@/lib/ai";
import {
	deleteAnalysisResult,
	getAnalysisResult,
	getStoredCommits,
	storeAnalysisResult,
} from "@/lib/database";
import { MODELS } from "@/lib/models";
import { getStoredPrompt } from "@/lib/prompts-store";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { repoUrl, commitHash, modelName, promptId } = body;

		if (!repoUrl || !commitHash || !modelName || !promptId) {
			return NextResponse.json(
				{
					error:
						"Missing required parameters: repoUrl, commitHash, modelName, promptId",
				},
				{ status: 400 },
			);
		}

		// Check if result is already cached
		const cachedResult = await getAnalysisResult(
			repoUrl,
			commitHash,
			modelName,
			promptId,
		);

		if (cachedResult) {
			return NextResponse.json({
				success: true,
				wasCached: true,
				result: cachedResult,
			});
		}

		// Get the commit from storage
		const commits = await getStoredCommits(repoUrl);
		const commit = commits.find((c) => c.hash === commitHash);

		if (!commit) {
			return NextResponse.json(
				{ error: "Commit not found in repository" },
				{ status: 404 },
			);
		}

		// Get the prompt template
		const prompt = await getStoredPrompt(promptId);
		if (!prompt) {
			return NextResponse.json(
				{ error: "Prompt template not found" },
				{ status: 404 },
			);
		}

		// Analyze the commit
		const analysis = await analyzeCommitChat(commit, modelName, prompt);

		// Calculate cost metrics
		let estimatedCost = 0;
		if (analysis.tokens) {
			const modelInfo = MODELS.find((m) => m.id === modelName);
			if (modelInfo?.pricing) {
				const inputCostUSD =
					(analysis.tokens.inputTokens / 1_000_000) *
					(modelInfo.pricing.inputCost || 1);
				const outputCostUSD =
					(analysis.tokens.outputTokens / 1_000_000) *
					(modelInfo.pricing.outputCost || 1);
				estimatedCost = inputCostUSD + outputCostUSD;
			}
		}

		// Store the result
		const result: AnalysisResultType = {
			aiSummary: analysis.aiSummary,
			keyDecisions: analysis.keyDecisions,
			architecturalCallouts: analysis.architecturalCallouts,
			duration: analysis.duration,
			tokens: analysis.tokens,
		};

		await storeAnalysisResult(repoUrl, commitHash, {
			hash: commitHash,
			modelName,
			promptId,
			aiSummary: result.aiSummary,
			keyDecisions: result.keyDecisions,
			architecturalCallouts: result.architecturalCallouts,
			duration: result.duration,
			tokens: analysis.tokens,
			generatedAt: new Date().toISOString(),
		});

		return NextResponse.json({
			success: true,
			wasCached: false,
			result,
			commitHash,
			metrics: {
				tokens: analysis.tokens,
				estimatedCost: parseFloat(estimatedCost.toFixed(6)),
				duration: analysis.duration,
			},
		});
	} catch (error) {
		console.error("Error analyzing commit:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to analyze commit",
			},
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const body = await request.json();
		const { repoUrl, commitHash, modelName, promptId } = body;

		if (!repoUrl || !commitHash || !modelName || !promptId) {
			return NextResponse.json(
				{ error: "Missing required parameters" },
				{ status: 400 },
			);
		}

		const deleted = await deleteAnalysisResult(
			repoUrl,
			commitHash,
			modelName,
			promptId,
		);
		if (!deleted) {
			return NextResponse.json(
				{ error: "Analysis not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting analysis result:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to delete analysis",
			},
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	const repoUrl = request.nextUrl.searchParams.get("repoUrl");
	const commitHash = request.nextUrl.searchParams.get("commitHash");
	const modelName = request.nextUrl.searchParams.get("modelName");
	const promptId = request.nextUrl.searchParams.get("promptId");

	if (!repoUrl || !commitHash || !modelName || !promptId) {
		return NextResponse.json(
			{ error: "Missing required parameters" },
			{ status: 400 },
		);
	}

	try {
		const result = await getAnalysisResult(
			repoUrl,
			commitHash,
			modelName,
			promptId,
		);

		if (!result) {
			return NextResponse.json(
				{ error: "Analysis result not found" },
				{ status: 200 },
			);
		}

		// Calculate cost metrics from cached result
		let estimatedCost = 0;
		if (result.tokens) {
			const modelInfo = MODELS.find((m) => m.id === modelName);
			if (modelInfo?.pricing) {
				const inputCostUSD =
					(result.tokens.inputTokens / 1_000_000) *
					(modelInfo.pricing.inputCost || 1);
				const outputCostUSD =
					(result.tokens.outputTokens / 1_000_000) *
					(modelInfo.pricing.outputCost || 1);
				estimatedCost = inputCostUSD + outputCostUSD;
			}
		}

		return NextResponse.json({
			success: true,
			wasCached: true,
			result,
			commitHash,
			metrics: {
				tokens: result.tokens,
				estimatedCost: parseFloat(estimatedCost.toFixed(6)),
				duration: result.duration,
			},
		});
	} catch (error) {
		console.error("Error fetching analysis result:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to fetch analysis result",
			},
			{ status: 500 },
		);
	}
}
