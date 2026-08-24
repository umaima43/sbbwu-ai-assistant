// "use client";

// import { GraduationCap, Landmark, Wallet, Home } from "lucide-react";
// import type { ElementType } from "react";

// type QuickAction = {
//   icon: ElementType;
//   question: string;
// };

// const quickActions: QuickAction[] = [
//   {
//     icon: GraduationCap,
//     question: "How do I apply for admission?",
//   },
//   {
//     icon: Landmark,
//     question: "What departments are available at SBBWU?",
//   },
//   {
//     icon: Wallet,
//     question: "What is the fee structure at SBBWU?",
//   },
//   {
//     icon: Home,
//     question: "What are the hostel facilities and rules?",
//   },
// ];

// type Props = {
//   onQuickAsk?: (question: string) => void;
// };

// export default function QuickActionCards({ onQuickAsk }: Props) {
//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//       {quickActions.map(({ icon: Icon, question }) => (
//         <button
//           key={question}
//           type="button"
//           onClick={() => onQuickAsk?.(question)}
//           className="group relative flex items-center gap-3 overflow-hidden rounded-xl bg-[#8C0A3E] px-4 py-3.5 text-left shadow-md shadow-[#A80D4F]/25 ring-1 ring-white/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#A80D4F]/40"
//         >
//           {/* base wrap: diagonal pink gradient */}
//           <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#D4166E] via-[#A80D4F] to-[#5E0729]" />

//           {/* soft white light wrapping in from the top-right corner */}
//           <span className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/25 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />

//           {/* faint bottom-left glow for balance */}
//           <span className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-[#FF3D8E]/20 blur-2xl" />

//           {/* hairline top edge to sell a glassy wrap */}
//           <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/30" />

//           {/* Icon */}
//           <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white text-[#A10D5A] shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-white">
//             <Icon size={18} />
//           </span>

//           {/* Question */}
//           <span className="relative text-sm font-semibold text-white">
//             {question}
//           </span>
//         </button>
//       ))}
//     </div>
//   );
// }


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
    question: "How do I apply for admission?",
  },
  {
    icon: Landmark,
    question: "What departments are available at SBBWU?",
  },
  {
    icon: Wallet,
    question: "What is the fee structure at SBBWU?",
  },
  {
    icon: Home,
    question: "What are the hostel facilities and rules?",
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
  bg-white
  px-5 py-4
  text-left
  shadow-sm
  transition-all duration-300
  hover:-translate-y-0.5
  hover:border-[#A10D5A]
  hover:shadow-lg hover:shadow-[#A10D5A]/10
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
            "
          >
            →
          </span>
        </button>
      ))}
    </div>
  );
}