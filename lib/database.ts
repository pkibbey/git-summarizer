import { promises as fs } from "fs";
import path from "path";
import type {
	Commit,
	FileChangeSnapshot,
	RepositoryEvolutionAnalysis,
	TokenUsage,
} from "./types";

// Database file paths
const DB_DIR = path.join(process.cwd(), ".data");
const COMMITS_DB_FILE = path.join(DB_DIR, "commits.json");
const RESULTS_DB_FILE = path.join(DB_DIR, "results.json");
const EVOLUTION_DB_FILE = path.join(DB_DIR, "evolution.json");
const SNAPSHOTS_DB_FILE = path.join(DB_DIR, "snapshots.json");

interface CommitsDB {
	[repoUrl: string]: {
		fetchedAt: string;
		commits: Commit[];
	};
}

interface EvolutionDB {
	[repoUrl: string]: RepositoryEvolutionAnalysis;
}

interface SnapshotsDB {
	[repoUrl: string]: {
		[filePath: string]: {
			[commitHash: string]: FileChangeSnapshot;
		};
	};
}

interface AnalysisResult {
	hash: string;
	modelName: string;
	promptId: string;
	aiSummary: string;
	keyDecisions: string[];
	architecturalCallouts: Array<{
		type:
			| "design-decision"
			| "pattern-used"
			| "performance-insight"
			| "learning";
		title: string;
		description: string;
	}>;
	duration: number;
	tokens?: TokenUsage;
	generatedAt: string;
}

interface ResultsDB {
	[repoUrl: string]: {
		[commitHash: string]: {
			[modelName: string]: {
				[promptId: string]: AnalysisResult;
			};
		};
	};
}

/**
 * Ensure database directory exists
 */
async function ensureDbDir() {
	try {
		await fs.mkdir(DB_DIR, { recursive: true });
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
			throw error;
		}
	}
}

/**
 * Load commits database
 */
async function loadCommitsDB(): Promise<CommitsDB> {
	await ensureDbDir();
	try {
		const data = await fs.readFile(COMMITS_DB_FILE, "utf-8");
		return JSON.parse(data);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return {};
		}
		throw error;
	}
}

/**
 * Load results database
 */
async function loadResultsDB(): Promise<ResultsDB> {
	await ensureDbDir();
	try {
		const data = await fs.readFile(RESULTS_DB_FILE, "utf-8");
		return JSON.parse(data);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return {};
		}
		throw error;
	}
}

/**
 * Load evolution database
 */
async function loadEvolutionDB(): Promise<EvolutionDB> {
	await ensureDbDir();
	try {
		const data = await fs.readFile(EVOLUTION_DB_FILE, "utf-8");
		return JSON.parse(data);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return {};
		}
		throw error;
	}
}

/**
 * Load snapshots database
 */
async function loadSnapshotsDB(): Promise<SnapshotsDB> {
	await ensureDbDir();
	try {
		const data = await fs.readFile(SNAPSHOTS_DB_FILE, "utf-8");
		return JSON.parse(data);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return {};
		}
		throw error;
	}
}

/**
 * Save commits database
 */
async function saveCommitsDB(db: CommitsDB) {
	await ensureDbDir();
	await fs.writeFile(COMMITS_DB_FILE, JSON.stringify(db, null, 2));
}

/**
 * Save evolution database
 */
async function saveEvolutionDB(db: EvolutionDB) {
	await ensureDbDir();
	await fs.writeFile(EVOLUTION_DB_FILE, JSON.stringify(db, null, 2));
}

/**
 * Save snapshots database
 */
async function saveSnapshotsDB(db: SnapshotsDB) {
	await ensureDbDir();
	await fs.writeFile(SNAPSHOTS_DB_FILE, JSON.stringify(db, null, 2));
}

/**
 * Save results database
 */
async function saveResultsDB(db: ResultsDB) {
	await ensureDbDir();
	await fs.writeFile(RESULTS_DB_FILE, JSON.stringify(db, null, 2));
}

/**
 * Check if a repository has been fetched
 */
export async function hasRepoBeenFetched(repoUrl: string): Promise<boolean> {
	const db = await loadCommitsDB();
	return !!db[repoUrl];
}

/**
 * Get stored file change snapshots
 */
export async function getFileChangeSnapshots(
	repoUrl: string,
	filePath: string,
): Promise<FileChangeSnapshot[]> {
	const db = await loadSnapshotsDB();
	const repoSnaps = db[repoUrl]?.[filePath] ?? {};
	return Object.values(repoSnaps);
}

