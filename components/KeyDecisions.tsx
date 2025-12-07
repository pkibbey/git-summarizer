"use client";

interface KeyDecisionsProps {
  decisions: string[];
  title?: string;
  className?: string;
}

export function KeyDecisions({
  decisions,
  title = 'Key Decisions',
  className = '',
}: KeyDecisionsProps) {
  if (!decisions || decisions.length === 0) return null;

  return (
    <div className={`mb-12 ${className}`}>
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-3">{title}</h3>
      <ul className="space-y-2">
        {decisions.map((decision, idx) => (
          <li key={idx} className="flex gap-3 text-xl text-gray-700 dark:text-gray-300">
            <span className="text-gray-400">→</span>
            <span>{decision}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default KeyDecisions;
