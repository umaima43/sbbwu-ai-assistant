

"use client";

import { useState } from "react";
import { Bookmark as BookmarkIcon, BookmarkCheck } from "lucide-react";
import { useBookmarks } from "@/lib/bookmarks/useBookmarks";
import { suggestBookmarkName } from "@/lib/bookmarks/storage";
import SaveBookmarkModal from "./SaveBookmarkModal";
import Toast from "./Toast";
import IconTooltip from "./IconTooltip";

interface BookmarkButtonProps {
  question: string;
  answer: string;
  className?: string;
}

export default function BookmarkButton({ question, answer, className = "" }: BookmarkButtonProps) {
  const { addBookmark, removeBookmark, isBookmarked, findBookmark } = useBookmarks();
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  });

  const saved = isBookmarked(question, answer);

  const handleClick = () => {
    if (saved) {
      const existing = findBookmark(question, answer);
      if (existing) {
        removeBookmark(existing.id);
        setToast({ message: "Bookmark removed.", show: true });
      }
      return;
    }
    setModalOpen(true);
  };

  const handleConfirm = (name: string) => {
    addBookmark(name, question, answer);
    setModalOpen(false);
    setToast({ message: "Answer bookmarked successfully!", show: true });
  };

  return (
    <>
      <div className={`group relative ${className}`}>
        <button
          type="button"
          onClick={handleClick}
          aria-pressed={saved}
          aria-label={saved ? "Remove bookmark" : "Bookmark this answer"}
          className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-1 text-xs font-bold transition-colors duration-150 ${
            saved
              ? "text-[#A10D5A] dark:text-[#F4B8D8]"
              : "text-black hover:text-[#A10D5A] dark:text-white dark:hover:text-[#F4B8D8]"
          }`}
        >
          {saved ? (
           <BookmarkCheck
  className="h-[18px] w-[18px] stroke-[2.5]"
  fill="currentColor"
/>
          ) : (
           <BookmarkIcon className="h-[18px] w-[18px] stroke-[2.5]" />
          )}
          {saved ? "Saved" : "Bookmark"}
        </button>
        {!saved && <IconTooltip label="Bookmark this answer" />}
      </div>

      <SaveBookmarkModal
        open={modalOpen}
        suggestedName={suggestBookmarkName(question)}
        questionPreview={question}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />

      <Toast
        message={toast.message}
        show={toast.show}
        onClose={() => setToast((current) => ({ ...current, show: false }))}
      />
    </>
  );
}