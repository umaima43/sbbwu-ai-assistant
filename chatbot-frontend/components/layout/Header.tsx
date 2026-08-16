


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
  Menu,
  Moon,
  Phone,
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
    label: "Contact Us",
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
  label: "Quick help",
  icon: Zap,
  desc: "Learn how to use the SBBWU AI Assistant.",
},
  
  
];

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E7E1E4] bg-white/95 shadow-[0_8px_24px_-12px_rgba(27,20,32,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-[#14101A]/95">

      <div className="flex h-[76px] items-center justify-between px-8">
        {/* LEFT — CREST + WORDMARK */}
        <div className="flex items-center gap-4">
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
          <div className="flex flex-col justify-center border-l border-[#E7E1E4] pl-4 dark:border-white/15">
            <h2 className="text-[19px] font-semibold leading-tight tracking-[-0.02em] text-[#A10D5A] ">
              SBBWU AI Assistant
            </h2>

            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-black dark:text-gray-300">
              Shaheed Benazir Bhutto Women University
            </p>
          </div>
        </div>

        {/* RIGHT — STATUS / THEME / MORE */}
        <div className="flex items-center gap-2">
          {/* Status */}
          <div className="hidden items-center gap-2 border-r border-[#E7E1E4] pr-4 sm:flex dark:border-white/15">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>

            <span className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Online
            </span>
          </div>

          {/* Theme Button */}
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() =>
              setTheme(resolvedTheme === "light" ? "dark" : "light")
            }
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#E7E1E4] text-gray-600 transition-colors duration-200 hover:border-[#A10D5A] hover:text-[#A10D5A] dark:border-white/15 dark:text-gray-300 dark:hover:border-[#B98A2E] dark:hover:text-[#B98A2E]"
          >
            {!mounted ? (
              <div className="h-4 w-4" />
            ) : resolvedTheme === "light" ? (
              <Moon size={17} />
            ) : (
              <Sun size={17} />
            )}
          </button>

          {/* MORE MENU */}
          <div className="relative" ref={menuRef}>
            {/* More Button */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className={`flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-all duration-200 ${
                menuOpen
                  ? "border-[#A10D5A] bg-[#A10D5A] text-white shadow-sm shadow-[#A10D5A]/20"
                  : "border-[#E7E1E4] text-gray-700 hover:border-[#A10D5A] hover:text-[#A10D5A] dark:border-white/15 dark:text-gray-200"
              }`}
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}

              <span className="tracking-wide">More</span>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div
                className="
                  absolute right-0 top-full z-50 mt-3
                  w-[400px] max-w-[calc(100vw-2rem)]
                  overflow-hidden rounded-xl
                  border border-[#A10D5A]/50
                  bg-white
                  shadow-[0_20px_60px_rgba(161,13,90,0.18)]
                  dark:border-[#A10D5A]/50
                  dark:bg-[#1B1420]
                "
              >
                {/* MENU HEADER */}
                <div className="relative border-b border-[#F0DCE6] px-6 py-5 dark:border-white/10">
                  <div className="flex flex-col items-center text-center">
                    {/* Sparkles */}
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

                  {/* Pink Accent */}
                  <div className="absolute bottom-0 left-1/2 h-[2px] w-12 -translate-x-1/2 rounded-full bg-[#A10D5A]" />
                </div>

                {/* MENU ITEMS */}
                <div
                  className="menu-scroll max-h-[360px] overflow-y-auto"
                  role="menu"
                >
                  {menuItems.map(
                    ({ href, label, icon: Icon, desc }) => (
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
                        <div
                          className="
                            flex h-10 w-10 shrink-0 items-center justify-center
                            rounded-xl
                            border border-[#F0DCE6]
                            bg-[#FFF8FB]
                            text-[#D0166F]
                            transition-all duration-200
                            group-hover:border-[#A10D5A]
                            group-hover:bg-[#FCE4EF]
                            group-hover:text-[#7A0A45]
                            dark:border-white/10
                            dark:bg-white/5
                            dark:text-[#E85C9C]
                            dark:group-hover:border-[#A10D5A]
                            dark:group-hover:bg-[#A10D5A]/10
                            dark:group-hover:text-[#E85C9C]
                          "
                        >
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
                          className="
                            shrink-0
                            text-gray-300
                            transition-all duration-200
                            group-hover:-translate-y-0.5
                            group-hover:translate-x-0.5
                            group-hover:text-[#A10D5A]
                            dark:text-gray-600
                          "
                        />
                      </Link>
                    )
                  )}
                </div>

                {/* FOOTER */}
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

                {/* CUSTOM SCROLLBAR */}
                
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}