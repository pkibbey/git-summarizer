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
		status: "added" | "modified" | "deleted" | "renamed";
	}[];
	stats: {
		filesChanged: number;
		additions: number;
		deletions: number;
	};
	fullDiff?: string; // Complete diff for AI analysis
	shortDiff?: string; // Optional truncated diff for scripts/tools
}

export interface ArchitecturalCallout {
	type: "design-decision" | "pattern-used" | "performance-insight" | "learning";
	title: string;
	description: string;
}

export interface TokenUsage {
	inputTokens: number;
	outputTokens: number;
	totalTokens: number;
}

export interface CostMetrics {
	inputCost: number; // cost per 1M tokens
	outputCost: number; // cost per 1M tokens
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

export interface FileEvolution {
	path: string;
	changeCount: number;
	lastChanged: string;
	authors: string[];
	commits: {
		hash: string;
		date: string;
		message: string;
		additions: number;
		deletions: number;
	}[];
}

export interface FileChangeSnapshot {
	filePath: string;
	commitHash: string;
	message: string;
	diff: string;
	timestamp: string;
	tokens?: TokenUsage;
	modelId?: string;
}

export interface RepositoryEvolutionAnalysis {
	repoUrl: string;
	generatedAt: string;
	fileEvolutions: FileEvolution[];
	foundations: {
		path: string;
		description: string;
		reinforcement: string;
	}[];
	hotspots: {
		path: string;
		evolutionaryLessons: string[];
	}[];
	architecturalLessons: {
		title: string;
		lesson: string;
		impact: "high" | "medium" | "low";
		affectedFiles: string[];
	}[];
	namedPieces: {
		name: string;
		description: string;
		files: string[];
	}[];
	summary: string;
	tokens?: TokenUsage;
	modelId?: string;
}
