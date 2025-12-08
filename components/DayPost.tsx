"use client";

import type { DayPost } from '@/lib/types';
import { CommitCard } from './CommitCard';
import { DailySummary } from './DailySummary';
import KeyDecisions from './KeyDecisions';
import { InsightsAndLearnings } from './InsightsAndLearnings';
import { useState } from 'react';
import CommitSidebar from './CommitSidebar';

interface DayPostProps {
  day: DayPost;
}

export function DayPost({ day }: DayPostProps) {
  // commits are visible on mobile (small screens) via the inline collapsible
  // on wider screens a dedicated sticky right sidebar will display commits
  const [showMobileCommits, setShowMobileCommits] = useState(false);

  // Combine architectural insights into a single array
  const allInsights = day.architecturalCallouts.map((callout) => ({
    title: callout.title,
    description: callout.description,
    type: callout.type as 'design-decision' | 'pattern-used' | 'performance-insight' | 'learning',
  }));

  return (
    <div id={`day-${day.date}`} className="max-w-3xl mb-12 pb-12 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
      <DailySummary text={day.aiSummary} />

      <KeyDecisions decisions={day.keyDecisions} />

      {/* Insights & Learnings */}
      {allInsights.length > 0 && (
        <InsightsAndLearnings items={allInsights} />
      )}

      {/* Mobile-only commits UI (desktop uses right sticky sidebar) */}
      <div className="mb-6 md:hidden">
        <button
          onClick={() => setShowMobileCommits(!showMobileCommits)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-4"
        >
          <span className={`transform transition-transform ${showMobileCommits ? 'rotate-90' : ''}`}>
            ▶
          </span>
          Commits ({day.commits.length})
        </button>
        {showMobileCommits && (
          <div className="space-y-3 pl-0">
            {day.commits.map((commit) => (
              <CommitCard key={commit.hash} commit={commit} />
            ))}
          </div>
        )}
        {!showMobileCommits && (
          <p className="text-xs text-gray-500 dark:text-gray-400">On larger screens, commits are shown in a sticky right-hand panel.</p>
        )}
      </div>
      <CommitSidebar commits={day!.commits} />
    </div>
  );
}
