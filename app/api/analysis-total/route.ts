import { NextResponse } from "next/server";
import { getAllAnalysisResults } from "@/lib/database";
import { MODELS } from "@/lib/models";

export async function GET() {
	try {
		const db = await getAllAnalysisResults();

		let total = 0;
		// db structure: { [repoUrl]: { [commitHash]: { [modelName]: { [promptId]: AnalysisResult }}}}
		for (const repoUrl of Object.keys(db)) {
			const commits = db[repoUrl] || {};
			for (const commitHash of Object.keys(commits)) {
				const models = commits[commitHash] || {};
				for (const modelName of Object.keys(models)) {
					const prompts = models[modelName] || {};
					for (const promptId of Object.keys(prompts)) {
						const res = prompts[promptId];
						if (res?.tokens) {
							const modelInfo = MODELS.find(
								(m) => m.id === res.modelName || m.id === modelName,
							);
							if (modelInfo?.pricing) {
								const inputCostUSD =
									(res.tokens.inputTokens / 1_000_000) *
									(modelInfo.pricing.inputCost || 0);
								const outputCostUSD =
									(res.tokens.outputTokens / 1_000_000) *
									(modelInfo.pricing.outputCost || 0);
								total += inputCostUSD + outputCostUSD;
							}
						}
					}
				}
			}
		}

		return NextResponse.json({
			success: true,
			total: parseFloat(total.toFixed(6)),
		});
	} catch (error) {
		console.error("Error computing analysis total:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to compute total",
			},
			{ status: 500 },
		);
	}
}
