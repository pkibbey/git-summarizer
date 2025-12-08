"use client";

import { useState } from 'react';
import type { Commit } from '@/lib/types';
import { CommitCard } from './CommitCard';
import { ChevronsUpDownIcon } from './ui/chevrons-up-down';
import { ChevronsDownUpIcon } from './ui/chevrons-down-up';

interface CommitSidebarProps {
  commits: Commit[];
}

export default function CommitSidebar({ commits }: CommitSidebarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    // Desktop-only, narrow sticky right column
    <aside className="hidden lg:block shrink-0">
      <div className="sticky top-24 h-[calc(100vh-6rem)]">
        <div className="bg-white/80 dark:bg-black/60 backdrop-blur rounded-lg border border-gray-200 dark:border-gray-800 p-3 shadow-sm">
          <div className="flex items-center justify-between" onClick={() => setExpanded(!expanded)}
          >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Commits
              ({commits.length})
            </h3>
            <div>
              <button
                aria-expanded={expanded}
                onClick={() => setExpanded(!expanded)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
              >
                {expanded ? <ChevronsDownUpIcon size={20} /> : <ChevronsUpDownIcon size={20} />}
                <span className="sr-only">{expanded ? 'Hide' : 'Show'} commits</span>
              </button>
            </div>
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
    </aside>
  );
}
