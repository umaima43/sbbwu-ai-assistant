import QuickActionCards from "../cards/QuickActionCards";

type Props = {
  onQuickAsk?: (question: string) => void;
};

export default function WelcomeSection({ onQuickAsk }: Props) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="py-6 text-center">
        <p className="mb-2 text-4xl">👋</p>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Assalamualaikum!
        </h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          How can I help you today?
        </p>
      </div>
      <QuickActionCards onQuickAsk={onQuickAsk} />
    </div>
  );
}
