
// "use client";

// import ChatMessage from "./ChatMessage";
// import type { ChatMessage as Msg } from "@/lib/chatHistory";
// import MessageFeedbackBar from "@/components/bookmarks/MessageFeedbackBar";

// interface ChatContainerProps {
//   messages: Msg[];
// }

// export default function ChatContainer({
//   messages,
// }: ChatContainerProps) {
//   return (
//     <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
//       {messages.map((msg, i) => (
//         <div key={`${msg.time}-${i}`}>
//           <ChatMessage
//             sender={msg.sender}
//             message={msg.message}
//             time={msg.time}
//           />

//           {/* Show feedback and bookmark actions only for bot answers */}
//           {msg.sender === "bot" && msg.question && (
//             <div className="mb-4 ml-1">
//               <MessageFeedbackBar
//                 question={msg.question}
//                 answer={msg.message}
//               />
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }


"use client";

import ChatMessage from "./ChatMessage";
import type { ChatMessage as Msg } from "@/lib/chatHistory";
import MessageFeedbackBar from "@/components/bookmarks/MessageFeedbackBar";

interface ChatContainerProps {
  messages: Msg[];
}

export default function ChatContainer({ messages }: ChatContainerProps) {
  return (
    <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {messages.map((msg, i) => (
        <div key={`${msg.time}-${i}`}>
          <ChatMessage sender={msg.sender} message={msg.message} time={msg.time} />

          {msg.sender === "bot" && msg.question && (
            <div className="mb-4 ml-1">
              <MessageFeedbackBar question={msg.question} answer={msg.message} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}