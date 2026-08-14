

import Image from "next/image";
import QuickActionCards from "../cards/QuickActionCards";

type Props = {
  onQuickAsk?: (question: string) => void;
};

export default function WelcomeSection({ onQuickAsk }: Props) {
  return (
    <div className="mx-auto w-full max-w-2xl text-center">
      <div className="mb-5 flex justify-center">
        <Image
          src="/hadeeqa.png"
          alt="SBBWU AI Assistant"
          width={495}
          height={495}
          priority
          className="h-auto w-85 sm:w-[460px] lg:w-[495px]"
        />
      </div>

     
      <p className="mb-6 text-[15px] font-semibold tracking-[-0.01em] text-gray-950">
  Try questions like these ....
</p>

      <QuickActionCards onQuickAsk={onQuickAsk} />
    </div>
  );
}