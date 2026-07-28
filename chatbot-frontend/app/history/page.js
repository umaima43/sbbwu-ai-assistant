"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Trash2 } from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import { loadHistory, deleteConversation } from "../../lib/chatHistory";

// ── Date grouping helpers ─────────────────────────────────────────────────

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function groupByDate(chats) {
  const todayMs = startOfDay(new Date());
  const yesterdayMs = todayMs - 86_400_000;

  const groups = { Today: [], Yesterday: [], Older: [] };

  for (const chat of chats) {
    const chatMs = startOfDay(new Date(chat.date));
    if (chatMs === todayMs) groups.Today.push(chat);
    else if (chatMs === yesterdayMs) groups.Yesterday.push(chat);
    else groups.Older.push(chat);
  }

  return groups;
}

function formatTime(isoDate) {
  return new Date(isoDate).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Page component ────────────────────────────────────────────────────────

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);

  // Read from localStorage only on the client
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Delete a single chat item
  const handleDelete = (e, sessionId) => {
    e.stopPropagation(); // prevent triggering the card click
    deleteConversation(sessionId);
    setHistory((prev) => prev.filter((h) => h.id !== sessionId));
  };

  // Navigate to home and load the selected conversation
  const handleOpen = (sessionId) => {
    router.push(`/?load=${sessionId}`);
  };

  const groups = groupByDate(history);
  const hasChats = history.length > 0;

  return (
    <div className="flex h-screen bg-[#F7F8FC] dark:bg-gray-950">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <Header />

        {/* History Content */}
        <main className="flex-1 overflow-y-auto p-8">

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
            Chat History
          </h1>

          {/* Empty state */}
          {!hasChats && (
            <div className="text-center text-gray-400 dark:text-gray-500 mt-20">
              <MessageSquare className="mx-auto mb-4 opacity-40" size={48} />
              <p className="text-lg font-medium">No chat history yet.</p>
              <p className="text-sm mt-1">Start a conversation to see it here.</p>
            </div>
          )}

          {/* Grouped sections */}
          {Object.entries(groups).map(([label, chats]) =>
            chats.length === 0 ? null : (
              <section key={label} className="mb-10">

                <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-4">
                  {label}
                </h2>

                <div className="space-y-4">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleOpen(chat.id)}
                      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 hover:shadow-lg transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-4">

                        {/* Icon + title + time */}
                        <div className="flex items-center gap-4 min-w-0">
                          <MessageSquare className="text-[#A10D5A] shrink-0" />

                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                              {chat.title}
                            </h3>

                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatTime(chat.date)}
                            </p>
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDelete(e, chat.id)}
                          title="Delete conversation"
                          className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </div>
                  ))}
                </div>

              </section>
            )
          )}

        </main>

      </div>

    </div>
  );
}