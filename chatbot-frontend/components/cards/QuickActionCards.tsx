"use client";

import QuickActionCard from "./QuickActionCard";

type Props = {
  onQuickAsk?: (question: string) => void;
};

export default function QuickActionCards({ onQuickAsk }: Props) {
  const cards = [
    {
      icon: "🎓",
      title: "Admissions",
      description: "Admission process and eligibility.",
      q: "Tell me about the admission process at SBBWU.",
    },
    {
      icon: "🏛️",
      title: "Departments",
      description: "Explore academic departments.",
      q: "What departments are available at SBBWU?",
    },
    {
      icon: "💰",
      title: "Scholarships",
      description: "View available scholarships.",
      q: "What scholarships are available at SBBWU?",
    },
    {
      icon: "📖",
      title: "Fee Structure",
      description: "Check tuition and other fees.",
      q: "What is the fee structure at SBBWU?",
    },
    {
      icon: "🏠",
      title: "Hostel",
      description: "Hostel facilities and rules.",
      q: "Tell me about hostel facilities at SBBWU.",
    },
    {
      icon: "📅",
      title: "Academic Calendar",
      description: "Important university dates.",
      q: "What are the important academic calendar dates?",
    },
  ];

  return (
    <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <QuickActionCard
          key={card.title}
          icon={card.icon}
          title={card.title}
          description={card.description}
          onClick={() => onQuickAsk?.(card.q)}
        />
      ))}
    </div>
  );
}