/**
 * Get a specific file change snapshot
 */
export async function getFileChangeSnapshot(
	repoUrl: string,
	filePath: string,
	commitHash: string,
): Promise<FileChangeSnapshot | null> {
	const db = await loadSnapshotsDB();
	return db[repoUrl]?.[filePath]?.[commitHash] ?? null;
}

/**
 * Store file change snapshots
 */
export async function storeFileChangeSnapshot(
	repoUrl: string,
	snapshot: FileChangeSnapshot,
) {
	const db = await loadSnapshotsDB();
	if (!db[repoUrl]) db[repoUrl] = {};
	if (!db[repoUrl][snapshot.filePath]) db[repoUrl][snapshot.filePath] = {};
	db[repoUrl][snapshot.filePath][snapshot.commitHash] = snapshot;
	await saveSnapshotsDB(db);
}

/**
 * Get stored commits for a repository
 */
export async function getStoredCommits(repoUrl: string): Promise<Commit[]> {
	const db = await loadCommitsDB();
	return db[repoUrl]?.commits ?? [];
}

/**
 * Get evolution analysis for a repository
 */
export async function getEvolutionAnalysis(
	repoUrl: string,
): Promise<RepositoryEvolutionAnalysis | null> {
	const db = await loadEvolutionDB();
	return db[repoUrl] || null;
}

/**
 * Store evolution analysis for a repository
 */
export async function storeEvolutionAnalysis(
	repoUrl: string,
	analysis: RepositoryEvolutionAnalysis,
) {
	const db = await loadEvolutionDB();
	db[repoUrl] = analysis;
	await saveEvolutionDB(db);
}

/**
 * Store commits for a repository
 */
export async function storeCommits(repoUrl: string, commits: Commit[]) {
	const db = await loadCommitsDB();
	db[repoUrl] = {
		fetchedAt: new Date().toISOString(),
		commits,
	};
	await saveCommitsDB(db);
}

/**
 * Get analysis result for a commit
 */
export async function getAnalysisResult(
	repoUrl: string,
	commitHash: string,
	modelName: string,
	promptId: string,
): Promise<AnalysisResult | null> {
	const db = await loadResultsDB();
	return db[repoUrl]?.[commitHash]?.[modelName]?.[promptId] ?? null;
}

/**
 * Store analysis result for a commit
 */
export async function storeAnalysisResult(
	repoUrl: string,
	commitHash: string,
	result: AnalysisResult,
) {
	const db = await loadResultsDB();

	if (!db[repoUrl]) {
		db[repoUrl] = {};
	}
	if (!db[repoUrl][commitHash]) {
		db[repoUrl][commitHash] = {};
	}
	if (!db[repoUrl][commitHash][result.modelName]) {
		db[repoUrl][commitHash][result.modelName] = {};
	}

	db[repoUrl][commitHash][result.modelName][result.promptId] = result;
	await saveResultsDB(db);
}

/**
 * Delete a specific analysis result
 * Returns true if a result was deleted, false if not found
 */
export async function deleteAnalysisResult(
	repoUrl: string,
	commitHash: string,
	modelName: string,
	promptId: string,
): Promise<boolean> {
	const db = await loadResultsDB();

	if (
		!db[repoUrl] ||
		!db[repoUrl][commitHash] ||
		!db[repoUrl][commitHash][modelName] ||
		!db[repoUrl][commitHash][modelName][promptId]
	) {
		return false;
	}

	delete db[repoUrl][commitHash][modelName][promptId];

	// cleanup empty objects to keep file tidy
	if (Object.keys(db[repoUrl][commitHash][modelName]).length === 0) {
		delete db[repoUrl][commitHash][modelName];
	}
	if (Object.keys(db[repoUrl][commitHash]).length === 0) {
		delete db[repoUrl][commitHash];
	}
	if (Object.keys(db[repoUrl]).length === 0) {
		delete db[repoUrl];
	}

	await saveResultsDB(db);
	return true;
}

/**
 * Return the entire results database object
 */
export async function getAllAnalysisResults(): Promise<ResultsDB> {
	return await loadResultsDB();
}

/**
 * Return the entire evolution database object
 */
export async function getAllEvolutionAnalyses(): Promise<EvolutionDB> {
	return await loadEvolutionDB();
}

/**
 * Return the entire snapshots database object
 */
export async function getAllSnapshots(): Promise<SnapshotsDB> {
	return await loadSnapshotsDB();
}
