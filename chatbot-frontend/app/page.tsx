"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

export default function EntrancePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white flex flex-col md:flex-row">
      {/* ===== LEFT PINK PANEL — full-width on mobile, 60% on md+ ===== */}
      <div
        className="relative min-h-screen w-full md:h-screen md:w-[60%]"
        style={{
          background:
            "radial-gradient(120% 140% at 15% 10%, #A8135F 0%, #8B0F4E 45%, #6E0B3D 100%)",
        }}
      >
        {/* --- University building silhouette at bottom --- */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]">
          <div
            className="relative h-full w-full"
            style={{
              maskImage:
                "linear-gradient(to top, black 0%, black 20%, transparent 85%), radial-gradient(ellipse 90% 100% at 50% 100%, black 60%, transparent 100%)",
              maskComposite: "intersect",
              WebkitMaskImage:
                "linear-gradient(to top, black 0%, black 20%, transparent 85%), radial-gradient(ellipse 90% 100% at 50% 100%, black 60%, transparent 100%)",
              WebkitMaskComposite: "source-in",
            }}
          >
            <Image
              src="/myuni.jpg"
              alt=""
              fill
              className="object-cover object-bottom"
              style={{
                filter: "grayscale(1) brightness(0.5) contrast(1.1)",
                opacity: 0.35,
              }}
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, #6E0B3D 0%, rgba(110,11,61,0.85) 30%, rgba(110,11,61,0.4) 65%, rgba(110,11,61,0) 100%)",
                mixBlendMode: "multiply",
              }}
            />
          </div>
        </div>

        {/* --- Decorative gradient orbs --- */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -right-10 top-[-40px] h-64 w-64 rounded-full opacity-40 blur-2xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%)",
            }}
          />
          <div className="absolute right-16 top-8 h-14 w-14 rounded-full border border-white/25" />
          <div className="absolute right-6 top-40 h-3 w-3 rounded-full bg-white/25" />
          <div
            className="absolute right-24 top-24 h-16 w-16 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
          />
          <div
            className="absolute right-[-60px] top-1/3 h-80 w-80 rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)",
            }}
          />
          <StarIcon className="absolute left-[20%] top-[8%] h-3 w-3 text-white/40" />
          <StarIcon className="absolute left-[70%] top-[55%] h-4 w-4 text-white/20" />
          <StarIcon className="absolute left-[35%] top-[70%] h-2.5 w-2.5 text-white/30" />
          <StarIcon className="absolute left-[85%] top-[15%] h-2 w-2 text-white/30" />
          <div
            className="absolute left-[8%] bottom-[22%] h-20 w-20 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />
        </div>

        {/* subtle bottom vignette */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 100%)",
          }}
        />

        {/* ===== CONTENT — starts from top, padded, not vertically centered ===== */}
        <div className="relative z-20 flex h-full flex-col items-center px-6 pt-8 text-center text-white sm:px-8 sm:pt-5">
          {/* Logo with soft glow behind it */}
          <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
            {/* soft white glow */}
            <div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0) 75%)",
              }}
            />

            {/* logo itself */}
            <div className="relative h-32 w-32 drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)] sm:h-40 sm:w-40">
              <Image
                src="/bglogo.png"
                alt="SBBWU Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>

          {/* Decorative heading */}
          <h1 className="mt-4 flex flex-wrap items-center justify-center gap-2 text-3xl font-extrabold leading-tight tracking-tight sm:gap-3 sm:text-4xl md:text-5xl">
            <span className="font-light text-white/80">Welcome to the</span>
            <span className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-1.5 text-[#A10D5A] shadow-lg shadow-black/20">
              SBBWU
            </span>
          </h1>

          <h2
            className={`${dancingScript.className} mt-2 text-4xl leading-none tracking-wide text-white sm:text-5xl md:text-6xl`}
          >
            AI Assistant
          </h2>

          <div className="mt-3 h-[3px] w-40 rounded-full bg-gradient-to-r from-transparent via-white/70 to-transparent" />

          {/* Subtext */}
          <p className="mt-6 max-w-md text-sm font-semibold leading-relaxed text-white/90 sm:text-base">
            Your virtual assistant for Shaheed Benazir Bhutto Women
            University — ask questions, get instant guidance, and find
            everything you need, all in one place.
          </p>

          {/* Get Started Button */}
          <Link
            href="/chat"
            className="group relative mt-8 flex w-full max-w-xs items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white py-4 text-base font-extrabold text-[#A10D5A] shadow-xl shadow-black/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/40 sm:mt-9"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#F5C6DE]/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">Get Started</span>
            <ArrowRight
              size={19}
              strokeWidth={3}
              className="relative transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          {/* Extra bottom padding on mobile so content breathes */}
          <div className="h-12 md:hidden" />
        </div>
      </div>

      {/* ===== RIGHT WHITE PANEL — hidden on mobile, 40% on md+ ===== */}
      <div className="relative hidden h-screen w-[40%] items-center justify-center overflow-hidden bg-white md:flex">
        {/* --- Pink decorative accents scattered on white side (darker, more of them) --- */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-[10%] h-16 w-16 rounded-full border-2 border-[#A10D5A]/45" />
          <div className="absolute right-[15%] top-[6%] h-8 w-8 rounded-full border-2 border-[#A10D5A]/50" />
          <div className="absolute bottom-[16%] left-[7%] h-10 w-10 rounded-full border-2 border-[#A10D5A]/45" />
          <div className="absolute right-[10%] bottom-[35%] h-6 w-6 rounded-full border-2 border-[#A10D5A]/40" />
          <div className="absolute left-[35%] top-[4%] h-5 w-5 rounded-full border-2 border-[#A10D5A]/35" />

          <div className="absolute right-[9%] top-[28%] h-3.5 w-3.5 rounded-full bg-[#A10D5A]/55" />
          <div className="absolute left-[16%] bottom-[28%] h-3 w-3 rounded-full bg-[#A10D5A]/50" />
          <div className="absolute right-[22%] bottom-[10%] h-4 w-4 rounded-full bg-[#A10D5A]/35" />
          <div className="absolute left-[6%] top-[42%] h-2.5 w-2.5 rounded-full bg-[#A10D5A]/50" />
          <div className="absolute right-[6%] top-[52%] h-2 w-2 rounded-full bg-[#A10D5A]/45" />
          <div className="absolute left-[26%] top-[18%] h-2 w-2 rounded-full bg-[#A10D5A]/40" />
          <div className="absolute right-[30%] top-[14%] h-2.5 w-2.5 rounded-full bg-[#A10D5A]/40" />

          <div
            className="absolute right-[8%] bottom-[26%] h-16 w-16 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(161,13,90,0.9) 1.3px, transparent 1.3px)",
              backgroundSize: "8px 8px",
            }}
          />
          <div
            className="absolute left-[10%] top-[20%] h-14 w-14 opacity-45"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(161,13,90,0.9) 1.3px, transparent 1.3px)",
              backgroundSize: "8px 8px",
            }}
          />
          <div
            className="absolute right-[28%] bottom-[6%] h-12 w-12 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(161,13,90,0.9) 1.3px, transparent 1.3px)",
              backgroundSize: "8px 8px",
            }}
          />

          <StarIcon className="absolute left-[20%] top-[62%] h-4 w-4 text-[#A10D5A]/50" />
          <StarIcon className="absolute right-[18%] top-[16%] h-3.5 w-3.5 text-[#A10D5A]/50" />
          <StarIcon className="absolute right-[32%] bottom-[10%] h-3 w-3 text-[#A10D5A]/45" />
          <StarIcon className="absolute left-[8%] top-[6%] h-3.5 w-3.5 text-[#A10D5A]/45" />
          <StarIcon className="absolute right-[5%] top-[42%] h-2.5 w-2.5 text-[#A10D5A]/40" />
          <StarIcon className="absolute left-[30%] bottom-[8%] h-3 w-3 text-[#A10D5A]/40" />
        </div>

        {/* Bot gif */}
        <div className="relative z-10 h-[80%] w-[85%]">
          <Image
            src="/bot.gif"
            alt="SBBWU Chatbot Assistant"
            fill
            unoptimized
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.4h7.6z" />
    </svg>
  );
}