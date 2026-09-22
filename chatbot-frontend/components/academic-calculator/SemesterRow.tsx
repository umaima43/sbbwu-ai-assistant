"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Trash2 } from "lucide-react";
import type { Semester } from "@/lib/academic-calculator/grading";
import { previewGradeFromGPA } from "@/lib/academic-calculator/grading";

interface SemesterRowProps {
  semester: Semester;
  index: number;
  onUpdate: (
    id: number,
    field: keyof Semester,
    value: string
  ) => void;
  onRemove: (id: number) => void;
}

const SEMESTER_OPTIONS = Array.from(
  { length: 8 },
  (_, i) => `Semester ${i + 1}`
);

// Increased so all 8 semesters can appear without scrolling.
const DROPDOWN_MAX_HEIGHT = 384;
const GAP = 8;

interface Position {
  top: number;
  left: number;
  width: number;
  openUpward: boolean;
}

export default function SemesterRow({
  semester,
  index,
  onUpdate,
  onRemove,
}: SemesterRowProps) {
  const livePreview = previewGradeFromGPA(semester.gpa);

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] =
    useState<Position | null>(null);
  const [mounted, setMounted] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => setMounted(true), []);

  function computePosition() {
    if (!buttonRef.current) return;

    const rect =
      buttonRef.current.getBoundingClientRect();

    const spaceBelow =
      window.innerHeight - rect.bottom;

    const spaceAbove = rect.top;

    const openUpward =
      spaceBelow < DROPDOWN_MAX_HEIGHT &&
      spaceAbove > spaceBelow;

    setPosition({
      top: openUpward
        ? rect.top - GAP
        : rect.bottom + GAP,
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  }

  function toggleOpen() {
    if (!isOpen) {
      computePosition();
    }

    setIsOpen((prev) => !prev);
  }

  function handleSelect(label: string) {
    onUpdate(
      semester.id,
      "semester",
      label
    );

    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      const clickedTrigger =
        wrapperRef.current?.contains(target);

      const clickedList =
        listRef.current?.contains(target);

      if (!clickedTrigger && !clickedList) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleResize() {
      computePosition();
    }

    function handleScroll() {
      setIsOpen(false);
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    window.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );

      window.removeEventListener(
        "scroll",
        handleScroll,
        true
      );
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (isOpen) {
      computePosition();
    }

  }, [isOpen]);

  return (
    <div className="px-5 py-5 transition-colors hover:bg-[#FAD8E8]/50 dark:hover:bg-[#3a1b2d] sm:px-7">

      {/* Mobile Header */}
      <div className="mb-4 flex items-center justify-between gap-2 md:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A10D5A] text-xs font-bold text-white">
            {index + 1}
          </span>

          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Semester {index + 1}
          </span>
        </div>

        {livePreview && (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${livePreview.badge}`}
          >
            {livePreview.letter} tier
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[28px_minmax(0,1fr)_170px_170px_60px_52px] md:items-center">

        {/* Number */}
        <div className="hidden md:flex md:justify-center">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A10D5A] text-xs font-bold text-white">
            {index + 1}
          </span>
        </div>

        {/* Semester */}
        <div>
          <label
            htmlFor={`semester-${semester.id}`}
            className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400 md:sr-only"
          >
            Semester
          </label>

          <div
            className="relative"
            ref={wrapperRef}
          >
            <button
              ref={buttonRef}
              id={`semester-${semester.id}`}
              type="button"
              onClick={toggleOpen}
              className={`flex h-13 w-full items-center justify-between rounded-xl border-2 bg-white px-4 text-base font-semibold outline-none transition-all dark:bg-[#1c1c1c] ${
                isOpen
                  ? "border-[#A10D5A] ring-4 ring-white/60 dark:ring-[#A10D5A]/20"
                  : "border-white hover:border-[#F4B8D8] dark:border-[#3d2934] dark:hover:border-[#7E174B]"
              } ${
                semester.semester
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-500"
              }`}
            >
              <span>
                {semester.semester ||
                  "Select Semester"}
              </span>

              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  isOpen
                    ? "rotate-180 text-[#A10D5A]"
                    : ""
                }`}
              />
            </button>

            {/* Semester Dropdown */}
            {mounted &&
              isOpen &&
              position &&
              createPortal(
                <ul
                  ref={listRef}
                  role="listbox"
                  className="semester-dropdown-scroll fixed z-[9999] max-h-96 overflow-auto rounded-xl border-2 border-[#A10D5A] bg-white p-1.5 shadow-lg shadow-[#A10D5A]/20 dark:bg-[#1c1c1c]"
                  style={{
                    left: position.left,
                    width: position.width,
                    ...(position.openUpward
                      ? {
                          bottom:
                            window.innerHeight -
                            position.top,
                          top: "auto",
                        }
                      : {
                          top: position.top,
                          bottom: "auto",
                        }),
                  }}
                >
                  {SEMESTER_OPTIONS.map(
                    (label) => {
                      const isSelected =
                        semester.semester === label;

                      return (
                        <li
                          key={label}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleSelect(label)
                            }
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-base font-semibold transition-colors ${
                              isSelected
                                ? "bg-[#A10D5A] text-white"
                                : "text-gray-700 hover:bg-[#FDE7F1] hover:text-[#A10D5A] dark:text-gray-200 dark:hover:bg-[#3A1228] dark:hover:text-[#F4B8D8]"
                            }`}
                          >
                            {label}

                            {isSelected && (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        </li>
                      );
                    }
                  )}
                </ul>,
                document.body
              )}
          </div>
        </div>

        {/* Semester GPA */}
        <div>
          <label
            htmlFor={`gpa-${semester.id}`}
            className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400 md:sr-only"
          >
            Semester GPA
          </label>

          <div className="relative">
            <input
              id={`gpa-${semester.id}`}
              type="number"
              min="0"
              max="4"
              step="0.01"
              value={semester.gpa}
              onChange={(event) =>
                onUpdate(
                  semester.id,
                  "gpa",
                  event.target.value
                )
              }
              placeholder="e.g. 3.50"
              className="h-13 w-full rounded-xl border-2 border-white bg-white px-4 pr-16 text-base font-semibold text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-500 hover:border-[#F4B8D8] focus:border-[#A10D5A] focus:ring-4 focus:ring-white/60 dark:border-[#3d2934] dark:bg-[#1c1c1c] dark:text-white dark:placeholder:text-gray-500 dark:hover:border-[#7E174B] dark:focus:border-[#A10D5A] dark:focus:ring-[#A10D5A]/20"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
              / 4.00
            </span>
          </div>
        </div>

        {/* Credit Hours */}
        <div>
          <label
            htmlFor={`credit-hours-${semester.id}`}
            className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400 md:sr-only"
          >
            Credit Hours
          </label>

          <input
            id={`credit-hours-${semester.id}`}
            type="number"
            min="1"
            max="50"
            value={semester.creditHours}
            onChange={(event) =>
              onUpdate(
                semester.id,
                "creditHours",
                event.target.value
              )
            }
            placeholder="e.g. 18"
            className="h-13 w-full rounded-xl border-2 border-white bg-white px-4 text-base font-semibold text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-500 hover:border-[#F4B8D8] focus:border-[#A10D5A] focus:ring-4 focus:ring-white/60 dark:border-[#3d2934] dark:bg-[#1c1c1c] dark:text-white dark:placeholder:text-gray-500 dark:hover:border-[#7E174B] dark:focus:border-[#A10D5A] dark:focus:ring-[#A10D5A]/20"
          />
        </div>

        {/* Live Grade Preview */}
        <div className="hidden justify-center md:flex">
          {livePreview ? (
            <span
              title={`${livePreview.name} tier`}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-black ${livePreview.badge}`}
            >
              {livePreview.letter}
            </span>
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-gray-200 text-xs text-gray-300 dark:border-gray-700 dark:text-gray-600">
              —
            </span>
          )}
        </div>

        {/* Remove */}
        <div className="flex justify-end md:justify-center">
          <button
            type="button"
            onClick={() =>
              onRemove(semester.id)
            }
            title={`Remove Semester ${index + 1}`}
            aria-label={`Remove Semester ${index + 1}`}
            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-[#A10D5A] text-white shadow-sm transition-all hover:bg-[#870B4C]"
          >
            <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
          </button>
        </div>
      </div>

      {/* Dropdown Scrollbar */}
      <style jsx global>{`
        .semester-dropdown-scroll {
          scrollbar-width: thin;
          scrollbar-color: #d94f8f transparent;
        }

        .semester-dropdown-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .semester-dropdown-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .semester-dropdown-scroll::-webkit-scrollbar-thumb {
          background-color: #d94f8f;
          border-radius: 9999px;
        }

        .semester-dropdown-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #7a0940;
        }
      `}</style>
    </div>
  );
}
