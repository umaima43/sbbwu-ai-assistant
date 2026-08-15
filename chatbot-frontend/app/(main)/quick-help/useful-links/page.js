"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  GraduationCap,
  Monitor,
  Building2,
  Library,
} from "lucide-react";

const usefulLinks = [
  {
    title: "SBBWU Authorities",
    description:
      "View information about university authorities and administration.",
    url: "https://sbbwu.edu.pk/sbbwu/Authorities",
    icon: Building2,
  },
  {
    title: "Admissions Portal",
    description:
      "Apply for admission and access the university admissions portal.",
    url: "https://admissions.sbbwu.edu.pk/application/index.php",
    icon: GraduationCap,
  },
  {
    title: "SBBWU LMS",
    description:
      "Access the university learning management system and online learning resources.",
    url: "https://lms.sbbwu.edu.pk/",
    icon: Monitor,
  },
  {
    title: "HEC Pakistan",
    description:
      "Visit the Higher Education Commission of Pakistan website.",
    url: "https://www.hec.gov.pk/english/Pages/default.aspx",
    icon: Globe,
  },
  {
    title: "Digital Library",
    description:
      "Access digital library resources and online academic materials.",
    url: "https://www.digitallibrary.edu.pk/",
    icon: Library,
  },
];

export default function UsefulLinksPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-gray-950">

      <main className="mx-auto max-w-6xl px-6 py-8 lg:px-10">

        {/* Back Button */}
        <Link
          href="/quick-help"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#A10D5A] transition-all hover:gap-3 dark:text-pink-400"
        >
          <ArrowLeft size={18} />
          Back to Quick Help
        </Link>

        {/* Page Header */}
        <div className="mb-10 flex items-center gap-5">

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#A10D5A] text-white shadow-lg shadow-pink-200 dark:shadow-none">
            <Globe size={30} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Useful Links
            </h1>

            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Important university websites and online resources
            </p>
          </div>

        </div>

        {/* Links */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {usefulLinks.map((link) => {
            const Icon = link.icon;

            return (
              <a
                key={link.title}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl border-2 border-pink-300 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#A10D5A] hover:shadow-lg dark:border-pink-800 dark:bg-gray-900 dark:hover:border-pink-500"
              >

                {/* Decorative Pink Line */}
                <div className="absolute left-0 top-0 h-full w-1 bg-[#A10D5A] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-start gap-5">

                  {/* Icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FDF0F7] text-[#A10D5A] transition-all duration-300 group-hover:bg-[#A10D5A] group-hover:text-white dark:bg-[#351126] dark:text-pink-400 dark:group-hover:bg-[#A10D5A] dark:group-hover:text-white">
                    <Icon size={23} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-3">

                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {link.title}
                      </h2>

                      <ExternalLink
                        size={18}
                        className="mt-0.5 shrink-0 text-gray-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#A10D5A] dark:text-gray-500 dark:group-hover:text-pink-400"
                      />

                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                      {link.description}
                    </p>

                    {/* Visit Website */}
                    <div className="mt-4 text-sm font-medium text-[#A10D5A] dark:text-pink-400">
                      Visit website
                    </div>

                  </div>

                </div>

              </a>
            );
          })}

        </div>

        {/* Information Note */}
        <div className="mt-10 rounded-2xl border-2 border-pink-300 bg-[#FDF0F7] p-5 dark:border-pink-800 dark:bg-[#240D1C]">

          <div className="flex items-start gap-3">

            <ExternalLink
              size={20}
              className="mt-0.5 shrink-0 text-[#A10D5A] dark:text-pink-400"
            />

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                External Websites
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                These links open official external websites in a new browser
                tab. You can return to the SBBWU AI Assistant whenever you
                are finished.
              </p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}