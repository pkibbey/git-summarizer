"use client";

interface InsightItem {
  title: string;
  description: string;
  type: 'design-decision' | 'pattern-used' | 'performance-insight' | 'learning';
}

interface InsightsAndLearningsProps {
  items: InsightItem[];
  title?: string;
  className?: string;
}

const typeStyles: { [key: string]: { badgeBg: string; badgeText: string; icon: string } } = {
  'design-decision': {
    badgeBg: 'bg-blue-100 dark:bg-blue-900/60',
    badgeText: 'text-blue-700 dark:text-blue-200',
    icon: '✦',
  },
  'pattern-used': {
    badgeBg: 'bg-purple-100 dark:bg-purple-900/60',
    badgeText: 'text-purple-700 dark:text-purple-200',
    icon: '◈',
  },
  'performance-insight': {
    badgeBg: 'bg-green-100 dark:bg-green-900/60',
    badgeText: 'text-green-700 dark:text-green-200',
    icon: '⚡',
  },
  learning: {
    badgeBg: 'bg-amber-100 dark:bg-amber-900/60',
    badgeText: 'text-amber-700 dark:text-amber-200',
    icon: '💡',
  },
};

const typeLabels: { [key: string]: string } = {
  'design-decision': 'Design',
  'pattern-used': 'Pattern',
  'performance-insight': 'Performance',
  learning: 'Learning',
};

export function InsightsAndLearnings({
  items,
  title = 'Insights & Learnings',
  className = '',
}: InsightsAndLearningsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`mb-12 ${className}`}>
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-6">{title}</h3>
      <div className="space-y-3 grid gap-2">
        {items.map((item, idx) => {
          const style = typeStyles[item.type] || typeStyles.learning;
          const label = typeLabels[item.type] || 'Note';

          return (
            <div key={idx} className="flex gap-3 items-start">
              <div className="flex-1 min-w-0">
                <div className="flex gap-4">
                  {item.title && (
                    <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">{item.title}</h4>
                  )}
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium whitespace-nowrap shrink-0 ${style.badgeBg} ${style.badgeText}`}>
                    {label}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
