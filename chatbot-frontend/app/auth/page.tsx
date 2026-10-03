
"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = "http://127.0.0.1:8000";

type Mode = "signin" | "signup";

// ============================================================
// Inner component that uses useSearchParams
// (must be inside a <Suspense> boundary)
// ============================================================

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>("signin");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================================================
  // GOOGLE LOGIN CALLBACK
  // ============================================================

  useEffect(() => {
    const googleSuccess =
      searchParams.get("google_success");

    if (googleSuccess !== "true") {
      return;
    }

    const id = searchParams.get("id");
    const googleName = searchParams.get("name");
    const googleEmail = searchParams.get("email");

    if (!id || !googleEmail) {
      setError(
        "Google login succeeded, but user information was missing."
      );
      return;
    }

    const googleUser = {
      id: Number(id),
      name: googleName || googleEmail.split("@")[0],
      email: googleEmail,
    };

    // Save logged-in Google user
    localStorage.setItem(
      "chatbot_user",
      JSON.stringify(googleUser)
    );

    // Remove OAuth parameters from browser history
    window.history.replaceState(
      {},
      document.title,
      "/auth"
    );

    // Go to chatbot
    router.replace("/chat");
  }, [searchParams, router]);

  // ============================================================
  // NORMAL EMAIL LOGIN / SIGNUP
  // ============================================================

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "signup"
          ? `${API_URL}/auth/signup`
          : `${API_URL}/auth/login`;

      const body =
        mode === "signup"
          ? {
              name,
              email,
              password,
            }
          : {
              email,
              password,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Authentication failed"
        );
      }

      // ========================================================
      // SIGN UP
      // ========================================================

      if (mode === "signup") {
        setMode("signin");
        setPassword("");

        setError(
          "Account created successfully. Please sign in."
        );

        return;
      }

      // ========================================================
      // SIGN IN
      // ========================================================

      if (!data.user) {
        throw new Error(
          "Login succeeded but user information was missing."
        );
      }

      localStorage.setItem(
        "chatbot_user",
        JSON.stringify(data.user)
      );

      router.push("/chat");

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // GOOGLE SIGN IN
  // ============================================================

  function handleGoogleSignIn() {
    setError("");

    window.location.href =
      `${API_URL}/auth/google`;
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc] px-4 dark:bg-[#120E15]">

      <div className="w-full max-w-md">

        <div className="rounded-2xl border border-[#f0c9df] bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#1B1420]">

          {/* Header */}

          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#A10D5A]/10">

              <span className="text-2xl">
                🤖
              </span>

            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              SBBWU AI Assistant
            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {mode === "signin"
                ? "Sign in to continue to the chatbot."
                : "Create your account to get started."}
            </p>

          </div>

          {/* Error / Success */}

          {error && (
            <div className="mb-5 rounded-lg border border-[#f0c9df] bg-[#fff8fc] p-3">

              <p className="text-sm text-[#A10D5A]">
                {error}
              </p>

            </div>
          )}

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Name */}

            {mode === "signup" && (
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your name"
                  required
                  className="w-full rounded-lg border border-[#f0c9df] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#A10D5A] focus:ring-2 focus:ring-[#A10D5A]/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />

              </div>
            )}

            {/* Email */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border border-[#f0c9df] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#A10D5A] focus:ring-2 focus:ring-[#A10D5A]/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
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
                placeholder="Enter your password"
                required
                minLength={6}
                className="w-full rounded-lg border border-[#f0c9df] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#A10D5A] focus:ring-2 focus:ring-[#A10D5A]/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />

            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#A10D5A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8B0F4E] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading
                ? "Please wait..."
                : mode === "signin"
                ? "Sign In"
                : "Create Account"}

            </button>

          </form>

          {/* Google */}

          <div className="mt-6">

            <div className="relative">

              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-white/10" />
              </div>

              <div className="relative flex justify-center">

                <span className="bg-white px-3 text-xs text-gray-400 dark:bg-[#1B1420]">
                  OR
                </span>

              </div>

            </div>

            {/* Google Sign In */}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
            >

              <span className="text-lg">
                G
              </span>

              Continue with Google

            </button>

          </div>

          {/* Switch */}

          <div className="mt-6 text-center">

            <p className="text-sm text-gray-500 dark:text-gray-400">

              {mode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={() => {
                  setError("");

                  setMode(
                    mode === "signin"
                      ? "signup"
                      : "signin"
                  );
                }}
                className="ml-1 font-semibold text-[#A10D5A] hover:underline"
              >

                {mode === "signin"
                  ? "Sign Up"
                  : "Sign In"}

              </button>

            </p>

          </div>

        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          SBBWU AI Assistant
        </p>

      </div>

    </main>
  );
}

// ============================================================
// Page export — wraps AuthContent in a Suspense boundary
// so useSearchParams() is satisfied during static generation
// ============================================================

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  );
}
