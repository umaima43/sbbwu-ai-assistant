"use client";

import ChatMessage from "./ChatMessage";
import type { ChatMessage as Msg } from "@/lib/chatHistory";
import MessageFeedbackBar from "@/components/bookmarks/MessageFeedbackBar";

interface ChatContainerProps {
  messages: Msg[];
}

export default function ChatContainer({ messages }: ChatContainerProps) {
  return (
    <div className="py-2">
      {messages.map((msg, i) => (
        <div key={`${msg.time}-${i}`}>
          <ChatMessage
            sender={msg.sender}
            message={msg.message}
            time={msg.time}
          />

          {msg.sender === "bot" && msg.question && (
            <div className="mb-4 ml-0 sm:ml-[48px]">
              <MessageFeedbackBar
                messageId={msg.messageId}
                question={msg.question}
                answer={msg.message}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
