"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  durationMs?: number;
}

export default function Toast({ message, show, onClose, durationMs = 3000 }: ToastProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [show, onClose, durationMs]);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-1000 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-[#F4B8D8] bg-white px-5 py-3.5 shadow-2xl shadow-black/10 animate-in fade-in slide-in-from-bottom-3 duration-300 dark:border-[#7E174B] dark:bg-gray-900">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#A10D5A]/10 text-[#A10D5A] dark:bg-[#A10D5A]/20 dark:text-[#F4B8D8]">
          <CheckCircle2 className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="ml-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
