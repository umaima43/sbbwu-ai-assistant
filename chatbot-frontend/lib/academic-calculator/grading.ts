/**
 * SBBWU Grading & GPA/CGPA engine
 * -------------------------------
 * Every function here is a pure, synchronous function: same input -> same
 * output, no state, no side effects, nothing async. That's deliberate —
 * it's what lets the calculator components call `calculateGPA(...)` /
 * `calculateCGPA(...)` directly inside an event handler (or inside a
 * `useMemo`) and trust that the numbers on screen always match the numbers
 * in state, with no race conditions or stale renders.
 *
 * Source: SBBWU Regulations, Section 31 (Grading), as summarized by the
 * user. SBBWU's public "Assessment Policy" page for the BS program is
 * currently empty, so the exact mark-by-mark table for undergrad isn't
 * published online. The Regulations document gives four fixed anchor
 * points per band (e.g. 70% -> 3.0, 84% -> 3.9) and says the marks in
 * between step up "near-linearly, ~1 point per mark". `marksToGradePoint`
 * reproduces that with linear interpolation inside each band. If SBBWU
 * later publishes the full official table, swap the interpolation math
 * below for a direct lookup table — everything else (GPA/CGPA formulas,
 * UI, components) stays the same.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Course {
  id: number;
  subject: string;
  marks: string;
  creditHours: string;
}

export interface Semester {
  id: number;
  semester: string;
  gpa: string;
  creditHours: string;
}

export interface CourseResult {
  id: number;
  subject: string;
  marks: number;
  creditHours: number;
  grade: string;
  gradePoint: number;
  qualityPoints: number;
}

export interface GPAResultData {
  courses: CourseResult[];
  totalCreditHours: number;
  totalQualityPoints: number;
  gpa: number;
}

export interface SemesterResult {
  id: number;
  semester: string;
  gpa: number;
  creditHours: number;
  qualityPoints: number;
}

export interface CGPAResultData {
  semesters: SemesterResult[];
  totalCreditHours: number;
  totalQualityPoints: number;
  cgpa: number;
}

export type CalculationOutcome<T> =
  | { result: T; error: null }
  | { result: null; error: string };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MAX_SUBJECTS = 10;
export const MAX_SEMESTERS = 8;
export const MIN_CGPA_STANDING = 3.0; // SBBWU minimum standing (grad programs)

// ---------------------------------------------------------------------------
// Marks -> Grade Point -> Letter Grade (SBBWU Section 31 scale)
// ---------------------------------------------------------------------------

const roundTo = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** SBBWU rounding rule: fractional marks round to the nearest whole mark. */
export const roundMarks = (marks: number) => Math.round(marks);

interface GradeBand {
  label: string;
  minMark: number;
  maxMark: number;
  minGp: number;
  maxGp: number;
}

// One entry per letter band. minGp/maxGp are the two anchor points SBBWU
// publishes for that band; every mark in between is linearly interpolated.
const GRADE_BANDS: GradeBand[] = [
  { label: "A", minMark: 85, maxMark: 100, minGp: 4.0, maxGp: 4.0 },
  { label: "B", minMark: 70, maxMark: 84, minGp: 3.0, maxGp: 3.9 },
  { label: "C", minMark: 60, maxMark: 69, minGp: 2.0, maxGp: 2.9 },
  { label: "D", minMark: 50, maxMark: 59, minGp: 1.0, maxGp: 1.9 },
];

const findBand = (marks: number): GradeBand | null =>
  GRADE_BANDS.find((band) => marks >= band.minMark && marks <= band.maxMark) ?? null;

/** Returns the letter grade (A/B/C/D/F) for a given mark. */
export const getLetterGrade = (marksInput: number): string => {
  const marks = roundMarks(marksInput);
  if (marks < 50) return "F";
  return findBand(marks)?.label ?? "F";
};

/**
 * Returns the SBBWU grade point (0.0 - 4.0) for a given mark.
 * Below 50% is a fail and carries 0 quality points.
 */
export const marksToGradePoint = (marksInput: number): number => {
  const marks = roundMarks(marksInput);

  if (marks < 50) return 0;

  const band = findBand(marks);
  if (!band) return 0;

  if (band.maxMark === band.minMark) return band.minGp;

  const progress = (marks - band.minMark) / (band.maxMark - band.minMark);
  const gradePoint = band.minGp + progress * (band.maxGp - band.minGp);

  return roundTo(gradePoint, 2);
};

export const getPerformanceLabel = (gpa: number): string => {
  if (gpa >= 3.7) return "Outstanding Performance";
  if (gpa >= 3.3) return "Excellent Performance";
  if (gpa >= 3.0) return "Very Good Performance";
  if (gpa >= 2.5) return "Good Performance";
  if (gpa >= 2.0) return "Satisfactory Performance";
  return "Keep Working — You Can Do It!";
};

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const isBlank = (value: string) => value.trim().length === 0;

// ---------------------------------------------------------------------------
// GPA (single semester, marks-based) — Calculate Your GPA
// ---------------------------------------------------------------------------

