"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MODELS, Model } from "@/lib/models";
import type { Commit, Prompt } from "@/lib/types";

function calculateCostBreakdown(
	tokens:
		| { inputTokens: number; outputTokens: number; totalTokens: number }
		| undefined,
	model: Model | undefined,
	estimatedCost: number | undefined,
): string {
	if (!tokens || !model?.pricing || estimatedCost === undefined) {
		return "";
	}

	const inputCost =
		(tokens.inputTokens / 1_000_000) * (model.pricing.inputCost || 0);
	const outputCost =
		(tokens.outputTokens / 1_000_000) * (model.pricing.outputCost || 0);

	return `${tokens.inputTokens.toLocaleString()} in × $${model.pricing.inputCost?.toFixed(4) || inputCost} + ${tokens.outputTokens.toLocaleString()} out × $${model.pricing.outputCost?.toFixed(4) || outputCost} = $${estimatedCost.toFixed(6)}`;
}

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
		return (
			<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<p>Loading commits...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-900 text-white">
			<div className="max-w-6xl mx-auto p-4">
				{/* Header */}
				<div className="mb-8">
					<Button
						onClick={() => router.push("/")}
						className="text-blue-400 hover:text-blue-300 mb-4"
					>
						← Back to Home
					</Button>
					<div className="flex items-center justify-between">
						<h1 className="text-3xl font-bold mb-2">Commit Analysis</h1>
						<div className="text-sm text-slate-300">
							Total:{" "}
							<span className="text-yellow-400 font-semibold">
								${globalTotal.toFixed(6)}
							</span>
						</div>
					</div>
					<p className="text-slate-400">
						Repo:{" "}
						<code className="bg-slate-800 px-2 py-1 rounded text-sm">
							{repoUrl}
						</code>
					</p>
				</div>

				{error && (
					<div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-2 rounded-md mb-4">
						{error}
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Sidebar */}
					<div className="lg:col-span-1">
						<div className="bg-slate-800 rounded-lg p-6 border border-slate-700 sticky top-4">
							{/* Commit Selection */}
							<div className="mb-6">
								<div className="flex items-center justify-between mb-3">
									<h3 className="font-semibold">Select Commit</h3>
									<Button
										onClick={async () => {
											setLoading(true);
											setError(null);
											try {
												const response = await fetch(
													`/api/fetch-repo?repoUrl=${encodeURIComponent(repoUrl || "")}&refresh=true`,
												);
												const data = await response.json();
												if (!response.ok) {
													throw new Error(
														data.error || "Failed to refresh commits",
													);
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
										disabled={loading}
										className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded transition"
										title="Refresh commits"
									>
										Refresh commits ↻
									</Button>
								</div>
								<ScrollArea className="h-48 w-full pr-4">
									<div className="flex flex-col space-y-2">
										{commits.map((commit) => (
											<Button
												key={commit.hash}
												onClick={() => setSelectedCommitHash(commit.hash)}
												className={`w-full text-left justify-start p-2 rounded text-sm transition ${
													selectedCommitHash === commit.hash
														? "bg-blue-600"
														: "bg-slate-700 hover:bg-slate-600"
												}`}
											>
												<div className="font-mono text-xs">
													{commit.hash.slice(0, 7)}
												</div>
												<div className="truncate">{commit.message}</div>
												<div className="flex-1 text-right text-xs text-slate-400">
													{new Date(commit.date).toLocaleDateString()}
												</div>
											</Button>
										))}
									</div>
									<ScrollBar orientation="vertical" />
								</ScrollArea>
							</div>

							{/* Model Selection */}
							<div className="mb-6">
								<h3 className="font-semibold mb-1">Select Models</h3>
								<label className="inline-flex items-center gap-2 cursor-pointer mb-3">
									<Checkbox
										checked={allSelected}
										onCheckedChange={() => handleToggleSelectAll()}
									/>
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
													onCheckedChange={(value) => {
														const newModels = new Set(selectedModels);
														if (value) {
															newModels.add(model.id);
															fetchCachedResult(model.id);
														} else {
															newModels.delete(model.id);
														}
														setSelectedModels(newModels);
													}}
												/>
												<div className="flex items-baseline gap-2 flex-1">
													<span className="text-sm truncate">{model.name}</span>
													{currentlyAnalyzing === model.id && (
														<span className="text-xs text-yellow-400">
															⏳ analyzing...
														</span>
													)}
													{selectedCommitHash &&
														results.has(
															`${selectedCommitHash}-${model.id}-${selectedPromptId}`,
														) && (
															<span className="text-xs text-green-400 truncate">
																✓ ready
															</span>
														)}
													{model.pricing?.inputCost !== undefined && (
														<span className="text-xs flex-1 text-right text-slate-400 truncate">
															${""}
															{model.pricing.inputCost.toFixed(2)}
														</span>
													)}
												</div>
											</label>
										))}
									</div>
									<ScrollBar orientation="vertical" />
								</ScrollArea>
							</div>

							{/* Prompt Selection */}
							<div className="mb-6">
								<h3 className="font-semibold mb-3">Select Prompt</h3>
								<Select
									value={selectedPromptId}
									onValueChange={(value) => setSelectedPromptId(value || "")}
								>
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

							{/* Analyze Button */}
							<Button
								onClick={handleAnalyze}
								disabled={
									analyzing || !selectedCommitHash || selectedModels.size === 0
								}
								className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
							>
								{analyzing ? "Analyzing..." : "Analyze Commit"}
							</Button>
						</div>
					</div>

					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Selected Commit Details */}
						{selectedCommit && (
							<div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
								<h2 className="text-xl font-bold mb-4">Commit Details</h2>
								<div className="space-y-3 text-sm">
									<div>
										<span className="text-slate-400">Hash:</span>
										<code className="ml-2 bg-slate-900 px-2 py-1 rounded">
											{selectedCommit.hash.slice(0, 12)}
										</code>
									</div>
									<div>
										<span className="text-slate-400">Author:</span>
										<span className="ml-2">{selectedCommit.author}</span>
									</div>
									<div>
										<span className="text-slate-400">Date:</span>
										<span className="ml-2">
											{new Date(selectedCommit.date).toLocaleString()}
										</span>
									</div>
									<div>
										<span className="text-slate-400">Message:</span>
										<p className="mt-2 bg-slate-900 p-3 rounded">
											{selectedCommit.message}
										</p>
									</div>
									<div>
										<span className="text-slate-400">Stats:</span>
										<div className="mt-2 grid grid-cols-3 gap-2 text-xs">
											<div className="bg-slate-900 p-2 rounded">
												<div className="text-slate-400">Files</div>
												<div className="font-bold">
													{selectedCommit.stats.filesChanged}
												</div>
											</div>
											<div className="bg-slate-900 p-2 rounded">
												<div className="text-slate-400">Lines +</div>
												<div className="font-bold text-green-400">
													{selectedCommit.stats.additions}
												</div>
											</div>
											<div className="bg-slate-900 p-2 rounded">
												<div className="text-slate-400">Lines -</div>
												<div className="font-bold text-red-400">
													{selectedCommit.stats.deletions}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Analysis Results */}
						<div className="mb-4">
							<div className="sticky top-20 bg-slate-800 rounded-lg p-3 border border-slate-700 flex items-center gap-3">
								<label className="inline-flex items-center gap-2 cursor-pointer">
									<Checkbox
										checked={Object.values(visibility).every(Boolean)}
										indeterminate={
											Object.values(visibility).some(Boolean) &&
											!Object.values(visibility).every(Boolean)
										}
										onCheckedChange={() => {
											const all = Object.values(visibility).every(Boolean);
											setVisibility({
												summary: !all,
												decisions: !all,
												callouts: !all,
											});
										}}
									/>
								</label>
								<div className="text-sm text-slate-300">All</div>

								<label className="inline-flex items-center gap-2 cursor-pointer">
									<Checkbox
										checked={visibility.summary}
										onCheckedChange={(v) =>
											setVisibility((s) => ({ ...s, summary: !!v }))
										}
									/>
									<span className="text-slate-300 px-2 py-1 text-sm">
										Summary
									</span>
								</label>

								<label className="inline-flex items-center gap-2 cursor-pointer">
									<Checkbox
										checked={visibility.decisions}
										onCheckedChange={(v) =>
											setVisibility((s) => ({ ...s, decisions: !!v }))
										}
									/>
									<span className="text-slate-300 px-2 py-1 text-sm">
										Key Decisions
									</span>
								</label>

								<label className="inline-flex items-center gap-2 cursor-pointer">
									<Checkbox
										checked={visibility.callouts}
										onCheckedChange={(v) =>
											setVisibility((s) => ({ ...s, callouts: !!v }))
										}
									/>
									<span className="text-slate-300 px-2 py-1 text-sm">
										Callouts
									</span>
								</label>
							</div>
						</div>

						<div className="space-y-4">
							{visibleResults.map(([key, result]) => (
								<div
									key={key}
									className="relative bg-slate-800 rounded-lg p-6 border border-slate-700"
								>
									<Button
										onClick={() => handleDelete(key)}
										variant="ghost"
										size="icon"
										className="absolute top-3 right-3 text-slate-400 hover:text-red-400 p-1 rounded"
										title="Delete analysis"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="w-4 h-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
											/>
										</svg>
									</Button>
									<div className="flex items-center justify-between mb-4">
										<div>
											{(() => {
												const model = MODELS.find(
													(m) => m.id === result.modelName,
												);
												return (
													<div>
														<h3 className="text-lg font-semibold">
															{model ? model.name : result.modelName}
															{calculateCostBreakdown(
																result.tokens,
																model,
																result.estimatedCost,
															) ? (
																<span className="ml-2 text-xs text-slate-400">
																	{calculateCostBreakdown(
																		result.tokens,
																		model,
																		result.estimatedCost,
																	)}
																</span>
															) : model?.pricing?.inputCost !== undefined ? (
																<span className="ml-2 text-xs text-slate-400">
																	${""}
																	{model.pricing.inputCost.toFixed(2)} /1M in
																</span>
															) : null}
														</h3>
														{result.wasCached && (
															<span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded mt-1 inline-block">
																✓ From Cache
															</span>
														)}
													</div>
												);
											})()}
										</div>
										<div className="text-right">
											<div className="text-xs text-slate-400">
												{result.duration}ms
											</div>
											{result.tokens && result.estimatedCost !== undefined && (
												<div className="text-xs text-slate-400 mt-2">
													<div>{result.tokens.totalTokens} tokens</div>
													<div className="text-yellow-400 font-semibold">
														${result.estimatedCost.toFixed(6)}
													</div>
												</div>
											)}
										</div>
									</div>

									<div className="space-y-4">
										{visibility.summary && (
											<div>
												<h4 className="font-semibold text-sm text-slate-300 mb-2">
													Summary
												</h4>
												<p className="text-sm">{result.summary}</p>
											</div>
										)}

										{visibility.decisions && result.decisions.length > 0 && (
											<div>
												<h4 className="font-semibold text-sm text-slate-300 mb-2">
													Key Decisions
												</h4>
												<ul className="text-sm space-y-1">
													{result.decisions.map((decision) => (
														<li key={decision} className="text-slate-300">
															• {decision}
														</li>
													))}
												</ul>
											</div>
										)}

										{visibility.callouts && result.callouts.length > 0 && (
											<div>
												<h4 className="font-semibold text-sm text-slate-300 mb-2">
													Architectural Callouts
												</h4>
												<div className="space-y-2">
													{result.callouts.map((callout) => (
														<div
															key={callout.title}
															className="bg-slate-900 p-3 rounded border-l-2 border-blue-500"
														>
															<div className="text-xs text-blue-400 uppercase tracking-wide">
																{callout.type}
															</div>
															<div className="font-semibold text-sm mt-1">
																{callout.title}
															</div>
															<div className="text-sm text-slate-300 mt-1">
																{callout.description}
															</div>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								</div>
							))}
						</div>

						{visibleResults.length === 0 && !analyzing && (
							<div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
								<p className="text-slate-400">
									Select a model to check cache or click &quot;Analyze
									Commit&quot; to run new analysis
								</p>
							</div>
						)}
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
