"use client";

interface KeyDecisionsProps {
	decisions: string[];
}

export function KeyDecisions({ decisions }: KeyDecisionsProps) {
	if (decisions.length === 0) return null;

	return (
		<div>
			<h4 className="font-semibold text-sm text-slate-300 mb-2">
				Key Decisions
			</h4>
			<ul className="text-sm space-y-1">
				{decisions.map((decision) => (
					<li key={decision} className="text-slate-300">
						• {decision}
					</li>
				))}
			</ul>
		</div>
	);
}
