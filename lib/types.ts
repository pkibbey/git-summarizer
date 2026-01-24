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
  fullDiff?: string; // Complete diff for AI analysis
}

export interface ArchitecturalCallout {
  type: 'design-decision' | 'pattern-used' | 'performance-insight' | 'learning';
  title: string;
  description: string;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface CostMetrics {
  inputCost: number;     // cost per 1M tokens
  outputCost: number;    // cost per 1M tokens
  estimatedCost: number; // in USD
}

export interface Prompt {
  id: string;
  name: string;
  description?: string;
  summaryPrompt: string;
  decisionsPrompt: string;
  insightsPrompt: string;
  createdAt: string;
  updatedAt: string;
}
