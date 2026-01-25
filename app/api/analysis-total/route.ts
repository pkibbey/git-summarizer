import { NextResponse } from "next/server";
import {
	getAllAnalysisResults,
	getAllEvolutionAnalyses,
	getAllSnapshots,
} from "@/lib/database";
import { MODELS } from "@/lib/models";

export async function GET() {
	try {
		const db = await getAllAnalysisResults();
		const evolutionDb = await getAllEvolutionAnalyses();
		const snapshotsDb = await getAllSnapshots();

		let total = 0;

		// 1. Commit Analysis Results
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

		// 2. Evolution Analysis Results
		// evolutionDb structure: { [repoUrl]: RepositoryEvolutionAnalysis }
		for (const repoUrl of Object.keys(evolutionDb)) {
			const analysis = evolutionDb[repoUrl];
			if (analysis?.tokens) {
				const modelId = analysis.modelId;
				const modelInfo = MODELS.find((m) => m.id === modelId);
				if (modelInfo?.pricing) {
					const inputCostUSD =
						(analysis.tokens.inputTokens / 1_000_000) *
						(modelInfo.pricing.inputCost || 0);
					const outputCostUSD =
						(analysis.tokens.outputTokens / 1_000_000) *
						(modelInfo.pricing.outputCost || 0);
					total += inputCostUSD + outputCostUSD;
				}
			}
		}

		// 3. File Change Snapshots
		// snapshotsDb structure: { [repoUrl]: { [filePath]: { [commitHash]: FileChangeSnapshot }}}
		for (const repoUrl of Object.keys(snapshotsDb)) {
			const files = snapshotsDb[repoUrl] || {};
			for (const filePath of Object.keys(files)) {
				const commits = files[filePath] || {};
				for (const commitHash of Object.keys(commits)) {
					const snapshot = commits[commitHash];
					if (snapshot?.tokens) {
						const modelId = snapshot.modelId;
						const modelInfo = MODELS.find((m) => m.id === modelId);
						if (modelInfo?.pricing) {
							const inputCostUSD =
								(snapshot.tokens.inputTokens / 1_000_000) *
								(modelInfo.pricing.inputCost || 0);
							const outputCostUSD =
								(snapshot.tokens.outputTokens / 1_000_000) *
								(modelInfo.pricing.outputCost || 0);
							total += inputCostUSD + outputCostUSD;
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
