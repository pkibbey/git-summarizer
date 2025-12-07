"use client";

import type { DayPost } from '@/lib/types';
import { CommitCard } from './CommitCard';
import { ArchitecturalCalloutComponent } from './ArchitecturalCallout';
import { DailySummary } from './DailySummary';
import KeyDecisions from './KeyDecisions';

interface DayPostProps {
  day: DayPost;
}

export function DayPost({ day }: DayPostProps) {
  return (
    <div id={`day-${day.date}`} className="mb-12 pb-12 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
      {/* Daily Summary */}
      <DailySummary text={day.aiSummary} />

      {/* Key Decisions */}
      <KeyDecisions decisions={day.keyDecisions} />

      {/* Architectural Callouts */}
      {
        day.architecturalCallouts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3">
              Architectural Insights
            </h3>
            {day.architecturalCallouts.map((callout, idx) => (
              <ArchitecturalCalloutComponent key={idx} callout={callout} />
            ))}
          </div>
        )
      }

      {/* Learnings */}
      {
        day.learnings.length > 0 && (
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
        )
      }

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
