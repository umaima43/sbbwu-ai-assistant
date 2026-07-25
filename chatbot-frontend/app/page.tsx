"use client";

import { useRef } from "react";

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

      <MainContent newConversationRef={newConversationRef} />
    </div>
  );
}