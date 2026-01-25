"use client";

interface Callout {
	type: string;
	title: string;
	description: string;
}

interface ArchitecturalCalloutsProps {
	callouts: Callout[];
}

export function ArchitecturalCallouts({
	callouts,
}: ArchitecturalCalloutsProps) {
	if (callouts.length === 0) return null;

	return (
		<div>
			<h4 className="font-semibold text-sm text-slate-300 mb-2">
				Architectural Callouts
			</h4>
			<div className="space-y-2">
				{callouts.map((callout) => (
					<div
						key={callout.title}
						className="bg-slate-900 p-3 rounded border-l-2 border-blue-500"
					>
						<div className="text-xs text-blue-400 uppercase tracking-wide">
							{callout.type}
						</div>
						<div className="font-semibold text-sm mt-1">{callout.title}</div>
						<div className="text-sm text-slate-300 mt-1">
							{callout.description}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
