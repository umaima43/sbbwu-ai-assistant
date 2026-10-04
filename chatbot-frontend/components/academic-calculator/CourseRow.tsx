"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Trash2 } from "lucide-react";
import type { Course } from "@/lib/academic-calculator/grading";

interface CourseRowProps {
  course: Course;
  index: number;
  onUpdate: (id: number, field: keyof Course, value: string) => void;
  onRemove: (id: number) => void;
}

const CREDIT_HOUR_OPTIONS = [1, 2, 3, 4, 5, 6];
const DROPDOWN_GAP = 6;

export default function CourseRow({
  course,
  index,
  onUpdate,
  onRemove,
}: CourseRowProps) {
  const [isCreditMenuOpen, setIsCreditMenuOpen] = useState(false);

  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
    openUpward: boolean;
  } | null>(null);

  const creditHoursRef = useRef<HTMLDivElement>(null);
  const creditHoursButtonRef = useRef<HTMLButtonElement>(null);
  const creditHoursMenuRef = useRef<HTMLUListElement>(null);

  function positionCreditHoursMenu() {
    if (!creditHoursButtonRef.current) return;

    const rect =
      creditHoursButtonRef.current.getBoundingClientRect();

    const openUpward =
      window.innerHeight - rect.bottom < 260 &&
      rect.top > window.innerHeight - rect.bottom;

    setMenuPosition({
      top: openUpward
        ? rect.top - DROPDOWN_GAP
        : rect.bottom + DROPDOWN_GAP,
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  }

  function toggleCreditHoursMenu() {
    if (!isCreditMenuOpen) {
      positionCreditHoursMenu();
    }

    setIsCreditMenuOpen((current) => !current);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        !creditHoursRef.current?.contains(target) &&
        !creditHoursMenuRef.current?.contains(target)
      ) {
        setIsCreditMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isCreditMenuOpen) return;

    const handleResize = () => positionCreditHoursMenu();

    const handleScroll = () => {
      setIsCreditMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isCreditMenuOpen]);

  useLayoutEffect(() => {
    if (isCreditMenuOpen) {
      positionCreditHoursMenu();
    }
  }, [isCreditMenuOpen]);

  return (
    <div className="px-5 py-5 transition-colors hover:bg-[#FAD8E8]/50 dark:hover:bg-[#3a1b2d] sm:px-7">
      {/* Mobile label */}
      <div className="mb-4 flex items-center gap-2 md:hidden">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A10D5A] text-xs font-bold text-white">
          {index + 1}
        </span>

        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
          Subject {index + 1}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-[28px_minmax(0,1fr)_150px_180px_52px] md:items-center">
        {/* Number */}
        <div className="hidden md:flex md:justify-center">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A10D5A] text-xs font-bold text-white">
            {index + 1}
          </span>
        </div>

        {/* Subject */}
        <div>
          <label
            htmlFor={`subject-${course.id}`}
            className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400 md:sr-only"
          >
            Subject
          </label>

          <input
            id={`subject-${course.id}`}
            type="text"
            value={course.subject}
            onChange={(event) =>
              onUpdate(
                course.id,
                "subject",
                event.target.value
              )
            }
            placeholder="e.g. Software Engineering"
            className="h-13 w-full rounded-xl border-2 border-white bg-white px-4 text-base font-semibold text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-500 hover:border-[#F4B8D8] focus:border-[#A10D5A] focus:ring-4 focus:ring-white/60 dark:border-[#3d2934] dark:bg-[#1c1c1c] dark:text-white dark:placeholder:text-gray-500 dark:hover:border-[#7E174B] dark:focus:border-[#A10D5A] dark:focus:ring-[#A10D5A]/20"
          />
        </div>

        {/* Marks */}
        <div>
          <label
            htmlFor={`marks-${course.id}`}
            className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400 md:sr-only"
          >
            Marks Obtained
          </label>

          <div className="relative">
            <input
              id={`marks-${course.id}`}
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={course.marks}
              onChange={(event) =>
                onUpdate(
                  course.id,
                  "marks",
                  event.target.value
                )
              }
              placeholder="e.g. 85"
              className="h-13 w-full rounded-xl border-2 border-white bg-white px-4 pr-10 text-base font-semibold text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-500 hover:border-[#F4B8D8] focus:border-[#A10D5A] focus:ring-4 focus:ring-white/60 dark:border-[#3d2934] dark:bg-[#1c1c1c] dark:text-white dark:placeholder:text-gray-500 dark:hover:border-[#7E174B] dark:focus:border-[#A10D5A] dark:focus:ring-[#A10D5A]/20"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
              %
            </span>
          </div>
        </div>

        {/* Credit Hours */}
        <div>
          <label
            htmlFor={`credit-hours-${course.id}`}
            className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400 md:sr-only"
          >
            Credit Hours
          </label>

          <div
            className="relative"
            ref={creditHoursRef}
          >
            <button
              ref={creditHoursButtonRef}
              id={`credit-hours-${course.id}`}
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isCreditMenuOpen}
              onClick={toggleCreditHoursMenu}
              className={`flex h-13 w-full items-center justify-between rounded-xl border-2 px-4 text-left text-base font-semibold shadow-sm outline-none transition-all ${
                isCreditMenuOpen
                  ? "border-[#A10D5A] ring-4 ring-white/60 dark:ring-[#A10D5A]/20"
                  : "border-white hover:border-[#F4B8D8] dark:border-[#3d2934] dark:hover:border-[#7E174B]"
              } ${
                course.creditHours
                  ? "bg-white text-gray-900 dark:bg-[#1c1c1c] dark:text-white"
                  : "bg-white text-gray-500 dark:bg-[#1c1c1c] dark:text-gray-500"
              }`}
            >
              <span>
                {course.creditHours
                  ? `${course.creditHours} Cr Hr${
                      Number(course.creditHours) > 1
                        ? "s"
                        : ""
                    }`
                  : "Select"}
              </span>

              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  isCreditMenuOpen
                    ? "rotate-180 text-[#A10D5A]"
                    : ""
                }`}
              />
            </button>

            {/* Credit Hours Dropdown */}
            {isCreditMenuOpen &&
              menuPosition &&
              createPortal(
                <ul
                  ref={creditHoursMenuRef}
                  role="listbox"
                  aria-labelledby={`credit-hours-${course.id}`}
                  className="fixed z-[9999] overflow-hidden rounded-xl border-2 border-[#A10D5A] bg-white p-1.5 shadow-lg shadow-[#A10D5A]/20 dark:bg-[#1c1c1c]"
                  style={{
                    left: menuPosition.left,
                    width: menuPosition.width,
                    ...(menuPosition.openUpward
                      ? {
                          bottom:
                            window.innerHeight -
                            menuPosition.top,
                          top: "auto",
                        }
                      : {
                          top: menuPosition.top,
                          bottom: "auto",
                        }),
                  }}
                >
                  {CREDIT_HOUR_OPTIONS.map((hours) => {
                    const isSelected =
                      String(hours) ===
                      String(course.creditHours);

                    return (
                      <li
                        key={hours}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onUpdate(
                              course.id,
                              "creditHours",
                              String(hours)
                            );
                            setIsCreditMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-base font-semibold transition-colors ${
                            isSelected
                              ? "bg-[#A10D5A] text-white"
                              : "text-gray-700 hover:bg-[#FDE7F1] hover:text-[#A10D5A] dark:text-gray-200 dark:hover:bg-[#3A1228] dark:hover:text-[#F4B8D8]"
                          }`}
                        >
                          {hours} Cr Hr
                          {hours > 1 ? "s" : ""}

                          {isSelected && (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>,
                document.body
              )}
          </div>
        </div>

        {/* Remove */}
        <div className="flex justify-end md:justify-center">
          <button
            type="button"
            onClick={() => onRemove(course.id)}
            title={`Remove Subject ${index + 1}`}
            aria-label={`Remove Subject ${index + 1}`}
            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-[#A10D5A] text-white shadow-sm transition-all hover:bg-[#870B4C]"
          >
            <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
          </button>
        </div>
      </div>
    </div>
  );
}
