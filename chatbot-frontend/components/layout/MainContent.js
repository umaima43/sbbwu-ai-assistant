"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import Header from "./Header";
import WelcomeSection from "../welcome/WelcomeSection";
import ChatContainer from "../chats/ChatContainer";
import ChatInput from "../chats/ChatInput";

const BACKEND_URL = "http://127.0.0.1:8000";

// Function to generate a new session ID
const createSessionId = () =>
  `session-${Math.random().toString(36).slice(2)}-${Date.now()}`;

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MainContent({ newConversationRef }) {
  // Current conversation session
  const [sessionId, setSessionId] = useState(createSessionId());

  // Messages
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      message:
        "👋 Assalamualaikum! I'm your University AI Assistant. How can I help you today?",
      time: getTime(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Start a brand-new conversation
  const handleNewConversation = useCallback(() => {
    setSessionId(createSessionId());

    setMessages([
      {
        sender: "bot",
        message:
          "👋 Assalamualaikum! I'm your University AI Assistant. How can I help you today?",
        time: getTime(),
      },
    ]);
  }, []);

  // Wire the handler to the ref so Sidebar can call it
  useEffect(() => {
    if (newConversationRef) {
      newConversationRef.current = handleNewConversation;
    }
  }, [newConversationRef, handleNewConversation]);

  const handleSend = async (text) => {
    if (!text.trim() || isLoading) return;

    // Show user message
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        message: text,
        time: getTime(),
      },
    ]);

    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          message: data.answer,
          time: getTime(),
        },
      ]);
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
    <main className="flex-1 flex flex-col h-screen bg-gray-50">
      <Header />

      <div className="flex-1 overflow-y-auto p-8">
        <WelcomeSection />

        <ChatContainer messages={messages} />

        {isLoading && (
          <div className="flex justify-start mb-6">
            <div className="rounded-2xl px-5 py-4 shadow-sm flex items-center gap-2 bg-white">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} />
    </main>
  );
}