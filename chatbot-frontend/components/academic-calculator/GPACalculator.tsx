"use client";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, BarChart3, CheckCircle2, Plus, RotateCcw } from "lucide-react";
import {
  MAX_SUBJECTS,
  calculateGPA,
  createCourse,
  type Course,
  type GPAResultData,
} from "@/lib/academic-calculator/grading";
import CourseRow from "./CourseRow";
import GPAResult from "./GPAResult";

interface GPACalculatorProps {
  onBack: () => void;
}

export default function GPACalculator({ onBack }: GPACalculatorProps) {
  // Reference to the result section so we can automatically scroll to it
  const resultRef = useRef<HTMLDivElement>(null);

  const [courses, setCourses] = useState<Course[]>([
    createCourse(1),
    createCourse(2),
  ]);

  const [result, setResult] = useState<GPAResultData | null>(null);
  const [error, setError] = useState("");

  const canCalculate = useMemo(
    () =>
      courses.some(
        (course) => course.subject && course.marks && course.creditHours
      ),
    [courses]
  );

  const updateCourse = (
    id: number,
    field: keyof Course,
    value: string
  ) => {
    setCourses((current) =>
      current.map((course) =>
        course.id === id
          ? { ...course, [field]: value }
          : course
      )
    );

    // Clear previous result when user changes the inputs
    setResult(null);
    setError("");
  };

  const addCourse = () => {
    if (courses.length >= MAX_SUBJECTS) {
      setError(
        `You can add up to ${MAX_SUBJECTS} subjects per semester.`
      );
      return;
    }

    const nextId =
      courses.length > 0
        ? Math.max(...courses.map((c) => c.id)) + 1
        : 1;

    setCourses((current) => [
      ...current,
      createCourse(nextId),
    ]);

    setResult(null);
    setError("");
  };

  const removeCourse = (id: number) => {
    if (courses.length <= 1) {
      setError("At least one subject is required.");
      return;
    }

    setCourses((current) =>
      current.filter((course) => course.id !== id)
    );

    setResult(null);
    setError("");
  };

  const handleCalculate = () => {
    // Calculate GPA using the current course data
    const {
      result: gpaResult,
      error: gpaError,
    } = calculateGPA(courses);

    setResult(gpaResult);
    setError(gpaError ?? "");

    // If calculation was successful, smoothly scroll to the result
    if (gpaResult) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const resetCalculator = () => {
    setCourses([
      createCourse(1),
      createCourse(2),
    ]);

    setResult(null);
    setError("");
  };

  return (
    <section className="min-h-full bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Back Button */}
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
        {/* Header */}
  
        <div className="flex flex-col items-center text-center">
  <h1 className="text-xl font-semibold tracking-[-0.02em] text-gray-900 sm:text-2xl">
    Calculate Your{" "}
    <span className="mx-1 text-[1.35em] font-bold text-[#A10D5A]">
      SEMESTER
    </span>{" "}
    GPA
  </h1>

  {/* Description card — pink */}
  <div className="mt-4 max-w-2xl rounded-2xl border-2 border-[#A10D5A] bg-white px-6 py-4 shadow-sm">
    <p className="text-sm leading-6 text-gray-700 sm:text-base">
      Enter your subjects, marks, and credit hours to calculate your GPA for
      this semester using{" "}
      <span className="font-semibold text-[#A10D5A] dark:text-[#F4B8D8]">
        SBBWU&apos;s grading scale
      </span>
      .
    </p>
  </div>
</div>

{/* Info card — white */}
<div className="mb-6 mt-4 flex gap-4 rounded-2xl border-2 border-[#A10D5A] bg-white p-5 shadow-sm">
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#A10D5A] text-white">
    <CheckCircle2 className="h-5 w-5" />
  </div>

  <div>
    <p className="text-sm font-semibold text-gray-900">
      How GPA is calculated
    </p>

    <p className="mt-1.5 text-xs leading-5 text-gray-600 sm:text-sm">
      Marks are converted to a grade point (85%+ = 4.0, 70–84% = B, 60–69% = C,
      50–59% = D, below 50% = F) and multiplied by credit hours. Your GPA is
      the total quality points divided by total credit hours.
    </p>
  </div>
</div>


        {/* Input Card */}
        <div className="overflow-hidden rounded-3xl border-2 border-[#A10D5A] bg-[#FAD8E8] shadow-lg shadow-pink-200/50">

          {/* Card Header */}
          <div className="border-b-2 border-[#A10D5A] bg-[#A10D5A] px-5 py-5 sm:px-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Enter Your Subjects
                </h2>

                <p className="mt-1 text-xs text-white/85 sm:text-sm">
                  Add the marks and credit hours for each subject this semester.
                </p>
              </div>

              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#A10D5A] text-white sm:flex">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Desktop Table Header */}
          <div className="hidden grid-cols-[28px_minmax(0,1fr)_150px_180px_52px] gap-4 border-b border-[#A10D5A] bg-[#A10D5A] px-5 py-3 text-xs font-bold uppercase tracking-wide text-white md:grid md:px-7">
            <span />
            <span>Subject</span>
            <span>Marks (%)</span>
            <span>Credit Hours</span>
            <span />
          </div>

          {/* Course Rows */}
          <div className="divide-y divide-[#EAA9CA]">
            {courses.map((course, index) => (
              <CourseRow
                key={course.id}
                course={course}
                index={index}
                onUpdate={updateCourse}
                onRemove={removeCourse}
              />
            ))}
          </div>

          {/* Add Subject */}
          <div className="border-t border-[#EAA9CA] bg-[#FAD8E8] px-5 py-5 sm:px-7">
            <button
              type="button"
              onClick={addCourse}
              disabled={courses.length >= MAX_SUBJECTS}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#A10D5A] bg-white px-4 py-2.5 text-sm font-bold text-[#A10D5A] transition-all hover:bg-[#A10D5A] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Another Subject
            </button>

            <p className="mt-2 text-xs text-gray-400">
              {courses.length}/{MAX_SUBJECTS} subjects added
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Action Buttons */}
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
            Calculate GPA
          </button>
        </div>

        {/* GPA Result */}
        {result && (
          <div
            ref={resultRef}
            className="scroll-mt-24"
          >
            <GPAResult result={result} />
          </div>
        )}
      </div>
    </section>
  );
}
