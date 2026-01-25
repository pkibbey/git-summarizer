"use client";

interface AnalysisResultSummaryProps {
	summary: string;
}

export function AnalysisResultSummary({ summary }: AnalysisResultSummaryProps) {
	return (
		<div>
			<h4 className="font-semibold text-sm text-slate-300 mb-2">Summary</h4>
			<p className="text-sm">{summary}</p>
		</div>
	);
}
