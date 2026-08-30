"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UserActivity = {
  session_id: string;
  messages: number;
  questions: number;
  last_active: number;
};

const API_URL = "http://127.0.0.1:8000";
const ITEMS_PER_PAGE = 10;

export default function UserActivityPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  // ============================================================
  // LOGOUT
  // ============================================================

  function handleLogout() {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  }

  // ============================================================
  // LOAD USER ACTIVITY
  // ============================================================

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      // Get admin JWT
      const token = localStorage.getItem("admin_token");

      // No token -> login
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/analytics/users`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Token expired / invalid
      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `API error: ${response.status} ${response.statusText}`
        );
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid user activity response"
        );
      }

      setUsers(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(
        "User activity error:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to load user activity."
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
    loadUsers();
  }, []);

  // ============================================================
  // FORMAT DATE
  // ============================================================

  function formatDate(timestamp: number) {
    if (!timestamp) {
      return "Unknown";
    }

    return new Date(
      timestamp * 1000
    ).toLocaleString();
  }

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      users.length / ITEMS_PER_PAGE
    )
  );

  const paginatedUsers = useMemo(() => {
    const startIndex =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return users.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [users, currentPage]);

  const startItem =
    users.length === 0
      ? 0
      : (currentPage - 1) *
          ITEMS_PER_PAGE +
        1;

  const endItem = Math.min(
    currentPage * ITEMS_PER_PAGE,
    users.length
  );

  function goToPreviousPage() {
    setCurrentPage((page) =>
      Math.max(page - 1, 1)
    );
  }

  function goToNextPage() {
    setCurrentPage((page) =>
      Math.min(
        page + 1,
        totalPages
      )
    );
  }

  // ============================================================
  // TOTALS
  // ============================================================

  const totalQuestions = users.reduce(
    (total, user) =>
      total + (user.questions || 0),
    0
  );

  const totalMessages = users.reduce(
    (total, user) =>
      total + (user.messages || 0),
    0
  );

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-[#f8f9fc] p-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            User Activity
          </h1>

          <p className="mt-2 text-gray-500">
            Monitor chatbot sessions and user activity.
          </p>
        </div>

        {/* HEADER BUTTONS */}

        <div className="flex gap-3">

          {/* REFRESH */}

          <button
            type="button"
            onClick={loadUsers}
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
            className="rounded-xl border border-[#A10D5A] bg-white px-5 py-3 text-sm font-semibold text-[#A10D5A] transition hover:bg-[#fff0f7]"
          >
            Logout
          </button>

        </div>

      </div>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="rounded-xl border border-[#F3D5E5] bg-white p-8 text-center shadow-sm">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#F3D5E5] border-t-[#A10D5A]" />

          <p className="mt-4 text-gray-500">
            Loading user activity...
          </p>

        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">

          <p className="font-medium text-red-700">
            Failed to load user activity
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadUsers}
            className="mt-4 rounded-lg bg-[#A10D5A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8B0F4E]"
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

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">

            {/* Total Sessions */}

            <div className="rounded-xl border border-[#F3D5E5] bg-white p-6 shadow-sm">

              <p className="text-sm font-medium text-gray-500">
                Total Sessions
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#A10D5A]">
                {users.length}
              </h2>

            </div>

            {/* Total Questions */}

            <div className="rounded-xl border border-[#F3D5E5] bg-white p-6 shadow-sm">

              <p className="text-sm font-medium text-gray-500">
                Total Questions
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#A10D5A]">
                {totalQuestions}
              </h2>

            </div>

            {/* Total Messages */}

            <div className="rounded-xl border border-[#F3D5E5] bg-white p-6 shadow-sm">

              <p className="text-sm font-medium text-gray-500">
                Total Messages
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#A10D5A]">
                {totalMessages}
              </h2>

            </div>

          </div>

          {/* ==================================================
              USER ACTIVITY TABLE
          ================================================== */}

          <div className="overflow-hidden rounded-xl border border-[#F3D5E5] bg-white shadow-sm">

            {/* Table Header */}

            <div className="border-b border-[#F3D5E5] px-6 py-5">

              <h2 className="text-xl font-bold text-gray-900">
                Recent User Activity
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Sessions recorded by the chatbot.
              </p>

            </div>

            {/* Empty State */}

            {users.length === 0 ? (
              <div className="p-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FCEBF4]">

                  <span className="text-xl font-semibold text-[#A10D5A]">
                    —
                  </span>

                </div>

                <p className="mt-4 font-medium text-gray-700">
                  No user activity found.
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  User sessions will appear here when users
                  interact with the chatbot.
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

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Session ID
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Questions
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Messages
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Last Active
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-[#F8E7EF]">

                      {paginatedUsers.map(
                        (user) => (

                          <tr
                            key={
                              user.session_id
                            }
                            className="transition hover:bg-[#fdf8fa]"
                          >

                            {/* Session ID */}

                            <td className="px-6 py-5">

                              <span className="font-mono text-sm text-gray-700">
                                {user.session_id}
                              </span>

                            </td>

                            {/* Questions */}

                            <td className="px-6 py-5">

                              <span className="inline-flex min-w-[36px] items-center justify-center rounded-full bg-[#FCEBF4] px-2.5 py-1 text-sm font-semibold text-[#A10D5A]">
                                {user.questions}
                              </span>

                            </td>

                            {/* Messages */}

                            <td className="px-6 py-5">

                              <span className="font-semibold text-gray-900">
                                {user.messages}
                              </span>

                            </td>

                            {/* Last Active */}

                            <td className="px-6 py-5 text-sm text-gray-500">
                              {formatDate(
                                user.last_active
                              )}
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

                  {/* Result Count */}

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
                      {users.length}
                    </span>{" "}

                    sessions

                  </p>

                  {/* Controls */}

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={
                        goToPreviousPage
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
                      onClick={
                        goToNextPage
                      }
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

        </>
      )}

    </main>
  );
}