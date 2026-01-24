import { promises as fs } from 'fs';
import path from 'path';
import type { Commit, TokenUsage } from './types';

// Database file paths
const DB_DIR = path.join(process.cwd(), '.data');
const COMMITS_DB_FILE = path.join(DB_DIR, 'commits.json');
const RESULTS_DB_FILE = path.join(DB_DIR, 'results.json');

interface CommitsDB {
  [repoUrl: string]: {
    fetchedAt: string;
    commits: Commit[];
  };
}

interface AnalysisResult {
  hash: string;
  modelName: string;
  promptId: string;
  aiSummary: string;
  keyDecisions: string[];
  architecturalCallouts: Array<{
    type: 'design-decision' | 'pattern-used' | 'performance-insight' | 'learning';
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
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
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
    const data = await fs.readFile(COMMITS_DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
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
    const data = await fs.readFile(RESULTS_DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
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
 * Get stored commits for a repository
 */
export async function getStoredCommits(repoUrl: string): Promise<Commit[]> {
  const db = await loadCommitsDB();
  return db[repoUrl]?.commits ?? [];
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
  promptId: string
): Promise<AnalysisResult | null> {
  const db = await loadResultsDB();
  return (
    db[repoUrl]?.[commitHash]?.[modelName]?.[promptId] ?? null
  );
}

/**
 * Store analysis result for a commit
 */
export async function storeAnalysisResult(
  repoUrl: string,
  commitHash: string,
  result: AnalysisResult
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
