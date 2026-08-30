"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageCircleQuestion,
  Users,
  ThumbsUp,
  Database,
  ArrowLeft,
} from "lucide-react";

type MenuItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Unanswered Questions",
      href: "/admin/unanswered",
      icon: MessageCircleQuestion,
    },
    {
      name: "User Activity",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Feedback",
      href: "/admin/feedback",
      icon: ThumbsUp,
    },
   
  ];

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col bg-gradient-to-b from-[#7E0D46] via-[#8B0F4E] to-[#991157] text-white">

      {/* ========================= */}
      {/* LOGO + BRAND */}
      {/* ========================= */}

      <div className="flex flex-col items-center px-6 pb-6 pt-8">

        <img
          src="/bglogo.png"
          alt="SBBWU Logo"
          className="h-20 w-20 object-contain"
        />

        <h1 className="mt-4 text-lg font-bold">
          SBBWU Admin
        </h1>

        <p className="mt-1 text-xs text-white/60">
          AI Assistant Management
        </p>

      </div>


      {/* ========================= */}
      {/* NAVIGATION */}
      {/* ========================= */}

      <nav className="flex-1 px-4">

        <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-white/50">
          Administration
        </p>

        <div className="space-y-2">

          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#A10D5A] shadow-md"
                    : "text-white/90 hover:bg-[#B32868] hover:text-white"
                }`}
              >

                <Icon
                  size={19}
                  strokeWidth={2.2}
                />

                <span>
                  {item.name}
                </span>

              </Link>
            );
          })}

        </div>

      </nav>


      {/* ========================= */}
      {/* BACK TO CHAT */}
      {/* ========================= */}

      <div className="border-t border-white/10 p-4">

        <Link
          href="/chat"
          className="flex items-center gap-3 rounded-xl bg-[#B32868] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#D44A88]"
        >

          <ArrowLeft
            size={18}
            strokeWidth={2.2}
          />

          <span>
            Back to Chat
          </span>

        </Link>

      </div>

    </aside>
  );
}