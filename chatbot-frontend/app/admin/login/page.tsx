"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Invalid username or password"
        );
      }

      // Save login token
      localStorage.setItem(
        "admin_token",
        data.access_token
      );

      // Go to admin dashboard
      router.push("/admin");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc] px-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[#f3c6dc] bg-white p-8 shadow-sm dark:border-[#3a3035] dark:bg-[#1c1c1c]">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#A10D5A]/10 dark:bg-[#A10D5A]/20">
              <span className="text-2xl">🔐</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sign in to access the admin dashboard.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Enter admin username"
                required
                className="w-full rounded-lg border border-[#f3c6dc] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#A10D5A] focus:ring-2 focus:ring-[#A10D5A]/10 dark:border-[#4a3540] dark:bg-[#151515] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-[#C33C78] dark:focus:ring-[#A10D5A]/20"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter admin password"
                required
                className="w-full rounded-lg border border-[#f3c6dc] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#A10D5A] focus:ring-2 focus:ring-[#A10D5A]/10 dark:border-[#4a3540] dark:bg-[#151515] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-[#C33C78] dark:focus:ring-[#A10D5A]/20"
              />
            </div>

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#A10D5A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8B0F4E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

        </div>

        <p className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500">
          SBBWU AI Chatbot — Admin Portal
        </p>
      </div>
    </main>
  );
}
