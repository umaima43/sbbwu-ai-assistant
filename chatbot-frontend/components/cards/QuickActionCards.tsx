"use client";

import { GraduationCap, Landmark, Wallet, Home } from "lucide-react";
import type { ElementType } from "react";

type QuickAction = {
  icon: ElementType;
  question: string;
};

const quickActions: QuickAction[] = [
  {
    icon: GraduationCap,
    question: "How can I contact the Examination Section?",
  },
  {
    icon: Landmark,
    question: "What is the history of SBBWU?",
  },
  {
    icon: Wallet,
    question: "Who is the head of the CS department?",
  },
  {
    icon: Home,
    question: "What should I do after admission?",
  },
];

type Props = {
  onQuickAsk?: (question: string) => void;
};

export default function QuickActionCards({ onQuickAsk }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {quickActions.map(({ icon: Icon, question }) => (
        <button
          key={question}
          type="button"
          onClick={() => onQuickAsk?.(question)}
          className="
            group relative flex min-h-[78px] items-center gap-4
            overflow-hidden rounded-xl
            border-[3px] border-[#A10D5A]/70
            bg-white dark:bg-[#1c1c1c]
            px-5 py-4
            text-left
            shadow-sm
            transition-all duration-300
            hover:-translate-y-0.5
            hover:border-[#A10D5A]
            hover:shadow-lg hover:shadow-[#A10D5A]/10
            dark:hover:bg-[#3a1b2d]
          "
        >
          {/* Icon */}
          <span
            className="
              relative flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-lg
              bg-[#A10D5A]
              text-white
              shadow-sm
            "
          >
            <Icon size={19} strokeWidth={2} />
          </span>

          {/* Question */}
          <span
            className="
              text-sm font-bold
              leading-5 text-[#252525]
              dark:text-gray-100
            "
          >
            {question}
          </span>

          {/* Arrow */}
          <span
            className="
              ml-auto flex h-7 w-7 shrink-0
              items-center justify-center
              rounded-full
              text-gray-300
              transition-all duration-300
              group-hover:bg-[#A10D5A]/10
              group-hover:text-[#A10D5A]
              dark:text-gray-500
              dark:group-hover:bg-[#A10D5A]/20
              dark:group-hover:text-[#F4B8D8]
            "
          >
            →
          </span>
        </button>
      ))}
    </div>
  );
}
