import { promises as fs } from 'fs';
import path from 'path';
import type { Commit } from '../lib/types';

const COMMITS_DATA_FILE = path.join(process.cwd(), '.commits-cache.json');

/**
 * Load commits from the cache file
 * @returns Map of date -> commits
 */
export async function loadStoredCommits(): Promise<Map<string, Commit[]>> {
  try {
    const data = await fs.readFile(COMMITS_DATA_FILE, 'utf-8');
    const groupedObj = JSON.parse(data) as { [date: string]: Commit[] };

    const grouped = new Map<string, Commit[]>();
    Object.entries(groupedObj).forEach(([date, commits]) => {
      grouped.set(date, commits);
    });

    return grouped;
  } catch (error) {
    throw new Error(
      `Failed to load commits cache. Have you run 'npm run fetch-commits' yet?\n` +
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export { COMMITS_DATA_FILE };
