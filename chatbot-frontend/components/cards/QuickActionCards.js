import QuickActionCard from "./QuickActionCard";

export default function QuickActionCards() {
  const cards = [
    {
      icon: "🎓",
      title: "Admissions",
      description: "Admission process and eligibility.",
    },
    {
      icon: "🏛️",
      title: "Departments",
      description: "Explore academic departments.",
    },
    {
      icon: "💰",
      title: "Scholarships",
      description: "View available scholarships.",
    },
    {
      icon: "📖",
      title: "Fee Structure",
      description: "Check tuition and other fees.",
    },
    {
      icon: "🏠",
      title: "Hostel",
      description: "Hostel facilities and rules.",
    },
    {
      icon: "📅",
      title: "Academic Calendar",
      description: "Important university dates.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
      {cards.map((card) => (
        <QuickActionCard
          key={card.title}
          icon={card.icon}
          title={card.title}
          description={card.description}
        />
      ))}
    </div>
  );
}