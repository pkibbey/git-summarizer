'use client';

import { useEffect, useState } from 'react';
import type { HFModel } from '@/lib/huggingface-models';

// Types extracted from providers.ts
type Provider = {
  id: string;
  name: string;
  description: string;
  url: string;
};

export type Model = {
  id: string;
  name: string;
  provider: string;
  description: string;
  tags: string[];
  pricing?: { inputCost?: number; outputCost?: number };
};

interface ProviderSelectorProps {
  onProviderSelect?: (provider: Provider) => void;
  onModelSelect?: (model: Model | HFModel) => void;
  selectedProvider?: string;
  selectedModel?: string;
  useHuggingFaceModels?: boolean; // If true, fetch from HuggingFace instead
  minContextWindow?: number; // Minimum context window for filtering
}

export function ProviderSelector({
  onProviderSelect,
  onModelSelect,
  selectedProvider,
  selectedModel,
  useHuggingFaceModels = false,
  minContextWindow = 4000,
}: ProviderSelectorProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<(Model | HFModel)[]>([]);
  const [filteredModels, setFilteredModels] = useState<(Model | HFModel)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string>(selectedProvider || '');
  const [activeModel, setActiveModel] = useState<string>(selectedModel || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch providers and models
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        if (useHuggingFaceModels) {
          // Fetch filtered HuggingFace models
          const response = await fetch(
            `/api/huggingface-models?action=filtered&minContextWindow=${minContextWindow}`
          );
          if (!response.ok) throw new Error('Failed to fetch HuggingFace models');
          
          const data = await response.json();
          console.log('data: ', data);
          setModels(data.models);
          setFilteredModels(data.models);
          // For HF models, we don't have traditional providers
          setProviders([]);
        } else {
          // Fetch traditional providers and models
          const response = await fetch('/api/providers');
          if (!response.ok) throw new Error('Failed to fetch providers');
          
          const data = await response.json();
          setProviders(data.providers);
          setModels(data.models);
          setFilteredModels(data.models);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [useHuggingFaceModels, minContextWindow]);

  // Filter models by selected provider
  useEffect(() => {
    if (activeProvider) {
      const filtered = models.filter(
        (m) => 'provider' in m && m.provider === activeProvider
      );
      setFilteredModels(filtered);
      setActiveModel(''); // Reset model selection when provider changes
    } else {
      setFilteredModels(models);
    }
  }, [activeProvider, models]);

  // Apply search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      if (activeProvider) {
        setFilteredModels(
          models.filter((m) => 'provider' in m && m.provider === activeProvider)
        );
      } else {
        setFilteredModels(models);
      }
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = models.filter(
      (m) => {
        const matchesQuery =
          ('name' in m && m.name.toLowerCase().includes(lowerQuery)) ||
          ('description' in m && m.description?.toLowerCase().includes(lowerQuery)) ||
          m.id.toLowerCase().includes(lowerQuery) ||
          ('tags' in m && m.tags && Array.isArray(m.tags) && 
           m.tags.some((t: string) => t.includes(lowerQuery)));

        const matchesProvider =
          !activeProvider || ('provider' in m && m.provider === activeProvider);

        return matchesQuery && matchesProvider;
      }
    );
    setFilteredModels(filtered);
  }, [searchQuery, activeProvider, models]);

  const handleProviderSelect = (providerId: string) => {
    setActiveProvider(providerId);
    const provider = providers.find((p) => p.id === providerId);
    if (provider && onProviderSelect) {
      onProviderSelect(provider);
    }
  };

  const handleModelSelect = (modelId: string) => {
    setActiveModel(modelId);
    const model = models.find((m) => m.id === modelId);
    if (model && onModelSelect) {
      onModelSelect(model);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600">Loading providers and models...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Providers Section */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Inference Provider</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleProviderSelect(provider.id)}
              className={`rounded-lg border-2 p-3 text-left transition-all ${
                activeProvider === provider.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title={provider.description}
            >
              <div className="font-medium">{provider.name}</div>
              <div className="mt-1 text-sm text-gray-600">{provider.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Models Section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Model</h3>
          <span className="text-sm text-gray-600">{filteredModels.length} available</span>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search models by name or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />

        {/* Models Grid */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredModels.length > 0 ? (
            filteredModels.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model.id)}
                className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                  activeModel === model.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">
                      {model.name}
                      {useHuggingFaceModels && 'isCheapest' in model && model.isCheapest && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Cheapest
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">{model.description}</div>
                    {useHuggingFaceModels && 'contextWindow' in model && (
                      <div className="mt-1 text-xs text-gray-500">
                        Context Window: {model.contextWindow?.toLocaleString()} tokens
                      </div>
                    )}
                    {useHuggingFaceModels && 'supportsStructuredOutput' in model && (
                      <div className="mt-1 text-xs text-gray-500">
                        <span className="inline-block">
                          {model.supportsStructuredOutput ? '✓' : '✗'} Structured Output
                        </span>
                      </div>
                    )}

                    {model.pricing && (
                      <div className="mt-1 text-xs text-gray-500">
                        Cost: ${""}{typeof model.pricing.inputCost === 'number' ? model.pricing.inputCost.toFixed(2) : 'N/A'} (in) / ${""}{typeof model.pricing.outputCost === 'number' ? model.pricing.outputCost.toFixed(2) : 'N/A'} (out) per 1M tokens
                      </div>
                    )}
                    {('tags' in model && model.tags) && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(model.tags as string[]).map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 break-all">{model.id}</div>
              </button>
            ))
          ) : (
            <div className="rounded-lg bg-gray-50 p-4 text-center text-gray-600">
              No models found matching your search
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {activeProvider && activeModel && !useHuggingFaceModels && (
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="text-sm text-gray-700">
            <div>
              <span className="font-semibold">Provider:</span>{' '}
              {providers.find((p) => p.id === activeProvider)?.name}
            </div>
            <div className="mt-1">
              <span className="font-semibold">Model:</span>{' '}
              {models.find((m) => m.id === activeModel)?.name}
            </div>
          </div>
        </div>
      )}
      {activeModel && useHuggingFaceModels && (
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="text-sm text-gray-700">
            <div>
              <span className="font-semibold">Selected Model:</span>{' '}
              {models.find((m) => m.id === activeModel)?.name}
            </div>
            <div className="mt-1 text-xs text-gray-600">
              Filtered from HuggingFace Inference API - supports structured output with
              sufficient context window
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