export const calculateGPA = (courses: Course[]): CalculationOutcome<GPAResultData> => {
  const filled = courses.filter(
    (course) => !isBlank(course.subject) || !isBlank(course.marks) || !isBlank(course.creditHours)
  );

  if (filled.length === 0) {
    return { result: null, error: "Add at least one subject before calculating your GPA." };
  }

  const incomplete = filled.find(
    (course) => isBlank(course.subject) || isBlank(course.marks) || isBlank(course.creditHours)
  );

  if (incomplete) {
    return {
      result: null,
      error: "Please fill in the subject, marks, and credit hours for every row.",
    };
  }

  const courseResults: CourseResult[] = [];

  for (const course of filled) {
    const marks = Number(course.marks);
    const creditHours = Number(course.creditHours);

    if (Number.isNaN(marks) || marks < 0 || marks > 100) {
      return {
        result: null,
        error: `Enter valid marks (0-100) for "${course.subject}".`,
      };
    }

    if (Number.isNaN(creditHours) || creditHours <= 0 || creditHours > 6) {
      return {
        result: null,
        error: `Enter valid credit hours (1-6) for "${course.subject}".`,
      };
    }

    const gradePoint = marksToGradePoint(marks);
    const grade = getLetterGrade(marks);
    const qualityPoints = roundTo(gradePoint * creditHours, 2);

    courseResults.push({
      id: course.id,
      subject: course.subject,
      marks,
      creditHours,
      grade,
      gradePoint,
      qualityPoints,
    });
  }

  const totalCreditHours = courseResults.reduce((sum, c) => sum + c.creditHours, 0);
  const totalQualityPoints = roundTo(
    courseResults.reduce((sum, c) => sum + c.qualityPoints, 0),
    2
  );
  const gpa = totalCreditHours > 0 ? roundTo(totalQualityPoints / totalCreditHours, 2) : 0;

  return {
    error: null,
    result: { courses: courseResults, totalCreditHours, totalQualityPoints, gpa },
  };
};

// ---------------------------------------------------------------------------
// CGPA (across semesters, GPA-based) — Calculate Your CGPA
// ---------------------------------------------------------------------------

export const calculateCGPA = (semesters: Semester[]): CalculationOutcome<CGPAResultData> => {
  const filled = semesters.filter(
    (semester) =>
      !isBlank(semester.semester) || !isBlank(semester.gpa) || !isBlank(semester.creditHours)
  );

  if (filled.length === 0) {
    return { result: null, error: "Add at least one semester before calculating your CGPA." };
  }

  const incomplete = filled.find(
    (semester) =>
      isBlank(semester.semester) || isBlank(semester.gpa) || isBlank(semester.creditHours)
  );

  if (incomplete) {
    return {
      result: null,
      error: "Please fill in the semester, GPA, and credit hours for every row.",
    };
  }

  const semesterResults: SemesterResult[] = [];

  for (const semester of filled) {
    const gpa = Number(semester.gpa);
    const creditHours = Number(semester.creditHours);

    if (Number.isNaN(gpa) || gpa < 0 || gpa > 4) {
      return {
        result: null,
        error: `Enter a valid GPA (0.00-4.00) for ${semester.semester}.`,
      };
    }

    if (Number.isNaN(creditHours) || creditHours <= 0 || creditHours > 50) {
      return {
        result: null,
        error: `Enter valid credit hours for ${semester.semester}.`,
      };
    }

    const qualityPoints = roundTo(gpa * creditHours, 2);

    semesterResults.push({
      id: semester.id,
      semester: semester.semester,
      gpa,
      creditHours,
      qualityPoints,
    });
  }

  const totalCreditHours = semesterResults.reduce((sum, s) => sum + s.creditHours, 0);
  const totalQualityPoints = roundTo(
    semesterResults.reduce((sum, s) => sum + s.qualityPoints, 0),
    2
  );
  const cgpa = totalCreditHours > 0 ? roundTo(totalQualityPoints / totalCreditHours, 2) : 0;

  return {
    error: null,
    result: { semesters: semesterResults, totalCreditHours, totalQualityPoints, cgpa },
  };
};

export const createCourse = (id: number): Course => ({
  id,
  subject: "",
  marks: "",
  creditHours: "",
});

export const createSemester = (id: number): Semester => ({
  id,
  semester: "",
  gpa: "",
  creditHours: "",
});

// ---------------------------------------------------------------------------
// GPA -> Tier styling (used by the CGPA calculator's per-semester badges)
// ---------------------------------------------------------------------------

export interface GradeStyle {
  letter: string;
  name: string;
  badge: string; // tailwind classes for the pill badge
  bar: string; // tailwind classes for the small color bar/dot
}

export const GRADE_STYLES: Record<string, GradeStyle> = {
  A: {
    letter: "A",
    name: "Outstanding",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  B: {
    letter: "B",
    name: "Very Good",
    badge:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-300",
    bar: "bg-sky-500",
  },
  C: {
    letter: "C",
    name: "Good",
    badge:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300",
    bar: "bg-amber-500",
  },
  D: {
    letter: "D",
    name: "Satisfactory",
    badge:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/20 dark:text-orange-300",
    bar: "bg-orange-500",
  },
  F: {
    letter: "F",
    name: "Needs Improvement",
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300",
    bar: "bg-red-500",
  },
};

/**
 * GPA-based tier preview (0.00 - 4.00), used for the live badge shown per
 * semester row in the CGPA calculator. Returns null while the field is
 * blank or the value isn't a valid GPA yet, so the UI can show a neutral
 * placeholder instead of a wrong badge.
 */
export const previewGradeFromGPA = (gpaInput: string): GradeStyle | null => {
  if (gpaInput.trim().length === 0) return null;

  const gpa = Number(gpaInput);
  if (Number.isNaN(gpa) || gpa < 0 || gpa > 4) return null;

  if (gpa >= 3.5) return GRADE_STYLES.A;
  if (gpa >= 3.0) return GRADE_STYLES.B;
  if (gpa >= 2.5) return GRADE_STYLES.C;
  if (gpa >= 2.0) return GRADE_STYLES.D;
  return GRADE_STYLES.F;
};

