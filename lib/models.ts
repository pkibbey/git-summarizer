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
	// {
	// 	id: "Qwen/Qwen3-32B",
	// 	name: "Qwen 3 32B",
	// 	provider: "nscale",
	// 	pricing: { inputCost: 0.08, outputCost: 0.25 },
	// },
	{
		id: "openai/gpt-oss-120b",
		name: "GPT OSS 120B",
		provider: "novita",
		pricing: { inputCost: 0.05, outputCost: 0.25 },
	},
	{
		id: "deepseek-ai/DeepSeek-V3.1",
		name: "DeepSeek V3.1",
		provider: "novita",
		pricing: { inputCost: 0.1, outputCost: 0.2 },
	},
	{
		id: "Qwen/Qwen2.5-Coder-32B-Instruct",
		name: "Qwen 2.5 Coder 32B",
		provider: "nscale",
		pricing: { inputCost: 0.06, outputCost: 0.2 },
	},
	{
		id: "Qwen/Qwen3-235B-A22B-Instruct-2507",
		name: "Qwen 3 235B A22B",
		provider: "novita",
		pricing: { inputCost: 0.09, outputCost: 0.58 },
	},
	{
		id: "deepcogito/cogito-v2-preview-llama-70B",
		name: "Cogito V2 Llama 70B",
		provider: "together",
		pricing: { inputCost: 0.88, outputCost: 0.88 },
	},
];
