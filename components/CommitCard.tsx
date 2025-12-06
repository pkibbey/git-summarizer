'use client';

import { useState } from 'react';
import type { Commit } from '@/lib/types';
import { CommitDiff } from './CommitDiff';

interface CommitCardProps {
  commit: Commit;
}

export function CommitCard({ commit }: CommitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const commitUrl = `https://github.com/pkibbey/peak-blooms/commit/${commit.hash}`;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <a
              href={commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {commit.hash.slice(0, 7)}
            </a>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(commit.date)}
            </span>
          </div>
          <p className="text-sm text-gray-900 dark:text-gray-50 font-medium mb-1">
            {commit.message}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            by {commit.author}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-xs bg-gray-100 dark:bg-gray-900 rounded px-2 py-1 whitespace-nowrap">
            <span className="text-green-600 dark:text-green-400">+{commit.stats.additions}</span>
            {' '}
            <span className="text-red-600 dark:text-red-400">-{commit.stats.deletions}</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            {isExpanded ? 'Hide' : 'Show'} ({commit.stats.filesChanged})
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
              Files Changed
            </h4>
            <div className="space-y-1">
              {commit.files.map((file, idx) => (
                <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="inline-block w-12 text-right text-green-600 dark:text-green-400">
                    +{file.additions}
                  </span>
                  <span className="inline-block w-12 text-right text-red-600 dark:text-red-400">
                    -{file.deletions}
                  </span>
                  <span className="text-gray-500">{file.status}</span>
                  <code className="flex-1 font-mono text-gray-900 dark:text-gray-50">
                    {file.path}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
              Diff Preview
            </h4>
            <CommitDiff commit={commit} />
          </div>
        </div>
      )}
    </div>
  );
}
