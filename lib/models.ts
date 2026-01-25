/**
 * Hardcoded models for commit summarization
 */

export interface Model {
	id: string;
	name: string;
	provider?: string;
	pricing?: {
		/** Cost in USD per 1M input tokens */
		inputCost?: number;
		/** Cost in USD per 1M output tokens */
		outputCost?: number;
	};
}

/**
 * Available models with provider information
 */
export const MODELS: Model[] = [
	{
		id: "meta-llama/Llama-3.1-8B-Instruct:nscale",
		name: "Llamam 3.2 8B",
		provider: "nscale",
		pricing: { inputCost: 0.06, outputCost: 0.06 },
	},
	{
		id: "Qwen/Qwen3-32B:nscale",
		name: "Qwen 3 32B",
		provider: "nscale",
		pricing: { inputCost: 0.08, outputCost: 0.25 },
	},
	{
		id: "deepseek-ai/DeepSeek-R1-Distill-Llama-8B:nscale",
		name: "DeepSeek R1 Llama 8B",
		provider: "nscale",
		pricing: { inputCost: 0.05, outputCost: 0.05 },
	},
	{
		id: "openai/gpt-oss-120b:novita",
		name: "GPT OSS 120B",
		provider: "novita",
		pricing: { inputCost: 0.05, outputCost: 0.25 },
	},
	{
		id: "Qwen/Qwen3-235B-A22B-Thinking-2507:fireworks-ai",
		name: "Qwen 3 235B Thinking",
		provider: "fireworks-ai",
		pricing: { inputCost: 0.22, outputCost: 0.88 },
	},
	{
		id: "ServiceNow-AI/Apriel-1.6-15b-Thinker:together",
		name: "Apriel-1.6-15b",
		pricing: { inputCost: 0.004, outputCost: 0.004 },
	},
	{
		id: "deepseek-ai/DeepSeek-V3.1:novita",
		name: "DeepSeek V3.1",
		provider: "novita",
		pricing: { inputCost: 0.1, outputCost: 0.2 },
	},
	{
		id: "meta-llama/Llama-3.2-3B-Instruct:together",
		name: "Llama 3.2 3B Instruct",
		provider: "together",
		pricing: { inputCost: 0.06, outputCost: 0.06 },
	},
	{
		id: "meta-llama/Llama-4-Scout-17B-16E-Instruct:nscale",
		name: "Llama 4 Scout 17B",
		provider: "nscale",
		pricing: { inputCost: 0.2, outputCost: 0.29 },
	},
	{
		id: "Qwen/Qwen2.5-Coder-32B-Instruct:nscale",
		name: "Qwen 2.5 Coder 32B",
		provider: "nscale",
		pricing: { inputCost: 0.06, outputCost: 0.2 },
	},
	{
		id: "Qwen/Qwen3-235B-A22B-Instruct-2507:novita",
		name: "Qwen 3 235B A22B",
		provider: "novita",
		pricing: { inputCost: 0.09, outputCost: 0.58 },
	},
	{
		id: "deepcogito/cogito-v2-preview-llama-70B:together",
		name: "Cogito V2 Llama 70B",
		provider: "together",
		pricing: { inputCost: 0.88, outputCost: 0.88 },
	},
];
