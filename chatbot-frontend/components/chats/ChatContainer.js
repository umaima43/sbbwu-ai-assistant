import ChatMessage from "./ChatMessage";

export default function ChatContainer({ messages }) {
  return (
    <div className="mt-8 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm bg-white dark:bg-gray-800">
      {messages.map((msg, index) => (
        <ChatMessage
          key={index}
          sender={msg.sender}
          message={msg.message}
          time={msg.time}
        />
      ))}
    </div>
  );
}