"use client";

import { useState } from "react";
import { Paperclip, SendHorizontal } from "lucide-react";

export default function ChatInput({ onSend }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-gray-100">
        <button className="text-gray-400 hover:text-[#A10D5A] transition-colors">
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Ask anything about SBBWU..."
          className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-gray-800"
        />

        <button
          onClick={handleSend}
          className="bg-[#A10D5A] text-white p-3 rounded-xl hover:bg-[#870B4C] transition-colors"
        >
          <SendHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}