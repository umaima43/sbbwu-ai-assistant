

"use client";
import { useState } from "react";
import {
  Bookmark,
  ChevronDown,
  MessageCircleQuestion,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { Bookmark as BookmarkType } from "@/lib/bookmarks/types";

interface BookmarkCardProps {
  bookmark: BookmarkType;
  onDelete: (id: string) => void;
}

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function BookmarkCard({
  bookmark,
  onDelete,
}: BookmarkCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded-3xl border transition-all duration-300 ${
        open
          ? "border-[#E9B3CF] bg-white shadow-xl shadow-[#A10D5A]/10 dark:border-[#5C1738] dark:bg-[#1F1F1F]"
          : "border-[#8C0C4E] bg-[#A10D5A] shadow-lg shadow-[#A10D5A]/20 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#A10D5A]/30"
      }`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`relative flex w-full items-center gap-4 px-5 py-4 text-left transition-all duration-300 ${
          open
            ? "bg-[#FFF8FB] dark:bg-[#2A111E]"
            : "hover:bg-white/5 backdrop-blur-sm"
        }`}
      >
        
        <div
  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
    open
      ? "bg-[#FCE4EF] text-[#A10D5A] dark:bg-[#3A1228] dark:text-[#F4B8D8]"
      : "bg-white/15 text-white backdrop-blur-md"
  }`}
>
  <Bookmark className="h-7 w-7" fill="currentColor" strokeWidth={2.2} />
</div>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-[15px] font-bold ${
              open ? "text-gray-900  dark:text-white" : "text-white"
            }`}
          >
            {bookmark.name}
          </p>

          <p
            className={`mt-1 truncate text-sm ${
              open
                ? "text-gray-500 dark:text-gray-400"
                : "text-white/75"
            }`}
          >
            {bookmark.question}
          </p>
        </div>

        {/* Date */}
<span
  className={`hidden shrink-0 text-sm font-semibold sm:block ${
    open
      ? "text-gray-500 dark:text-gray-400"
      : "text-white/80"
  }`}
>
  {formatDate(bookmark.createdAt)}
</span>

{/* Delete */}
<button
  type="button"
  onClick={(event) => {
    event.stopPropagation();
    onDelete(bookmark.id);
  }}
  aria-label="Delete bookmark"
  title="Delete bookmark"
  className={`group flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
    open
      ? "text-gray-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40"
      : "bg-white/15 text-white/80 hover:bg-white/25 hover:text-white"
  }`}
>
  <Trash2
    className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
    strokeWidth={2.3}
  />
</button>

{/* Expand Arrow */}
<div
  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
    open
      ? "bg-[#FCE4EF] text-[#A10D5A] dark:bg-[#3A1228] dark:text-[#F4B8D8]"
      : "bg-white/15 text-white/80 hover:bg-white/25 hover:text-white"
  }`}
>
  <ChevronDown
    strokeWidth={2.5}
    className={`h-5 w-5 transition-transform duration-300 ${
      open ? "rotate-180" : ""
    }`}
  />
</div>
      </button>

      {/* Expanded Content */}
    {open && (
  <div className="border-t border-[#F4D4E4] bg-gradient-to-b from-[#FFF9FC] to-white px-6 py-6 dark:border-[#4A1C32] dark:from-[#24111C] dark:to-[#1B1018]">
    {/* Question */}
    <div className="mb-7">
      <div className="mb-3 flex items-center gap-3">
        
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A10D5A] text-white shadow-md shadow-[#A10D5A]/25 dark:bg-[#A10D5A] dark:text-white">
  <MessageCircleQuestion className="h-5 w-5" />
</div>

        <div>
          
          <p className="text-[19px] font-extrabold tracking-tight text-[#A10D5A] dark:text-[#F4B8D8]">
  Question
</p>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your saved question
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#8C0C4E] bg-[#A10D5A] px-4 py-4 shadow-lg shadow-[#A10D5A]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#A10D5A]/30 sm:px-7 sm:py-6">
  <p className="text-[16px] font-semibold leading-8 tracking-[0.01em] text-white">
    {bookmark.question}
  </p>
</div>
    </div>

    {/* Answer */}
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
            Saved assistant response
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#F4B8D8] bg-gradient-to-br from-[#FFF8FB] to-white px-6 py-5 shadow-md transition-all duration-300 hover:shadow-lg dark:border-[#7E174B] dark:from-[#2A111E] dark:to-[#221019]">
        <p className="whitespace-pre-wrap text-[16px] font-semibold leading-8 tracking-[0.01em] text-gray-900 dark:text-white">
          {bookmark.answer}
        </p>
      </div>
    </div>

    <div className="mt-6 flex justify-end">
      <span className="rounded-full bg-[#FCE4EF] px-3 py-1 text-xs font-medium text-[#A10D5A] dark:bg-[#3A1228] dark:text-[#F4B8D8] sm:hidden">
        Saved on {formatDate(bookmark.createdAt)}
      </span>
    </div>
  </div>
)}
    </div>
  );
}