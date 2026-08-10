"use client";

const categories = [
  "All",
  "Admissions",
  "Academics",
  "Hostel",
  "Fees",
  "Scholarships",
];

interface FAQCategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function FAQCategoryFilter({
  activeCategory,
  onCategoryChange,
}: FAQCategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#A10D5A]/40 scrollbar-track-transparent">
      <div className="flex min-w-max justify-center gap-3 px-1">
        {categories.map((category) => {
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-[#A10D5A] text-white shadow-md shadow-[#A10D5A]/20"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-[#A10D5A]/30 hover:bg-[#A10D5A]/5 hover:text-[#A10D5A] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-[#A10D5A]/50 dark:hover:bg-[#A10D5A]/10 dark:hover:text-pink-400"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}

