"use client";

import { Button } from "@/components/ui/button";

interface AnalyzeSidebarProps {
	onAnalyze: () => void;
	disabled: boolean;
	analyzing: boolean;
}

export function AnalyzeButton({
	onAnalyze,
	disabled,
	analyzing,
}: AnalyzeSidebarProps) {
	return (
		<Button
			onClick={onAnalyze}
			disabled={disabled || analyzing}
			className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
		>
			{analyzing ? "Analyzing..." : "Analyze Commit"}
		</Button>
	);
}
