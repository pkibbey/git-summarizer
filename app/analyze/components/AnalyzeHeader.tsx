"use client";

import { Button } from "@/components/ui/button";

interface AnalyzeHeaderProps {
	repoUrl: string | null;
	globalTotal: number;
	onBackClick: () => void;
}

export function AnalyzeHeader({
	repoUrl,
	globalTotal,
	onBackClick,
}: AnalyzeHeaderProps) {
	return (
		<div className="mb-8">
			<Button
				onClick={onBackClick}
				className="text-blue-400 hover:text-blue-300 mb-4"
			>
				← Back to Home
			</Button>
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold mb-2">Commit Analysis</h1>
				<div className="text-sm text-slate-300">
					Total:{" "}
					<span className="text-yellow-400 font-semibold">
						${globalTotal.toFixed(6)}
					</span>
				</div>
			</div>
			<p className="text-slate-400">
				Repo:{" "}
				<code className="bg-slate-800 px-2 py-1 rounded text-sm">
					{repoUrl}
				</code>
			</p>
		</div>
	);
}
