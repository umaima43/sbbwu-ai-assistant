
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  ArrowUpRight,
  Bookmark,
  Calculator,
  CircleHelp,
  LogOut,
  Menu,
  Moon,
  Phone,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
  Zap,
} from "lucide-react";

const menuItems = [
  {
    href: "/academic-calculator",
    label: "Academic Calculator",
    icon: Calculator,
    desc: "Calculate GPA and CGPA in seconds.",
  },
  {
    href: "/bookmarks",
    label: "Bookmarks",
    icon: Bookmark,
    desc: "Access your saved chatbot responses.",
  },
  {
    href: "/contact-us",
    label: "Quick Contact",
    icon: Phone,
    desc: "Reach university offices and get direct assistance.",
  },
  {
    href: "/faq",
    label: "FAQ",
    icon: CircleHelp,
    desc: "Find answers to common student questions.",
  },
  {
    href: "/quick-help/user-guide",
    label: "Quick Help",
    icon: Zap,
    desc: "Learn how to use the SBBWU AI Assistant.",
  },
  {
    href: "/admin/login",
    label: "Admin Login",
    icon: ShieldCheck,
    desc: "Sign in to access the admin dashboard.",
  },
];

type ChatbotUser = {
  name?: string;
  email?: string;
};

interface HeaderProps {
  /** Called when the mobile hamburger button is pressed */
  onMenuOpen?: () => void;
}

