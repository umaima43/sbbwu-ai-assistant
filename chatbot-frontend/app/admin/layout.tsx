"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
children,
}: {
children: React.ReactNode;
}) {
const pathname = usePathname();

// Admin login page should have NO sidebar
if (pathname === "/admin/login") {
return <>{children}</>;
}

// All other admin pages get the sidebar
return ( <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
{/* Admin Sidebar */} <AdminSidebar />


  {/* Admin Content */}
  <main className="min-w-0 flex-1 overflow-y-auto">
    {children}
  </main>
</div>


);
}

