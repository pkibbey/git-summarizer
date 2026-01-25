"use client";

import type { Commit } from "@/lib/types";

interface CommitDetailsProps {
	commit: Commit;
}

export function CommitDetails({ commit }: CommitDetailsProps) {
	return (
		<div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
			<h2 className="text-xl font-bold mb-4">Commit Details</h2>
			<div className="space-y-3 text-sm">
				<div>
					<span className="text-slate-400">Hash:</span>
					<code className="ml-2 bg-slate-900 px-2 py-1 rounded">
						{commit.hash.slice(0, 12)}
					</code>
				</div>
				<div>
					<span className="text-slate-400">Author:</span>
					<span className="ml-2">{commit.author}</span>
				</div>
				<div>
					<span className="text-slate-400">Date:</span>
					<span className="ml-2">{new Date(commit.date).toLocaleString()}</span>
				</div>
				<div>
					<span className="text-slate-400">Message:</span>
					<p className="mt-2 bg-slate-900 p-3 rounded">{commit.message}</p>
				</div>
				<div>
					<span className="text-slate-400">Stats:</span>
					<div className="mt-2 grid grid-cols-3 gap-2 text-xs">
						<div className="bg-slate-900 p-2 rounded">
							<div className="text-slate-400">Files</div>
							<div className="font-bold">{commit.stats.filesChanged}</div>
						</div>
						<div className="bg-slate-900 p-2 rounded">
							<div className="text-slate-400">Lines +</div>
							<div className="font-bold text-green-400">
								{commit.stats.additions}
							</div>
						</div>
						<div className="bg-slate-900 p-2 rounded">
							<div className="text-slate-400">Lines -</div>
							<div className="font-bold text-red-400">
								{commit.stats.deletions}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