export default function Header({ onMenuOpen }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [user, setUser] = useState<ChatbotUser | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ============================================================
  // LOAD LOGGED-IN USER
  // ============================================================

  useEffect(() => {
    function loadUser() {
      try {
        const storedUser = localStorage.getItem("chatbot_user");

        if (!storedUser) {
          setUser(null);
          return;
        }

        const parsedUser = JSON.parse(storedUser);

        if (parsedUser && typeof parsedUser === "object") {
          setUser(parsedUser);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    }

    loadUser();

    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  // ============================================================
  // REFRESH USER WHEN LOCAL STORAGE CHANGES
  // ============================================================

  useEffect(() => {
    function handleUserChanged() {
      try {
        const storedUser = localStorage.getItem("chatbot_user");

        if (!storedUser) {
          setUser(null);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        setUser(null);
      }
    }

    window.addEventListener("chatbot-user-changed", handleUserChanged);

    return () => {
      window.removeEventListener("chatbot-user-changed", handleUserChanged);
    };
  }, []);

  // ============================================================
  // CLOSE MENU WHEN CLICKING OUTSIDE
  // ============================================================

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ============================================================
  // LOGOUT
  // ============================================================

  function handleLogout() {
    localStorage.removeItem("chatbot_user");

    setUser(null);
    setMenuOpen(false);

    window.dispatchEvent(new Event("chatbot-user-changed"));

    window.location.href = "/auth";
  }

  // ============================================================
  // USER INITIAL
  // ============================================================

  const userInitial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    user?.email?.trim()?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <header className="sticky top-0 z-40 border-b border-[#E7E1E4] bg-white/95 shadow-[0_8px_24px_-12px_rgba(27,20,32,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-[#14101A]/95">

      <div className="flex h-[76px] items-center justify-between px-4 sm:px-8">

        {/* =====================================================
            LEFT — HAMBURGER (mobile) + CREST + WORDMARK
        ====================================================== */}

        <div className="flex items-center gap-3 sm:gap-4">

          {/* Mobile hamburger — hidden on md+ where sidebar is always visible */}
          <button
            type="button"
            onClick={onMenuOpen}
            aria-label="Open sidebar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#E7E1E4] text-gray-600 transition-colors hover:border-[#A10D5A] hover:text-[#A10D5A] md:hidden dark:border-white/15 dark:text-gray-300"
          >
            <Menu size={18} />
          </button>

          {/* Logo */}
          <div className="relative flex h-12 w-14 shrink-0 items-center justify-center rounded-md border border-[#E7E1E4] bg-white dark:border-white/15 dark:bg-white/5">
            <Image
              src="/bglogo.png"
              alt="SBBWU"
              width={41}
              height={39}
              priority
              className="object-contain"
            />
          </div>

          {/* University Name */}
          <div className="flex flex-col justify-center border-l border-[#E7E1E4] pl-3 sm:pl-4 dark:border-white/15">

            <h2 className="text-[17px] font-semibold leading-tight tracking-[-0.02em] text-[#A10D5A] sm:text-[19px]">
              SBBWU AI Assistant
            </h2>

            <p className="mt-0.5 hidden text-[11px] font-medium uppercase tracking-[0.16em] text-black sm:block dark:text-gray-300">
              Shaheed Benazir Bhutto Women University
            </p>

          </div>
        </div>

        {/* =====================================================
            RIGHT — MORE → THEME → USER → ONLINE
        ====================================================== */}

        <div className="flex items-center gap-2">

          {/* =================================================
              MORE MENU
          ================================================== */}

          <div className="relative" ref={menuRef}>

            {/* More Button */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className={`flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-all duration-200 ${
                menuOpen
                  ? "border-[#A10D5A] bg-white text-[#A10D5A] shadow-sm shadow-[#A10D5A]/15 dark:border-[#E85C9C] dark:bg-[#1B1420] dark:text-[#E85C9C]"
                  : "border-[#A10D5A] bg-[#A10D5A] text-white shadow-sm shadow-[#A10D5A]/25 hover:border-[#A10D5A] hover:bg-white hover:text-[#A10D5A] hover:shadow-md hover:shadow-[#A10D5A]/15 dark:border-[#A10D5A] dark:bg-[#A10D5A] dark:text-white dark:hover:border-[#E85C9C] dark:hover:bg-[#1B1420] dark:hover:text-[#E85C9C]"
              }`}
            >
              {menuOpen ? (
                <X size={16} strokeWidth={2.2} />
              ) : (
                <Menu size={16} strokeWidth={2.2} />
              )}

              <span className="tracking-wide">
                More
              </span>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-[400px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#A10D5A]/50 bg-white shadow-[0_20px_60px_rgba(161,13,90,0.18)] dark:border-[#A10D5A]/50 dark:bg-[#1B1420]">

                {/* Menu Header */}
                <div className="relative border-b border-[#F0DCE6] px-6 py-5 dark:border-white/10">

                  <div className="flex flex-col items-center text-center">

                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#FCE4EF] text-[#A10D5A] dark:bg-[#A10D5A]/15 dark:text-[#E85C9C]">
                      <Sparkles size={17} strokeWidth={2.1} />
                    </div>

                    <h3 className="text-[17px] font-bold tracking-tight text-[#A10D5A]">
                      More
                    </h3>

                    <p className="mt-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                      Explore more features and helpful options
                    </p>

                  </div>

                  <div className="absolute bottom-0 left-1/2 h-[2px] w-12 -translate-x-1/2 rounded-full bg-[#A10D5A]" />

                </div>

                {/* Menu Items */}
                <div className="menu-scroll max-h-[420px] overflow-y-auto" role="menu">

                  {menuItems.map(({ href, label, icon: Icon, desc }) => (
                    <Link
                      key={href}
                      href={href}
                      role="menuitem"
                      onClick={() => {
                        setActiveItem(href);

                        setTimeout(() => {
                          setMenuOpen(false);
                        }, 150);
                      }}
                      className={`group flex items-center gap-4 border-b border-[#F0EBEE] px-6 py-4 transition-all duration-200 last:border-b-0 dark:border-white/5 ${
                        activeItem === href
                          ? "bg-[#FAF3F7] dark:bg-white/5"
                          : "hover:bg-[#FAF3F7] dark:hover:bg-white/5"
                      }`}
                    >

                      {/* Item Icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F0DCE6] bg-[#FFF8FB] text-[#D0166F] transition-all duration-200 group-hover:border-[#A10D5A] group-hover:bg-[#FCE4EF] group-hover:text-[#7A0A45] dark:border-white/10 dark:bg-white/5 dark:text-[#E85C9C] dark:group-hover:border-[#A10D5A] dark:group-hover:bg-[#A10D5A]/10 dark:group-hover:text-[#E85C9C]">
                        <Icon size={17} strokeWidth={2} />
                      </div>

                      {/* Item Content */}
                      <div className="min-w-0 flex-1">

                        <h4 className="text-[14px] font-semibold text-[#1B1420] dark:text-white">
                          {label}
                        </h4>

                        <p className="mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400">
                          {desc}
                        </p>

                      </div>

                      {/* Arrow */}
                      <ArrowUpRight
                        size={15}
                        className="shrink-0 text-gray-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#A10D5A] dark:text-gray-600"
                      />

                    </Link>
                  ))}

                </div>

                {/* Footer */}
                <div className="border-t border-[#F0DCE6] bg-[#FFF9FC] px-6 py-3 dark:border-white/10 dark:bg-white/[0.02]">

                  <div className="flex items-center justify-center gap-2">

                    <Sparkles
                      size={13}
                      strokeWidth={2}
                      className="text-[#A10D5A]"
                    />

                    <p className="text-[11px] font-medium text-[#7A0A45] dark:text-[#E85C9C]">
                      Everything you need, all in one place
                    </p>

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              THEME BUTTON
          ================================================== */}

          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() =>
              setTheme(
                resolvedTheme === "light"
                  ? "dark"
                  : "light"
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#A10D5A] bg-[#A10D5A] text-white shadow-sm shadow-[#A10D5A]/20 transition-all duration-200 hover:border-[#A10D5A] hover:bg-white hover:text-[#A10D5A] hover:shadow-md hover:shadow-[#A10D5A]/15 dark:border-[#A10D5A] dark:bg-[#A10D5A] dark:text-white dark:hover:border-[#E85C9C] dark:hover:bg-[#1B1420] dark:hover:text-[#E85C9C]"
          >

            {!mounted ? (
              <div className="h-4 w-4" />
            ) : resolvedTheme === "light" ? (
              <Moon size={17} strokeWidth={2.2} />
            ) : (
              <Sun size={17} strokeWidth={2.2} />
            )}

          </button>

          {/* =================================================
              LOGGED-IN USER
          ================================================== */}

          {user && (
            <div className="hidden items-center gap-3 border-l border-[#E7E1E4] pl-4 sm:flex dark:border-white/15">

              {/* Avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FCE4EF] text-sm font-bold text-[#A10D5A] dark:bg-[#A10D5A]/15 dark:text-[#E85C9C]">
                {userInitial}
              </div>

              {/* Name + Email */}
              <div className="max-w-[180px]">

                <p className="truncate text-sm font-semibold text-gray-800 dark:text-white">
                  {user.name || "User"}
                </p>

                {user.email && (
                  <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                )}

              </div>

              {/* Logout */}
             <button 
            type="button" 
            onClick={handleLogout} 
            title="Logout" 
            aria-label="Logout" 
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#A10D5A] bg-[#A10D5A] text-white shadow-sm shadow-[#A10D5A]/20 transition-all duration-200 hover:border-[#A10D5A] hover:bg-white hover:text-[#A10D5A] hover:shadow-md hover:shadow-[#A10D5A]/15 dark:border-[#A10D5A] dark:bg-[#A10D5A] dark:text-white dark:hover:border-[#E85C9C] dark:hover:bg-[#1B1420] dark:hover:text-[#E85C9C]"
             >
  <LogOut size={16} />
</button>

            </div>
          )}

          {/* =================================================
              ONLINE STATUS
          ================================================== */}

          <div className="hidden items-center gap-2 border-l border-[#E7E1E4] pl-4 sm:flex dark:border-white/15">

            <span className="relative flex h-2 w-2">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />

            </span>

            <span className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Online
            </span>

          </div>

        </div>

      </div>

    </header>
  );
}
