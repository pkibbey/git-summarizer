import { promises as fs } from "fs";
import path from "path";
import simpleGit, { SimpleGit } from "simple-git";
import type { Commit } from "../lib/types";

const TEMP_REPO_DIR = path.join(process.cwd(), ".temp-repo");
const COMMITS_DATA_FILE = path.join(process.cwd(), ".commits-cache.json");
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

async function fetchAndStoreCommits() {
	try {
		if (!process.env.GITHUB_TOKEN) {
			throw new Error("GITHUB_TOKEN environment variable is required");
		}

		console.log("Cloning Peak Blooms repository...");
		const git = await cloneRepository();

		console.log("Extracting commits...");
		const commits = await extractCommits(git);

		if (commits.length === 0) {
			throw new Error("No commits found in repository");
		}

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

		// Sort commits within each day by date (oldest first for chronological reading)
		grouped.forEach((dayCommits) => {
			dayCommits.sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
			);
		});

		// Convert Map to object for JSON serialization
		const groupedObj: { [date: string]: Commit[] } = {};
		grouped.forEach((commits, date) => {
			groupedObj[date] = commits;
		});

		// Store to file
		await fs.writeFile(
			COMMITS_DATA_FILE,
			JSON.stringify(groupedObj, null, 2),
			"utf-8",
		);

		// Clean up temp directory
		await fs.rm(TEMP_REPO_DIR, { recursive: true, force: true });

		console.log(`\n✅ Commits fetched and stored successfully!`);
		console.log(`   Output: ${COMMITS_DATA_FILE}`);
		console.log(`   Total commits: ${commits.length}`);
		console.log(`   Days: ${grouped.size}`);
		console.log(`\nNext step: Run one of the analysis scripts:`);
		console.log(`   npm run analyze:gemma`);
		console.log(`   npm run analyze:ministral`);
	} catch (error) {
		console.error("Error fetching commits:", error);
		process.exit(1);
	}
}

(async () => {
	await fetchAndStoreCommits();
})();
