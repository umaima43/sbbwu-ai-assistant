
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import WelcomeSection from "@/components/welcome/WelcomeSection";
import ChatContainer from "./ChatContainer";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import { sendChatMessage } from "@/lib/api";
import {
  getConversation,
  saveEntry,
  type ChatMessage,
} from "@/lib/chatHistory";
import { useChatContext } from "@/components/providers/ChatProvider";

const createSessionId = () =>
  `session-${Math.random().toString(36).slice(2)}-${Date.now()}`;

function getTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${String(displayHour).padStart(2, "0")}:${minutes} ${period}`;
}

function makeWelcome(): ChatMessage {
  return {
    sender: "bot",
    message:
      "Assalamualaikum! I'm your University AI Assistant. How can I help you today?",
    time: getTime(),
  };
}

export default function MainChat() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { registerNewConversation, bumpHistory } = useChatContext();

  const [sessionId, setSessionId] = useState(createSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>([
    makeWelcome(),
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef(sessionId);

  // Prevent FAQ question from being sent twice
  const faqQuestionHandledRef = useRef(false);

  // Keep session ID ref synchronized
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Load saved conversation from chat history
  useEffect(() => {
    const loadId = searchParams.get("load");

    if (!loadId) return;

    const conv = getConversation(loadId);

    if (conv) {
      setSessionId(conv.sessionId);
      sessionIdRef.current = conv.sessionId;
      setMessages(conv.messages);
    }

    router.replace("/chat");
  }, [searchParams, router]);

  // Save conversation history when messages change
  useEffect(() => {
    // Don't save only the initial welcome message
    if (messages.length <= 1) return;

    // Find latest user message for conversation title
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.sender === "user");

    if (!lastUserMessage) return;

    saveEntry(
      sessionIdRef.current,
      sessionIdRef.current,
      lastUserMessage.message,
      messages
    );

    bumpHistory();
  }, [messages, bumpHistory]);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // Start a completely new conversation
  const handleNewConversation = useCallback(() => {
    const newSessionId = createSessionId();

    setSessionId(newSessionId);
    sessionIdRef.current = newSessionId;

    setMessages([makeWelcome()]);

    // Allow a new FAQ question to be processed
    faqQuestionHandledRef.current = false;
  }, []);

  // Register new conversation function with ChatProvider
  useEffect(() => {
    registerNewConversation(handleNewConversation);
  }, [registerNewConversation, handleNewConversation]);

  // Send message to backend
  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        sender: "user",
        message: text,
        time: getTime(),
      };

      // Add user message immediately
      setMessages((prev) => [...prev, userMsg]);

      // Show typing indicator
      setIsLoading(true);

      try {
        // Send question to backend
        const data = await sendChatMessage(
          sessionIdRef.current,
          text
        );

        // Create bot response
        const botMsg: ChatMessage = {
          sender: "bot",
          message: data.answer,
          time: getTime(),
          messageId: data.message_id,

          // IMPORTANT:
          // Store the original question together with the bot answer.
          // This allows the BookmarkButton to save the correct Q&A pair.
          question: text,
        };

        // Add bot response
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        // Backend unavailable
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            message:
              "Could not reach the server. Please make sure the backend is running on port 8000.",
            time: getTime(),

            // No question property here.
            // Therefore, no feedback/bookmark bar will appear
            // for this error message.
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  // Handle question coming from FAQ page
  useEffect(() => {
    const question = searchParams.get("question");

    // No FAQ question in URL
    if (!question) return;

    // Prevent duplicate FAQ question
    if (faqQuestionHandledRef.current) return;

    // Mark as handled before sending
    faqQuestionHandledRef.current = true;

    // Send through normal chat flow
    handleSend(question);

    // Remove question from URL
    router.replace("/chat");
  }, [searchParams, router, handleSend]);

  // Whether a real conversation has started (more than the initial welcome msg)
  const hasConversation = messages.length > 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!hasConversation ? (
        // Pre-chat state: welcome section + input centered together
        <div className="flex flex-1 items-center justify-center overflow-y-auto px-3 py-5 sm:px-6 sm:py-8">
          <div className="w-full max-w-2xl">
            <WelcomeSection onQuickAsk={handleSend} />

            <div className="mt-5 sm:mt-8">
              <ChatInput
                onSend={handleSend}
                disabled={isLoading}
                variant="centered"
              />
            </div>
          </div>
        </div>
      ) : (
        // Active chat state: scrollable messages, input pinned to bottom
        // Both share the same max-w-6xl mx-auto wrapper so their edges line up
        <>
          <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8">
            <div className="mx-auto w-full max-w-6xl">
              <ChatContainer messages={messages} />
              {isLoading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="shrink-0 bg-white px-3 pb-3 pt-2 dark:bg-gray-900 sm:px-6 sm:pb-4 md:px-10">
            <div className="mx-auto w-full max-w-4xl">
              <ChatInput
                onSend={handleSend}
                disabled={isLoading}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

