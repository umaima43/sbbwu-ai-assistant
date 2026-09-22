"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QuickActionCards from "../cards/QuickActionCards";

type Props = {
  onQuickAsk?: (question: string) => void;
};

export default function WelcomeSection({ onQuickAsk }: Props) {
  const fullText = "Try questions like these ....";
  const [displayText, setDisplayText] = useState("");
  const [animateBot, setAnimateBot] = useState(true);

  useEffect(() => {
    // Bot movement runs for a few seconds, then stops
    const botTimer = setTimeout(() => {
      setAnimateBot(false);
    }, 5000);

    // Typewriter animation
    let index = 0;

    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 70);

    return () => {
      clearTimeout(botTimer);
      clearInterval(typingInterval);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-2 text-center sm:px-0">
      <div className="mb-4 flex justify-center sm:mb-5">
        <Image
          src="/welcome.png"
          alt="SBBWU AI Assistant"
          width={495}
          height={495}
          priority
          className={`h-auto w-[240px] xs:w-[280px] sm:w-[360px] md:w-[430px] lg:w-[495px] ${
            animateBot ? "animate-bot-welcome" : ""
          }`}
        />
      </div>

      <p className="mb-5 text-[18px] font-semibold leading-relaxed tracking-[-0.01em] text-gray-950 dark:text-[#A10D5A] sm:mb-6 sm:text-[19px]">
  {displayText}
  <span
    className="ml-1 inline-block h-[22px] w-[3px] translate-y-[4px] animate-pulse rounded-full bg-[#A10D5A] sm:h-[24px] sm:w-[3px]"
  />
</p>

      <QuickActionCards onQuickAsk={onQuickAsk} />
    </div>
  );
}
