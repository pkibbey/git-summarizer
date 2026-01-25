"use client";

import type { Commit, Prompt } from "@/lib/types";
import { AnalyzeButton } from "./AnalyzeButton";
import { CommitList } from "./CommitList";
import { ModelSelection } from "./ModelSelection";
import { PromptSelection } from "./PromptSelection";

interface AnalyzeSidebarProps {
	commits: Commit[];
	selectedCommitHash: string | null;
	onCommitSelect: (hash: string) => void;
	onRefreshCommits: () => void;
	selectedModels: Set<string>;
	onModelToggle: (modelId: string, checked: boolean) => void;
	onSelectAllModels: () => void;
	prompts: Prompt[];
	selectedPromptId: string;
	onPromptChange: (promptId: string | null) => void;
	onAnalyze: () => void;
	disabled: boolean;
	analyzing: boolean;
	analyzingModel: string | null;
	cachedResults: Map<string, unknown>;
	loading?: boolean;
}

export function AnalyzeSidebar({
	commits,
	selectedCommitHash,
	onCommitSelect,
	onRefreshCommits,
	selectedModels,
	onModelToggle,
	onSelectAllModels,
	prompts,
	selectedPromptId,
	onPromptChange,
	onAnalyze,
	disabled,
	analyzing,
	analyzingModel,
	cachedResults,
	loading = false,
}: AnalyzeSidebarProps) {
	const cachedModels = new Set<string>();
	if (selectedCommitHash) {
		for (const modelId of selectedModels) {
			const resultKey = `${selectedCommitHash}-${modelId}-${selectedPromptId}`;
			if (cachedResults.has(resultKey)) {
				cachedModels.add(modelId);
			}
		}
	}

	return (
		<div className="lg:col-span-1">
			<div className="bg-slate-800 rounded-lg p-6 border border-slate-700 sticky top-4">
				<CommitList
					commits={commits}
					selectedHash={selectedCommitHash}
					onSelect={onCommitSelect}
					onRefresh={onRefreshCommits}
					loading={loading}
				/>

				<ModelSelection
					selectedModels={selectedModels}
					onToggle={onModelToggle}
					onSelectAll={onSelectAllModels}
					analyzingModel={analyzingModel}
					cachedModels={cachedModels}
				/>

				<PromptSelection
					prompts={prompts}
					selectedPromptId={selectedPromptId}
					onPromptChange={onPromptChange}
				/>

				<AnalyzeButton
					onAnalyze={onAnalyze}
					disabled={disabled}
					analyzing={analyzing}
				/>
			</div>
		</div>
	);
}
