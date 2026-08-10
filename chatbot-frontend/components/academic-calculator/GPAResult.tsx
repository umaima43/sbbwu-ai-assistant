"use client";

import { CheckCircle2, GraduationCap, Trophy } from "lucide-react";
import { getPerformanceLabel, type GPAResultData } from "@/lib/academic-calculator/grading";

interface GPAResultProps {
  result: GPAResultData;
}

export default function GPAResult({ result }: GPAResultProps) {
  return (
    <section className="mt-10">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#A10D5A] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[#A10D5A]/20">
          <CheckCircle2 className="h-4 w-4" />
          Calculation Complete
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
          Your GPA Result
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Here is the detailed breakdown of your semester performance.
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
              Your Semester GPA
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tight sm:text-7xl">
                {result.gpa.toFixed(2)}
              </span>
              <span className="text-lg font-semibold text-pink-100">/ 4.00</span>
            </div>
            <p className="mt-3 text-sm text-pink-100">{getPerformanceLabel(result.gpa)}</p>
            <p className="mt-1 text-xs text-pink-100/80">
              Based on {result.courses.length}{" "}
              {result.courses.length === 1 ? "subject" : "subjects"} and{" "}
              {result.totalCreditHours} credit hours.
            </p>
          </div>
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm">
            <GraduationCap className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-[#F4B8D8] bg-[#FFF3F8] p-5 shadow-sm dark:border-[#7E174B] dark:bg-[#3A1228]">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Semester GPA
          </p>
          <p className="mt-2 text-2xl font-bold text-[#A10D5A] dark:text-[#F4B8D8]">
            {result.gpa.toFixed(2)}
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
            Total Quality Points
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {result.totalQualityPoints.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-5 overflow-hidden rounded-3xl border-4 border-[#A10D5A] bg-[#A10D5A] text-white shadow-sm">
        <div className="border-b border-white/30 px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">GPA Breakdown</h2>
              <p className="mt-1 text-sm text-white/85">
                See how each subject contributed to your final GPA.
              </p>
            </div>
            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#FDE7F1] text-[#A10D5A] sm:flex dark:bg-[#3A1228] dark:text-[#F4B8D8]">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-187.5 bg-white text-left">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500 dark:bg-gray-950/40 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Marks</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4">Grade Point</th>
                <th className="px-6 py-4">Credit Hours</th>
                <th className="px-6 py-4">Quality Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {result.courses.map((course) => (
                <tr
                  key={course.id}
                  className="text-sm text-gray-700 transition-colors hover:bg-[#FFFDFE] dark:text-gray-300 dark:hover:bg-gray-800/40"
                >
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {course.subject}
                  </td>
                  <td className="px-6 py-4">{course.marks}%</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-lg bg-[#FDE7F1] px-2.5 py-1 text-xs font-bold text-[#A10D5A] dark:bg-[#3A1228] dark:text-[#F4B8D8]">
                      {course.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">{course.gradePoint.toFixed(2)}</td>
                  <td className="px-6 py-4">{course.creditHours}</td>
                  <td className="px-6 py-4 font-semibold">{course.qualityPoints.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-[#EAA9CA] bg-white md:hidden">
          {result.courses.map((course, index) => (
            <div key={course.id} className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDE7F1] text-sm font-bold text-[#A10D5A] dark:bg-[#3A1228] dark:text-[#F4B8D8]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{course.subject}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {course.marks}% marks
                    </p>
                  </div>
                </div>
                <span className="inline-flex rounded-lg bg-[#FDE7F1] px-2.5 py-1 text-xs font-bold text-[#A10D5A] dark:bg-[#3A1228] dark:text-[#F4B8D8]">
                  {course.grade}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950/50">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Grade Point
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                    {course.gradePoint.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950/50">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Credits
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                    {course.creditHours}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950/50">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Quality
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                    {course.qualityPoints.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-white/30 bg-[#A10D5A] px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-white/75">
                GPA Calculation
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                Total Quality Points ÷ Total Credit Hours
              </p>
            </div>
            <div className="rounded-xl bg-white px-4 py-3 text-lg font-black text-[#A10D5A] shadow-sm dark:bg-gray-900 dark:text-[#F4B8D8]">
              {result.totalQualityPoints.toFixed(2)} ÷ {result.totalCreditHours} ={" "}
              {result.gpa.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Formula */}
      <div className="mt-5 rounded-2xl border-2 border-[#A10D5A] bg-white p-5 shadow-sm">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDE7F1] text-[#A10D5A] dark:bg-[#3A1228] dark:text-[#F4B8D8]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              How your GPA was calculated
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Each subject&apos;s grade point (from SBBWU&apos;s marks-to-grade-point scale) was
              multiplied by its credit hours to get quality points. Total quality points were
              then divided by total credit hours attempted.
            </p>
            <div className="mt-3 rounded-xl border border-[#F4B8D8] bg-[#FFF8FB] px-4 py-3 text-sm font-bold text-[#A10D5A]">
              GPA = Total Quality Points ÷ Total Credit Hours
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


