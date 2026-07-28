export default function ChatMessage({ sender, message, time }) {
  const isUser = sender === "user";

  return (
    <div className={`flex mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-5 py-4 shadow-sm ${
          isUser
            ? "bg-[#A10D5A] text-white"
            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        }`}
      >
        <p>{message}</p>

        <p
          className={`text-xs mt-3 ${
            isUser ? "text-pink-200" : "text-gray-400 dark:text-gray-400"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}