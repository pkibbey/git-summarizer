import simpleGit, { SimpleGit } from "simple-git";
import { promises as fs } from "fs";
import path from "path";
import type { Commit } from "../lib/types";

const TEMP_REPO_DIR = path.join(process.cwd(), ".temp-repo");
console.log("TEMP_REPO_DIR: ", TEMP_REPO_DIR);
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const NEXT_PUBLIC_REPO = `${process.env.NEXT_PUBLIC_REPO}.git`;

async function cloneRepository(): Promise<SimpleGit> {
	// Clean up existing clone
	try {
		await fs.rm(TEMP_REPO_DIR, { recursive: true, force: true });
	} catch {
		// Directory doesn't exist, continue
	}

	// Create directory
	await fs.mkdir(TEMP_REPO_DIR, { recursive: true });

	// Clone with authentication
	const authUrl = NEXT_PUBLIC_REPO.replace(
		"https://",
		`https://${GITHUB_TOKEN}@`,
	);
	const git = simpleGit();
	await git.clone(authUrl, TEMP_REPO_DIR);

	return simpleGit(TEMP_REPO_DIR);
}

async function extractCommits(git: SimpleGit): Promise<Commit[]> {
	// Get commit log with detailed format
	const log = await git.log({
		format: {
			hash: "%H",
			message: "%s",
			author: "%an",
			email: "%ae",
			date: "%aI",
			body: "%b",
		},
	});

	const commits: Commit[] = [];

	for (const logEntry of log.all) {
		// Get diff stats for this commit
		const diffStats = await git.show([
			"--format=",
			"--name-status",
			"--diff-filter=AMDRT",
			logEntry.hash,
		]);

		const files = diffStats
			.split("\n")
			.filter(Boolean)
			.map((line) => {
				const [status, ...pathParts] = line.split("\t");
				return {
					path: pathParts.join("\t"),
					status: status as "A" | "M" | "D" | "R",
				};
			});

		// Get numeric stats
		const numstat = await git.show(["--format=", "--numstat", logEntry.hash]);
		const fileStats: {
			[key: string]: { additions: number; deletions: number };
		} = {};
		let totalAdditions = 0;
		let totalDeletions = 0;

		numstat.split("\n").forEach((line) => {
			const [additions, deletions, filePath] = line.split("\t");
			if (filePath && additions !== "-" && deletions !== "-") {
				const add = parseInt(additions, 10);
				const del = parseInt(deletions, 10);
				fileStats[filePath] = { additions: add, deletions: del };
				totalAdditions += add;
				totalDeletions += del;
			}
		});

		// Merge file info
		const enrichedFiles: Commit["files"] = files.map((f) => ({
			path: f.path,
			status:
				f.status === "A"
					? "added"
					: f.status === "M"
						? "modified"
						: f.status === "D"
							? "deleted"
							: "renamed",
			additions: fileStats[f.path]?.additions || 0,
			deletions: fileStats[f.path]?.deletions || 0,
		}));

		// Get short diff for AI analysis (first 2000 chars)
		let shortDiff = "";
		try {
			const fullDiff = await git.show([logEntry.hash]);
			shortDiff = fullDiff.slice(0, 2000);
		} catch {
			// Some commits might not have a diff
		}

		commits.push({
			hash: logEntry.hash,
			message: logEntry.message,
			author: logEntry.author,
			email: logEntry.email,
			date: new Date(logEntry.date).toISOString(),
			files: enrichedFiles,
			stats: {
				filesChanged: enrichedFiles.length,
				additions: totalAdditions,
				deletions: totalDeletions,
			},
			shortDiff,
		});
	}

	return commits;
}

export async function extractAndGroupCommits(): Promise<Map<string, Commit[]>> {
	console.log("Cloning Peak Blooms repository...");
	const git = await cloneRepository();

	console.log("Extracting commits...");
	const commits = await extractCommits(git);

	// Group commits by date
	const grouped = new Map<string, Commit[]>();

	for (const commit of commits) {
		const commitDate = new Date(commit.date);
		const dateKey = commitDate.toISOString().split("T")[0]; // YYYY-MM-DD

		if (!grouped.has(dateKey)) {
			grouped.set(dateKey, []);
		}
		grouped.get(dateKey)!.push(commit);
	}

	// Sort commits within each day by date (newest first for display, oldest first for chronological reading)
	grouped.forEach((dayCommits) => {
		dayCommits.sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		);
	});

	// Clean up temp directory
	await fs.rm(TEMP_REPO_DIR, { recursive: true, force: true });

	console.log(
		`Extracted ${commits.length} commits across ${grouped.size} days`,
	);
	return grouped;
}
