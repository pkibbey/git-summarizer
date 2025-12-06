'use client';

import type { BlogData } from '@/lib/types';
import { DayPost } from './DayPost';

interface BlogTimelineProps {
  blogData: BlogData;
}

export function BlogTimeline({ blogData }: BlogTimelineProps) {
  if (blogData.days.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No development days recorded yet. Run the blog generation script to populate data.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Generated on {new Date(blogData.generatedAt).toLocaleDateString()} at{' '}
          {new Date(blogData.generatedAt).toLocaleTimeString()}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Source:{' '}
          <a
            href={blogData.sourceRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {blogData.sourceRepo}
          </a>
        </p>
      </div>

      <div>
        {blogData.days.map((day) => (
          <DayPost key={day.date} day={day} />
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {blogData.days.length} development days • {blogData.days.reduce((acc, d) => acc + d.stats.totalCommits, 0)}{' '}
          commits
        </p>
      </div>
    </div>
  );
}
