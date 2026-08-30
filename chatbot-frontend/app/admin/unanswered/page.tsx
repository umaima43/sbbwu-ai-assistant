"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UnansweredQuestion = {
  id: number;
  question: string;
  created_at: number;
};

const API_URL = "http://127.0.0.1:8000";
const QUESTIONS_PER_PAGE = 10;

export default function UnansweredQuestionsPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<UnansweredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ============================================================
  // LOGOUT
  // ============================================================

  function handleLogout() {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  }

  // ============================================================
  // LOAD QUESTIONS
  // ============================================================

  async function loadQuestions(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      // --------------------------------------------------------
      // GET ADMIN TOKEN
      // --------------------------------------------------------

      const token = localStorage.getItem("admin_token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      // --------------------------------------------------------
      // API REQUEST
      // --------------------------------------------------------

      const response = await fetch(
        `${API_URL}/admin/unanswered`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // --------------------------------------------------------
      // READ RESPONSE
      // --------------------------------------------------------

      const data = await response.json();

      // --------------------------------------------------------
      // TOKEN INVALID / EXPIRED
      // --------------------------------------------------------

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      // --------------------------------------------------------
      // OTHER API ERRORS
      // --------------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `API error: ${response.status} ${response.statusText}`
        );
      }

      // --------------------------------------------------------
      // VALIDATE RESPONSE
      // --------------------------------------------------------

      if (!Array.isArray(data)) {
        throw new Error("Invalid response from server");
      }

      setQuestions(data);
      setCurrentPage(1);
    } catch (error) {
      console.error(
        "Unanswered questions error:",
        error
      );

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to load unanswered questions."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadQuestions();
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
  // SEARCH
  // ============================================================

  const filteredQuestions = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    if (!searchText) {
      return questions;
    }

    return questions.filter((item) => {
      const question =
        item.question ?? "";

      return question
        .toLowerCase()
        .includes(searchText);
    });
  }, [questions, search]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredQuestions.length /
        QUESTIONS_PER_PAGE
    )
  );

  const paginatedQuestions =
    filteredQuestions.slice(
      (currentPage - 1) *
        QUESTIONS_PER_PAGE,
      currentPage *
        QUESTIONS_PER_PAGE
    );

  const startItem =
    filteredQuestions.length === 0
      ? 0
      : (currentPage - 1) *
          QUESTIONS_PER_PAGE +
        1;

  const endItem = Math.min(
    currentPage *
      QUESTIONS_PER_PAGE,
    filteredQuestions.length
  );

  // ============================================================
  // SEARCH HANDLER
  // ============================================================

  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  // ============================================================
  // PAGINATION
  // ============================================================

  function previousPage() {
    setCurrentPage((page) =>
      Math.max(page - 1, 1)
    );
  }

  function nextPage() {
    setCurrentPage((page) =>
      Math.min(
        page + 1,
        totalPages
      )
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen bg-[#f8f9fc] p-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Unanswered Questions
          </h1>

          <p className="mt-2 text-gray-500">
            Questions where the chatbot used a fallback answer.
          </p>
        </div>

        {/* REFRESH + LOGOUT */}

        <div className="flex gap-3">

          {/* REFRESH */}

          <button
            type="button"
            onClick={() =>
              loadQuestions(true)
            }
            disabled={refreshing}
            className="rounded-xl bg-[#A10D5A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8B0F4E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-[#A10D5A] bg-white px-5 py-3 text-sm font-semibold text-[#A10D5A] transition hover:bg-[#fff0f7]"
          >
            Logout
          </button>

        </div>

      </div>

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="mb-6 grid gap-5 md:grid-cols-2">

        <div className="rounded-xl border border-[#F3D5E5] bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-gray-500">
            Total Unanswered
          </p>

          <p className="mt-2 text-3xl font-bold text-[#A10D5A]">
            {questions.length}
          </p>

        </div>

        <div className="rounded-xl border border-[#F3D5E5] bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-gray-500">
            Search Results
          </p>

          <p className="mt-2 text-3xl font-bold text-[#A10D5A]">
            {filteredQuestions.length}
          </p>

        </div>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">

          <p className="font-semibold text-red-700">
            Failed to load unanswered questions
          </p>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              loadQuestions()
            }
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>

        </div>
      )}

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="rounded-xl border border-[#F3D5E5] bg-white p-10 text-center shadow-sm">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#F3D5E5] border-t-[#A10D5A]" />

          <p className="mt-4 text-gray-500">
            Loading unanswered questions...
          </p>

        </div>
      )}

      {/* ======================================================
          CONTENT
      ====================================================== */}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-[#F3D5E5] bg-white shadow-sm">

          {/* ==================================================
              SEARCH HEADER
          ================================================== */}

          <div className="flex flex-col gap-4 border-b border-[#F3D5E5] px-6 py-5 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-xl font-semibold text-gray-900">
                Questions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review questions that the chatbot could not answer.
              </p>

            </div>

            <div className="relative w-full md:w-80">

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  handleSearch(
                    e.target.value
                  )
                }
                placeholder="Search questions..."
                className="w-full rounded-lg border border-[#E8BFD2] bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#A10D5A] focus:ring-2 focus:ring-[#A10D5A]/10"
              />

            </div>

          </div>

          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {filteredQuestions.length === 0 ? (

            <div className="p-10 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FCEBF4]">

                <span className="text-xl font-semibold text-[#A10D5A]">
                  ?
                </span>

              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No questions found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {search
                  ? "Try a different search term."
                  : "There are currently no unanswered questions."}
              </p>

            </div>

          ) : (

            <>

              {/* =================================================
                  TABLE
              ================================================= */}

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead className="bg-[#fdf5f9]">

                    <tr>

                      <th className="w-24 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        ID
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Question
                      </th>

                      <th className="w-56 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>

                      <th className="w-32 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-[#F8E7EF]">

                    {paginatedQuestions.map(
                      (item) => (

                        <tr
                          key={item.id}
                          className="transition hover:bg-[#fdf8fa]"
                        >

                          <td className="px-6 py-5 text-sm font-medium text-gray-500">
                            #{item.id}
                          </td>

                          <td className="px-6 py-5">

                            <p className="max-w-2xl text-sm font-medium leading-6 text-gray-900">
                              {item.question}
                            </p>

                          </td>

                          <td className="px-6 py-5 text-sm text-gray-500">
                            {formatDate(
                              item.created_at
                            )}
                          </td>

                          <td className="px-6 py-5">

                            <span className="inline-flex rounded-full bg-[#FCEBF4] px-3 py-1 text-xs font-semibold text-[#A10D5A]">
                              Unanswered
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* =================================================
                  PAGINATION
              ================================================= */}

              <div className="flex flex-col gap-4 border-t border-[#F3D5E5] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-gray-500">

                  Showing{" "}

                  <span className="font-semibold text-gray-700">
                    {startItem}
                  </span>{" "}

                  to{" "}

                  <span className="font-semibold text-gray-700">
                    {endItem}
                  </span>{" "}

                  of{" "}

                  <span className="font-semibold text-gray-700">
                    {filteredQuestions.length}
                  </span>{" "}

                  questions

                </p>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={
                      previousPage
                    }
                    disabled={
                      currentPage === 1
                    }
                    className="rounded-lg border border-[#E8BFD2] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-[#FDF1F6] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="rounded-lg bg-[#FCEBF4] px-4 py-2 text-sm font-semibold text-[#A10D5A]">
                    {currentPage} /{" "}
                    {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={nextPage}
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    className="rounded-lg border border-[#E8BFD2] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-[#FDF1F6] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>

                </div>

              </div>

            </>

          )}

        </div>
      )}

    </main>
  );
}