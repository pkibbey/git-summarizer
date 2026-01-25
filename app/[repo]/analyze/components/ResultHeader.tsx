"use client";

import { MODELS, Model } from "@/lib/models";

interface ResultHeaderProps {
	modelName: string;
	tokens?: {
		inputTokens: number;
		outputTokens: number;
		totalTokens: number;
	};
	estimatedCost?: number;
	duration: number;
	wasCached?: boolean;
}

function calculateCostBreakdown(
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

export function ResultHeader({
	modelName,
	tokens,
	estimatedCost,
	duration,
	wasCached,
}: ResultHeaderProps) {
	const model = MODELS.find((m) => m.id === modelName);

	return (
		<div className="flex items-center justify-between mb-4">
			<div>
				<h3 className="text-lg font-semibold">
					{model ? model.name : modelName}
					{calculateCostBreakdown(tokens, model, estimatedCost) ? (
						<span className="ml-2 text-xs text-slate-400">
							{calculateCostBreakdown(tokens, model, estimatedCost)}
						</span>
					) : model?.pricing?.inputCost !== undefined ? (
						<span className="ml-2 text-xs text-slate-400">
							${model.pricing.inputCost.toFixed(2)} /1M in
						</span>
					) : null}
				</h3>
				{wasCached && (
					<span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded mt-1 inline-block">
						✓ From Cache
					</span>
				)}
			</div>
			<div className="text-right">
				<div className="text-xs text-slate-400">{duration}ms</div>
				{tokens && estimatedCost !== undefined && (
					<div className="text-xs text-slate-400 mt-2">
						<div>{tokens.totalTokens} tokens</div>
						<div className="text-yellow-400 font-semibold">
							${estimatedCost.toFixed(6)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
