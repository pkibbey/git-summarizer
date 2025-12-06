'use client';

import { BlogTimeline } from '@/components/BlogTimeline';
import type { BlogData } from '@/lib/types';
import { useEffect, useState } from 'react';

type ModelType = 'gemma' | 'ministral';

export default function Home() {
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemma');

  useEffect(() => {
    async function loadBlogData(model: ModelType) {
      setIsLoading(true);
      try {
        const filenames: Record<ModelType, string> = {
          gemma: 'blog-data-gemma.json',
          ministral: 'blog-data-ministral.json',
        };
        const filename = filenames[model];
        const response = await fetch(`/${filename}`);
        if (!response.ok) {
          throw new Error(`Blog data not found for ${model} model. Run: npm run analyze:${model}`);
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

    loadBlogData(selectedModel);
  }, [selectedModel]);

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
          <div className="mb-6 flex items-center gap-4">
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
                • Gemma: <span className="text-gray-900 dark:text-gray-50">GITHUB_TOKEN=your_token npm run analyze:gemma</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400 ml-4">
                • Ministral: <span className="text-gray-900 dark:text-gray-50">GITHUB_TOKEN=your_token npm run analyze:ministral</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                4. Commit and push: <span className="text-gray-900 dark:text-gray-50">git add public/blog-data-*.json && git commit -m &quot;chore: update blog data&quot;</span>
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
