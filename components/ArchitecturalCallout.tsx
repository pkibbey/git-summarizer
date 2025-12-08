'use client';

interface CardItem {
  title: string;
  description: string;
  type: 'design-decision' | 'pattern-used' | 'performance-insight' | 'learning';
}

interface InsightCardComponentProps {
  item: CardItem;
}

const typeStyles: { [key: string]: { bg: string; border: string; textColor: string; titleColor: string; icon: string; badgeBg: string; badgeText: string } } = {
  'design-decision': {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-900 dark:text-blue-100',
    titleColor: 'text-blue-950 dark:text-blue-50',
    icon: '✦',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/60',
    badgeText: 'text-blue-700 dark:text-blue-200',
  },
  'pattern-used': {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-900 dark:text-purple-100',
    titleColor: 'text-purple-950 dark:text-purple-50',
    icon: '◈',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/60',
    badgeText: 'text-purple-700 dark:text-purple-200',
  },
  'performance-insight': {
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-900 dark:text-green-100',
    titleColor: 'text-green-950 dark:text-green-50',
    icon: '⚡',
    badgeBg: 'bg-green-100 dark:bg-green-900/60',
    badgeText: 'text-green-700 dark:text-green-200',
  },
  learning: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-900 dark:text-amber-100',
    titleColor: 'text-amber-950 dark:text-amber-50',
    icon: '💡',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/60',
    badgeText: 'text-amber-700 dark:text-amber-200',
  },
};

const typeLabels: { [key: string]: string } = {
  'design-decision': 'Design',
  'pattern-used': 'Pattern',
  'performance-insight': 'Performance',
  learning: 'Learning',
};

export function InsightCardComponent({
  item,
}: InsightCardComponentProps) {
  const style = typeStyles[item.type] || typeStyles.learning;
  const label = typeLabels[item.type] || 'Note';

  return (
    <div className={`rounded-lg border-2 p-6 ${style.bg} ${style.border} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-0.5">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className={`font-bold text-sm ${style.titleColor} flex-1`}>
              {item.title}
            </h4>
            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${style.badgeBg} ${style.badgeText}`}>
              {label}
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${style.textColor}`}>
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// For backward compatibility with existing ArchitecturalCallout imports
import type { ArchitecturalCallout } from '@/lib/types';

interface ArchitecturalCalloutComponentProps {
  callout: ArchitecturalCallout;
}

export function ArchitecturalCalloutComponent({
  callout,
}: ArchitecturalCalloutComponentProps) {
  return (
    <InsightCardComponent
      item={{
        title: callout.title,
        description: callout.description,
        type: callout.type,
      }}
    />
  );
}
