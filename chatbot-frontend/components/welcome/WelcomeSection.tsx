import Image from "next/image";
import QuickActionCards from "../cards/QuickActionCards";

type Props = {
  onQuickAsk?: (question: string) => void;
};

export default function WelcomeSection({ onQuickAsk }: Props) {
  return (
    <div className="mx-auto w-full max-w-2xl px-2 sm:px-0 text-center">
      <div className="mb-4 sm:mb-5 flex justify-center">
        <Image
          src="/chand.jpeg"
          alt="SBBWU AI Assistant"
          width={495}
          height={495}
          priority
          className="h-auto w-[240px] xs:w-[280px] sm:w-[360px] md:w-[430px] lg:w-[495px]"
        />
      </div>

      <p className="mb-5 sm:mb-6 text-[14px] sm:text-[15px] font-semibold tracking-[-0.01em] text-gray-950">
        Try questions like these ....
      </p>

      <QuickActionCards onQuickAsk={onQuickAsk} />
    </div>
  );
}