"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 flex items-center justify-between transition-colors duration-300">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <Image
          src="/sbbwu-logo.png"
          alt="Logo"
          width={45}
          height={45}
          priority
        />

        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            SBBWU AI Assistant
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-300">
            Shaheed Benazir Bhutto Women University
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Online Status */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>

          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Online
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() =>
            setTheme(resolvedTheme === "light" ? "dark" : "light")
          }
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
          aria-label="Toggle Theme"
        >
          {!mounted ? (
            <div className="w-5 h-5" />
          ) : resolvedTheme === "light" ? (
            <Moon
              size={20}
              className="text-gray-700 dark:text-white"
            />
          ) : (
            <Sun
              size={20}
              className="text-yellow-400"
            />
          )}
        </button>
      </div>
    </header>
  );
}