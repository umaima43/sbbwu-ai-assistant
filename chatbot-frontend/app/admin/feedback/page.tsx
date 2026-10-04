"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FeedbackItem = {
id: number;
session_id: string;
question?: string | null;
answer?: string | null;
message?: string | null;
feedback: "positive" | "negative";
created_at: number;
};

type FeedbackStats = {
total_feedback: number;
positive_feedback: number;
negative_feedback: number;
positive_percentage: number;
negative_percentage: number;
};

const API_URL = "";
const ITEMS_PER_PAGE = 10;

export default function FeedbackPage() {
const router = useRouter();

const [feedback, setFeedback] =
useState<FeedbackItem[]>([]);

const [stats, setStats] =
useState<FeedbackStats | null>(null);

const [loading, setLoading] =
useState(true);

const [error, setError] =
useState("");

const [search, setSearch] =
useState("");

const [filter, setFilter] = useState<
"all" | "positive" | "negative"

> ("all");

const [currentPage, setCurrentPage] =
useState(1);

// ============================================================
// LOGOUT
// ============================================================

function handleLogout() {
localStorage.removeItem("admin_token");
router.push("/admin/login");
}

// ============================================================
// LOAD FEEDBACK
// ============================================================

async function loadFeedback() {
try {
setLoading(true);
setError("");


  const token =
    localStorage.getItem("admin_token");

  if (!token) {
    router.push("/admin/login");
    return;
  }

  const [
    feedbackResponse,
    statsResponse,
  ] = await Promise.all([
    fetch(`${API_URL}/admin/feedback`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),

    fetch(`${API_URL}/admin/feedback/stats`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),
  ]);

  // TOKEN EXPIRED / INVALID
  if (
    feedbackResponse.status === 401 ||
    statsResponse.status === 401
  ) {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
    return;
  }

  const feedbackData =
    await feedbackResponse.json();

  const statsData =
    await statsResponse.json();

  // API ERRORS
  if (!feedbackResponse.ok) {
    throw new Error(
      feedbackData?.detail ||
        "Failed to load feedback"
    );
  }

  if (!statsResponse.ok) {
    throw new Error(
      statsData?.detail ||
        "Failed to load feedback statistics"
    );
  }

  // VALIDATE RESPONSE
  if (!Array.isArray(feedbackData)) {
    throw new Error(
      "Invalid feedback response from server"
    );
  }

  setFeedback(feedbackData);
  setStats(statsData);
  setCurrentPage(1);
} catch (err) {
  console.error("Feedback error:", err);

  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError(
      "Failed to load feedback."
    );
  }
} finally {
  setLoading(false);
}


}

// ============================================================
// INITIAL LOAD
// ============================================================

useEffect(() => {
loadFeedback();
}, []);

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(timestamp: number) {
if (!timestamp) {
return "Unknown date";
}

return new Date(
  timestamp * 1000
).toLocaleString();


}

// ============================================================
// SEARCH + FILTER
// ============================================================

const filteredFeedback = useMemo(() => {
const searchText =
search.trim().toLowerCase();


return feedback.filter((item) => {
  const question =
    item.question ?? "";

  const answer =
    item.answer ??
    item.message ??
    "";

  const sessionId =
    item.session_id ?? "";

  const matchesSearch =
    searchText === "" ||
    question
      .toLowerCase()
      .includes(searchText) ||
    answer
      .toLowerCase()
      .includes(searchText) ||
    sessionId
      .toLowerCase()
      .includes(searchText);

  const matchesFilter =
    filter === "all" ||
    item.feedback === filter;

  return (
    matchesSearch &&
    matchesFilter
  );
});


}, [feedback, search, filter]);

// ============================================================
// PAGINATION
// ============================================================

const totalPages = Math.max(
1,
Math.ceil(
filteredFeedback.length /
ITEMS_PER_PAGE
)
);

const paginatedFeedback = useMemo(() => {
const start =
(currentPage - 1) *
ITEMS_PER_PAGE;

return filteredFeedback.slice(
  start,
  start + ITEMS_PER_PAGE
);


}, [
filteredFeedback,
currentPage,
]);

useEffect(() => {
setCurrentPage(1);
}, [search, filter]);

useEffect(() => {
if (currentPage > totalPages) {
setCurrentPage(totalPages);
}
}, [currentPage, totalPages]);

const startItem =
filteredFeedback.length === 0
? 0
: (currentPage - 1) *
ITEMS_PER_PAGE +
1;

const endItem = Math.min(
currentPage * ITEMS_PER_PAGE,
filteredFeedback.length
);

// ============================================================
// LOADING
// ============================================================

