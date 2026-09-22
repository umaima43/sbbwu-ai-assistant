"use client";

import { useMemo, useState } from "react";
import { Bookmark as BookmarkIcon, Search } from "lucide-react";
import { useBookmarks } from "@/lib/bookmarks/useBookmarks";
import BookmarkCard from "@/components/bookmarks/BookmarkCard";
import Toast from "@/components/bookmarks/Toast";
import Image from "next/image";

export default function BookmarksPage() {
  const { bookmarks, ready, removeBookmark } = useBookmarks();
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookmarks;
    return bookmarks.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.question.toLowerCase().includes(q)
    );
  }, [bookmarks, query]);

  const handleDelete = (id: string) => {
    removeBookmark(id);
    setToast({ message: "Bookmark deleted.", show: true });
  };

  return (
    <section className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
       <div className="mb-8 flex justify-center">
  <div className="flex flex-col items-center">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FCE4EF] shadow-sm dark:bg-[#3A1228]">
        <Image
          src="/anfa.gif"
          alt="Bookmarks"
          width={33}
          height={33}
          className="h-8 w-8 object-contain"
          unoptimized
        />
      </div>

      <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[#A10D5A]  sm:text-4xl lg:text-[2.7rem]">
        My Bookmarks
      </h1>
    </div>

    <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
      {ready
        ? `${bookmarks.length} saved ${
            bookmarks.length === 1 ? "answer" : "answers"
          }`
        : "Loading your bookmarks..."}
    </p>
  </div>
</div>

        {/* Search */}

 {ready && bookmarks.length > 0 && (
  <div className="relative mb-8">
    <Search className="pointer-events-none absolute left-5 top-1/2 h-5.5 w-5.5 -translate-y-1/2 text-[#A10D5A] dark:text-[#F4B8D8]" />

    <input
      type="text"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Search your saved bookmarks..."
      className="h-16 w-full rounded-3xl border-2 border-pink-300 bg-[#FFF8FB] pl-14 pr-6 text-[15px] font-semibold text-gray-800 placeholder:font-medium placeholder:text-gray-500 shadow-md outline-none transition-all duration-300 focus:border-[#A10D5A] focus:ring-4 focus:ring-[#A10D5A]/15 focus:shadow-xl focus:shadow-[#A10D5A]/10 dark:border-[#5C1738] dark:bg-[#2A111E] dark:text-white dark:placeholder:text-gray-400"
    />
  </div>
)}
        {/* Loading */}
        {!ready && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-17 animate-pulse rounded-2xl bg-[#FCE4EF] dark:bg-[#2A111E]"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {ready && bookmarks.length === 0 && (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-pink-200 bg-[#FFF8FB] px-6 py-16 text-center dark:border-[#5B1737] dark:bg-[#2A111E]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FCE4EF] text-[#A10D5A] dark:bg-[#341221] dark:text-[#F4B8D8]">
              <BookmarkIcon className="h-8 w-8" />
            </div>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              No bookmarks yet
            </h2>

            <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              When the assistant gives you a useful answer, tap{" "}
              <span className="font-semibold text-[#A10D5A] dark:text-[#F4B8D8]">
                🔖 Bookmark
              </span>{" "}
              underneath it to save it here for later.
            </p>
          </div>
        )}

        {/* No Results */}
        {ready && bookmarks.length > 0 && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-pink-200 bg-[#FFF8FB] px-6 py-10 text-center text-sm text-gray-500 dark:border-[#5B1737] dark:bg-[#2A111E] dark:text-gray-400">
            No bookmarks match &quot;{query}&quot;.
          </div>
        )}

        {/* List */}
        {ready && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <Toast
        message={toast.message}
        show={toast.show}
        onClose={() => setToast((current) => ({ ...current, show: false }))}
      />
    </section>
  );
}