import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { simpleGit } from 'simple-git';
import type { Commit } from '@/lib/types';
import {
  hasRepoBeenFetched,
  storeCommits,
  getStoredCommits,
} from '@/lib/database';

/**
 * Validate that a repo URL is publicly accessible
 */
function validateRepoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Extract commits from a git repository
 */
async function extractCommitsFromRepo(repoPath: string): Promise<Commit[]> {
  const git = simpleGit(repoPath);

  // Get all commits with detailed info
  const logs = await git.log({
    '--all': null,
    format: {
      hash: '%H',
      author: '%an',
      email: '%ae',
      date: '%aI',
      subject: '%s',
    },
  });

  const commits: Commit[] = [];

  if (!logs.all || logs.all.length === 0) {
    return commits;
  }

  // Iterate through each log entry
  for (const logEntry of logs.all) {
    const hash = logEntry.hash;
    const author = logEntry.author;
    const email = logEntry.email;
    const date = logEntry.date;
    const subject = logEntry.subject;

    // Get file stats for this commit
    let diff = '';

    try {
      // Try with parent commit, but handle initial commit case
      diff = await git.diff([`${hash}^..${hash}`]);
    } catch {
      // Initial commit has no parent, use show instead
      try {
        diff = await git.show([hash]);
      } catch {
        // If both fail, continue without diff
      }
    }

    // Get files changed
    let diffStat = '';
    try {
      diffStat = await git.diff([
        '--stat',
        `${hash}^..${hash}`,
      ]);
    } catch {
      try {
        diffStat = await git.show(['--stat', hash]);
      } catch {
        // If both fail, continue
      }
    }

    // Parse file changes from diff
    const files: Commit['files'] = [];
    const stats = {
      filesChanged: 0,
      additions: 0,
      deletions: 0,
    };

    try {
      const fileLines = diffStat.split('\n').filter((l) => l.includes('|'));
      fileLines.forEach((line) => {
        const match = line.match(
          /^\s*(.+?)\s+\|\s+(\d+)\s+([+\-]+).*$/
        );
        if (match) {
          const [, filePath, , signs] = match;
          const additions = (signs.match(/\+/g) || []).length;
          const deletions = (signs.match(/\-/g) || []).length;

          files.push({
            path: filePath.trim(),
            additions,
            deletions,
            status: 'modified', // simplified for now
          });

          stats.additions += additions;
          stats.deletions += deletions;
        }
      });
      stats.filesChanged = files.length;
    } catch {
      // If parsing fails, that's ok
    }

    commits.push({
      hash,
      message: subject,
      author,
      email,
      date,
      files,
      stats,
      fullDiff: diff || undefined,
    });
  }

  return commits.reverse(); // Oldest first
}

/**
 * Fetch commits from a public GitHub repo
 * Returns cached commits if already fetched, unless refresh is true
 */
export async function fetchCommitsFromRepo(
  repoUrl: string,
  refresh: boolean = false
): Promise<{
  commits: Commit[];
  wasCached: boolean;
  fetchedAt?: string;
}> {
  // Validate URL format
  if (!validateRepoUrl(repoUrl)) {
    throw new Error('Invalid repository URL');
  }

  // Check if already fetched (unless refresh is requested)
  if (!refresh) {
    const isCached = await hasRepoBeenFetched(repoUrl);
    if (isCached) {
      const commits = await getStoredCommits(repoUrl);
      return {
        commits,
        wasCached: true,
      };
    }
  }

  // Clone and extract
  const tmpDir = tmpdir();
  const repoName = repoUrl.split('/').pop()?.replace(/\.git$/, '') || 'repo';
  const clonePath = path.join(tmpDir, `git-summarizer-${Date.now()}-${repoName}`);

  try {
    // Clone the repository
    const git = simpleGit();
    await git.clone(repoUrl, clonePath, ['--depth', '100']); // Limit depth to recent commits

    // Extract commits
    const commits = await extractCommitsFromRepo(clonePath);

    // Store in database
    await storeCommits(repoUrl, commits);

    return {
      commits,
      wasCached: false,
      fetchedAt: new Date().toISOString(),
    };
  } finally {
    // Clean up temp directory
    try {
      await fs.rm(clonePath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}
