"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RepositoryFormProps {
	onSubmit: (repoUrl: string) => void;
	loading?: boolean;
	error?: string | null;
	success?: string | null;
}

export function RepositoryForm({
	onSubmit,
	loading = false,
	error = null,
	success = null,
}: RepositoryFormProps) {
	const [repoUrl, setRepoUrl] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		onSubmit(repoUrl);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
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
	);
}
