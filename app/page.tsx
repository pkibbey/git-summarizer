"use client";

import { useState } from "react";
import { HomeHeader } from "./components/HomeHeader";
import { HowItWorks } from "./components/HowItWorks";
import { RepositoryForm } from "./components/RepositoryForm";

export default function Home() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	async function handleFetchRepo(url: string) {
		setError(null);
		setSuccess(null);

		if (!url.trim()) {
			setError("Please enter a repository URL");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/api/fetch-repo", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ repoUrl: url.trim() }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch repository");
			}

			const message = data.wasCached
				? `Loaded ${data.totalCommits} commits from cache`
				: `Fetched ${data.totalCommits} commits from GitHub`;

			setSuccess(message);

			// Redirect to commit selection page
			setTimeout(() => {
				const trimmed = url.trim();
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
				<HomeHeader />
				<div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
					<RepositoryForm
						onSubmit={handleFetchRepo}
						loading={loading}
						error={error}
						success={success}
					/>
				</div>
				<HowItWorks />
			</div>
		</div>
	);
}
