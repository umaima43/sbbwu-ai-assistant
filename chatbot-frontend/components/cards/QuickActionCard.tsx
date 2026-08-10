type Props = {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
};

export default function QuickActionCard({
  icon,
  title,
  description,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 font-bold text-gray-800 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </button>
  );
}
