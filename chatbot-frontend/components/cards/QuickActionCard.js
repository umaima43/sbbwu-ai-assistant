export default function QuickActionCard({ icon, title, description }) {
  return (
    <button
      className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 text-left w-full bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="text-3xl mb-3">{icon}</div>

      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </button>
  );
}