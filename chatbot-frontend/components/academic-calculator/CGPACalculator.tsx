"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, BarChart3, CheckCircle2, Plus, RotateCcw } from "lucide-react";
import {
  MAX_SEMESTERS,
  calculateCGPA,
  createSemester,
  GRADE_STYLES,
  type Semester,
  type CGPAResultData,
} from "@/lib/academic-calculator/grading";
import SemesterRow from "./SemesterRow";
import CGPAResult from "./CGPAResult";

interface CGPACalculatorProps {
  onBack: () => void;
}

export default function CGPACalculator({ onBack }: CGPACalculatorProps) {
  const resultRef = useRef<HTMLDivElement>(null);
  const [semesters, setSemesters] = useState<Semester[]>([createSemester(1), createSemester(2)]);
  const [result, setResult] = useState<CGPAResultData | null>(null);
  const [error, setError] = useState("");

  const canCalculate = useMemo(
    () => semesters.some((s) => s.semester && s.gpa && s.creditHours),
    [semesters]
  );

  const updateSemester = (id: number, field: keyof Semester, value: string) => {
    setSemesters((current) =>
      current.map((semester) => (semester.id === id ? { ...semester, [field]: value } : semester))
    );
    setResult(null);
    setError("");
  };

  const addSemester = () => {
    if (semesters.length >= MAX_SEMESTERS) {
      setError(`You can add up to ${MAX_SEMESTERS} semesters for a standard undergraduate degree.`);
      return;
    }
    const nextId = semesters.length > 0 ? Math.max(...semesters.map((s) => s.id)) + 1 : 1;
    setSemesters((current) => [...current, createSemester(nextId)]);
    setResult(null);
    setError("");
  };

  const removeSemester = (id: number) => {
    if (semesters.length <= 1) {
      setError("At least one semester is required.");
      return;
    }
    setSemesters((current) => current.filter((semester) => semester.id !== id));
    setResult(null);
    setError("");
  };

  const handleCalculate = () => {
    const { result: cgpaResult, error: cgpaError } = calculateCGPA(semesters);
    setResult(cgpaResult);
    setError(cgpaError ?? "");

    if (cgpaResult) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const resetCalculator = () => {
    setSemesters([createSemester(1), createSemester(2)]);
    setResult(null);
    setError("");
  };

  return (
    <section className="min-h-full bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        {/* <button
          type="button"
          onClick={onBack}
          className="group mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#A10D5A] transition-all hover:bg-[#FFF0F6] dark:text-[#F4B8D8] dark:hover:bg-[#3A1228]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Calculator
        </button> */}




         <div className="mb-6 flex justify-start">
  <button
    type="button"
    onClick={onBack}
    aria-label="Back to Calculator"
    title="Back to Calculator"
    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#A10D5A] bg-[#A10D5A] text-white shadow-md transition-all duration-200 hover:bg-white hover:text-[#A10D5A] hover:shadow-lg active:scale-95 active:bg-white active:text-[#A10D5A] dark:bg-[#A10D5A] dark:text-white dark:hover:bg-gray-900 dark:hover:text-[#A10D5A]"
  >
    <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.3} />
  </button>
</div>
         
         





        {/* Header — centered, matches GPA section */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-gray-900 sm:text-2xl">
            Calculate Your{" "}
            <span className="mx-1 text-[1.35em] font-bold text-[#A10D5A]">
              CUMULATIVE
            </span>{" "}
            GPA
          </h1>

          {/* Description card — pink */}
          <div className="mt-4 mb-6 max-w-2xl rounded-2xl border-2 border-[#A10D5A] bg-white px-6 py-4 shadow-sm">
            <p className="text-sm leading-6 text-gray-700 sm:text-base">
              Add the GPA and credit hours for each semester to get your overall CGPA using{" "}
              <span className="font-semibold text-[#A10D5A] dark:text-[#F4B8D8]">
                SBBWU&apos;s grading scale
              </span>
              .
            </p>
          </div>
        </div>

        {/* Info card — white */}
        {/* <div className="mb-6 mt-4 flex gap-4 rounded-2xl border-2 border-[#A10D5A] bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#A10D5A] text-white">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              How CGPA is calculated
            </p>
            <p className="mt-1.5 text-xs leading-5 text-gray-600 sm:text-sm">
              Enter the GPA and total credit hours for each completed semester. Your cumulative
              GPA is calculated using the weighted credit hours of all entered semesters.
            </p>
          </div>
        </div> */}

        {/* Input card */}
        <div className="overflow-hidden rounded-3xl border-2 border-[#A10D5A] bg-[#FAD8E8] shadow-lg shadow-pink-200/50">
          <div className="border-b-2 border-[#A10D5A] bg-[#A10D5A] px-5 py-5 sm:px-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Enter Your Semester Details
                </h2>
                <p className="mt-1 text-xs text-white/85 sm:text-sm">
                  Add the GPA and credit hours for each completed semester.
                </p>
              </div>
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#A10D5A] text-white sm:flex">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="hidden grid-cols-[28px_minmax(0,1fr)_170px_170px_60px_52px] gap-4 border-b border-[#A10D5A] bg-[#A10D5A] px-5 py-3 text-xs font-bold uppercase tracking-wide text-white md:grid md:px-7">
            <span />
            <span>Semester</span>
            <span>Semester GPA</span>
            <span>Total Credit Hours</span>
            <span className="text-center">Grade</span>
            <span />
          </div>

          <div className="divide-y divide-[#EAA9CA]">
            {semesters.map((semester, index) => (
              <SemesterRow
                key={semester.id}
                semester={semester}
                index={index}
                onUpdate={updateSemester}
                onRemove={removeSemester}
              />
            ))}
          </div>

          <div className="border-t border-[#EAA9CA] bg-[#FAD8E8] px-5 py-5 sm:px-7">
            <button
              type="button"
              onClick={addSemester}
              disabled={semesters.length >= MAX_SEMESTERS}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#A10D5A] bg-white px-4 py-2.5 text-sm font-bold text-[#A10D5A] transition-all hover:bg-[#A10D5A] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Another Semester
            </button>
            <p className="mt-2 text-xs text-gray-400">
              {semesters.length}/{MAX_SEMESTERS} semesters added
            </p>
          </div>
        </div>

        {/* Tier  — functional key for the badges shown per row */}
        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border-2 border-[#A10D5A] bg-white px-4 py-3.5 shadow-sm sm:px-5">
          <span className="mr-1 text-xs font-bold uppercase tracking-wide text-gray-400">
            GPA Grades Tier
          </span>
          {Object.values(GRADE_STYLES).map((style) => (
            <span
              key={style.letter}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${style.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.bar}`} />
              {style.letter} · {style.name}
            </span>
          ))}
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetCalculator}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#A10D5A] bg-white px-5 text-sm font-bold text-[#A10D5A] transition-all hover:bg-[#FDE7F1]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleCalculate}
            disabled={!canCalculate}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#A10D5A] px-7 text-sm font-bold text-white shadow-lg shadow-[#A10D5A]/20 transition-all hover:bg-[#870B4C] hover:shadow-xl hover:shadow-[#A10D5A]/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            <BarChart3 className="h-4 w-4" />
            Calculate CGPA
          </button>
        </div>

        {/* CGPA Result */}
        {result && (
          <div ref={resultRef} className="scroll-mt-24">
            <CGPAResult result={result} />
          </div>
        )}
      </div>
    </section>
  );
}
