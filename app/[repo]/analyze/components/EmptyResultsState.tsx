"use client";

interface EmptyResultsStateProps {
	isAnalyzing: boolean;
}

export function EmptyResultsState({ isAnalyzing }: EmptyResultsStateProps) {
	if (isAnalyzing) return null;

	return (
		<div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
			<p className="text-slate-400">
				Select a model to check cache or click &quot;Analyze Commit&quot; to run
				new analysis
			</p>
		</div>
	);
}
