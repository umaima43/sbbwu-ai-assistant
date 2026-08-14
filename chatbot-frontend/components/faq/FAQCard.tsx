"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  MessageCircle,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";

interface FAQCardProps {
  question: string;
  answer: string;
}

export default function FAQCard({
  question,
  answer,
}: FAQCardProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);
  const [showHelpAlert, setShowHelpAlert] = useState(false);

  const handleAskAssistant = () => {
    
    // router.push(`/?question=${encodeURIComponent(question)}`);
      router.push(`/chat?question=${encodeURIComponent(question)}`);
  };

  const handleNotHelpful = () => {
    const nextFeedback = feedback === "no" ? null : "no";
    setFeedback(nextFeedback);

    if (nextFeedback === "no") {
      setShowHelpAlert(true);
    }
  };
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 dark:bg-gray-900 ${
        isOpen
          ? "border-[#A10D5A]/25 shadow-md"
          : "border-gray-200 shadow-sm hover:shadow-md dark:border-gray-800"
      }`}
    >
      {/* =====================================================
          QUESTION HEADER
      ====================================================== */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors sm:px-6 ${
          isOpen
            ? "bg-[#A10D5A]/5"
            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
        }`}
        aria-expanded={isOpen}
      >
        <span
          className={`text-base font-semibold leading-6 sm:text-[17px] ${
            isOpen
              ? "text-[#A10D5A]"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {question}
        </span>

        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            isOpen
              ? "bg-[#A10D5A] text-white"
              : "bg-[#A10D5A]/10 text-[#A10D5A]"
          }`}
        >
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {/* Expanded answer */}
      {isOpen && (
        <div className="border-t border-[#F4D4E4] bg-gradient-to-b from-[#FFF9FC] to-white px-5 py-6 dark:border-[#4A1C32] dark:from-[#24111C] dark:to-[#1B1018] sm:px-6">
          {/* Answer — styled to match saved bookmark answers */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A10D5A] text-white shadow-md shadow-[#A10D5A]/20">
                <Sparkles className="h-5 w-5" fill="currentColor" />
              </div>
              <div>
                <p className="text-[19px] font-extrabold tracking-tight text-[#A10D5A] dark:text-[#F4B8D8]">
                  Answer
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  SBBWU Assistant response
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-[#F4B8D8] bg-gradient-to-br from-[#FFF8FB] to-white px-6 py-5 shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-[#7E174B] dark:from-[#2A111E] dark:to-[#221019]">
              <p className="whitespace-pre-wrap text-[16px] font-semibold leading-8 tracking-[0.01em] text-gray-900 dark:text-white">
                {answer}
              </p>
            </div>
          </div>

          {/* Feedback */}
          <div className="mt-7 border-t border-gray-100 pt-6 dark:border-gray-800">
              <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                Was this answer helpful?
              </p>

              <div className="flex items-center gap-2">
                <div className="group relative">
                  <button
                    type="button"
                    onClick={() => setFeedback(feedback === "yes" ? null : "yes")}
                    aria-label="Helpful"
                    aria-pressed={feedback === "yes"}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 ${
                      feedback === "yes"
                        ? "text-[#A10D5A] dark:text-[#F4B8D8]"
                        : "text-gray-500 hover:text-[#A10D5A] dark:text-gray-400 dark:hover:text-[#F4B8D8]"
                    }`}
                  >
                    <ThumbsUp className="h-5 w-5" fill={feedback === "yes" ? "currentColor" : "none"} />
                  </button>
                  <span role="tooltip" className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#A10D5A] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg shadow-[#A10D5A]/30 transition-all duration-150 group-hover:translate-y-0.5 group-hover:opacity-100">
                    Helpful
                  </span>
                </div>

                <div className="group relative">
                  <button
                    type="button"
                    onClick={handleNotHelpful}
                    aria-label="Not helpful"
                    aria-pressed={feedback === "no"}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 ${
                      feedback === "no"
                        ? "text-[#A10D5A] dark:text-[#F4B8D8]"
                        : "text-gray-500 hover:text-[#A10D5A] dark:text-gray-400 dark:hover:text-[#F4B8D8]"
                    }`}
                  >
                    <ThumbsDown className="h-5 w-5" fill={feedback === "no" ? "currentColor" : "none"} />
                  </button>
                  <span role="tooltip" className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#A10D5A] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg shadow-[#A10D5A]/30 transition-all duration-150 group-hover:translate-y-0.5 group-hover:opacity-100">
                    Not helpful
                  </span>
                </div>
              </div>
            </div>

          <div className="mt-7 rounded-2xl border border-[#A10D5A]/15 bg-[#A10D5A]/5 p-5 dark:bg-[#A10D5A]/10">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Still need help?
              </p>

              <p className="mt-1.5 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Ask the SBBWU Assistant for a more specific answer
                to your question.
              </p>

              <button
                type="button"
                onClick={handleAskAssistant}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#A10D5A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#8F0B50] hover:shadow-md"
              >
                <MessageCircle className="h-4 w-4" />
                Ask SBBWU Assistant
              </button>
          </div>
        </div>
      )}

      {showHelpAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-alert-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#A10D5A]/30 bg-[#FFF0F7] p-6 shadow-2xl dark:bg-[#4A1C32]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="help-alert-title" className="text-lg font-bold text-[#A10D5A] dark:text-[#F4B8D8]">
                  Need more help?
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-100">
                  Ask the SBBWU Assistant for a more detailed answer.
                </p>
              </div>
              <button type="button" onClick={() => setShowHelpAlert(false)} aria-label="Close alert" className="text-[#A10D5A] hover:text-[#8F0B50] dark:text-[#F4B8D8]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <button type="button" onClick={handleAskAssistant} className="mt-5 rounded-xl bg-[#A10D5A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8F0B50]">
              Ask SBBWU Assistant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
