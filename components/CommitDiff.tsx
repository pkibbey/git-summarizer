'use client';

import type { Commit } from '@/lib/types';

interface CommitDiffProps {
  commit: Commit;
}

export function CommitDiff({ commit }: CommitDiffProps) {
  const isDiffAvailable = commit.shortDiff && commit.shortDiff.length > 0;

  if (!isDiffAvailable) {
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 p-3 rounded font-mono">
        No diff content available
      </div>
    );
  }

  return (
    <div className="overflow-auto bg-gray-900 dark:bg-gray-950 rounded border border-gray-700 dark:border-gray-800">
      <pre className="text-xs text-gray-100 p-4 font-mono whitespace-pre-wrap wrap-break-word">
        {commit.shortDiff}
      </pre>
    </div>
  );
}
