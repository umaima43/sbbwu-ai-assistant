"use client";

import { CheckCircle2, GraduationCap, TrendingUp, Trophy } from "lucide-react";
import {
  getPerformanceLabel,
  previewGradeFromGPA,
  type CGPAResultData,
} from "@/lib/academic-calculator/grading";

interface CGPAResultProps {
  result: CGPAResultData;
}

export default function CGPAResult({ result }: CGPAResultProps) {
  return (
    <section className="mt-10">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#A10D5A] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[#A10D5A]/20">
          <CheckCircle2 className="h-4 w-4" />
          Calculation Complete
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
          Your CGPA Result
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Here is how your semesters combine into your cumulative GPA.
        </p>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border-4 border-[#A10D5A] bg-[#A10D5A] p-7 text-white shadow-xl shadow-[#A10D5A]/20 sm:p-9">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-black/10" />

        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-pink-100">
              <Trophy className="h-4 w-4" />
              Your Cumulative GPA
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tight sm:text-7xl">
                {result.cgpa.toFixed(2)}
              </span>
              <span className="text-lg font-semibold text-pink-100">/ 4.00</span>
            </div>
            <p className="mt-3 text-sm text-pink-100">{getPerformanceLabel(result.cgpa)}</p>
            <p className="mt-1 text-xs text-pink-100/80">
              Based on {result.semesters.length}{" "}
              {result.semesters.length === 1 ? "semester" : "semesters"} and{" "}
              {result.totalCreditHours} credit hours.
            </p>
            {result.cgpa < 3.0 && (
              <p className="mt-1 text-xs text-pink-100/80">
                SBBWU&apos;s minimum standing is a 3.00 CGPA — below that, an academic plan may
                be required.
              </p>
            )}
          </div>
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm">
            <TrendingUp className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-[#F4B8D8] bg-[#FFF3F8] p-5 shadow-sm dark:border-[#7E174B] dark:bg-[#3A1228]">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Cumulative GPA
          </p>
          <p className="mt-2 text-2xl font-bold text-[#A10D5A] dark:text-[#F4B8D8]">
            {result.cgpa.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-[#F4B8D8] bg-[#FFF3F8] p-5 shadow-sm dark:border-[#7E174B] dark:bg-[#3A1228]">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Total Credit Hours
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {result.totalCreditHours}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-[#F4B8D8] bg-[#FFF3F8] p-5 shadow-sm dark:border-[#7E174B] dark:bg-[#3A1228]">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Semesters
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {result.semesters.length}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-5 overflow-hidden rounded-3xl border-4 border-[#A10D5A] bg-[#A10D5A] text-white shadow-sm">
        <div className="border-b border-white/30 px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Semester Breakdown
              </h2>
              <p className="mt-1 text-sm text-white/85">
                See how each semester contributed to your cumulative GPA.
              </p>
            </div>
            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#FDE7F1] text-[#A10D5A] sm:flex dark:bg-[#3A1228] dark:text-[#F4B8D8]">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-162.5 bg-white text-left">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500 dark:bg-gray-950/40 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">Semester</th>
                <th className="px-6 py-4">GPA</th>
                <th className="px-6 py-4">Tier</th>
                <th className="px-6 py-4">Credit Hours</th>
                <th className="px-6 py-4">Quality Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {result.semesters.map((semester) => {
                const style = previewGradeFromGPA(String(semester.gpa));
                return (
                  <tr
                    key={semester.id}
                    className="text-sm text-gray-700 transition-colors hover:bg-[#FFFDFE] dark:text-gray-300 dark:hover:bg-gray-800/40"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {semester.semester}
                    </td>
                    <td className="px-6 py-4 font-semibold">{semester.gpa.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${
                          style?.badge ?? "border-gray-200 bg-gray-50 text-gray-600"
                        }`}
                      >
                        {style?.letter ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{semester.creditHours}</td>
                    <td className="px-6 py-4 font-semibold">
                      {semester.qualityPoints.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-[#EAA9CA] bg-white md:hidden">
          {result.semesters.map((semester, index) => {
            const style = previewGradeFromGPA(String(semester.gpa));
            return (
              <div key={semester.id} className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDE7F1] text-sm font-bold text-[#A10D5A] dark:bg-[#3A1228] dark:text-[#F4B8D8]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {semester.semester}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {semester.gpa.toFixed(2)} GPA
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${
                      style?.badge ?? "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  >
                    {style?.letter ?? "—"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950/50">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      Credits
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                      {semester.creditHours}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950/50">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      Quality Points
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                      {semester.qualityPoints.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-white/30 bg-[#A10D5A] px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-white/75">
                CGPA Calculation
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                Total Quality Points ÷ Total Credit Hours
              </p>
            </div>
            <div className="rounded-xl bg-white px-4 py-3 text-lg font-black text-[#A10D5A] shadow-sm dark:bg-gray-900 dark:text-[#F4B8D8]">
              {result.totalQualityPoints.toFixed(2)} ÷ {result.totalCreditHours} ={" "}
              {result.cgpa.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Formula */}
      <div className="mt-5 rounded-2xl border-2 border-[#A10D5A] bg-white p-5 shadow-sm">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDE7F1] text-[#A10D5A] dark:bg-[#3A1228] dark:text-[#F4B8D8]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              How your CGPA was calculated
            </p>
            <div className="mt-3 rounded-xl border border-[#F4B8D8] bg-[#FFF8FB] px-4 py-3 text-sm font-bold text-[#A10D5A]">
              CGPA = Total Quality Points ÷ Total Credit Hours
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
