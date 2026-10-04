"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type ChatContextValue = {
  registerNewConversation: (fn: () => void) => void;
  startNewConversation: () => void;
  historyVersion: number;
  bumpHistory: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const newConversationRef = useRef<(() => void) | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);

  const registerNewConversation = useCallback((fn: () => void) => {
    newConversationRef.current = fn;
  }, []);

  const startNewConversation = useCallback(() => {
    newConversationRef.current?.();
  }, []);

  const bumpHistory = useCallback(() => {
    setHistoryVersion((v) => v + 1);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        registerNewConversation,
        startNewConversation,
        historyVersion,
        bumpHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used inside ChatProvider");
  }
  return ctx;
}
