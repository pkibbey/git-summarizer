import { Model } from "@/components/ProviderSelector";

/**
 * List of HuggingFace inference providers
 * These support chat completion and can produce JSON output
 */
const HUGGINGFACE_PROVIDERS = [
  {
    id: 'together',
    name: 'Together AI',
    description: 'Together AI provides fast and affordable LLM inference',
    url: 'https://together.ai',
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Groq offers extremely fast LLM inference with specialized hardware',
    url: 'https://groq.com',
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    description: 'Cerebras provides enterprise-grade LLM inference',
    url: 'https://cerebras.ai',
  },
  {
    id: 'fireworks-ai',
    name: 'Fireworks AI',
    description: 'Fireworks AI offers fine-tuned and open-source LLMs',
    url: 'https://fireworks.ai',
  },
  {
    id: 'replicate',
    name: 'Replicate',
    description: 'Replicate provides a wide range of AI models on demand',
    url: 'https://replicate.com',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Cohere specializes in NLP and text generation models',
    url: 'https://cohere.com',
  },
  {
    id: 'hf-inference',
    name: 'HuggingFace Inference',
    description: 'Official HuggingFace inference API',
    url: 'https://huggingface.co/inference',
  },
  {
    id: 'clarifai',
    name: 'Clarifai',
    description: 'Clarifai provides AI models for various tasks',
    url: 'https://clarifai.com',
  },
] as const;

/**
 * Popular open-source models recommended for code analysis
 * These models are known to work well with JSON output and code understanding
 */
export const RECOMMENDED_MODELS = [
  {
    id: 'meta-llama/Llama-3.1-8B-Instruct:nscale',
    name: 'Llamam 3.2 8B',
    provider: 'nscale',
    description: '',
    tags: ['llama'],
    pricing: { inputCost: 0.06, outputCost: 0.06 },
  },
   {
    id: 'Qwen/Qwen3-32B:nscale',
    name: 'Qwen 3 32B',
    provider: 'nscale',
    description: '',
    tags: ['qwen'],
    pricing: { inputCost: 0.08, outputCost: 0.25 },
  },
   {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-8B:nscale',
    name: 'DeepSeek R1 Llama 8B',
    provider: 'nscale',
    description: '',
    tags: ['deepseek'],
    pricing: { inputCost: 0.05, outputCost: 0.05 },
  },
   {
    id: 'openai/gpt-oss-120b:novita',
    name: 'GPT OSS 120B',
    provider: 'novita',
    description: '',
    tags: ['openai'],
    pricing: { inputCost: 0.05, outputCost: 0.25 },
  },
   {
    id: 'Qwen/Qwen3-235B-A22B-Thinking-2507:fireworks-ai',
    name: 'Qwen 3 235B Thinking',
    provider: 'fireworks-ai',
    description: '',
    tags: ['qwen'],
    pricing: { inputCost: 0.22, outputCost: 0.88 },
  },
] as Model[];

/**
 * Get all available providers
 */
export function getProviders() {
  return HUGGINGFACE_PROVIDERS;
}

/**
 * Get provider by ID
 */
export function getProvider(id: string) {
  return HUGGINGFACE_PROVIDERS.find((p) => p.id === id);
}

/**
 * Get all recommended models
 */
export function getRecommendedModels() {
  return RECOMMENDED_MODELS;
}

/**
 * Get models for a specific provider
 */
export function getModelsForProvider(providerId: string) {
  return RECOMMENDED_MODELS.filter((m) => m.provider === providerId);
}

/**
 * Search models by keyword
 */
export function searchModels(query: string) {
  const lowerQuery = query.toLowerCase();
  return RECOMMENDED_MODELS.filter(
    (m) =>
      m.name.toLowerCase().includes(lowerQuery) ||
      m.description.toLowerCase().includes(lowerQuery) ||
      m.id.toLowerCase().includes(lowerQuery) ||
      m.tags.some((t) => t.includes(lowerQuery))
  );
}
