import { Model } from "@/lib/models";

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
