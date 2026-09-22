"use client";

import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  NotebookPen,
} from "lucide-react";

export type CalculatorView = "home" | "gpa" | "cgpa";

interface AcademicCalculatorHomeProps {
  onSelect: (view: CalculatorView) => void;
}

export default function AcademicCalculatorHome({
  onSelect,
}: AcademicCalculatorHomeProps) {
  return (
    <section className="min-h-full bg-white px-5 py-10 transition-colors duration-300 dark:bg-[#111111]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#A10D5A] bg-white shadow-sm transition-colors duration-300 dark:bg-[#1c1c1c]">
            <NotebookPen className="h-8 w-8 text-[#A10D5A]" />
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[#A10D5A] sm:text-4xl lg:text-[2.7rem]">
            Academic Calculator
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-gray-600 transition-colors duration-300 dark:text-gray-300 sm:text-lg">
            Calculate your Semester GPA and Overall CGPA quickly and accurately
            using the official SBBWU grading policy.
          </p>
        </div>

        {/* Cards */}
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
          {/* GPA Card */}
          <button
            onClick={() => onSelect("gpa")}
            className="group relative z-10 flex w-full max-w-sm justify-self-end flex-col overflow-hidden rounded-3xl border-2 border-[#A10D5A] bg-white p-8 shadow-lg shadow-pink-200/40 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-300/50 dark:bg-[#1c1c1c] dark:shadow-black/30 dark:hover:shadow-black/50"
          >
            <span className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-[#A10D5A] to-[#E0559B]" />

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FCE4EF] transition-transform duration-300 group-hover:scale-110 dark:bg-[#3a1b2d]">
              <Calculator className="h-8 w-8 text-[#A10D5A]" />
            </div>

            <h2 className="text-2xl font-bold text-[#1E1E1E] transition-colors duration-300 dark:text-white">
              Calculate GPA
            </h2>

            <p className="mt-3 flex-1 text-[15px] leading-7 text-gray-600 transition-colors duration-300 dark:text-gray-300">
              Calculate your semester GPA by entering marks and credit hours for
              each course.
            </p>

            <span className="mt-8 inline-flex items-center gap-2 font-semibold text-[#A10D5A]">
              Get Started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </button>

          {/* Center GIF */}
          <div className="flex items-center justify-center px-2">
            <Image
              src="/cropped.gif"
              alt="Academic Calculator"
              width={260}
              height={260}
              priority
              className="h-auto w-35 object-contain transition-transform duration-500 hover:scale-105 lg:w-[120px] xl:w-[150px]"
            />
          </div>

          {/* CGPA Card */}
          <button
            onClick={() => onSelect("cgpa")}
            className="group relative z-10 flex w-full max-w-sm justify-self-start flex-col overflow-hidden rounded-3xl border-2 border-[#A10D5A] bg-white p-8 shadow-lg shadow-pink-200/40 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-300/50 dark:bg-[#1c1c1c] dark:shadow-black/30 dark:hover:shadow-black/50"
          >
            <span className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-[#A10D5A] to-[#E0559B]" />

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FCE4EF] transition-transform duration-300 group-hover:scale-110 dark:bg-[#3a1b2d]">
              <BarChart3 className="h-8 w-8 text-[#A10D5A]" />
            </div>

            <h2 className="text-2xl font-bold text-[#1E1E1E] transition-colors duration-300 dark:text-white">
              Calculate CGPA
            </h2>

            <p className="mt-3 flex-1 text-[15px] leading-7 text-gray-600 transition-colors duration-300 dark:text-gray-300">
              Track your cumulative academic performance across multiple
              semesters with a single click.
            </p>

            <span className="mt-8 inline-flex items-center gap-2 font-semibold text-[#A10D5A]">
              Get Started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
