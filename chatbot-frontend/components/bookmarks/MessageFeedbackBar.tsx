"use client";

import { useState } from "react";
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import BookmarkButton from "./BookmarkButton";
import IconTooltip from "./IconTooltip";

interface MessageFeedbackBarProps {
  messageId?: number;
  question: string;
  answer: string;
  onFeedback?: (value: "up" | "down" | null) => void;
}

const API_URL = "";

const iconColorClasses = (active: boolean) =>
  `transition-colors duration-150 ${
    active
      ? "text-[#A10D5A] dark:text-[#F4B8D8]"
      : "text-black hover:text-[#A10D5A] dark:text-white dark:hover:text-[#F4B8D8]"
  }`;

export default function MessageFeedbackBar({
  messageId,
  question,
  answer,
  onFeedback,
}: MessageFeedbackBarProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const toggleFeedback = async (value: "up" | "down") => {
    if (!messageId || submitting) return;

    const next = feedback === value ? null : value;

    try {
      setSubmitting(true);

      // If clicking the same button again, remove the local selection.
      // The backend currently accepts only positive true/false,
      // so nothing is sent when clearing the selection.
      if (next === null) {
        setFeedback(null);
        onFeedback?.(null);
        return;
      }

      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          message_id: messageId,
          positive: next === "up",
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail ||
            `Feedback API error: ${response.status} ${response.statusText}`
        );
      }

      // Keep the existing selected-button behavior.
      setFeedback(next);
      onFeedback?.(next);

      // Show temporary thank-you popup.
      setShowThankYou(true);

      // Hide it automatically after 2 seconds.
      setTimeout(() => {
        setShowThankYou(false);
      }, 2000);
    } catch (error) {
      console.error("Feedback submission failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
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
              : `inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconColorClasses(
                  false
                )}`
          }
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-[18px] w-[18px] stroke-[2.5]" />
          )}

          {copied && "Copied"}
        </button>

        {!copied && <IconTooltip label="Copy" />}
      </div>

      {/* Helpful */}
      <div className="group relative">
        <button
          type="button"
          onClick={() => toggleFeedback("up")}
          disabled={!messageId || submitting}
          aria-pressed={feedback === "up"}
          aria-label="Helpful"
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconColorClasses(
            feedback === "up"
          )} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <ThumbsUp
            className="h-[18px] w-[18px] stroke-[2.5]"
            fill={feedback === "up" ? "currentColor" : "none"}
          />
        </button>

        <IconTooltip label="Helpful" />
      </div>

      {/* Not Helpful */}
      <div className="group relative">
        <button
          type="button"
          onClick={() => toggleFeedback("down")}
          disabled={!messageId || submitting}
          aria-pressed={feedback === "down"}
          aria-label="Not helpful"
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconColorClasses(
            feedback === "down"
          )} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <ThumbsDown
            className="h-[18px] w-[18px] stroke-[2.5]"
            fill={feedback === "down" ? "currentColor" : "none"}
          />
        </button>

        <IconTooltip label="Not helpful" />
      </div>

      {/* Temporary Thank You Popup */}
      {showThankYou && (
        <div
          className="
            fixed
            bottom-6
            left-1/2
            z-50
            -translate-x-1/2
            rounded-lg
            bg-[#A10D5A]
            px-4
            py-2.5
            text-xs
            font-semibold
            text-white
            shadow-lg
            animate-in
            fade-in
            slide-in-from-bottom-2
            duration-200
            dark:bg-[#F4B8D8]
            dark:text-[#3a1b2d]
          "
        >
          Thanks for your feedback!
        </div>
      )}

      {/* Bookmark */}
      <BookmarkButton question={question} answer={answer} />
    </div>
  );
}
