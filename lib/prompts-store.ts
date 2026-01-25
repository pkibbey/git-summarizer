import { promises as fs } from "fs";
import path from "path";
import { Prompt } from "./types";

const PROMPTS_FILE = path.join(process.cwd(), ".data", "prompts.json");

const DEFAULT_PROMPTS: Record<string, Prompt> = {
	default: {
		id: "default",
		name: "Default",
		description: "Comprehensive analysis with standard depth",
		summaryPrompt: `Analyze the commits and provide a concise but comprehensive daily summary of what was accomplished. 
    Focus on the big picture of what features were worked on, what problems were solved, and the general direction of development.
    Keep the tone professional but conversational.`,
		decisionsPrompt: `Review the commits and identify the key architectural, technical, or product decisions made during development.
    Format as a bullet list of decisions. Each decision should be clear and actionable.`,
		insightsPrompt: `Based on the commits, identify key insights, learnings, design patterns used, and performance considerations.
    Categorize each insight as one of: design-decision, pattern-used, performance-insight, or learning.
    Return as JSON array with type, title, and description for each.`,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
};

async function ensureDataDir() {
	try {
		await fs.mkdir(path.dirname(PROMPTS_FILE), { recursive: true });
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_error) {
		// Directory might already exist
	}
}

async function readPrompts(): Promise<Record<string, Prompt>> {
	try {
		const content = await fs.readFile(PROMPTS_FILE, "utf-8");
		return JSON.parse(content);
	} catch (error) {
		// File doesn't exist yet, return defaults
		console.error(error);
		return DEFAULT_PROMPTS;
	}
}

async function writePrompts(prompts: Record<string, Prompt>): Promise<void> {
	await ensureDataDir();
	await fs.writeFile(PROMPTS_FILE, JSON.stringify(prompts, null, 2), "utf-8");
}

export async function initializePrompts(): Promise<void> {
	const prompts = await readPrompts();
	// Only init if default doesn't exist
	if (!prompts.default) {
		prompts.default = DEFAULT_PROMPTS.default;
		await writePrompts(prompts);
	}
}

export async function getPrompt(id: string): Promise<Prompt | null> {
	const prompts = await readPrompts();
	return prompts[id] || null;
}

export async function getStoredPrompt(id: string): Promise<Prompt | null> {
	return getPrompt(id);
}

export async function getAllPrompts(): Promise<Record<string, Prompt>> {
	return readPrompts();
}

export async function createPrompt(
	name: string,
	description: string | undefined,
	summaryPrompt: string,
	decisionsPrompt: string,
	insightsPrompt: string,
): Promise<Prompt> {
	const prompts = await readPrompts();
	const id = `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
	const now = new Date().toISOString();

	const prompt: Prompt = {
		id,
		name,
		description,
		summaryPrompt,
		decisionsPrompt,
		insightsPrompt,
		createdAt: now,
		updatedAt: now,
	};

	prompts[id] = prompt;
	await writePrompts(prompts);

	return prompt;
}

export async function updatePrompt(
	id: string,
	updates: Partial<Omit<Prompt, "id" | "createdAt">>,
): Promise<Prompt | null> {
	const prompts = await readPrompts();
	const prompt = prompts[id];

	if (!prompt) {
		return null;
	}

	const updated: Prompt = {
		...prompt,
		...updates,
		id: prompt.id,
		createdAt: prompt.createdAt,
		updatedAt: new Date().toISOString(),
	};

	prompts[id] = updated;
	await writePrompts(prompts);

	return updated;
}

export async function deletePrompt(id: string): Promise<boolean> {
	if (id === "default") {
		throw new Error("Cannot delete default prompt");
	}

	const prompts = await readPrompts();
	if (!prompts[id]) {
		return false;
	}

	delete prompts[id];
	await writePrompts(prompts);

	return true;
}
