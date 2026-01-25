"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MODELS } from "@/lib/models";

interface ModelSelectionProps {
	selectedModels: Set<string>;
	onToggle: (modelId: string, checked: boolean) => void;
	onSelectAll: () => void;
	analyzingModel: string | null;
	cachedModels: Set<string>;
}

export function ModelSelection({
	selectedModels,
	onToggle,
	onSelectAll,
	analyzingModel,
	cachedModels,
}: ModelSelectionProps) {
	const allSelected = MODELS.every((m) => selectedModels.has(m.id));

	return (
		<div className="mb-6">
			<h3 className="font-semibold mb-1">Select Models</h3>
			<label className="inline-flex items-center gap-2 cursor-pointer mb-3">
				<Checkbox checked={allSelected} onCheckedChange={() => onSelectAll()} />
				<span className="text-xs text-slate-400">
					{allSelected ? "Deselect all" : "Select all"}
				</span>
			</label>
			<ScrollArea className="h-48 w-full pr-4">
				<div className="space-y-2">
					{MODELS.map((model) => (
						<label
							key={model.id}
							className="flex items-center gap-2 cursor-pointer"
						>
							<Checkbox
								checked={selectedModels.has(model.id)}
								onCheckedChange={(value) => onToggle(model.id, !!value)}
							/>
							<div className="flex items-baseline gap-2 flex-1">
								<span className="text-sm truncate">{model.name}</span>
								{analyzingModel === model.id && (
									<span className="text-xs text-yellow-400">
										⏳ analyzing...
									</span>
								)}
								{cachedModels.has(model.id) && (
									<span className="text-xs text-green-400 truncate">
										✓ ready
									</span>
								)}
								{model.pricing?.inputCost !== undefined && (
									<span className="text-xs flex-1 text-right text-slate-400 truncate">
										${model.pricing.inputCost.toFixed(2)}
									</span>
								)}
							</div>
						</label>
					))}
				</div>
				<ScrollBar orientation="vertical" />
			</ScrollArea>
		</div>
	);
}
