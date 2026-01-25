interface HowItWorksProps {
	variant?: "compact" | "full";
}

export function HowItWorks({ variant = "full" }: HowItWorksProps) {
	return (
		<div className="mt-4 pt-6">
			<h2 className="text-sm font-semibold text-slate-300 mb-3">
				How it works:
			</h2>
			<ol className="text-sm text-slate-400 space-y-2">
				<li>1. Enter a public GitHub repository URL</li>
				<li>2. Select a commit to analyze</li>
				<li>3. Choose one or more AI models</li>
				<li>4. View and compare analysis results</li>
			</ol>
		</div>
	);
}
