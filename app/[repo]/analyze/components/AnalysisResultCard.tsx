"use client";

import { Button } from "@/components/ui/button";
import { AnalysisResultSummary } from "./AnalysisResultSummary";
import { ArchitecturalCallouts } from "./ArchitecturalCallouts";
import { KeyDecisions } from "./KeyDecisions";
import { ResultHeader } from "./ResultHeader";

interface AnalysisResult {
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
}

interface ResultVisibility {
	summary: boolean;
	decisions: boolean;
	callouts: boolean;
}

interface AnalysisResultCardProps {
	result: AnalysisResult;
	visibility: ResultVisibility;
	onDelete: () => void;
}

export function AnalysisResultCard({
	result,
	visibility,
	onDelete,
}: AnalysisResultCardProps) {
	return (
		<div className="relative bg-slate-800 rounded-lg p-6 border border-slate-700">
			<Button
				onClick={onDelete}
				variant="ghost"
				size="icon"
				className="absolute top-3 right-3 text-slate-400 hover:text-red-400 p-1 rounded"
				title="Delete analysis"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="w-4 h-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
					/>
				</svg>
			</Button>

			<ResultHeader
				modelName={result.modelName}
				tokens={result.tokens}
				estimatedCost={result.estimatedCost}
				duration={result.duration}
				wasCached={result.wasCached}
			/>

			<div className="space-y-4">
				{visibility.summary && (
					<AnalysisResultSummary summary={result.summary} />
				)}

				{visibility.decisions && <KeyDecisions decisions={result.decisions} />}

				{visibility.callouts && (
					<ArchitecturalCallouts callouts={result.callouts} />
				)}
			</div>
		</div>
	);
}
