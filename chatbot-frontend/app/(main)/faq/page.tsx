
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
} from "lucide-react";

import { faqs } from "@/data/faqs";
import FAQCard from "@/components/faq/FAQCard";
import FAQCategoryFilter from "@/components/faq/FAQCategoryFilter";

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  // ================= FILTER FAQS =================
  const filteredFAQs = useMemo(() => {
    if (activeCategory === "All") {
      return faqs;
    }

    return faqs.filter(
      (faq) => faq.category === activeCategory
    );
  }, [activeCategory]);

  return (
    <main className="min-h-screen bg-[#F7F8FC] px-4 py-10 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">

        {/* ================= BACK TO HOME ================= */}
       
<div className="mb-3">
  <Link
    // href="/"
    href="/chat"   
    aria-label="Back to Home"
    title="Back to Home"
    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#A10D5A]/15 bg-white text-[#A10D5A] shadow-sm transition-all duration-200 hover:border-[#A10D5A]/30 hover:bg-[#A10D5A] hover:text-white hover:shadow-md dark:border-[#A10D5A]/30 dark:bg-gray-900"
  >
    <ArrowLeft size={17} strokeWidth={2.2} />
  </Link>
</div>


        {/* ================= PAGE HEADER ================= */}
        <section className="mb-10 text-center">

          {/* Icon */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A10D5A]/10">
            <HelpCircle className="h-7 w-7 text-[#A10D5A]" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Frequently Asked Questions
          </h1>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
            Find quick answers to common questions about admissions,
            academics, hostels, fees, scholarships, and other
            services at Shaheed Benazir Bhutto Women University
            Peshawar.
          </p>
        </section>

        {/* ================= CATEGORY FILTERS ================= */}
        <section className="mb-8">
          <FAQCategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </section>

        {/* ================= FAQ RESULT INFO ================= */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {filteredFAQs.length}{" "}
            {filteredFAQs.length === 1
              ? "question"
              : "questions"}{" "}
            found
          </p>

          {activeCategory !== "All" && (
            <button
              type="button"
              onClick={() => setActiveCategory("All")}
              className="text-sm font-semibold text-[#A10D5A] transition-colors hover:text-[#8F0B50]"
            >
              View all FAQs
            </button>
          )}
        </div>

        {/* ================= FAQ LIST ================= */}
        {filteredFAQs.length > 0 ? (
          <section className="space-y-4">
            {filteredFAQs.map((faq) => (
              <FAQCard
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </section>
        ) : (
          /* ================= EMPTY STATE ================= */
          <section className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#A10D5A]/10">
              <MessageCircle className="h-7 w-7 text-[#A10D5A]" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
              No FAQs found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-400">
              We could not find any frequently asked questions
              for the selected category.
            </p>

            <button
              type="button"
              onClick={() => setActiveCategory("All")}
              className="mt-5 rounded-xl bg-[#A10D5A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#8F0B50] hover:shadow-md"
            >
              View All FAQs
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
