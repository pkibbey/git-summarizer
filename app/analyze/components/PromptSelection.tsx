"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Prompt } from "@/lib/types";

interface PromptSelectionProps {
	prompts: Prompt[];
	selectedPromptId: string;
	onPromptChange: (promptId: string | null) => void;
}

export function PromptSelection({
	prompts,
	selectedPromptId,
	onPromptChange,
}: PromptSelectionProps) {
	return (
		<div className="mb-6">
			<h3 className="font-semibold mb-3">Select Prompt</h3>
			<Select value={selectedPromptId} onValueChange={onPromptChange}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select prompt" />
				</SelectTrigger>
				<SelectPositioner side="inline-end" sideOffset={10}>
					<SelectContent>
						{prompts.map((prompt) => (
							<SelectItem key={prompt.id} value={prompt.id}>
								{prompt.name}
							</SelectItem>
						))}
					</SelectContent>
				</SelectPositioner>
			</Select>
		</div>
	);
}