if (loading && !stats) {
return ( <main className="min-h-screen bg-[#f8f9fc] p-8 dark:bg-gray-900"> <div className="flex min-h-[400px] items-center justify-center"> <div className="rounded-xl border border-[#f2c6dc] bg-white px-8 py-6 text-center shadow-sm dark:border-[#3a3035] dark:bg-[#1c1c1c]"> <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#f2c6dc] border-t-[#A10D5A] dark:border-[#4a3540] dark:border-t-[#A10D5A]" />


        <p className="mt-4 text-gray-500 dark:text-gray-400">
          Loading feedback...
        </p>
      </div>
    </div>
  </main>
);


}

// ============================================================
// RENDER
// ============================================================

return ( <main className="min-h-screen bg-[#f8f9fc] p-8 dark:bg-gray-900">


  {/* ======================================================
      HEADER
  ====================================================== */}

  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Feedback
      </h1>

      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Review user questions and their
        feedback about chatbot responses.
      </p>
    </div>

    {/* ACTION BUTTONS */}

    <div className="flex gap-3">

      {/* REFRESH */}

      <button
        type="button"
        onClick={loadFeedback}
        disabled={loading}
        className="rounded-xl bg-[#A10D5A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8B0F4E] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Refreshing..."
          : "Refresh"}
      </button>

      {/* LOGOUT */}

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-xl border border-[#A10D5A] bg-white px-5 py-3 text-sm font-semibold text-[#A10D5A] transition hover:bg-[#fff0f7] dark:bg-[#1c1c1c] dark:text-[#F4B8D8] dark:hover:bg-[#2a1722]"
      >
        Logout
      </button>

    </div>
  </div>

  {/* ======================================================
      ERROR
  ====================================================== */}

  {error && (
    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30">

      <p className="font-semibold text-red-700 dark:text-red-400">
        Failed to load feedback
      </p>

      <p className="mt-2 text-sm text-red-600 dark:text-red-300">
        {error}
      </p>

      <button
        type="button"
        onClick={loadFeedback}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Try Again
      </button>

    </div>
  )}

  {/* ======================================================
      CONTENT
  ====================================================== */}

  {!loading && !error && (
    <>
      {/* ==================================================
          STATISTICS
      ================================================== */}

      <div className="mb-8 grid gap-5 md:grid-cols-3">

        {/* TOTAL */}

        <div className="rounded-xl border border-[#f2c6dc] bg-white p-6 shadow-sm dark:border-[#3a3035] dark:bg-[#1c1c1c]">

          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Feedback
          </p>

          <p className="mt-2 text-3xl font-bold text-[#A10D5A] dark:text-[#F4B8D8]">
            {stats?.total_feedback ?? 0}
          </p>

        </div>

        {/* POSITIVE */}

        <div className="rounded-xl border border-[#f2c6dc] bg-white p-6 shadow-sm dark:border-[#3a3035] dark:bg-[#1c1c1c]">

          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Positive Feedback
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            {stats?.positive_feedback ?? 0}
          </p>

          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            {stats?.positive_percentage ?? 0}%
          </p>

        </div>

        {/* NEGATIVE */}

        <div className="rounded-xl border border-[#f2c6dc] bg-white p-6 shadow-sm dark:border-[#3a3035] dark:bg-[#1c1c1c]">

          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Negative Feedback
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
            {stats?.negative_feedback ?? 0}
          </p>

          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            {stats?.negative_percentage ?? 0}%
          </p>

        </div>

      </div>

      {/* ==================================================
          FEEDBACK CARD
      ================================================== */}

      <div className="overflow-hidden rounded-xl border border-[#f2c6dc] bg-white shadow-sm dark:border-[#3a3035] dark:bg-[#1c1c1c]">

        {/* TOOLBAR */}

        <div className="flex flex-col gap-4 border-b border-[#f2c6dc] px-6 py-5 md:flex-row md:items-center md:justify-between dark:border-[#3a3035]">

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              User Feedback
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Showing {startItem}-{endItem} of{" "}
              {filteredFeedback.length} feedback
              records
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* SEARCH */}

            <input
              type="text"
              placeholder="Search questions or answers..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-[#e8b6d0] bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#A10D5A] focus:ring-2 focus:ring-[#A10D5A]/10 dark:border-[#4a3540] dark:bg-[#151515] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-[#C33C78] dark:focus:ring-[#C33C78]/20 sm:w-72"
            />

            {/* FILTER */}

            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value as
                    | "all"
                    | "positive"
                    | "negative"
                )
              }
              className="rounded-lg border border-[#e8b6d0] bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#A10D5A] focus:ring-2 focus:ring-[#A10D5A]/10 dark:border-[#4a3540] dark:bg-[#151515] dark:text-gray-100 dark:focus:border-[#C33C78] dark:focus:ring-[#C33C78]/20"
            >
              <option value="all">
                All Feedback
              </option>

              <option value="positive">
                Positive
              </option>

              <option value="negative">
                Negative
              </option>
            </select>

          </div>
        </div>

        {/* EMPTY STATE */}

        {filteredFeedback.length === 0 ? (
          <div className="p-10 text-center">

            <p className="font-medium text-gray-700 dark:text-gray-200">
              No feedback found.
            </p>

            {search ||
            filter !== "all" ? (
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                Try changing your search
                or filter.
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                No users have submitted
                feedback yet.
              </p>
            )}

          </div>
        ) : (

          /* FEEDBACK LIST */

          <div className="divide-y divide-[#f5dce8] dark:divide-[#3a3035]">

            {paginatedFeedback.map(
              (item) => {
                const question =
                  item.question?.trim() ||
                  "Question not available";

                const answer =
                  item.answer?.trim() ||
                  item.message?.trim() ||
                  "Answer not available";

                return (
                  <div
                    key={item.id}
                    className="px-6 py-6 transition hover:bg-[#fff8fb] dark:hover:bg-[#241b20]"
                  >

                    <div className="flex flex-col gap-5">

                      {/* QUESTION */}

                      <div>
                        <div className="mb-2 flex items-center gap-2">

                          <span className="rounded-md bg-[#A10D5A]/10 px-2.5 py-1 text-xs font-semibold text-[#A10D5A] dark:bg-[#A10D5A]/20 dark:text-[#F4B8D8]">
                            USER QUESTION
                          </span>

                        </div>

                        <p className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                          {question}
                        </p>
                      </div>

                      {/* ANSWER */}

                      <div className="rounded-lg border border-[#f4dce8] bg-[#fffafb] p-4 dark:border-[#44323b] dark:bg-[#241b20]">

                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#A10D5A]/60 dark:text-[#F4B8D8]/70">
                          Chatbot Answer
                        </p>

                        <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                          {answer}
                        </p>

                      </div>

                      {/* BOTTOM INFORMATION */}

                      <div className="flex flex-col gap-3 border-t border-[#f5dce8] pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#3a3035]">

                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400 dark:text-gray-500">

                          <span>
                            ID: {item.id}
                          </span>

                          <span className="max-w-[300px] truncate">
                            Session:{" "}
                            {item.session_id}
                          </span>

                          <span>
                            {formatDate(
                              item.created_at
                            )}
                          </span>

                        </div>

                        {/* FEEDBACK STATUS */}

                        {item.feedback ===
                        "positive" ? (
                          <span className="w-fit shrink-0 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950/60 dark:text-green-400">
                            👍 Positive
                          </span>
                        ) : (
                          <span className="w-fit shrink-0 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-400">
                            👎 Negative
                          </span>
                        )}

                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* PAGINATION */}

        {filteredFeedback.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-[#f2c6dc] bg-[#fffafb] px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#3a3035] dark:bg-[#151515]">

            <p className="text-sm text-gray-500 dark:text-gray-400">

              Showing{" "}

              <span className="font-medium text-gray-700 dark:text-gray-200">
                {startItem}
              </span>{" "}

              to{" "}

              <span className="font-medium text-gray-700 dark:text-gray-200">
                {endItem}
              </span>{" "}

              of{" "}

              <span className="font-medium text-gray-700 dark:text-gray-200">
                {filteredFeedback.length}
              </span>

            </p>

            <div className="flex items-center gap-2">

              {/* PREVIOUS */}

              <button
                type="button"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
                className="rounded-lg border border-[#e8b6d0] bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-[#A10D5A] hover:text-[#A10D5A] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#4a3540] dark:bg-[#1c1c1c] dark:text-gray-300 dark:hover:border-[#C33C78] dark:hover:text-[#F4B8D8]"
              >
                Previous
              </button>

              {/* PAGE NUMBERS */}

              <div className="flex items-center gap-1">

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                    className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition ${
                      currentPage === page
                        ? "bg-[#A10D5A] text-white"
                        : "border border-[#e8b6d0] bg-white text-gray-700 hover:border-[#A10D5A] hover:text-[#A10D5A] dark:border-[#4a3540] dark:bg-[#1c1c1c] dark:text-gray-300 dark:hover:border-[#C33C78] dark:hover:text-[#F4B8D8]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

              </div>

              {/* NEXT */}

              <button
                type="button"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
                className="rounded-lg border border-[#e8b6d0] bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-[#A10D5A] hover:text-[#A10D5A] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#4a3540] dark:bg-[#1c1c1c] dark:text-gray-300 dark:hover:border-[#C33C78] dark:hover:text-[#F4B8D8]"
              >
                Next
              </button>

            </div>
          </div>
        )}
      </div>
    </>
  )}
</main>
);
}
