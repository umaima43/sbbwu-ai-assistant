
"use client";

import { useState } from "react";
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import BookmarkButton from "./BookmarkButton";
import IconTooltip from "./IconTooltip";

interface MessageFeedbackBarProps {
  question: string;
  answer: string;
  onFeedback?: (value: "up" | "down" | null) => void;
}

// Idle: gray icon, transparent, no box.
// Hover: icon outline turns pink — still transparent, no box.
// Active: icon itself becomes a SOLID filled pink glyph — no background box at all.
const iconColorClasses = (active: boolean) =>
  `transition-colors duration-150 ${
    active
      ? "text-[#A10D5A] dark:text-[#F4B8D8]"
      : "text-gray-500 hover:text-[#A10D5A] dark:text-gray-400 dark:hover:text-[#F4B8D8]"
  }`;

export default function MessageFeedbackBar({
  question,
  answer,
  onFeedback,
}: MessageFeedbackBarProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleFeedback = (value: "up" | "down") => {
    const next = feedback === value ? null : value;
    setFeedback(next);
    onFeedback?.(next);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — fail silently.
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {/* Copy */}
      <div className="group relative">
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy answer"
          className={
            copied
              ? "inline-flex h-9 items-center gap-1.5 rounded-lg px-1 text-xs font-bold text-[#A10D5A] transition-colors duration-150 dark:text-[#F4B8D8]"
              : `inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconColorClasses(false)}`
          }
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-4 w-4" />}
          {copied && "Copied"}
        </button>
        {!copied && <IconTooltip label="Copy" />}
      </div>

      {/* Helpful */}
      <div className="group relative">
        <button
          type="button"
          onClick={() => toggleFeedback("up")}
          aria-pressed={feedback === "up"}
          aria-label="Helpful"
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconColorClasses(feedback === "up")}`}
        >
          <ThumbsUp className="h-4 w-4" fill={feedback === "up" ? "currentColor" : "none"} />
        </button>
        <IconTooltip label="Helpful" />
      </div>

      {/* Not Helpful */}
      <div className="group relative">
        <button
          type="button"
          onClick={() => toggleFeedback("down")}
          aria-pressed={feedback === "down"}
          aria-label="Not helpful"
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconColorClasses(feedback === "down")}`}
        >
          <ThumbsDown className="h-4 w-4" fill={feedback === "down" ? "currentColor" : "none"} />
        </button>
        <IconTooltip label="Not helpful" />
      </div>

      {/* Bookmark — keeps its text label */}
      <BookmarkButton question={question} answer={answer} />
    </div>
  );
}