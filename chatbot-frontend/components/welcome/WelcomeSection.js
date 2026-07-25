import QuickActionCards from "../cards/QuickActionCards";

export default function WelcomeSection() {
  return (
    <div className="max-w-5xl mx-auto">

      {/* Welcome */}
      <div className="text-center py-6">

        <p className="text-4xl mb-2">👋</p>

        <h1 className="text-3xl font-bold text-gray-800">
          Assalamualaikum!
        </h1>

        <p className="mt-2 text-lg text-gray-500">
          How can I help you today?
        </p>

      </div>

      {/* Cards */}
      <QuickActionCards />

    </div>
  );
}