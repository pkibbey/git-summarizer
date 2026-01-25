"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface ResultVisibility {
	summary: boolean;
	decisions: boolean;
	callouts: boolean;
}

interface ResultVisibilityToggleProps {
	visibility: ResultVisibility;
	onToggle: (key: keyof ResultVisibility, value: boolean) => void;
	onToggleAll: () => void;
}

export function ResultVisibilityToggle({
	visibility,
	onToggle,
	onToggleAll,
}: ResultVisibilityToggleProps) {
	const allVisible = Object.values(visibility).every(Boolean);
	const someVisible = Object.values(visibility).some(Boolean);

	return (
		<div className="mb-4">
			<div className="sticky top-20 bg-slate-800 rounded-lg p-3 border border-slate-700 flex items-center gap-3">
				<label className="inline-flex items-center gap-2 cursor-pointer">
					<Checkbox
						checked={allVisible}
						indeterminate={someVisible && !allVisible}
						onCheckedChange={() => onToggleAll()}
					/>
				</label>
				<div className="text-sm text-slate-300">All</div>

				<label className="inline-flex items-center gap-2 cursor-pointer">
					<Checkbox
						checked={visibility.summary}
						onCheckedChange={(v) => onToggle("summary", !!v)}
					/>
					<span className="text-slate-300 px-2 py-1 text-sm">Summary</span>
				</label>

				<label className="inline-flex items-center gap-2 cursor-pointer">
					<Checkbox
						checked={visibility.decisions}
						onCheckedChange={(v) => onToggle("decisions", !!v)}
					/>
					<span className="text-slate-300 px-2 py-1 text-sm">
						Key Decisions
					</span>
				</label>

				<label className="inline-flex items-center gap-2 cursor-pointer">
					<Checkbox
						checked={visibility.callouts}
						onCheckedChange={(v) => onToggle("callouts", !!v)}
					/>
					<span className="text-slate-300 px-2 py-1 text-sm">Callouts</span>
				</label>
			</div>
		</div>
	);
}
