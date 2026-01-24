/**
 * Hardcoded models for commit summarization
 */

export interface HFModel {
  id: string;
  name: string;
  description?: string;
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
export const MODELS: HFModel[] = [
  {
    id: "ServiceNow-AI/Apriel-1.6-15b-Thinker:together",
    name: 'Apriel-1.6-15b',
    description: 'ServiceNow-AI Apriel-1.6-15b Thinker via Together',
    pricing: { inputCost: 0.004, outputCost: 0.004 },
  },
  {
    id: 'deepseek-ai/DeepSeek-V3.1:novita',
    name: 'DeepSeek V3.1',
    description: 'DeepSeek V3.1 via Novita',
    provider: 'novita',
    pricing: { inputCost: 0.10, outputCost: 0.20 },
  },
  {
    id: 'meta-llama/Llama-3.2-3B-Instruct:together',
    name: 'Llama 3.2 3B Instruct',
    description: 'Meta Llama 3.2 3B Instruct via Together',
    provider: 'together',
    pricing: { inputCost: 0.06, outputCost: 0.06 },
  },
  {
    id: 'meta-llama/Llama-4-Scout-17B-16E-Instruct:nscale',
    name: 'Llama 4 Scout 17B',
    description: 'Meta Llama 4 Scout 17B 16E Instruct via NScale',
    provider: 'nscale',
    pricing: { inputCost: 0.20, outputCost: 0.29 },
  },
  {
    id: 'openai/gpt-oss-120b:novita',
    name: 'GPT OSS 120B',
    description: 'OpenAI GPT OSS 120B via Novita',
    provider: 'novita',
    pricing: { inputCost: 0.50, outputCost: 1.50 },
  },
  {
    id: 'Qwen/Qwen2.5-Coder-32B-Instruct:nscale',
    name: 'Qwen 2.5 Coder 32B',
    description: 'Qwen 2.5 Coder 32B Instruct via NScale',
    provider: 'nscale',
    pricing: { inputCost: 0.25, outputCost: 0.75 },
  },
  {
    id: 'Qwen/Qwen3-235B-A22B-Instruct-2507:novita',
    name: 'Qwen 3 235B A22B',
    description: 'Qwen 3 235B A22B Instruct via Novita',
    provider: 'novita',
    pricing: { inputCost: 0.45, outputCost: 1.35 },
  },
];

/**
 * Get all available models
 */
export function getAvailableModels(): HFModel[] {
  return MODELS;
}
