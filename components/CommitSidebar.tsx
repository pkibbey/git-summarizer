"use client";

import { useState } from 'react';
import type { Commit } from '@/lib/types';
import { CommitCard } from './CommitCard';

interface CommitSidebarProps {
  commits: Commit[];
}

export default function CommitSidebar({ commits }: CommitSidebarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    // Desktop-only, narrow sticky right column
    <aside className="hidden lg:block shrink-0">
      <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pr-2 pl-2">
        <div className="bg-white/80 dark:bg-black/60 backdrop-blur rounded-lg border border-gray-200 dark:border-gray-800 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Commits</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">{commits.length}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Show commits</span>
              <button
                aria-expanded={expanded}
                onClick={() => setExpanded(!expanded)}
                className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                {expanded ? 'Hide' : 'Show'}
              </button>
            </div>

            {expanded && (
              <div className="mt-2 space-y-3">
                {commits.map((c) => (
                  <CommitCard key={c.hash} commit={c} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
