"use client";

import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AnalyzeHeaderProps {
	repoUrl: string | null;
	onBackClick: () => void;
	onRefresh: () => void;
}

export function AnalyzeHeader({
	repoUrl,
	onBackClick,
	onRefresh,
}: AnalyzeHeaderProps) {
	const pathname = usePathname();
	const evolutionHref = pathname
		? pathname.replace(/\/analyze(?:\/)?$/, "/evolution")
		: "/evolution";

	return (
		<div className="mb-8">
			<div className="flex justify-between items-start mb-4">
				<Button
					onClick={onBackClick}
					className="text-blue-400 hover:text-blue-300"
				>
					← Back to Home
				</Button>
				<div className="flex gap-2">
					<Button
						onClick={onRefresh}
						className="bg-slate-700 hover:bg-slate-600 flex items-center gap-2"
						title="Refetch commits from GitHub"
					>
						Refetch Commits ↻
					</Button>
					<Link href={evolutionHref}>
						<Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
							<TrendingUp className="w-4 h-4" />
							View Evolution & Architecture
						</Button>
					</Link>
				</div>
			</div>
			<h1 className="text-3xl font-bold mb-2">Commit Analysis</h1>
			<p className="text-slate-400">
				Repo:{" "}
				<code className="bg-slate-800 px-2 py-1 rounded text-sm">
					{repoUrl}
				</code>
			</p>
		</div>
	);
}
