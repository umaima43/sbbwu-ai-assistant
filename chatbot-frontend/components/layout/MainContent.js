"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import Header from "./Header";
import WelcomeSection from "../welcome/WelcomeSection";
import ChatContainer from "../chats/ChatContainer";
import ChatInput from "../chats/ChatInput";
import { saveEntry, getConversation } from "../../lib/chatHistory";

const BACKEND_URL = "http://127.0.0.1:8000";

// Generate a unique session ID for each conversation
const createSessionId = () =>
  `session-${Math.random().toString(36).slice(2)}-${Date.now()}`;

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function makeWelcome() {
  return {
    sender: "bot",
    message:
      "👋 Assalamualaikum! I'm your University AI Assistant. How can I help you today?",
    time: getTime(),
  };
}

export default function MainContent({ newConversationRef }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sessionId, setSessionId] = useState(createSessionId);
  const [messages, setMessages] = useState(() => [makeWelcome()]);
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef(null);

  // Keep live refs so beforeunload can access the latest values
  const messagesRef = useRef(messages);
  const sessionIdRef = useRef(sessionId);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // ── Load conversation from URL param (?load=<sessionId>) ──────────────
  useEffect(() => {
    const loadId = searchParams.get("load");
    if (!loadId) return;

    const conv = getConversation(loadId);
    if (conv) {
      setSessionId(conv.id);
      setMessages(conv.messages);
    }
    // Remove the query param so the URL stays clean
    router.replace("/");
  }, [searchParams, router]);

  // (History is saved per Q&A exchange inside handleSend — no beforeunload needed)

  // ── Auto-scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── New conversation ──────────────────────────────────────────────────
  const handleNewConversation = useCallback(() => {
    // History already saved per-exchange; just reset to a fresh session
    setSessionId(createSessionId());
    setMessages([makeWelcome()]);
  }, []);

  // Wire the handler to the ref so Sidebar can call it
  useEffect(() => {
    if (newConversationRef) {
      newConversationRef.current = handleNewConversation;
    }
  }, [newConversationRef, handleNewConversation]);

  // ── Send message ──────────────────────────────────────────────────────
  const handleSend = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { sender: "user", message: text, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      const botMsg = { sender: "bot", message: data.answer, time: getTime() };

      setMessages((prev) => {
        const updated = [...prev, botMsg];
        // Each Q&A exchange gets its own unique history entry
        // so 10 messages → 10 history items (capped at 10 total)
        const entryId = `${sessionIdRef.current}-${Date.now()}`;
        saveEntry(entryId, text, updated);
        return updated;
      });
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          message:
            "⚠️ Could not reach the server. Please make sure the backend is running on port 8000.",
          time: getTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="flex-1 overflow-y-auto p-8">
        <WelcomeSection />

        <ChatContainer messages={messages} />

        {isLoading && (
          <div className="flex justify-start mb-6">
            <div className="rounded-2xl px-5 py-4 shadow-sm flex items-center gap-2 bg-white dark:bg-gray-800">
              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} />
    </main>
  );
}