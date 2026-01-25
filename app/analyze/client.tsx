"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { MODELS } from "@/lib/models";
import type { Commit, Prompt } from "@/lib/types";
import { AnalysisResultCard } from "./components/AnalysisResultCard";
import { AnalyzeHeader } from "./components/AnalyzeHeader";
import { AnalyzeSidebar } from "./components/AnalyzeSidebar";
import { CommitDetails } from "./components/CommitDetails";
import { EmptyResultsState } from "./components/EmptyResultsState";
import { ErrorAlert } from "./components/ErrorAlert";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ResultVisibilityToggle } from "./components/ResultVisibilityToggle";

function AnalyzePageContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const params = useParams();
	// `repo` param is the repository path after github.com, e.g. "pkibbey/projects-radar" encoded via encodeURIComponent
	const repoParam = Array.isArray(params.repo)
		? params.repo.join("/")
		: params.repo;
	const decodedRepoRest = repoParam ? decodeURIComponent(repoParam) : null;
	const repoUrl = decodedRepoRest
		? `https://github.com/${decodedRepoRest}`
		: null;
	const commitFromUrl = searchParams.get("commit");

	const [commits, setCommits] = useState<Commit[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedCommitHash, setSelectedCommitHash] = useState<string | null>(
		commitFromUrl,
	);
	const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
	const [prompts, setPrompts] = useState<Prompt[]>([]);
	const [selectedPromptId, setSelectedPromptId] = useState<string>("default");
	const [analyzing, setAnalyzing] = useState(false);
	const [results, setResults] = useState<
		Map<
			string,
			{
				modelName: string;
				summary: string;
				decisions: string[];
				callouts: Array<{
					type: string;
					title: string;
					description: string;
				}>;
				duration: number;
				tokens?: {
					inputTokens: number;
					outputTokens: number;
					totalTokens: number;
				};
				estimatedCost?: number;
				wasCached?: boolean;
			}
		>
	>(new Map());
	const [currentlyAnalyzing, setCurrentlyAnalyzing] = useState<string | null>(
		null,
	);
	const [visibility, setVisibility] = useState({
		summary: true,
		decisions: true,
		callouts: true,
	});

	// Are all models currently selected?
	const allSelected = MODELS.every((m) => selectedModels.has(m.id));

	const handleToggleSelectAll = () => {
		if (allSelected) {
			setSelectedModels(new Set());
			return;
		}

		const newSet = new Set(MODELS.map((m) => m.id));
		setSelectedModels(newSet);
	};

	// Fetch commits
	useEffect(() => {
		if (!repoUrl) {
			router.push("/");
			return;
		}

		async function fetchCommits() {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch(
					`/api/fetch-repo?repoUrl=${encodeURIComponent(repoUrl || "")}`,
				);
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Failed to fetch commits");
				}

				setCommits(data.commits || []);
				if (data.commits?.length > 0) {
					// Use commit from URL if valid, otherwise use first commit
					const validCommit = data.commits.find(
						(c: Commit) => c.hash === commitFromUrl,
					);
					const defaultCommit = validCommit || data.commits[0];
					setSelectedCommitHash(defaultCommit.hash);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load commits");
			} finally {
				setLoading(false);
			}
		}

		fetchCommits();
	}, [repoUrl, router, commitFromUrl]);

	// Fetch prompts
	useEffect(() => {
		async function fetchPrompts() {
			try {
				const response = await fetch("/api/prompts");
				if (response.ok) {
					const data = await response.json();
					const promptList = Array.isArray(data)
						? data
						: (Object.values(data.prompts || {}) as Prompt[]);
					setPrompts(promptList);
					if (promptList.length > 0) {
						setSelectedPromptId(promptList[0].id);
					}
				} else {
					console.error("Failed to fetch prompts:", response.status);
				}
			} catch (err) {
				console.error("Failed to fetch prompts:", err);
			}
		}

		fetchPrompts();
	}, []);

	// Fetch cached results when model is selected
	const fetchCachedResult = useCallback(
		async (modelName: string) => {
			if (!selectedCommitHash || !repoUrl || !selectedPromptId) return;

			const resultKey = `${selectedCommitHash}-${modelName}-${selectedPromptId}`;

			// Skip if already loaded
			if (results.has(resultKey)) {
				return;
			}

			try {
				const response = await fetch(
					`/api/analyze-commit?repoUrl=${encodeURIComponent(repoUrl)}&commitHash=${selectedCommitHash}&modelName=${modelName}&promptId=${selectedPromptId}`,
				);

				const data = await response.json();

				if (response.ok && data.result) {
					setResults((prev) => {
						const newResults = new Map(prev);
						newResults.set(resultKey, {
							modelName,
							summary: data.result.aiSummary,
							decisions: data.result.keyDecisions,
							callouts: data.result.architecturalCallouts,
							duration: data.result.duration,
							tokens: data.result.tokens,
							estimatedCost: data.metrics?.estimatedCost,
							wasCached: data.wasCached,
						});
						return newResults;
					});
				}
			} catch (err) {
				console.error(`Failed to fetch cached result for ${modelName}:`, err);
			}
		},
		[results, selectedCommitHash, repoUrl, selectedPromptId],
	);

	// Fetch cached results for selected models when commit changes
	useEffect(() => {
		if (!selectedCommitHash || selectedModels.size === 0) return;

		for (const modelId of selectedModels) {
			const resultKey = `${selectedCommitHash}-${modelId}-${selectedPromptId}`;
			if (!results.has(resultKey)) {
				fetchCachedResult(modelId);
			}
		}
	}, [
		selectedCommitHash,
		selectedModels,
		results,
		fetchCachedResult,
		selectedPromptId,
	]);

	const handleAnalyze = useCallback(async () => {
		if (!selectedCommitHash || selectedModels.size === 0) {
			setError("Please select a commit and at least one model");
			return;
		}

		// Prevent multiple calls while analyzing
		if (analyzing) {
			return;
		}

		setAnalyzing(true);
		setError(null);

		try {
			for (const modelName of Array.from(selectedModels)) {
				const response = await fetch("/api/analyze-commit", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						repoUrl,
						commitHash: selectedCommitHash,
						modelName,
						promptId: selectedPromptId,
					}),
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || `Failed to analyze with ${modelName}`);
				}

				const resultKey = `${selectedCommitHash}-${modelName}-${selectedPromptId}`;

				setResults((results) =>
					new Map(results).set(resultKey, {
						modelName,
						summary: data.result.aiSummary,
						decisions: data.result.keyDecisions,
						callouts: data.result.architecturalCallouts,
						duration: data.result.duration,
						tokens: data.result.tokens,
						estimatedCost: data.metrics?.estimatedCost,
						wasCached: data.wasCached,
					}),
				);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to analyze commit");
		} finally {
			setAnalyzing(false);
			setCurrentlyAnalyzing(null);
		}
	}, [
		selectedCommitHash,
		selectedModels,
		selectedPromptId,
		repoUrl,
		analyzing,
	]);

	async function handleDelete(resultKey: string) {
		if (!repoUrl || !selectedCommitHash || !selectedPromptId) return;

		try {
			const response = await fetch("/api/analyze-commit", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					repoUrl,
					commitHash: selectedCommitHash,
					modelName: results.get(resultKey)?.modelName,
					promptId: selectedPromptId,
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Failed to delete analysis");
			}

			setResults((prev) => {
				const next = new Map(prev);
				next.delete(resultKey);
				return next;
			});

			// Refresh global total
			try {
				const res = await fetch("/api/analysis-total");
				const totalJson = await res.json();
				if (res.ok) setGlobalTotal(totalJson.total || 0);
			} catch (err) {
				console.error("Error fetching total: ", err);
			}
		} catch (err) {
			console.error("Failed to delete analysis:", err);
			setError(
				err instanceof Error ? err.message : "Failed to delete analysis",
			);
		}
	}

	const selectedCommit = commits.find((c) => c.hash === selectedCommitHash);

	// Only show results for the currently selected commit
	const visibleResults = selectedCommitHash
		? Array.from(results.entries()).filter(
				([key]) =>
					key.startsWith(`${selectedCommitHash}-`) &&
					key.endsWith(`-${selectedPromptId}`),
			)
		: [];

	const [globalTotal, setGlobalTotal] = useState<number>(0);

	useEffect(() => {
		let mounted = true;
		async function fetchGlobalTotal() {
			try {
				const res = await fetch("/api/analysis-total");
				const data = await res.json();
				if (!res.ok) {
					console.error("Failed to fetch global total", data.error);
					return;
				}
				if (mounted) setGlobalTotal(data.total || 0);
			} catch (err) {
				console.error("Failed to fetch global total", err);
			}
		}

		fetchGlobalTotal();
		return () => {
			mounted = false;
		};
	}, []);

	if (loading) {
		return <LoadingSpinner />;
	}

	return (
		<div className="min-h-screen bg-slate-900 text-white">
			<div className="max-w-6xl mx-auto p-4">
				<AnalyzeHeader
					repoUrl={repoUrl}
					globalTotal={globalTotal}
					onBackClick={() => router.push("/")}
				/>

				{error && <ErrorAlert message={error} />}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<AnalyzeSidebar
						commits={commits}
						selectedCommitHash={selectedCommitHash}
						onCommitSelect={setSelectedCommitHash}
						onRefreshCommits={async () => {
							setLoading(true);
							setError(null);
							try {
								const response = await fetch(
									`/api/fetch-repo?repoUrl=${encodeURIComponent(repoUrl || "")}&refresh=true`,
								);
								const data = await response.json();
								if (!response.ok) {
									throw new Error(data.error || "Failed to refresh commits");
								}
								setCommits(data.commits || []);
								if (data.commits?.length > 0) {
									setSelectedCommitHash(data.commits[0].hash);
								}
							} catch (err) {
								setError(
									err instanceof Error
										? err.message
										: "Failed to refresh commits",
								);
							} finally {
								setLoading(false);
							}
						}}
						selectedModels={selectedModels}
						onModelToggle={(modelId, checked) => {
							const newModels = new Set(selectedModels);
							if (checked) {
								newModels.add(modelId);
								fetchCachedResult(modelId);
							} else {
								newModels.delete(modelId);
							}
							setSelectedModels(newModels);
						}}
						onSelectAllModels={handleToggleSelectAll}
						prompts={prompts}
						selectedPromptId={selectedPromptId}
						onPromptChange={(id) => setSelectedPromptId(id || "")}
						onAnalyze={handleAnalyze}
						disabled={!selectedCommitHash || selectedModels.size === 0}
						analyzing={analyzing}
						analyzingModel={currentlyAnalyzing}
						cachedResults={results}
						loading={loading}
					/>

					<div className="lg:col-span-2 space-y-6">
						{selectedCommit && <CommitDetails commit={selectedCommit} />}

						<ResultVisibilityToggle
							visibility={visibility}
							onToggle={(key, value) =>
								setVisibility((s) => ({ ...s, [key]: value }))
							}
							onToggleAll={() => {
								const all = Object.values(visibility).every(Boolean);
								setVisibility({
									summary: !all,
									decisions: !all,
									callouts: !all,
								});
							}}
						/>

						<div className="space-y-4">
							{visibleResults.map(([key, result]) => (
								<AnalysisResultCard
									key={key}
									result={result}
									visibility={visibility}
									onDelete={() => handleDelete(key)}
								/>
							))}
						</div>

						<EmptyResultsState isAnalyzing={analyzing} />
					</div>
				</div>
			</div>
		</div>
	);
}

export function AnalyzeClient() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
					Loading...
				</div>
			}
		>
			<AnalyzePageContent />
		</Suspense>
	);
}
