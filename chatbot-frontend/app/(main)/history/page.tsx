"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Search,
  Trash2,
} from "lucide-react";

import {
  clearAllHistory,
  deleteConversation,
  loadHistory,
  groupHistoryByDate,
  type HistoryEntry,
} from "@/lib/chatHistory";

export default function HistoryPage() {
  const router = useRouter();

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return history;

    return history.filter((h) =>
      h.title.toLowerCase().includes(q)
    );
  }, [history, query]);

  const { today, yesterday, older } = useMemo(
    () => groupHistoryByDate(filtered),
    [filtered]
  );

  const sections = [
    { label: "Recent", items: today },
    { label: "Yesterday", items: yesterday },
    { label: "Older", items: older },
  ].filter((section) => section.items.length > 0);

  const handleDelete = (id: string) => {
    deleteConversation(id);
    setHistory(loadHistory());
  };

  const handleClearAll = () => {
    clearAllHistory();
    setHistory([]);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-[#FBF8F9] dark:bg-gray-900">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2B1B24] dark:text-white">
              Chat History
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and continue your previous conversations.
            </p>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-[#1c1c1c] dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <Trash2 size={17} />
              Clear All
            </button>
          )}
        </div>

        {/* Search */}
        {history.length > 0 && (
          <div className="mb-8">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-xl border border-[#ead8e1] bg-white py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#A10D5A] focus:ring-2 focus:ring-[#A10D5A]/10 dark:border-[#4a3540] dark:bg-[#151515] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-[#C33C78] dark:focus:ring-[#A10D5A]/20"
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {history.length === 0 && (
          <div className="rounded-2xl border border-[#ead8e1] bg-white px-6 py-16 text-center dark:border-[#3a3035] dark:bg-[#1c1c1c]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FDE7F1] dark:bg-[#A10D5A]/20">
              <MessageSquare
                size={28}
                className="text-[#A10D5A] dark:text-[#F4B8D8]"
              />
            </div>

            <h2 className="text-xl font-semibold text-[#2B1B24] dark:text-white">
              No conversations yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              Your conversations will appear here once you start chatting
              with the SBBWU AI Assistant.
            </p>

            <button
              type="button"
              onClick={() => router.push("/chat")}
              className="mt-6 rounded-xl bg-[#A10D5A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#870B4C]"
            >
              Start a Conversation
            </button>
          </div>
        )}

        {/* No Search Results */}
        {history.length > 0 && filtered.length === 0 && (
          <div className="rounded-2xl border border-[#ead8e1] bg-white px-6 py-14 text-center dark:border-[#3a3035] dark:bg-[#1c1c1c]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FDE7F1] dark:bg-[#A10D5A]/20">
              <Search
                size={24}
                className="text-[#A10D5A] dark:text-[#F4B8D8]"
              />
            </div>

            <h2 className="text-lg font-semibold text-[#2B1B24] dark:text-white">
              No conversations found
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try searching with a different conversation title.
            </p>
          </div>
        )}

        {/* History Sections */}
        {sections.length > 0 && (
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.label}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {section.label}
                </h2>

                <div className="overflow-hidden rounded-2xl border border-[#ead8e1] bg-white dark:border-[#3a3035] dark:bg-[#1c1c1c]">
                  {section.items.map((chat, index) => {
                    const last =
                      chat.messages[chat.messages.length - 1]?.message ??
                      "No messages in this conversation.";

                    return (
                      <div
                        key={chat.id}
                        onClick={() =>
                          router.push(`/chat?load=${chat.id}`)
                        }
                        className={`group cursor-pointer px-5 py-4 transition hover:bg-[#FFF3F8] dark:hover:bg-[#241b20] ${
                          index !== section.items.length - 1
                            ? "border-b border-[#ead8e1] dark:border-[#3a3035]"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDE7F1] dark:bg-[#A10D5A]/20">
                            <MessageSquare
                              size={19}
                              className="text-[#A10D5A] dark:text-[#F4B8D8]"
                            />
                          </div>

                          {/* Conversation Content */}
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-semibold text-[#2B1B24] dark:text-gray-100">
                              {chat.title}
                            </h3>

                            <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                              {last}
                            </p>
                          </div>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(chat.id);
                            }}
                            aria-label={`Delete ${chat.title}`}
                            className="shrink-0 rounded-lg p-2 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:text-gray-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
