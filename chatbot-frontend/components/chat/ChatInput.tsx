

// "use client";

// import { useState } from "react";
// import { Paperclip, SendHorizontal } from "lucide-react";

// type Props = {
//   onSend: (text: string) => void;
//   disabled?: boolean;
//   variant?: "default" | "centered";
// };

// export default function ChatInput({ onSend, disabled, variant = "default" }: Props) {
//   const [input, setInput] = useState("");
//   const isCentered = variant === "centered";

//   const handleSend = () => {
//     if (!input.trim() || disabled) return;
//     onSend(input);
//     setInput("");
//   };

//   return (
//     <div className="w-full">
//       <div
//         className={`flex items-center gap-3 rounded-2xl border-2 border-[#A10D5A] bg-gray-50 px-4 py-3 shadow-sm dark:bg-gray-800 ${
//           isCentered ? "shadow-md" : ""
//         }`}
//       >
//         <button
//           type="button"
//           className="text-gray-400 transition hover:text-[#A10D5A]"
//           aria-label="Attach file"
//         >
//           <Paperclip size={20} />
//         </button>
//         <input
//           type="text"
//           value={input}
//           disabled={disabled}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSend()}
//           placeholder="Ask anything about SBBWU..."
//           className="flex-1 bg-transparent text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100"
//         />
//         <button
//           type="button"
//           onClick={handleSend}
//           disabled={disabled}
//           className="rounded-xl bg-[#A10D5A] p-3 text-white transition hover:bg-[#870B4C] disabled:opacity-50"
//           aria-label="Send message"
//         >
//           <SendHorizontal size={18} />
//         </button>
//       </div>
//       <p className="mt-2 text-center text-xs text-gray-400">
//         SBBWU Assistant can make mistakes. Please verify important information.
//       </p>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Paperclip, SendHorizontal } from "lucide-react";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
  variant?: "default" | "centered";
};

export default function ChatInput({
  onSend,
  disabled,
  variant = "default",
}: Props) {
  const [input, setInput] = useState("");
  const isCentered = variant === "centered";

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="w-full">
      <div
        className={`flex items-center gap-3 rounded-2xl bg-gray-50 shadow-sm dark:bg-gray-800 ${
          isCentered
            ? "border-4 border-[#A10D5A] px-8 py-8 shadow-md"
            : "border-3 border-[#A10D5A] px-5 py-4"
        }`}
      >
        <button
          type="button"
          className="text-gray-400 transition hover:text-[#A10D5A]"
          aria-label="Attach file"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything about SBBWU..."
          className="flex-1 bg-transparent text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={disabled}
          className="rounded-xl bg-[#A10D5A] p-3 text-white transition hover:bg-[#870B4C] disabled:opacity-50"
          aria-label="Send message"
        >
          <SendHorizontal size={18} />
        </button>
      </div>

      <p className="mt-2 text-center text-xs text-gray-400">
        SBBWU Assistant can make mistakes. Please verify important information.
      </p>
    </div>
  );
}