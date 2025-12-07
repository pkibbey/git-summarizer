export default function Home() {
  return (
    <div className="border-b border-border bg-white dark:bg-black py-8">
      <div className="w-full max-w-4xl mx-auto px-6 py-12 sm:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50">
          Peak Blooms
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
          A 2-week journey building a fully featured website. Documenting the daily progress,
          architectural decisions, and learnings through git commits and AI-powered analysis.
        </p>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-4">
          This site demonstrates user-centric design thinking, software quality principles,
          and thoughtful engineering decisions that make great products.
        </p>
      </div>
    </div>
  );
}
