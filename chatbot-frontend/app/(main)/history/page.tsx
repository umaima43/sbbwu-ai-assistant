
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
    {
      label: "Recent",
      items: today,
    },
    {
      label: "Yesterday",
      items: yesterday,
    },
    {
      label: "Older",
      items: older,
    },
  ].filter((s) => s.items.length > 0);

  const handleDelete = (id: string) => {
    deleteConversation(id);
    setHistory(loadHistory());
  };

  const handleClearAll = () => {
    clearAllHistory();
    setHistory([]);
  };

  return (
    <>

      <main className="flex-1 overflow-y-auto bg-[#FBF8F9] dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">

          {/* =====================================================
              PAGE HEADER
          ====================================================== */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#24121D] dark:text-white">
                Chat History
              </h1>

              <p className="mt-2 text-sm font-medium text-[#6B4A5A] dark:text-gray-400">
                View and manage your previous conversations with SBBWU Assistant.
              </p>
            </div>

            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8B9CC] bg-white px-4 py-2.5 text-sm font-bold text-[#A10D5A] transition-all duration-200 hover:border-[#A10D5A] hover:bg-[#FFF3F8] dark:border-gray-700 dark:bg-gray-800 dark:text-[#E98AB8] dark:hover:border-[#8F2860] dark:hover:bg-gray-800/70"
              >
                <Trash2 size={17} />
                Clear All
              </button>
            )}
          </div>

          {/* =====================================================
              SEARCH
          ====================================================== */}
          <div className="relative mb-10 max-w-2xl">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A10D5A] dark:text-[#E98AB8]"
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your conversations..."
              className="w-full rounded-2xl border border-[#DCCDD4] bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-[#24121D] outline-none transition-all placeholder:text-[#8A747E] hover:border-[#C5B2BC] focus:border-[#A10D5A] focus:ring-4 focus:ring-[#A10D5A]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-[#A10D5A] dark:focus:ring-[#A10D5A]/20"
            />
          </div>

          {/* =====================================================
              EMPTY STATE
          ====================================================== */}
          {filtered.length === 0 ? (
            <div className="mx-auto mt-20 max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF3F8] text-[#A10D5A] dark:bg-[#A10D5A]/10 dark:text-[#E98AB8]">
                <MessageSquare size={30} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#24121D] dark:text-white">
                No conversations found
              </h2>

              <p className="mt-2 text-sm font-medium leading-6 text-[#7A6670] dark:text-gray-400">
                {query
                  ? "Try searching with a different keyword."
                  : "Your conversations will appear here once you start chatting with SBBWU Assistant."}
              </p>
            </div>
          ) : (

            /* =====================================================
               HISTORY SECTIONS
            ====================================================== */
            <div className="space-y-10">
              {sections.map((section) => (
                <section key={section.label}>

                  <div className="mb-4 flex items-center gap-3">
                    <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[#6B4A5A] dark:text-gray-400">
                      {section.label}
                    </h2>

                    <div className="h-px flex-1 bg-[#E8DDE2] dark:bg-gray-700" />
                  </div>

                  <div className="space-y-3">
                    {section.items.map((chat) => {
                      const last =
                        chat.messages[chat.messages.length - 1]?.message ??
                        "No messages in this conversation.";

                      return (
                        <div
                          key={chat.id}
                          onClick={() =>
                            router.push(`/?load=${chat.id}`)
                          }
                          className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-[#E5D9DF] bg-white p-4 shadow-[0_3px_15px_rgba(36,18,29,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E2B8CB] hover:shadow-[0_8px_25px_rgba(161,13,90,0.09)] sm:p-5 dark:border-gray-700 dark:bg-gray-800/60 dark:shadow-none dark:hover:border-[#8F2860] dark:hover:bg-gray-800"
                        >

                          {/* CHAT ICON */}
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#A10D5A] text-white shadow-sm shadow-[#A10D5A]/20 transition-transform duration-200 group-hover:scale-105">
                            <MessageSquare
                              size={21}
                              strokeWidth={2.2}
                            />
                          </div>

                          {/* CONVERSATION INFO */}
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-base font-bold text-[#24121D] dark:text-white">
                              {chat.title}
                            </h3>

                            <p className="mt-1 truncate text-sm font-medium text-[#7A6670] dark:text-gray-400">
                              {last}
                            </p>

                            <p className="mt-2 text-xs font-semibold text-[#A10D5A] dark:text-[#E98AB8]">
                              {new Date(chat.date).toLocaleDateString()}
                            </p>
                          </div>

                          {/* DELETE BUTTON */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(chat.id);
                            }}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F0C9D9] bg-[#FFF3F8] text-[#A10D5A] transition-all duration-200 hover:border-[#A10D5A] hover:bg-[#A10D5A] hover:text-white dark:border-gray-700 dark:bg-gray-800 dark:text-[#E98AB8] dark:hover:border-[#A10D5A] dark:hover:bg-[#A10D5A] dark:hover:text-white"
                            aria-label={`Delete ${chat.title}`}
                          >
                            <Trash2 size={18} />
                          </button>
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
    </>
  );
}