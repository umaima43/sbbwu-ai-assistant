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
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc]">
        <div className="rounded-xl border border-[#F3D5E5] bg-white px-8 py-6 text-center shadow-sm">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#F3D5E5] border-t-[#A10D5A]" />

          <p className="mt-4 text-sm text-gray-500">
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