"use client";

interface IconTooltipProps {
  label: string;
}

export default function IconTooltip({ label }: IconTooltipProps) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#A10D5A] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg shadow-[#A10D5A]/30 transition-all duration-150 group-hover:translate-y-0.5 group-hover:opacity-100 dark:bg-[#870B4C]"
    >
      {label}
    </span>
  );
}
