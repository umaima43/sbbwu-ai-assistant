"use client";

import Link from "next/link";
import {
  BookOpen,
  Phone,
  Link as LinkIcon,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

const quickHelpItems = [
  {
    title: "User Guide",
    description: "Learn how to use the SBBWU AI Assistant.",
    icon: BookOpen,
    href: "/quick-help/user-guide",
  },
  {
    title: "Important Contacts",
    description:
      "Find important university office and department contact information.",
    icon: Phone,
    href: "/quick-help/important-contacts",
  },
  {
    title: "Useful Links",
    description: "Access important university websites and portals.",
    icon: LinkIcon,
    href: "/quick-help/useful-links",
  },
 {
  title: "SAP Student Portal",
  description:
    "Access your attendance, results, fees, and other student information.",
  icon: GraduationCap,
  href: "/quick-help/sap",
},
];

export default function QuickHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 transition-colors duration-300 dark:bg-gray-950">

      <div className="mx-auto max-w-5xl">

        {/* Heading */}
        <h1 className="text-3xl font-bold text-[#A10D5A]">
          Quick Help
        </h1>

        <p className="mb-8 mt-2 text-gray-600 dark:text-gray-300">
          Important university resources and information in one place.
        </p>

        {/* Quick Help Cards */}
        <div className="grid gap-5 md:grid-cols-2">

          {quickHelpItems.map((item) => {
            const Icon = item.icon;

            if (item.external) {
              return (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group
                    relative
                    flex
                    items-center
                    gap-4
                    overflow-hidden
                    rounded-2xl
                    border-2
                    border-pink-200
                    bg-white
                    p-5
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#A10D5A]
                    hover:shadow-lg
                    dark:border-pink-900
                    dark:bg-gray-900
                    dark:hover:border-pink-600
                  "
                >
                  {/* Decorative Pink Line */}
                  <div
                    className="
                      absolute
                      left-0
                      top-0
                      h-full
                      w-1
                      bg-[#A10D5A]
                      opacity-0
                      transition-opacity
                      duration-300
                      group-hover:opacity-100
                    "
                  />

                  {/* Icon */}
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#FDF0F7]
                      text-[#A10D5A]
                      transition-all
                      duration-300
                      group-hover:bg-[#A10D5A]
                      group-hover:text-white
                      dark:bg-[#351126]
                      dark:text-pink-400
                      dark:group-hover:bg-[#A10D5A]
                      dark:group-hover:text-white
                    "
                  >
                    <Icon size={24} />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-300">
                      {item.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ArrowRight
                    size={20}
                    className="
                      shrink-0
                      text-gray-400
                      transition-all
                      duration-300
                      group-hover:translate-x-1
                      group-hover:text-[#A10D5A]
                      dark:text-gray-500
                      dark:group-hover:text-pink-400
                    "
                  />
                </a>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href}
                className="
                  group
                  relative
                  flex
                  items-center
                  gap-4
                  overflow-hidden
                  rounded-2xl
                  border-2
                  border-pink-200
                  bg-white
                  p-5
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-[#A10D5A]
                  hover:shadow-lg
                  dark:border-pink-900
                  dark:bg-gray-900
                  dark:hover:border-pink-600
                "
              >
                {/* Decorative Pink Line */}
                <div
                  className="
                    absolute
                    left-0
                    top-0
                    h-full
                    w-1
                    bg-[#A10D5A]
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                  "
                />

                {/* Icon */}
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#FDF0F7]
                    text-[#A10D5A]
                    transition-all
                    duration-300
                    group-hover:bg-[#A10D5A]
                    group-hover:text-white
                    dark:bg-[#351126]
                    dark:text-pink-400
                    dark:group-hover:bg-[#A10D5A]
                    dark:group-hover:text-white
                  "
                >
                  <Icon size={24} />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-300">
                    {item.description}
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRight
                  size={20}
                  className="
                    shrink-0
                    text-gray-400
                    transition-all
                    duration-300
                    group-hover:translate-x-1
                    group-hover:text-[#A10D5A]
                    dark:text-gray-500
                    dark:group-hover:text-pink-400
                  "
                />
              </Link>
            );
          })}

        </div>

      </div>
    </div>
  );
}