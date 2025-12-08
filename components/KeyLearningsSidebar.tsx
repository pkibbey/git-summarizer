'use client';

interface KeyLearningsSidebarProps {
  learnings: string[];
}

export function KeyLearningsSidebar({ learnings }: KeyLearningsSidebarProps) {
  if (!learnings || learnings.length === 0) return null;

  return (
    <aside className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-lg border border-amber-200 dark:border-amber-800 p-6 h-fit sticky top-6">
      <h3 className="text-lg font-bold text-amber-950 dark:text-amber-50 mb-4 flex items-center gap-2">
        <span className="text-2xl">⚡</span>
        Key Learnings
      </h3>
      <ul className="space-y-3">
        {learnings.map((learning, idx) => (
          <li
            key={idx}
            className="text-sm leading-relaxed text-amber-900 dark:text-amber-100 p-3 rounded bg-white dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800"
          >
            {learning}
          </li>
        ))}
      </ul>
    </aside>
  );
}
