"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setAuthenticated(true);
    setChecking(false);
  }, [router]);

  // Authentication check is still running
  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc] dark:bg-gray-900">
        <div className="rounded-xl border border-[#F3D5E5] bg-white px-8 py-6 text-center shadow-sm dark:border-[#3a3035] dark:bg-[#1c1c1c]">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#F3D5E5] border-t-[#A10D5A] dark:border-[#3a3035] dark:border-t-[#C33C78]" />

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Checking authentication...
          </p>

        </div>
      </main>
    );
  }

  // Not authenticated
  if (!authenticated) {
    return null;
  }

  // Authenticated
  return <>{children}</>;
}
