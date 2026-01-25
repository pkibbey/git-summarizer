"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Commit } from "@/lib/types";

interface CommitListProps {
	commits: Commit[];
	selectedHash: string | null;
	onSelect: (hash: string) => void;
	onRefresh: () => void;
	loading?: boolean;
}

export function CommitList({
	commits,
	selectedHash,
	onSelect,
	onRefresh,
	loading = false,
}: CommitListProps) {
	return (
		<div className="mb-6">
			<div className="flex items-center justify-between mb-3">
				<h3 className="font-semibold">Select Commit</h3>
				<Button
					onClick={onRefresh}
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
							onClick={() => onSelect(commit.hash)}
							className={`w-full text-left justify-start p-2 rounded text-sm transition ${
								selectedHash === commit.hash
									? "bg-blue-600"
									: "bg-slate-700 hover:bg-slate-600"
							}`}
						>
							<div className="font-mono text-xs">{commit.hash.slice(0, 7)}</div>
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
	);
}
