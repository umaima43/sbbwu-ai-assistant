"use client";

import { useState } from "react";
import AcademicCalculatorHome, {
  type CalculatorView,
} from "@/components/academic-calculator/AcademicCalculatorHome";
import GPACalculator from "@/components/academic-calculator/GPACalculator";
import CGPACalculator from "@/components/academic-calculator/CGPACalculator";

export default function AcademicCalculatorPage() {
  const [view, setView] = useState<CalculatorView>("home");

  if (view === "gpa") {
    return <GPACalculator onBack={() => setView("home")} />;
  }

  if (view === "cgpa") {
    return <CGPACalculator onBack={() => setView("home")} />;
  }

  return <AcademicCalculatorHome onSelect={setView} />;
}
