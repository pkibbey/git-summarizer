"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
	const [repoUrl, setRepoUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	async function handleFetchRepo(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setSuccess(null);

		if (!repoUrl.trim()) {
			setError("Please enter a repository URL");
			return;
		}

		setLoading(true);
		try {
			const response = await fetch("/api/fetch-repo", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ repoUrl: repoUrl.trim() }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch repository");
			}

			const message = data.wasCached
				? `Loaded ${data.totalCommits} commits from cache`
				: `Fetched ${data.totalCommits} commits from GitHub`;

			setSuccess(message);
			setRepoUrl("");

			// Redirect to commit selection page
			setTimeout(() => {
				// Assume GitHub base and store the rest (e.g. "user/repo").
				const trimmed = repoUrl.trim();
				const repoRest = trimmed.replace(
					/^https?:\/\/(www\.)?github\.com\//i,
					"",
				);
				window.location.href = `/analyze/${encodeURIComponent(repoRest)}`;
			}, 1000);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
			<div className="max-w-md w-full">
				<Image
					src="/logo.png"
					alt="MultiCam logo"
					width="828"
					height="297"
					className="pb-4 w-60 mx-auto"
				/>
				<p className="text-sm text-slate-300 mb-8 text-center">
					Analyze commits from any public Git repository
				</p>
				<div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
					<form onSubmit={handleFetchRepo} className="space-y-4">
						<div>
							<label
								htmlFor="repoUrl"
								className="block text-sm font-medium text-slate-300 mb-2"
							>
								Repository URL
							</label>
							<Input
								id="repoUrl"
								type="url"
								placeholder="https://github.com/user/repo"
								value={repoUrl}
								onChange={(e) => setRepoUrl(e.target.value)}
								
							/>
							<p className="text-xs text-slate-400 mt-2">
								Must be a publicly accessible repository
							</p>
						</div>

						{error && (
							<div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-2 rounded-md text-sm">
								{error}
							</div>
						)}

						{success && (
							<div className="bg-green-900/30 border border-green-700 text-green-200 px-4 py-2 rounded-md text-sm">
								{success}
							</div>
						)}

						<Button
							type="submit"
							disabled={loading}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition disabled:opacity-50"
						>
							{loading ? "Fetching..." : "Fetch Repository"}
						</Button>
					</form>
				</div>

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
			</div>
		</div>
	);
}
