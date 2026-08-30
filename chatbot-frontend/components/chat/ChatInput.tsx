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

    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="w-full">
      {/* Input container */}
      <div
        className={`flex w-full items-center gap-2 rounded-2xl bg-gray-50 shadow-sm transition-all dark:bg-gray-800 ${
          isCentered
            ? "border-2 border-[#A10D5A] px-3 py-3 shadow-md sm:gap-3 sm:border-4 sm:px-6 sm:py-6 md:px-8 md:py-7"
            : "border-2 border-[#A10D5A] px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-4"
        }`}
      >
        {/* Attachment */}
        <button
          type="button"
          disabled={disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#FCE4EF] hover:text-[#A10D5A] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
          aria-label="Attach file"
        >
          <Paperclip
            size={18}
            className="sm:h-5 sm:w-5"
          />
        </button>

        {/* Text input */}
        <input
          type="text"
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          placeholder="Ask anything about SBBWU..."
          className="min-w-0 flex-1 bg-transparent px-1 text-sm text-gray-800 outline-none placeholder:text-xs placeholder:text-gray-400 sm:text-base sm:placeholder:text-sm dark:text-gray-100"
        />

        {/* Send */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#A10D5A] text-white transition hover:bg-[#870B4C] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:w-11"
          aria-label="Send message"
        >
          <SendHorizontal
            size={18}
            className="sm:h-5 sm:w-5"
          />
        </button>
      </div>

      {/* Disclaimer */}
      <p className="mt-2 px-2 text-center text-[10px] leading-relaxed text-gray-400 sm:text-xs">
        SBBWU Assistant can make mistakes. Please verify important
        information.
      </p>
    </div>
  );
}
