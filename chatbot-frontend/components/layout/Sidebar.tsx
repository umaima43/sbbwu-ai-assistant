

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  History,
  Home,
  PanelLeftClose,
  PanelLeft,
  Trash2,
} from "lucide-react";
import { useChatContext } from "@/components/providers/ChatProvider";
import {
  deleteConversation,
  loadHistory,
  groupHistoryByDate,
  type HistoryEntry,
} from "@/lib/chatHistory";

function formatSidebarTime(isoDate: string) {
  const d = new Date(isoDate);
  const today = new Date();

  const isToday = d.toDateString() === today.toDateString();

  const time = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return isToday
    ? `Today · ${time}`
    : d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { startNewConversation, historyVersion } = useChatContext();

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setHistory(loadHistory().slice(0, 8));
  }, [historyVersion, pathname]);

  const handleDelete = (
    e: React.MouseEvent,
    id: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    deleteConversation(id);

    setHistory(loadHistory().slice(0, 8));
  };

  const { today, yesterday, older } =
    groupHistoryByDate(history);

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

  return (
    <aside
  className={`flex h-full shrink-0 flex-col bg-linear-to-b from-[#7E0D46] via-[#8B0F4E] to-[#991157] text-white transition-all duration-300 dark:bg-gray-900 ${
          collapsed ? "w-16" : "w-92.5"
  }`}
>
      <div
  className={`flex items-center px-4 pt-6 ${
    collapsed ? "justify-center" : "justify-end"
  }`}
>
  <div className="group relative flex items-center justify-center">
    <button
      type="button"
      onClick={() => setCollapsed((v) => !v)}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-all duration-200 hover:bg-white/15"
      aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
    >
      {collapsed ? (
        <PanelLeft size={20} />
      ) : (
        <PanelLeftClose size={20} />
      )}
    </button>

    <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#A10D5A] px-3 py-1.5 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10 opacity-0 transition-all duration-200 group-hover:opacity-100">
      {collapsed ? "Show sidebar" : "Hide sidebar"}
    </div>
  </div>
</div>

      {/* =====================================================
          COLLAPSIBLE CONTENT
          Hidden (not just visually) when collapsed so it
          doesn't render/squish inside the slim strip.
      ====================================================== */}
      {!collapsed && (
        <>
          {/* =====================================================
              LOGO + BRAND
          ====================================================== */}
          <div className="flex flex-col items-center px-6 pb-4 pt-2">
            <Image
  src="/sbbwu-logo.png"
  alt="SBBWU Logo"
  width={85}
  height={85}
  className="block"
/>

            <h1 className="mt-4 text-center text-lg font-bold leading-6">
              SBBWU Assistant
            </h1>
          </div>

{/* =====================================================
    ACTION BUTTONS
===================================================== */}
<div className="space-y-3 px-6">

    {/* New Conversation */}
  <button
    onClick={() => {
      startNewConversation();
      router.push("/");
    }}
    className="w-full rounded-2xl bg-[#B32868] py-3 text-[15px] font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-[#d44a88] dark:bg-[#A10D5A] dark:hover:bg-[#C33C78]"
  >
    + New Conversation
  </button>
  {/* Home */}
  <button
  onClick={() => pathname !== "/" && router.push("/")}
  disabled={pathname === "/"}
  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[15px] font-semibold text-white shadow-md transition-all duration-200 ${
    pathname === "/"
      ? "cursor-default bg-[#A10D5A] opacity-90"
      : "bg-[#B32868] hover:scale-[1.02] hover:bg-[#d44a88] dark:bg-[#A10D5A] dark:hover:bg-[#C33C78]"
  }`}
>
  <Home size={18} strokeWidth={2.2} />
  Home
</button>
</div>
          {/* =====================================================
              CHAT HISTORY
          ====================================================== */}
          <div className="mt-6 flex min-h-0 flex-1 flex-col px-5">

            {/* HISTORY HEADING */}
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-white/90">
              <History size={18} />
              Chat History
            </div>

            {/* =====================================================
                SCROLLABLE HISTORY LIST
            ====================================================== */}
            <div className="sidebar-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">

              {history.length === 0 ? (
                <p className="px-2 text-sm font-medium text-white/65">
                  No conversations yet.
                </p>
              ) : (
                sections.map((section) => (
                  <div key={section.label}>

                    {/* SECTION LABEL */}
                    <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-white/60">
                      {section.label}
                    </p>

                    {/* CONVERSATION ITEMS */}
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            router.push(`/?load=${item.id}`)
                          }
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" ||
                              e.key === " "
                            ) {
                              e.preventDefault();
                              router.push(`/?load=${item.id}`);
                            }
                          }}
                         className="group flex w-full cursor-pointer items-center gap-2 rounded-xl border border-[#C33C78]/30 bg-[#B32868] px-2.5 py-2.5 text-left shadow-sm transition-all duration-200 hover:border-[#D95A91]/40 hover:bg-[#9A1F5A] hover:shadow-md dark:border-[#8F2860] dark:bg-[#6E0E3E] dark:hover:border-[#A10D5A] dark:hover:bg-[#7E174B]"
                        >

                          {/* CONVERSATION DETAILS */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white/95">
                              {item.title}
                            </p>

                            <p className="mt-0.5 truncate text-xs font-medium text-white/65">
                              {formatSidebarTime(item.date)}
                            </p>
                          </div>

                          {/* DELETE BUTTON */}
                          <button
                            type="button"
                            onClick={(e) =>
                              handleDelete(e, item.id)
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 transition-all duration-200 hover:bg-white/15 hover:text-white"
                            title="Delete conversation"
                            aria-label={`Delete ${item.title}`}
                          >
                            <Trash2
                              size={15}
                              strokeWidth={2.2}
                            />
                          </button>

                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}

            </div>

            {/* =====================================================
                VIEW ALL HISTORY
            ====================================================== */}
            <Link
              href="/history"
              className="mt-3 block rounded-2xl border border-white/20 bg-[#B32868] py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:border-white/35 hover:bg-[#9A1F5A] hover:shadow-md dark:border-white/10 dark:bg-[#6E0E3E] dark:hover:border-white/20 dark:hover:bg-[#7E174B]"

            >
              View all history
            </Link>

          </div>

          {/* =====================================================
              REPORT AN ISSUE
          ====================================================== */}
<div className="border-t border-white/10 p-4 dark:border-gray-700">
  <Link
    href="/report-issue"
    className="group flex w-full items-center gap-3 rounded-2xl border border-white/25 bg-[#B32868] p-3.5 shadow-sm transition-all duration-200 hover:border-white/40 hover:bg-[#9A1F5A] hover:shadow-md dark:border-white/15 dark:bg-[#6E0E3E] dark:hover:border-white/25 dark:hover:bg-[#7E174B]"
  >

    {/* ICON */}
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#A10D5A] shadow-sm transition-transform duration-200 group-hover:scale-105 dark:bg-white dark:text-[#A10D5A]">
      <AlertTriangle
        size={19}
        strokeWidth={2.2}
      />
    </div>

    {/* TEXT */}
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-white">
        Report an Issue
      </p>

      <p className="mt-0.5 truncate text-xs font-medium text-white/80">
        Help us improve your experience
      </p>
    </div>

    {/* ARROW */}
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-white/15 group-hover:text-white">
      <ArrowRight
        size={17}
        strokeWidth={2.2}
      />
    </div>

  </Link>
</div>
        </>
      )}

    </aside>
  );
}