export interface Commit {
  hash: string;
  message: string;
  author: string;
  email: string;
  date: string;
  files: {
    path: string;
    additions: number;
    deletions: number;
    status: 'added' | 'modified' | 'deleted' | 'renamed';
  }[];
  stats: {
    filesChanged: number;
    additions: number;
    deletions: number;
  };
  shortDiff?: string; // First 2000 chars of diff for AI analysis
}

export interface ArchitecturalCallout {
  type: 'design-decision' | 'pattern-used' | 'performance-insight' | 'learning';
  title: string;
  description: string;
}

export interface DayPost {
  date: string; // ISO format: YYYY-MM-DD
  dayOfWeek: string;
  commits: Commit[];
  aiSummary: string;
  keyDecisions: string[];
  architecturalCallouts: ArchitecturalCallout[];
  stats: {
    totalCommits: number;
    filesChanged: number;
    additions: number;
    deletions: number;
  };
}

export interface BlogData {
  generatedAt: string;
  sourceRepo: string;
  days: DayPost[];
}
