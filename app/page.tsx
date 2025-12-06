'use client';

import { BlogTimeline } from '@/components/BlogTimeline';
import type { BlogData } from '@/lib/types';
import { useEffect, useState } from 'react';

type ModelType = 'gemma' | 'ministral';
type PromptVersion = 'v1' | 'v2' | 'v3';

export default function Home() {
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemma');
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion>('v1');
  const [availableVersions, setAvailableVersions] = useState<PromptVersion[]>(['v1']);

  useEffect(() => {
    async function loadBlogData(model: ModelType, version: PromptVersion) {
      setIsLoading(true);
      try {
        const url = `/blog-data/${model}/${version}.json`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Blog data not found for ${model} model with prompt version ${version}. Run: npm run analyze:${model} -- --version=${version}`);
        }
        const data = await response.json();
        setBlogData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog data');
        setBlogData(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadBlogData(selectedModel, selectedVersion);
  }, [selectedModel, selectedVersion]);

  useEffect(() => {
    // Check which versions are available for the selected model
    async function checkAvailableVersions() {
      const versions: PromptVersion[] = [];
      const versionList: PromptVersion[] = ['v1', 'v2', 'v3'];

      for (const v of versionList) {
        try {
          const response = await fetch(`/blog-data/${selectedModel}/${v}.json`, { method: 'HEAD' });
          if (response.ok) {
            versions.push(v);
          }
        } catch {
          // Version not available
        }
      }

      setAvailableVersions(versions.length > 0 ? versions : ['v1']);
      // Reset to first available version if current selection is not available
      if (!versions.includes(selectedVersion)) {
        setSelectedVersion(versions[0] || 'v1');
      }
    }

    checkAvailableVersions();
  }, [selectedModel, selectedVersion]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/95 dark:bg-black/95 backdrop-blur-sm z-50">
        <div className="w-full max-w-4xl mx-auto px-6 py-8 sm:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50">
            Peak Blooms
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
            A 2-week journey building a fully featured website. Documenting the daily progress,
            architectural decisions, and learnings through git commits and AI-powered analysis.
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-4">
            This site demonstrates user-centric design thinking, software quality principles,
            and thoughtful engineering decisions that make great products.
          </p>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-6 py-12 sm:px-8">
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin h-8 w-8 border-4 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-50 rounded-full"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading development journal...</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-3">
              <label htmlFor="model-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                AI Model:
              </label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gemma">Gemma 3 (LM Studio)</option>
                <option value="ministral">Ministral 3B (LM Studio)</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="version-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Prompt Version:
              </label>
              <select
                id="version-select"
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value as PromptVersion)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableVersions.map((v) => (
                  <option key={v} value={v}>
                    {v === 'v1' ? 'Original (v1)' : v === 'v2' ? 'Refined (v2)' : 'Latest (v3)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-50 mb-2">
              Blog Data Not Available
            </h2>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
            <div className="bg-white dark:bg-black rounded p-4 font-mono text-xs overflow-auto">
              <p className="text-gray-900 dark:text-gray-50">
                To generate blog data locally:
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                1. Install dependencies: <span className="text-gray-900 dark:text-gray-50">npm install</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                2. Choose your local LLM provider (LM Studio)
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                3. Generate analysis with one of:
              </p>
              <p className="text-gray-600 dark:text-gray-400 ml-4">
                • Gemma: <span className="text-gray-900 dark:text-gray-50">GITHUB_TOKEN=your_token npm run analyze:gemma -- --version=v1</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400 ml-4">
                • Ministral: <span className="text-gray-900 dark:text-gray-50">GITHUB_TOKEN=your_token npm run analyze:ministral -- --version=v1</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                4. Commit and push: <span className="text-gray-900 dark:text-gray-50">git add public/blog-data/ && git commit -m &quot;chore: update blog data&quot;</span>
              </p>
            </div>
          </div>
        )}

        {blogData && !isLoading && <BlogTimeline blogData={blogData} />}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="w-full max-w-4xl mx-auto px-6 py-8 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Built with Next.js, AI, and attention to detail.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/pkibbey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://github.com/pkibbey/peak-blooms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 transition-colors"
              >
                Peak Blooms Repo
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
