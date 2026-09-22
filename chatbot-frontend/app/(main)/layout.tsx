"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function MainLayout({
children,
}: {
children: React.ReactNode;
}) {
const router = useRouter();
const [checkingAuth, setCheckingAuth] = useState(true);
const [sidebarOpen, setSidebarOpen] = useState(false);

useEffect(() => {
const storedUser = localStorage.getItem("chatbot_user");


if (!storedUser) {
  router.replace("/auth");
  return;
}

setCheckingAuth(false);


}, [router]);

// Don't show the main layout while checking login
if (checkingAuth) {
return null;
}

return ( <div className="flex min-h-screen bg-[#F7F8FC] dark:bg-gray-900">
{/* Desktop sidebar — hidden on mobile, visible md+ */} <aside className="sticky top-0 hidden h-screen shrink-0 md:block"> <Sidebar /> </aside>


  {/* Mobile sidebar overlay */}
  <Sidebar
    mobileOpen={sidebarOpen}
    onMobileClose={() => setSidebarOpen(false)}
  />

  <div className="flex min-w-0 flex-1 flex-col">
    <Header onMenuOpen={() => setSidebarOpen(true)} />

    <main className="min-w-0 flex-1">
      {children}
    </main>
  </div>
</div>


);
}
