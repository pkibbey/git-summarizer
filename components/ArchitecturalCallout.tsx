'use client';

import type { ArchitecturalCallout } from '@/lib/types';

interface ArchitecturalCalloutComponentProps {
  callout: ArchitecturalCallout;
}

const typeStyles: { [key: string]: { bg: string; border: string; icon: string } } = {
  'design-decision': {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-300 dark:border-blue-700',
    icon: '✦',
  },
  'pattern-used': {
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-300 dark:border-purple-700',
    icon: '◈',
  },
  'performance-insight': {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-300 dark:border-green-700',
    icon: '⚡',
  },
  learning: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-300 dark:border-amber-700',
    icon: '💡',
  },
};

export function ArchitecturalCalloutComponent({
  callout,
}: ArchitecturalCalloutComponentProps) {
  const style = typeStyles[callout.type] || typeStyles.learning;

  return (
    <div className={`rounded border-l-3 p-5 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-2">
        <span className="text-xl">{style.icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-base text-gray-900 dark:text-gray-50 mb-2">
            {callout.title}
          </h4>
          <p className="text-base text-gray-700 dark:text-gray-300 mt-1">
            {callout.description}
          </p>
        </div>
      </div>
    </div>
  );
}
