"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bookmark as BookmarkIcon, X } from "lucide-react";

interface SaveBookmarkModalProps {
  open: boolean;
  suggestedName: string;
  questionPreview: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}

export default function SaveBookmarkModal({
  open,
  suggestedName,
  questionPreview,
  onCancel,
  onConfirm,
}: SaveBookmarkModalProps) {
  const [name, setName] = useState(suggestedName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(suggestedName);
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open, suggestedName]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    onConfirm(trimmed.length > 0 ? trimmed : suggestedName);
  };

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
      role="presentation"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-bookmark-title"
        className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-linear-to-r from-[#FFF8FB] to-white px-6 py-5 dark:border-gray-800 dark:from-[#2A111E] dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDE7F1] text-[#A10D5A] dark:bg-[#3A1228] dark:text-[#F4B8D8]">
              <BookmarkIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 id="save-bookmark-title" className="text-base font-bold text-gray-900 dark:text-white">
                Save this answer
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Give your bookmark a name you&apos;ll recognize later.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <label htmlFor="bookmark-name" className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">
            Bookmark name
          </label>
          <input
            id="bookmark-name"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            placeholder="e.g. Scholarship eligibility"
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#A10D5A] focus:ring-4 focus:ring-[#A10D5A]/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500"
          />

          <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-950/50">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Question</p>
            <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{questionPreview}</p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-bold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#A10D5A] px-5 text-sm font-bold text-white shadow-lg shadow-[#A10D5A]/20 transition-all hover:bg-[#870B4C] hover:shadow-xl hover:shadow-[#A10D5A]/25"
            >
              <BookmarkIcon className="h-4 w-4" />
              Save Bookmark
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
