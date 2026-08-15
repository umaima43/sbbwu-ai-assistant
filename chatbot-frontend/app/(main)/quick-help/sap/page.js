"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  GraduationCap,
  ClipboardCheck,
  WalletCards,
  BarChart3,
  ShieldCheck,
  Info,
} from "lucide-react";

const sapPortalUrl =
  "https://fiori.maktab.pern.edu.pk:8000/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-client=300&sap-language=EN#Shell-home";

const sapFeatures = [
  {
    icon: ClipboardCheck,
    title: "Attendance",
    description:
      "Check your attendance information and monitor your attendance record.",
  },
  {
    icon: BarChart3,
    title: "Results",
    description:
      "View your available academic results and examination-related information.",
  },
  {
    icon: WalletCards,
    title: "Fee Information",
    description:
      "Check your available fee and payment-related information.",
  },
  {
    icon: GraduationCap,
    title: "Student Information",
    description:
      "Access student-related services and information available through SAP.",
  },
];

export default function SAPPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FC] p-6 transition-colors duration-300 dark:bg-gray-950">
      <main className="mx-auto max-w-6xl">

        {/* Back Button */}
        <Link
          href="/quick-help"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#A10D5A] transition-all hover:gap-3 dark:text-pink-400"
        >
          <ArrowLeft size={18} />
          Back to Quick Help
        </Link>

        {/* Header */}
        <div className="mb-10 flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#A10D5A] text-white shadow-lg shadow-pink-200 dark:shadow-none">
            <GraduationCap size={30} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              SAP Student Portal
            </h1>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Access your personal academic and student information.
            </p>
          </div>
        </div>

        {/* Main Portal Card */}
        <section className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-[#A10D5A] to-[#C33C78] p-8 text-white shadow-xl">
          {/* Decorative circles */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-white/10" />

          <div className="relative">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <GraduationCap size={28} />
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  SBBWU Student Portal
                </h2>

                <p className="mt-1 text-pink-100">
                  Your student information in one place
                </p>
              </div>
            </div>

            <p className="max-w-3xl leading-7 text-pink-50">
              Use the SAP Student Portal to access student-specific
              information such as attendance, results, fees, and other
              services provided by the university.
            </p>

            {/* Open SAP Button */}
            <a
              href={sapPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-[#A10D5A] shadow-md transition-all hover:-translate-y-0.5 hover:bg-pink-50 hover:shadow-lg"
            >
              Open SAP Portal
              <ExternalLink size={18} />
            </a>
          </div>
        </section>

        {/* Available Services */}
        <section className="mb-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              What Can You Access?
            </h2>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              The SAP portal provides access to student-related information
              and services.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {sapFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border-2 border-pink-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#A10D5A] hover:shadow-lg dark:border-pink-900 dark:bg-gray-900 dark:hover:border-pink-600"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FDF0F7] text-[#A10D5A] transition-all group-hover:bg-[#A10D5A] group-hover:text-white dark:bg-[#351126] dark:text-pink-400">
                      <Icon size={23} />
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* How to Use */}
        <section className="mb-10 rounded-3xl border-2 border-pink-200 bg-white p-7 shadow-sm dark:border-pink-900 dark:bg-gray-900">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF0F7] text-[#A10D5A] dark:bg-[#351126] dark:text-pink-400">
              <Info size={22} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              How to Access SAP
            </h2>
          </div>

          <div className="space-y-4">
            <Step
              number="1"
              text="Click the Open SAP Portal button."
            />

            <Step
              number="2"
              text="Log in using your university-provided student credentials."
            />

            <Step
              number="3"
              text="Open the relevant student service from the SAP portal."
            />

            <Step
              number="4"
              text="Check your attendance, results, fees, or other available student information."
            />
          </div>
        </section>

        {/* Important Notice */}
        <section className="rounded-2xl border-2 border-pink-200 bg-[#FDF0F7] p-5 dark:border-pink-900 dark:bg-[#240D1C]">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={21}
              className="mt-0.5 shrink-0 text-[#A10D5A] dark:text-pink-400"
            />

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Important
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                SAP contains personal student information. Keep your login
                credentials private and do not share your password with
                anyone.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Button */}
        <div className="py-10 text-center">
          <a
            href={sapPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#A10D5A] px-6 py-3 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#8B0B4D] hover:shadow-lg"
          >
            Go to SAP Student Portal
            <ExternalLink size={18} />
          </a>
        </div>

      </main>
    </div>
  );
}

/* Step Component */
function Step({ number, text }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A10D5A] text-sm font-bold text-white">
        {number}
      </div>

      <p className="text-gray-600 dark:text-gray-300">
        {text}
      </p>
    </div>
  );
}