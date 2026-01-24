'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Commit, Prompt } from '@/lib/types';

interface Model {
  id: string;
  name: string;
  pricing?: { inputCost?: number; outputCost?: number };
}

function calculateCostBreakdown(
  tokens: { inputTokens: number; outputTokens: number; totalTokens: number } | undefined,
  modelInfo: Model | undefined,
  estimatedCost: number | undefined
): string {
  if (!tokens || !modelInfo?.pricing || estimatedCost === undefined) {
    return '';
  }

  const inputCost = (tokens.inputTokens / 1_000_000) * (modelInfo.pricing.inputCost || 0);
  const outputCost = (tokens.outputTokens / 1_000_000) * (modelInfo.pricing.outputCost || 0);

  return `${tokens.inputTokens.toLocaleString()} in × $${modelInfo.pricing.inputCost?.toFixed(4) || inputCost} + ${tokens.outputTokens.toLocaleString()} out × $${modelInfo.pricing.outputCost?.toFixed(4) || outputCost} = $${estimatedCost.toFixed(6)}`;
}

function AnalyzePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  // `repo` param is the repository path after github.com, e.g. "pkibbey/projects-radar" encoded via encodeURIComponent
  const repoParam = Array.isArray(params.repo) ? params.repo.join('/') : params.repo;
  const decodedRepoRest = repoParam ? decodeURIComponent(repoParam) : null;
  const repoUrl = decodedRepoRest ? `https://github.com/${decodedRepoRest}` : null;
  const commitFromUrl = searchParams.get('commit');

  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommitHash, setSelectedCommitHash] = useState<string | null>(
    commitFromUrl
  );
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('default');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<
    Map<
      string,
      {
        modelName: string;
        summary: string;
        decisions: string[];
        callouts: Array<{
          type: string;
          title: string;
          description: string;
        }>;
        duration: number;
        tokens?: { inputTokens: number; outputTokens: number; totalTokens: number };
        estimatedCost?: number;
        wasCached?: boolean;
      }
    >
  >(new Map());
  const [loadingCached, setLoadingCached] = useState<Set<string>>(new Set());
  const [currentlyAnalyzing, setCurrentlyAnalyzing] = useState<string | null>(null);
  const [visibility, setVisibility] = useState({
    summary: true,
    decisions: true,
    callouts: true,
  });

  // Fetch commits
  useEffect(() => {
    if (!repoUrl) {
      router.push('/');
      return;
    }

    async function fetchCommits() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/fetch-repo?repoUrl=${encodeURIComponent(repoUrl!)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch commits');
        }

        setCommits(data.commits || []);
        if (data.commits?.length > 0) {
          // Use commit from URL if valid, otherwise use first commit
          const validCommit = data.commits.find(
            (c: Commit) => c.hash === commitFromUrl
          );
          const defaultCommit = validCommit || data.commits[0];
          setSelectedCommitHash(defaultCommit.hash);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load commits'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCommits();
  }, [repoUrl, router, commitFromUrl]);

  // Fetch prompts
  useEffect(() => {
    async function fetchPrompts() {
      try {
        const response = await fetch('/api/prompts');
        if (response.ok) {
          const data = await response.json();
        const promptList = Array.isArray(data) 
            ? data 
            : Object.values(data.prompts || {}) as Prompt[];
          setPrompts(promptList);
          if (promptList.length > 0) {
            setSelectedPromptId(promptList[0].id);
          }
        } else {
          console.error('Failed to fetch prompts:', response.status);
        }
      } catch (err) {
        console.error('Failed to fetch prompts:', err);
      }
    }

    fetchPrompts();
  }, []);

  // Fetch available models
  useEffect(() => {
    async function fetchModels() {
      setLoadingModels(true);
      try {
        const response = await fetch('/api/providers');
        if (response.ok) {
          const data = await response.json();
          const modelList = data.models.map((model: Model) => ({
            id: model.id,
            name: model.name,
            pricing: (model as unknown as { pricing?: { inputCost?: number; outputCost?: number } }).pricing,
          }));
          setModels(modelList);
        }
      } catch (err) {
        console.error('Failed to fetch models:', err);
      } finally {
        setLoadingModels(false);
      }
    }

    fetchModels();
  }, []);

  // Fetch cached results when model is selected
  const fetchCachedResult = useCallback(async (modelName: string) => {
    if (!selectedCommitHash || !repoUrl || !selectedPromptId) return;

    const resultKey = `${selectedCommitHash}-${modelName}`;
    
    // Skip if already loaded
    if (results.has(resultKey)) {
      return;
    }

    setLoadingCached((prev) => new Set(prev).add(resultKey));

    try {
      const response = await fetch(
        `/api/analyze-commit?repoUrl=${encodeURIComponent(repoUrl)}&commitHash=${selectedCommitHash}&modelName=${modelName}&promptId=${selectedPromptId}`
      );

      const data = await response.json();

      if (response.ok && data.result) {
        setResults((prev) => {
          const newResults = new Map(prev);
          newResults.set(resultKey, {
            modelName,
            summary: data.result.aiSummary,
            decisions: data.result.keyDecisions,
            callouts: data.result.architecturalCallouts,
            duration: data.result.duration,
            tokens: data.result.tokens,
            estimatedCost: data.metrics?.estimatedCost,
            wasCached: data.wasCached,
          });
          return newResults;
        });
      }
    } catch (err) {
      console.error(`Failed to fetch cached result for ${modelName}:`, err);
    } finally {
      setLoadingCached((prev) => {
        const newSet = new Set(prev);
        newSet.delete(resultKey);
        return newSet;
      });
    }
  }, [results, selectedCommitHash, repoUrl, selectedPromptId]);

  // Fetch cached results for selected models when commit changes
  useEffect(() => {
    if (!selectedCommitHash || selectedModels.size === 0) return;

    for (const modelId of selectedModels) {
      const resultKey = `${selectedCommitHash}-${modelId}`;
      if (!results.has(resultKey)) {
        fetchCachedResult(modelId);
      }
    }
  }, [selectedCommitHash, selectedModels, results, fetchCachedResult]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedCommitHash || selectedModels.size === 0) {
      setError('Please select a commit and at least one model');
      return;
    }

    // Prevent multiple calls while analyzing
    if (analyzing) {
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      for (const modelName of Array.from(selectedModels)) {
        const response = await fetch('/api/analyze-commit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoUrl,
            commitHash: selectedCommitHash,
            modelName,
            promptId: selectedPromptId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || `Failed to analyze with ${modelName}`
          );
        }
        
        const resultKey = `${selectedCommitHash}-${modelName}`;

        setResults(results => new Map(results).set(resultKey, {
          modelName,
          summary: data.result.aiSummary,
          decisions: data.result.keyDecisions,
          callouts: data.result.architecturalCallouts,
          duration: data.result.duration,
          tokens: data.result.tokens,
          estimatedCost: data.metrics?.estimatedCost,
          wasCached: data.wasCached,
        }));
      }

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to analyze commit'
      );
    } finally {
      setAnalyzing(false);
      setCurrentlyAnalyzing(null);
    }
  }, [selectedCommitHash, selectedModels, selectedPromptId, repoUrl, analyzing]);

  const selectedCommit = commits.find((c) => c.hash === selectedCommitHash);

  // Only show results for the currently selected commit
  const visibleResults = selectedCommitHash
    ? Array.from(results.entries()).filter(([key]) => key.startsWith(`${selectedCommitHash}-`))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading commits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold mb-2">Commit Analysis</h1>
          <p className="text-slate-400">
            Repo: <code className="bg-slate-800 px-2 py-1 rounded text-sm">{repoUrl}</code>
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 sticky top-4">
              {/* Commit Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Select Commit</h3>
                  <button
                    onClick={async () => {
                      setLoading(true);
                      setError(null);
                      try {
                        const response = await fetch(
                          `/api/fetch-repo?repoUrl=${encodeURIComponent(repoUrl!)}&refresh=true`
                        );
                        const data = await response.json();
                        if (!response.ok) {
                          throw new Error(data.error || 'Failed to refresh commits');
                        }
                        setCommits(data.commits || []);
                        if (data.commits?.length > 0) {
                          setSelectedCommitHash(data.commits[0].hash);
                        }
                      } catch (err) {
                        setError(
                          err instanceof Error ? err.message : 'Failed to refresh commits'
                        );
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded transition"
                    title="Refresh commits"
                  >
                    Refresh commits ↻
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {commits.map((commit) => (
                    <button
                      key={commit.hash}
                      onClick={() => setSelectedCommitHash(commit.hash)}
                      className={`w-full text-left p-2 rounded text-sm transition ${
                        selectedCommitHash === commit.hash
                          ? 'bg-blue-600'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <div className="font-mono text-xs">{commit.hash.slice(0, 7)}</div>
                      <div className="truncate">{commit.message}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(commit.date).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Selection */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Select Models</h3>
                {loadingModels ? (
                  <p className="text-sm text-slate-400">Loading models...</p>
                ) : (
                  <div className="space-y-2">
                    {models.map((model) => (
                      <label key={model.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedModels.has(model.id)}
                          onChange={(e) => {
                            const newModels = new Set(selectedModels);
                            if (e.target.checked) {
                              newModels.add(model.id);
                              // Fetch cached result for this model
                              fetchCachedResult(model.id);
                            } else {
                              newModels.delete(model.id);
                            }
                            setSelectedModels(newModels);
                          }}
                          className="w-4 h-4"
                        />
                        <div className="flex items-baseline gap-2 flex-1">
                          <span className="text-sm">{model.name}</span>
                          {currentlyAnalyzing === model.id && (
                            <span className="text-xs text-yellow-400">⏳ analyzing...</span>
                          )}
                          {selectedCommitHash && loadingCached.has(`${selectedCommitHash}-${model.id}`) && (
                            <span className="text-xs text-blue-400">fetching cache...</span>
                          )}
                          {selectedCommitHash && results.has(`${selectedCommitHash}-${model.id}`) && (
                            <span className="text-xs text-green-400">✓ ready</span>
                          )}
                          {model.pricing?.inputCost !== undefined && (
                            <span className="text-xs text-slate-400">
                              ${""}{model.pricing.inputCost.toFixed(2)} /1M in
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Prompt Selection */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Select Prompt</h3>
                <select
                  value={selectedPromptId}
                  onChange={(e) => setSelectedPromptId(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
                >
                  {prompts.map((prompt) => (
                    <option key={prompt.id} value={prompt.id}>
                      {prompt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Analyze Button */}
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || !selectedCommitHash || selectedModels.size === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Commit'}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Commit Details */}
            {selectedCommit && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold mb-4">Commit Details</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-slate-400">Hash:</span>
                    <code className="ml-2 bg-slate-900 px-2 py-1 rounded">
                      {selectedCommit.hash.slice(0, 12)}
                    </code>
                  </div>
                  <div>
                    <span className="text-slate-400">Author:</span>
                    <span className="ml-2">{selectedCommit.author}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Date:</span>
                    <span className="ml-2">
                      {new Date(selectedCommit.date).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Message:</span>
                    <p className="mt-2 bg-slate-900 p-3 rounded">
                      {selectedCommit.message}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Stats:</span>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-slate-900 p-2 rounded">
                        <div className="text-slate-400">Files</div>
                        <div className="font-bold">{selectedCommit.stats.filesChanged}</div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded">
                        <div className="text-slate-400">Lines +</div>
                        <div className="font-bold text-green-400">
                          {selectedCommit.stats.additions}
                        </div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded">
                        <div className="text-slate-400">Lines -</div>
                        <div className="font-bold text-red-400">
                          {selectedCommit.stats.deletions}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Results */}
            <div className="mb-4">
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex items-center gap-3">
                <div className="text-sm text-slate-300">Show:</div>
                <button
                  onClick={() => setVisibility((v) => ({ ...v, summary: !v.summary }))}
                  className={`px-2 py-1 text-sm rounded ${visibility.summary ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setVisibility((v) => ({ ...v, decisions: !v.decisions }))}
                  className={`px-2 py-1 text-sm rounded ${visibility.decisions ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                >
                  Key Decisions
                </button>
                <button
                  onClick={() => setVisibility((v) => ({ ...v, callouts: !v.callouts }))}
                  className={`px-2 py-1 text-sm rounded ${visibility.callouts ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                >
                  Callouts
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {visibleResults.map(([key, result]) => (
                <div
                  key={key}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {(() => {
                        const modelInfo = models.find((m) => m.id === result.modelName);
                        return (
                          <div>
                            <h3 className="text-lg font-semibold">
                              {modelInfo ? modelInfo.name : result.modelName}
                              {calculateCostBreakdown(result.tokens, modelInfo, result.estimatedCost) ? (
                                <span className="ml-2 text-xs text-slate-400">
                                  {calculateCostBreakdown(result.tokens, modelInfo, result.estimatedCost)}
                                </span>
                              ) : modelInfo?.pricing?.inputCost !== undefined ? (
                                <span className="ml-2 text-xs text-slate-400">${""}{modelInfo.pricing.inputCost.toFixed(2)} /1M in</span>
                              ) : null}
                            </h3>
                            {result.wasCached && (
                              <span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded mt-1 inline-block">
                                ✓ From Cache
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">
                        {result.duration}ms
                      </div>
                      {result.tokens && result.estimatedCost !== undefined && (
                        <div className="text-xs text-slate-400 mt-2">
                          <div>{result.tokens.totalTokens} tokens</div>
                          <div className="text-yellow-400 font-semibold">
                            ${result.estimatedCost.toFixed(6)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {visibility.summary && (
                      <div>
                        <h4 className="font-semibold text-sm text-slate-300 mb-2">
                          Summary
                        </h4>
                        <p className="text-sm">{result.summary}</p>
                      </div>
                    )}

                    {visibility.decisions && result.decisions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-slate-300 mb-2">
                          Key Decisions
                        </h4>
                        <ul className="text-sm space-y-1">
                          {result.decisions.map((decision, idx) => (
                            <li key={idx} className="text-slate-300">
                              • {decision}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {visibility.callouts && result.callouts.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-slate-300 mb-2">
                          Architectural Callouts
                        </h4>
                        <div className="space-y-2">
                          {result.callouts.map((callout, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-900 p-3 rounded border-l-2 border-blue-500"
                            >
                              <div className="text-xs text-blue-400 uppercase tracking-wide">
                                {callout.type}
                              </div>
                              <div className="font-semibold text-sm mt-1">
                                {callout.title}
                              </div>
                              <div className="text-sm text-slate-300 mt-1">
                                {callout.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {visibleResults.length === 0 && !analyzing && (
              <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
                <p className="text-slate-400">
                  Select a model to check cache or click &quot;Analyze Commit&quot; to run new analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnalyzeClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>}>
      <AnalyzePageContent />
    </Suspense>
  );
}
