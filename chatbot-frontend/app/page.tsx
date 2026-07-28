"use client";

import { useRef, Suspense } from "react";

import Sidebar from "../components/layout/Sidebar";
import MainContent from "../components/layout/MainContent";

export default function Home() {
  const newConversationRef = useRef(null);

  return (
    <div className="flex h-screen">
      <Sidebar
        onNewConversation={() => {
          if (newConversationRef.current) {
            newConversationRef.current();
          }
        }}
      />

      {/*
        Suspense is required here because MainContent uses useSearchParams()
        to detect the ?load=<sessionId> param for restoring a conversation.
      */}
      <Suspense fallback={null}>
        <MainContent newConversationRef={newConversationRef} />
      </Suspense>
    </div>
  );
}