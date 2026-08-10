


"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

const offices = [
  {
    id: "admissions",
    name: "Admissions",
    fullName: "Admissions & Merit Lists",
    desc: "New applications, merit lists, and enrollment queries",
    icon: GraduationCap,
    phone: "+92-91-9224726",
    tel: "+92919224726",
    email: "admissions@sbbwu.edu.pk",
    hours: "Monday – Friday · 9:00 AM – 3:00 PM",
  },
  {
    id: "examinations",
    name: "Examinations",
    fullName: "Examinations, Results & Date Sheets",
    desc: "Result inquiries, re-checking, and exam scheduling",
    icon: FileText,
    phone: "+92-91-9224724",
    tel: "+92919224724",
    email: "assttcontroller2@sbbwu.edu.pk",
    hours: "Monday – Friday · 9:00 AM – 3:00 PM",
  },
];

function CopyRow({
  icon: Icon,
  value,
  href,
}: {
  icon: typeof Phone;
  value: string;
  href: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-[#F7F8FC] px-4 py-3.5 transition hover:border-[#A10D5A]/30 hover:bg-[#FCEAF3]/40 dark:border-gray-700 dark:bg-gray-800/60">
      <Icon size={19} className="shrink-0 text-[#A10D5A]" />

      <a
        href={href}
        className="min-w-0 flex-1 truncate text-base font-medium text-gray-700 transition hover:text-[#A10D5A] dark:text-gray-200"
      >
        {value}
      </a>

      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-white hover:text-[#A10D5A] dark:hover:bg-gray-700"
        aria-label={`Copy ${value}`}
        title="Copy"
      >
        {copied ? <Check size={17} /> : <Copy size={17} />}
      </button>
    </div>
  );
}

export default function ContactPage() {
  const [selectedId, setSelectedId] = useState(offices[0].id);

  const selected = offices.find((office) => office.id === selectedId)!;

  return (
    <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-4 sm:p-6 lg:p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">

        {/* ================= BACK TO HOME ================= */}
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

        {/* ================= PAGE HEADER ================= */}
       

<section className="mb-10 text-center">

{/* Icon + Heading */}

  <div className="flex items-center justify-center gap-3">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#A10D5A]/10">
      <MessageCircle className="h-6 w-6 text-[#A10D5A]" />
    </div>

<h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
  Contact Us
</h1>

  </div>

{/* Description */}

  <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
    Get in touch with the university offices for admissions,
    examinations, results, and other important inquiries.
  </p>

</section>

        {/* ================= CONTACT HUB ================= */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">

          {/* ================= OFFICE NAVIGATION ================= */}
          <div className="border-b border-gray-200 px-5 pt-4 dark:border-gray-700 sm:px-8">
            <div className="flex gap-7">

              {offices.map((office) => {
                const Icon = office.icon;
                const isActive = office.id === selectedId;

                return (
                  <button
                    key={office.id}
                    type="button"
                    onClick={() => setSelectedId(office.id)}
                    className={`group relative flex items-center gap-2.5 pb-4 text-base font-semibold transition-colors ${
                      isActive
                        ? "text-[#A10D5A]"
                        : "text-gray-500 hover:text-[#A10D5A] dark:text-gray-400"
                    }`}
                  >
                    <Icon
                      size={19}
                      className={`transition-transform duration-200 ${
                        isActive
                          ? "scale-110"
                          : "group-hover:scale-110"
                      }`}
                    />

                    {office.name}

                    {/* Active underline */}
                    <span
                      className={`absolute bottom-0 left-0 h-[3px] rounded-full bg-[#A10D5A] transition-all duration-300 ${
                        isActive ? "w-full" : "w-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= SELECTED OFFICE DETAIL ================= */}
          <div
            key={selected.id}
            className="animate-[fadeSlide_0.35s_ease-out] p-6 sm:p-8 lg:p-9"
          >
            {/* Office heading */}
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FCEAF3] text-[#A10D5A] dark:bg-[#A10D5A]/10">
                  <selected.icon size={22} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {selected.fullName}
                  </h2>
                </div>
              </div>

              <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
                {selected.desc}
              </p>

              {/* Office hours */}
              <div className="mt-4 inline-flex items-center rounded-full bg-[#FCEAF3] px-4 py-2 text-sm font-semibold text-[#A10D5A] dark:bg-[#A10D5A]/10">
                {selected.hours}
              </div>
            </div>

            {/* Contact information */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <CopyRow
                icon={Phone}
                value={selected.phone}
                href={`tel:${selected.tel}`}
              />

              <CopyRow
                icon={Mail}
                value={selected.email}
                href={`mailto:${selected.email}`}
              />
            </div>
          </div>
        </div>

        {/* ================= LOCATION SECTION ================= */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-[#A10D5A] shadow-sm">
          <div className="grid sm:grid-cols-2">

            {/* ================= LOCATION INFORMATION ================= */}
            <div className="flex flex-col justify-center p-8 text-white sm:p-10">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <MapPin size={24} />
              </div>

              <h2 className="text-2xl font-bold">
                Visit the Campus
              </h2>

              <p className="mt-4 text-base leading-7 text-white/90">
                Shaheed Benazir Bhutto Women University
                <br />
                LARAMA, Charsadda Road
                <br />
                Peshawar, Khyber Pakhtunkhwa, Pakistan
              </p>

              <a
                href="https://maps.app.goo.gl/kHmcfUFgJFU69uaK6"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-base font-semibold text-[#A10D5A] transition hover:bg-white/90"
              >
                <ExternalLink size={19} />
                Open in Google Maps
              </a>
            </div>

            {/* ================= GOOGLE MAP ================= */}
            <div className="relative min-h-[320px] overflow-hidden bg-gray-200 sm:min-h-[380px]">

              {/* Map loading background */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <MapPin size={28} className="text-[#A10D5A]" />
                  <span className="text-sm font-medium">
                    Loading map...
                  </span>
                </div>
              </div>

              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d423107.6078970789!2d71.567203!3d34.055972!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d91603774ee399%3A0xc26a04d64ff68cd!2sShaheed%20Benazir%20Bhutto%20Women%20University!5e0!3m2!1sen!2sus!4v1785178807042!5m2!1sen!2sus"
                className="relative z-10 block h-full min-h-[320px] w-full border-0 sm:min-h-[380px]"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                title="Shaheed Benazir Bhutto Women University location"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= ANIMATION ================= */}
      <style jsx>{`
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
