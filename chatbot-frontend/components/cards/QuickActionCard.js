export default function QuickActionCard({ icon, title, description }) {
  return (
    <button
      className="rounded-2xl border border-gray-200 p-5 text-left w-full bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="text-3xl mb-3">{icon}</div>

      <h3 className="text-lg font-semibold text-gray-800">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>
    </button>
  );
}