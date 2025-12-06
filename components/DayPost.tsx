'use client';

import type { DayPost } from '@/lib/types';
import { CommitCard } from './CommitCard';
import { ArchitecturalCalloutComponent } from './ArchitecturalCallout';

interface DayPostProps {
  day: DayPost;
}

export function DayPost({ day }: DayPostProps) {
  return (
    <div className="mb-12 pb-12 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
          {day.dayOfWeek}, {day.date}
        </h2>
        <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
          <span>{day.stats.totalCommits} commit{day.stats.totalCommits !== 1 ? 's' : ''}</span>
          <span>{day.stats.filesChanged} file{day.stats.filesChanged !== 1 ? 's' : ''}</span>
          <span className="text-green-600 dark:text-green-400">+{day.stats.additions}</span>
          <span className="text-red-600 dark:text-red-400">-{day.stats.deletions}</span>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-2">
          Daily Summary
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {day.aiSummary}
        </p>
      </div>

      {/* Key Decisions */}
      {day.keyDecisions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3">
            Key Decisions
          </h3>
          <ul className="space-y-2">
            {day.keyDecisions.map((decision, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-gray-400">→</span>
                <span>{decision}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Architectural Callouts */}
      {day.architecturalCallouts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3">
            Architectural Insights
          </h3>
          {day.architecturalCallouts.map((callout, idx) => (
            <ArchitecturalCalloutComponent key={idx} callout={callout} />
          ))}
        </div>
      )}

      {/* Learnings */}
      {day.learnings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3">
            Key Learnings
          </h3>
          <ul className="space-y-2">
            {day.learnings.map((learning, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-amber-600 dark:text-amber-400">⚡</span>
                <span>{learning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Commits */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3">
          Commits ({day.commits.length})
        </h3>
        <div className="space-y-3">
          {day.commits.map((commit) => (
            <CommitCard key={commit.hash} commit={commit} />
          ))}
        </div>
      </div>
    </div>
  );
}
