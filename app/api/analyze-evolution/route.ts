/** biome-ignore-all lint/suspicious/noExplicitAny: complex journey data structure */
import { NextRequest, NextResponse } from "next/server";
import { analyzeFileJourney, synthesizeEvolution } from "@/lib/ai";
import { collectFileEvolution } from "@/lib/analysis-utils";
import {
	getEvolutionAnalysis,
	getFileChangeSnapshot,
	getStoredCommits,
	storeEvolutionAnalysis,
	storeFileChangeSnapshot,
} from "@/lib/database";
import { getFileDiffsForFile } from "@/lib/git-service";
import { MODELS } from "@/lib/models";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { repoUrl, modelName, selectedFiles, reprocessSnapshots } = body;

		if (!repoUrl) {
			return NextResponse.json(
				{ error: "Missing repoUrl parameter" },
				{ status: 400 },
			);
		}

		const selectedModel = modelName || MODELS[0].id;

		// Get commits to analyze evolution
		const commits = await getStoredCommits(repoUrl);
		if (commits.length === 0) {
			return NextResponse.json(
				{ error: "No commits found for this repository. Fetch it first." },
				{ status: 404 },
			);
		}

		// Group file changes
		const fileEvolutions = collectFileEvolution(commits);

		// Determine which files to analyze (top 5 by default or user choice)
		const targetFilePaths =
			selectedFiles || fileEvolutions.slice(0, 5).map((f) => f.path);

		const journeys: any[] = [];
		const foundations: any[] = [];
		const hotspots: any[] = [];
		let totalInputTokens = 0;
		let totalOutputTokens = 0;

		// Process each target file
		for (const filePath of targetFilePaths) {
			const fileEvolution = fileEvolutions.find((f) => f.path === filePath);
			if (!fileEvolution) continue;

			const snapshots = [];

			// For each commit this file was in, get or create a snapshot
			const relevantCommits = fileEvolution.commits.reverse();

			// We need diffs for journey analysis
			const commitHashesToSnapshot = [];
			for (const c of relevantCommits) {
				const existing = await getFileChangeSnapshot(repoUrl, filePath, c.hash);
				// Invalidate old-style snapshots that have 'summary' instead of 'message'
				const isOldStyle = existing && (existing as any).summary !== undefined;

				if (!existing || reprocessSnapshots || isOldStyle) {
					commitHashesToSnapshot.push(c.hash);
				} else {
					snapshots.push(existing);
				}
			}

			if (commitHashesToSnapshot.length > 0) {
				const diffs = await getFileDiffsForFile(
					repoUrl,
					filePath,
					commitHashesToSnapshot,
				);
				for (const hash of commitHashesToSnapshot) {
					const commit = relevantCommits.find((nc) => nc.hash === hash);
					const newSnapshot = {
						filePath,
						commitHash: hash,
						message: commit?.message || "",
						diff: diffs[hash] || "",
						timestamp: commit?.date || new Date().toISOString(),
						modelId: selectedModel,
					};
					await storeFileChangeSnapshot(repoUrl, newSnapshot);
					snapshots.push(newSnapshot);
				}
			}

			// Sort snapshots chronologically for journey analysis
			const sortedSnapshots = snapshots.sort(
				(a, b) =>
					new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
			);

			// Extract a "World View" for this file (other files' descriptions if available)
			// For now, just a brief list of other active files
			const worldView = `Active files in this repo: ${fileEvolutions
				.slice(0, 10)
				.map((f) => f.path)
				.join(", ")}`;

			const journey = await analyzeFileJourney(
				filePath,
				sortedSnapshots.map((s: any) => ({
					message: s.message,
					diff: s.diff,
					date: s.timestamp,
				})),
				worldView,
				selectedModel,
			);

			if (journey.tokens) {
				totalInputTokens += journey.tokens.inputTokens;
				totalOutputTokens += journey.tokens.outputTokens;
			}

			const journeyData = {
				path: filePath,
				...journey,
			};

			journeys.push(journeyData);

			if (journey.isHotspot) {
				hotspots.push({
					path: filePath,
					evolutionaryLessons: journey.evolutionaryLessons || [],
				});
			} else {
				foundations.push({
					path: filePath,
					description: journey.description,
					reinforcement: journey.reinforcement || "Stable core logic",
				});
			}
		}

		// Final synthesis
		const synthesis = await synthesizeEvolution(
			repoUrl,
			journeys,
			selectedModel,
		);

		if (synthesis.tokens) {
			totalInputTokens += synthesis.tokens.inputTokens;
			totalOutputTokens += synthesis.tokens.outputTokens;
		}

		const result = {
			repoUrl,
			generatedAt: new Date().toISOString(),
			fileEvolutions,
			foundations,
			hotspots,
			architecturalLessons: synthesis.architecturalLessons || [],
			namedPieces: synthesis.namedPieces || [],
			summary: synthesis.summary || "",
			tokens: {
				inputTokens: totalInputTokens,
				outputTokens: totalOutputTokens,
				totalTokens: totalInputTokens + totalOutputTokens,
			},
			modelId: selectedModel,
		};

		// Store result
		await storeEvolutionAnalysis(repoUrl, result as any);

		return NextResponse.json({
			success: true,
			wasCached: false,
			result,
		});
	} catch (error) {
		console.error("Error analyzing evolution:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to analyze evolution",
			},
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	const repoUrl = request.nextUrl.searchParams.get("repoUrl");

	if (!repoUrl) {
		return NextResponse.json(
			{ error: "Missing repoUrl parameter" },
			{ status: 400 },
		);
	}

	try {
		// Try to get full analysis first
		const analysis = await getEvolutionAnalysis(repoUrl);

		// Always get the latest file evolutions from stored commits
		const commits = await getStoredCommits(repoUrl);
		const fileEvolutions =
			commits.length > 0 ? collectFileEvolution(commits) : [];

		if (!analysis) {
			// Return just the stats if no AI analysis exists yet
			return NextResponse.json({
				success: true,
				hasFullAnalysis: false,
				result: {
					repoUrl,
					fileEvolutions,
					architecturalLessons: [],
					namedPieces: [],
					summary: "",
				},
			});
		}

		return NextResponse.json({
			success: true,
			hasFullAnalysis: true,
			result: {
				...analysis,
				fileEvolutions, // Use fresh evolutions in case more commits were fetched
			},
		});
	} catch (error) {
		console.error("Error fetching evolution analysis:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to fetch evolution analysis",
			},
			{ status: 500 },
		);
	}
}
