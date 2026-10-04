import { Suspense } from "react";
import MainChat from "@/components/chat/MainChat";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          Loading...
        </div>
      }
    >
      <MainChat />
    </Suspense>
  );
}
