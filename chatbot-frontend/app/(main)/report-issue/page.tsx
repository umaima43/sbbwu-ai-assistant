"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Image from "next/image";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import {
  ArrowLeft,
  Bug,
  CheckCircle2,
  ChevronDown,
  Check,
  ImagePlus,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  Upload,
  X,
  HelpCircle,
  FileWarning,
  ClipboardList, Zap, Sparkles
} from "lucide-react";

// import Header from "@/components/layout/Header";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export default function ReportIssuePage() {
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [issue, setIssue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const issueTypes = [
    {
      value: "General",
      label: "General Issue",
      description: "Something else isn't working as expected",
      icon: HelpCircle,
    },
    {
      value: "Bug",
      label: "Technical Bug",
      description: "A feature, button, or page isn't working",
      icon: Bug,
    },
    {
      value: "Wrong Answer",
      label: "Incorrect Answer",
      description: "The assistant provided incorrect information",
      icon: FileWarning,
    },
    {
      value: "Other",
      label: "Other",
      description: "Something that doesn't fit the categories above",
      icon: MessageCircle,
    },
  ];

  const selectedType = issueTypes.find((item) => item.value === category);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    setTimeout(() => {
      setCategory("");
      setEmail("");
      setIssue("");
      setFile(null);
      setIsSubmitted(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 2500);
  };

  return (
    <>
      <main
        className={`${fraunces.variable} ${mono.variable} flex-1 overflow-y-auto bg-[#FBF8F9]`}
      >
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          {/* =====================================================
              BACK TO CHAT
          ====================================================== */}
         <div className="mb-8 flex justify-start">
  <Link
    href="/"
    aria-label="Back to Home"
    title="Back to Home"
    className="inline-flex h-10 w-10 items-center justify-center rounded-full
      bg-[#A10D5A] text-white border border-[#A10D5A]
      shadow-md transition-all duration-200
      hover:bg-white hover:text-[#A10D5A] hover:shadow-lg
      active:bg-white active:text-[#A10D5A] active:scale-95
      dark:bg-[#A10D5A] dark:text-white dark:hover:bg-gray-900 dark:hover:text-[#A10D5A]"
  >
    <ArrowLeft size={18} strokeWidth={2.3} />
  </Link>
</div>

          {/* =====================================================
              HERO section
          ====================================================== */}
          <div className="relative overflow-hidden rounded-[28px] bg-[#FFF3F8] px-6 py-8 sm:px-8">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.3]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #A10D5A 1px, transparent 1px)",
                backgroundSize: "18px 18px",
                maskImage:
                  "radial-gradient(ellipse at top right, black, transparent 65%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at top right, black, transparent 65%)",
              }}
            />

            <div className="relative flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
              {/* GIF — large, sitting right against the heading */}
              <div className="flex h-48 w-48 shrink-0 items-center justify-center sm:h-52 sm:w-52 lg:h-80 lg:w-80">
                <Image
                  src="/report.gif"
                  alt="SBBWU Assistant support animation"
                  width={470}
                  height={470}
                  unoptimized
                  className="h-full w-full object-contain drop-shadow-[0_15px_30px_rgba(135,11,76,0.22)]"
                />
              </div>

              {/* HEADING + DESCRIPTION */}
              <div className="text-center sm:text-left">
                <div
  className="mb-5 inline-flex items-center gap-3 rounded-full bg-[#A10D5A] px-5 py-2.5 text-lg font-semibold uppercase tracking-[0.16em] text-white shadow-lg shadow-[#A10D5A]/25 transition-all duration-200 hover:scale-[1.02] hover:bg-[#870B4C]"
  style={{ fontFamily: "var(--font-mono)" }}
>
  <Bug size={20} strokeWidth={2.2} />
  Report an Issue
  </div>
                <h1
                  className="text-3xl leading-[1.1] tracking-[-0.01em] text-[#1A0D14] sm:text-4xl lg:text-[2.75rem]"
                  style={{ fontFamily: "var(--font-fraunces)", fontWeight: 600 }}
                >
                  Something that not <span className="italic text-[#A10D5A]">working</span>?
                </h1>

                 <p className="mx-auto mt-4 max-w-2xl text-lg font-medium leading-8 text-[#2E1C27] sm:mx-0 sm:text-lg">
                  Tell us what happened and help us improve your experience
                  with SBBWU Assistant.
                </p>
                     


                     {/* cards  */}
                   <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
        <div className="group flex items-center gap-3 rounded-2xl border border-[#F3D4E4] bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#A10D5A]/40 hover:shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCE4EF] text-[#A10D5A] transition-colors duration-300 group-hover:bg-[#A10D5A] group-hover:text-white">
            <CheckCircle2 size={18} strokeWidth={2.3} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#2E1C27]">
              Reviewed by Our Team
            </p>
            <p className="text-xs text-[#6A5563]">
              Every report is carefully reviewed.
            </p>
          </div>
        </div>

        <div className="group flex items-center gap-3 rounded-2xl border border-[#F3D4E4] bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#A10D5A]/40 hover:shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCE4EF] text-[#A10D5A] transition-colors duration-300 group-hover:bg-[#A10D5A] group-hover:text-white">
            <ShieldCheck size={18} strokeWidth={2.3} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#2E1C27]">
              Privacy Protected
            </p>
            <p className="text-xs text-[#6A5563]">
              Your information remains secure.
            </p>
          </div>
        </div>
                </div>
              </div>
            </div>
          </div>
          


          
 

          {/* =====================================================
              FORM CARD — professional, dark-pink accented
          ====================================================== */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 overflow-hidden rounded-3xl border border-[#D8B8C6] bg-white shadow-[0_10px_40px_rgba(74,10,42,0.1)]"
          >
            {/* dark pink header bar */}
            <div className="flex items-center gap-3 bg-[#A10D5A] px-6 py-5 sm:px-10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                <ClipboardList size={19} />
              </div>
              <div>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Issue Details
                </p>
                <p className="text-base font-bold text-white sm:text-lg">
                  Fill in the details below
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* EMAIL ADDRESS */}
                <div>
                  <label className="mb-2.5 flex items-center gap-2 text-base font-bold text-[#1A0D14]">
                    <Mail size={16} className="text-[#A10D5A]" />
                    Email Address
                    <span className="text-sm font-medium text-[#6B4A5A]">
                      (Optional)
                    </span>
                  </label>

                  <div className="relative">
                    <Mail
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A10D5A]"
                    />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border-2 border-[#D8B8C6] bg-white py-4 pl-12 pr-4 text-base font-medium text-[#1A0D14] outline-none transition-all placeholder:font-normal placeholder:text-[#7A6670] hover:border-[#B3839B] focus:border-[#A10D5A] focus:ring-4 focus:ring-[#A10D5A]/12"
                    />
                  </div>

                  <p className="mt-2.5 text-sm leading-6 text-[#5C4B54]">
                    We&apos;ll only contact you if we need more information
                    about your report.
                  </p>
                </div>

                {/* ISSUE CATEGORY */}
                <div>
                  <label className="mb-2.5 flex items-center gap-2 text-base font-bold text-[#1A0D14]">
                    <Bug size={16} className="text-[#A10D5A]" />
                    Issue Category
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className={`flex w-full items-center justify-between rounded-2xl border-2 bg-white px-4 py-4 text-left outline-none transition-all ${
                        isCategoryOpen
                          ? "border-[#A10D5A] ring-4 ring-[#A10D5A]/12"
                          : "border-[#D8B8C6] hover:border-[#B3839B]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF3F8] text-[#A10D5A]">
                          {category ? (
                            (() => {
                              const SelectedIcon = selectedType?.icon || Bug;
                              return <SelectedIcon size={18} />;
                            })()
                          ) : (
                            <Bug size={18} />
                          )}
                        </div>

                        <div>
                          <p
                            className={`text-base font-semibold ${
                              category ? "text-[#1A0D14]" : "text-[#7A6670]"
                            }`}
                          >
                            {category
                              ? selectedType?.label
                              : "Select the type of issue"}
                          </p>

                          {category && (
                            <p className="mt-0.5 text-xs font-medium text-[#A10D5A]">
                              {selectedType?.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <ChevronDown
                        size={20}
                        className={`text-[#A10D5A] transition-transform duration-200 ${
                          isCategoryOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isCategoryOpen && (
                      <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-[#D8B8C6] bg-white p-2 shadow-[0_12px_35px_rgba(74,10,42,0.16)]">
                        {issueTypes.map((item) => {
                          const Icon = item.icon;
                          const isSelected = category === item.value;

                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => {
                                setCategory(item.value);
                                setIsCategoryOpen(false);
                              }}
                              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                                isSelected ? "bg-[#FFF3F8]" : "hover:bg-[#FFF8FB]"
                              }`}
                            >
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                  isSelected
                                    ? "bg-[#A10D5A] text-white"
                                    : "bg-[#FFF3F8] text-[#A10D5A] group-hover:bg-[#FCE6F0]"
                                }`}
                              >
                                <Icon size={19} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`text-sm font-bold ${
                                    isSelected ? "text-[#A10D5A]" : "text-[#1A0D14]"
                                  }`}
                                >
                                  {item.label}
                                </p>
                                <p className="mt-0.5 text-xs font-medium text-[#6B4A5A]">
                                  {item.description}
                                </p>
                              </div>

                              {isSelected && (
                                <Check size={18} className="shrink-0 text-[#A10D5A]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="lg:col-span-2">
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-base font-bold text-[#1A0D14]">
                      <MessageCircle size={16} className="text-[#A10D5A]" />
                      Describe the Issue
                    </label>
                    <span className="hidden text-sm font-medium text-[#6B4A5A] sm:block">
                      Be as specific as possible
                    </span>
                  </div>

                  <textarea
                    required
                    rows={7}
                    maxLength={1000}
                    placeholder="Tell us what happened, what you expected to happen, and any other details that may help us understand the problem..."
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    className="w-full resize-none rounded-2xl border-2 border-[#D8B8C6] bg-white px-4 py-4 text-base font-medium leading-7 text-[#1A0D14] outline-none transition-all placeholder:font-normal placeholder:text-[#7A6670] hover:border-[#B3839B] focus:border-[#A10D5A] focus:ring-4 focus:ring-[#A10D5A]/12"
                  />

                  <div className="mt-2 flex justify-end">
                    <span
                      className="text-sm font-medium text-[#A10D5A]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {issue.length}/1000
                    </span>
                  </div>
                </div>

                {/* ATTACH SCREENSHOT */}
                <div className="lg:col-span-2">
                  <label className="mb-2.5 flex items-center gap-2 text-base font-bold text-[#1A0D14]">
                    <ImagePlus size={16} className="text-[#A10D5A]" />
                    Attach Screenshot
                    <span className="text-sm font-medium text-[#6B4A5A]">
                      (Optional)
                    </span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!file ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex w-full items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[#D8B8C6] bg-[#FBF8F9] px-5 py-7 text-left transition-all duration-200 hover:border-[#A10D5A] hover:bg-[#FFF3F8]"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#A10D5A] shadow-sm transition-transform duration-200 group-hover:scale-105">
                        <Upload size={21} />
                      </div>
                      <div>
                        <p className="text-base font-bold text-[#A10D5A]">
                          Browse a file
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#5C4B54]">
                          PNG, JPG or WEBP • Maximum 5MB
                        </p>
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#D8B8C6] bg-[#FBF8F9] px-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#A10D5A] shadow-sm">
                          <ImagePlus size={19} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-[#1A0D14]">
                            {file.name}
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#5C4B54]">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#5C4B54] transition hover:bg-[#FFF3F8] hover:text-[#A10D5A]"
                        aria-label="Remove file"
                      >
                        <X size={19} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-10 flex flex-col-reverse gap-4 border-t border-[#E3D5DD] pt-7 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-[#4B3140]">
                  <ShieldCheck size={17} className="text-[#A10D5A]" />
                  Your feedback helps us improve SBBWU Assistant.
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <Link
                    href="/"
                    className="flex h-12 items-center justify-center rounded-2xl border-2 border-[#D8B8C6] bg-white px-7 text-base font-bold text-[#2D1B24] transition-all hover:border-[#B3839B] hover:text-[#A10D5A]"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={isSubmitted}
                    className="group flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#A10D5A] px-8 text-base font-bold text-white shadow-lg shadow-[#A10D5A]/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#870B4C] hover:shadow-xl hover:shadow-[#A10D5A]/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitted ? (
                      <>
                        <CheckCircle2 size={19} />
                        Report Submitted
                      </>
                    ) : (
                      <>
                        <Send
                          size={18}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}