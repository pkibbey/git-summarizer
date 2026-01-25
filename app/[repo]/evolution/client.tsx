"use client";

import {
	GitBranch,
	History,
	Lightbulb,
	Package,
	TrendingUp,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RepositoryEvolutionAnalysis } from "@/lib/types";
import { ErrorAlert } from "../analyze/components/ErrorAlert";
import { LoadingSpinner } from "../analyze/components/LoadingSpinner";

export function EvolutionClient() {
	const params = useParams();
	const router = useRouter();
	const repoParam = Array.isArray(params.repo)
		? params.repo.join("/")
		: params.repo;
	const decodedRepoRest = repoParam ? decodeURIComponent(repoParam) : null;
	const repoUrl = decodedRepoRest
		? `https://github.com/${decodedRepoRest}`
		: null;

	const [loading, setLoading] = useState(true);
	const [analyzing, setAnalyzing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [analysis, setAnalysis] = useState<RepositoryEvolutionAnalysis | null>(
		null,
	);
	const [hasFullAnalysis, setHasFullAnalysis] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

	useEffect(() => {
		if (!repoUrl) {
			router.push("/");
			return;
		}

		async function fetchAnalysis() {
			try {
				const response = await fetch(
					`/api/analyze-evolution?repoUrl=${encodeURIComponent(repoUrl || "")}`,
				);
				const data = await response.json();
				if (data.success) {
					setAnalysis(data.result);
					setHasFullAnalysis(!!data.hasFullAnalysis);
					if (data.result.hotspots || data.result.foundations) {
						// Pre-select files that are already analyzed
						const analyzed = [
							...(data.result.hotspots?.map((h: any) => h.path) || []),
							...(data.result.foundations?.map((f: any) => f.path) || []),
						];
						setSelectedFiles(analyzed);
					}
				}
			} catch (err) {
				console.error("Failed to fetch evolution:", err);
			} finally {
				setLoading(false);
			}
		}

		fetchAnalysis();
	}, [repoUrl, router]);

	const handleAnalyze = async (reprocessSnapshots = false) => {
		setAnalyzing(true);
		setError(null);
		try {
			const response = await fetch("/api/analyze-evolution", {
				method: "POST",
				body: JSON.stringify({
					repoUrl,
					selectedFiles: selectedFiles.length > 0 ? selectedFiles : undefined,
					reprocessSnapshots,
				}),
				headers: { "Content-Type": "application/json" },
			});
			const data = await response.json();
			if (data.success) {
				setAnalysis(data.result);
				setHasFullAnalysis(true);
			} else {
				setError(data.error);
			}
		} catch (_err) {
			setError("Failed to start analysis");
		} finally {
			setAnalyzing(false);
		}
	};

	const toggleFileSelection = (path: string) => {
		setSelectedFiles((prev) =>
			prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
		);
	};

	if (loading)
		return (
			<div className="flex h-screen items-center justify-center bg-slate-900">
				<LoadingSpinner />
			</div>
		);

	return (
		<div className="min-h-screen bg-slate-900 text-white p-6">
			<div className="max-w-7xl mx-auto space-y-8">
				<header className="flex items-center justify-between">
					<div className="space-y-1">
						<button
							onClick={() => router.back()}
							className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors mb-4"
						>
							← Back to standard analysis
						</button>
						<h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
							<TrendingUp className="w-8 h-8 text-yellow-400" />
							Forensic Evolution & Journey
						</h1>
						<p className="text-slate-400">
							Repo:{" "}
							<code className="bg-slate-800 px-2 py-1 rounded text-sm">
								{repoUrl}
							</code>
						</p>
					</div>
					{(!hasFullAnalysis || selectedFiles.length > 0) && !analyzing && (
						<div className="flex items-center gap-3">
							{hasFullAnalysis && (
								<Button
									onClick={() => handleAnalyze(true)}
									variant="outline"
									size="sm"
									className="text-slate-400 border-slate-700 hover:bg-slate-800"
								>
									Refresh All Snapshots
								</Button>
							)}
							<Button
								onClick={() => handleAnalyze(false)}
								size="lg"
								className="bg-blue-600 hover:bg-blue-700"
							>
								{hasFullAnalysis
									? "Update Journey Analysis"
									: "Run Forensic Analysis"}
							</Button>
						</div>
					)}
				</header>

				{error && <ErrorAlert message={error} />}

				{analyzing && (
					<div className="bg-slate-800/50 rounded-xl p-8 flex flex-col items-center gap-4 border border-slate-700">
						<LoadingSpinner />
						<div className="text-center space-y-2">
							<p className="text-blue-400 font-medium animate-pulse">
								Performing journey analysis...
							</p>
							<p className="text-slate-500 text-sm max-w-md">
								Analyzing each file's history to synthesize architectural
								lessons. It may take a minute for large histories.
							</p>
						</div>
					</div>
				)}

				{!analyzing && (
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
						{/* Left Column: Summary & Lessons (Main Focus) */}
						<div className="lg:col-span-3 space-y-8">
							{analysis && (
								<>
									<Card className="bg-slate-800 border-slate-700 overflow-hidden">
										<div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
											<TrendingUp className="w-24 h-24" />
										</div>
										<CardHeader>
											<CardTitle className="text-xl text-slate-100 flex items-center gap-2">
												<History className="w-5 h-5 text-blue-400" />
												Evolutionary Synthesis
											</CardTitle>
										</CardHeader>
										<CardContent>
											{hasFullAnalysis ? (
												<div className="space-y-4">
													<p className="text-slate-200 leading-relaxed text-lg font-medium italic">
														&quot;{analysis.summary}&quot;
													</p>
												</div>
											) : (
												<div className="py-2">
													<p className="text-slate-400 text-sm mb-4">
														Select files on the right to perform a deep journey
														forensic analysis. This will reveal WHY the code
														evolved the way it did.
													</p>
												</div>
											)}
										</CardContent>
									</Card>

									{hasFullAnalysis && (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											{/* Evolutionary Hotspots */}
											<div className="space-y-4">
												<h3 className="text-lg font-bold flex items-center gap-2 text-rose-400">
													<TrendingUp className="w-5 h-5" />
													Evolutionary Hotspots
												</h3>
												<div className="space-y-3">
													{(analysis as any).hotspots?.map((hs: any) => (
														<Card
															key={hs.path}
															className="bg-slate-800 border-slate-700 border-l-4 border-l-rose-500"
														>
															<CardHeader className="p-4">
																<CardTitle className="text-sm font-mono text-slate-100">
																	{hs.path}
																</CardTitle>
															</CardHeader>
															<CardContent className="px-4 pb-4 pt-0">
																<ul className="space-y-2">
																	{hs.evolutionaryLessons.map(
																		(lesson: string, i: number) => (
																			<li
																				key={i}
																				className="text-xs text-slate-300 flex gap-2"
																			>
																				<span className="text-rose-500 font-bold">
																					•
																				</span>
																				{lesson}
																			</li>
																		),
																	)}
																</ul>
															</CardContent>
														</Card>
													))}
												</div>
											</div>

											{/* Foundational Bedrock */}
											<div className="space-y-4">
												<h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
													<Package className="w-5 h-5" />
													Foundational Bedrock
												</h3>
												<div className="space-y-3">
													{(analysis as any).foundations?.map((f: any) => (
														<Card
															key={f.path}
															className="bg-slate-800 border-slate-700 border-l-4 border-l-emerald-500"
														>
															<CardHeader className="p-4">
																<CardTitle className="text-sm font-mono text-slate-100">
																	{f.path}
																</CardTitle>
															</CardHeader>
															<CardContent className="px-4 pb-4 pt-0 space-y-2">
																<p className="text-xs text-slate-400 italic">
																	{f.description}
																</p>
																<div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-2 text-[11px] text-emerald-300">
																	<strong>Reinforcement:</strong>{" "}
																	{f.reinforcement}
																</div>
															</CardContent>
														</Card>
													))}
												</div>
											</div>
										</div>
									)}

									{hasFullAnalysis && (
										<div className="space-y-6">
											<h2 className="text-xl font-semibold flex items-center gap-2 text-slate-100">
												<Lightbulb className="w-6 h-6 text-yellow-500" />
												Cross-File Architectural Lessons
											</h2>
											<div className="grid grid-cols-1 gap-4">
												{analysis.architecturalLessons.map((lesson, idx) => (
													<Card
														key={idx}
														className="bg-slate-800 border-slate-700 border-l-4 border-l-blue-500"
													>
														<CardHeader className="pb-2">
															<div className="flex items-center justify-between">
																<CardTitle className="text-lg text-slate-100">
																	{lesson.title}
																</CardTitle>
																<Badge
																	variant={
																		lesson.impact === "high"
																			? "destructive"
																			: "secondary"
																	}
																	className="uppercase text-[10px]"
																>
																	{lesson.impact} Impact
																</Badge>
															</div>
														</CardHeader>
														<CardContent className="space-y-4">
															<p className="text-slate-300 text-sm italic border-l-2 border-slate-600 pl-4">
																{lesson.lesson}
															</p>
															<div className="flex flex-wrap gap-2">
																{lesson.affectedFiles.map((file) => (
																	<code
																		key={file}
																		className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700"
																	>
																		{file}
																	</code>
																))}
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										</div>
									)}
								</>
							)}
						</div>

						{/* Right Column: File Selection & Activity */}
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold flex items-center gap-2 text-slate-100">
									<History className="w-5 h-5 text-purple-500" />
									File Journeys
								</h2>
								<span className="text-[10px] text-slate-500 uppercase font-bold px-2 py-0.5 bg-slate-800 rounded">
									{selectedFiles.length} Selected
								</span>
							</div>
							<div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
								<div className="p-3 border-b border-slate-700 bg-slate-900/50">
									<div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest flex justify-between">
										<span>Targets</span>
										<span>Changes</span>
									</div>
								</div>
								<ScrollArea className="h-[750px]">
									<div className="divide-y divide-slate-700">
										{analysis?.fileEvolutions.slice(0, 50).map((file) => (
											<div
												key={file.path}
												onClick={() => toggleFileSelection(file.path)}
												className={`p-3 cursor-pointer transition-all flex items-center gap-3 ${
													selectedFiles.includes(file.path)
														? "bg-blue-600/20 border-r-4 border-blue-500"
														: "hover:bg-slate-700/30"
												}`}
											>
												<div
													className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
														selectedFiles.includes(file.path)
															? "bg-blue-600 border-blue-400"
															: "bg-slate-900 border-slate-600"
													}`}
												>
													{selectedFiles.includes(file.path) && (
														<div className="w-1.5 h-1.5 bg-white rounded-full" />
													)}
												</div>
												<div className="flex-1 min-w-0">
													<div
														className="text-xs font-mono truncate text-slate-300"
														title={file.path}
													>
														{file.path}
													</div>
												</div>
												<div className="text-right">
													<div className="text-xs font-bold text-yellow-500">
														{file.changeCount}
													</div>
												</div>
											</div>
										))}
									</div>
								</ScrollArea>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
