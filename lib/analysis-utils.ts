import { Model } from "@/lib/models";
import type { Commit, FileEvolution } from "@/lib/types";

export function calculateCostBreakdown(
	tokens:
		| { inputTokens: number; outputTokens: number; totalTokens: number }
		| undefined,
	model: Model | undefined,
	estimatedCost: number | undefined,
): string {
	if (!tokens || !model?.pricing || estimatedCost === undefined) {
		return "";
	}

	const inputCost =
		(tokens.inputTokens / 1_000_000) * (model.pricing.inputCost || 0);
	const outputCost =
		(tokens.outputTokens / 1_000_000) * (model.pricing.outputCost || 0);

	return `${tokens.inputTokens.toLocaleString()} in × $${model.pricing.inputCost?.toFixed(4) || inputCost} + ${tokens.outputTokens.toLocaleString()} out × $${model.pricing.outputCost?.toFixed(4) || outputCost} = $${estimatedCost.toFixed(6)}`;
}

export type AnalysisResult = {
	modelName: string;
	summary: string;
	decisions: string[];
	callouts: Array<{
		type: string;
		title: string;
		description: string;
	}>;
	duration: number;
	tokens?: {
		inputTokens: number;
		outputTokens: number;
		totalTokens: number;
	};
	estimatedCost?: number;
	wasCached?: boolean;
};

export function generateResultKey(
	commitHash: string,
	modelId: string,
	promptId: string,
): string {
	return `${commitHash}-${modelId}-${promptId}`;
}

export function collectFileEvolution(commits: Commit[]): FileEvolution[] {
	const fileMap = new Map<string, FileEvolution>();

	for (const commit of commits) {
		for (const file of commit.files) {
			if (!fileMap.has(file.path)) {
				fileMap.set(file.path, {
					path: file.path,
					changeCount: 0,
					lastChanged: commit.date,
					authors: [],
					commits: [],
				});
			}

			const evolution = fileMap.get(file.path)!;
			evolution.changeCount++;
			if (new Date(commit.date) > new Date(evolution.lastChanged)) {
				evolution.lastChanged = commit.date;
			}
			if (!evolution.authors.includes(commit.author)) {
				evolution.authors.push(commit.author);
			}
			evolution.commits.push({
				hash: commit.hash,
				date: commit.date,
				message: commit.message,
				additions: file.additions,
				deletions: file.deletions,
			});
		}
	}

	return Array.from(fileMap.values()).sort(
		(a, b) => b.changeCount - a.changeCount,
	);
}
